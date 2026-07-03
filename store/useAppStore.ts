import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import { generateId } from '../lib/id';
import { monthlyCostOf } from '../lib/costCalculations';
import type {
  StackSweep,
  Subscription,
  SubscriptionAlertState,
  SubscriptionStatus,
  SweepDecision,
  UserProfile,
} from '../types/models';

const DEFAULT_PROFILE: UserProfile = {
  id: 'local-user',
  name: '',
  email: '',
  preferredCurrency: 'USD',
  notificationPreferences: {
    renewalAlerts: true,
    trialAlerts: true,
    reviewReminders: true,
    sweepReminders: true,
  },
  onboardingCompleted: false,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
};

interface AppState {
  profile: UserProfile;
  subscriptions: Subscription[];
  alertStates: Record<string, SubscriptionAlertState>;
  sweeps: StackSweep[];
  hasHydrated: boolean;

  setHasHydrated: (value: boolean) => void;

  updateProfile: (patch: Partial<UserProfile>) => void;
  completeOnboarding: () => void;

  addSubscription: (
    sub: Omit<Subscription, 'id' | 'userId' | 'createdAt' | 'updatedAt'>,
  ) => Subscription;
  updateSubscription: (id: string, patch: Partial<Subscription>) => void;
  deleteSubscription: (id: string) => void;
  setSubscriptionStatus: (id: string, status: SubscriptionStatus) => void;

  setAlertStatus: (
    subscriptionId: string,
    alertType: SubscriptionAlertState['alertType'],
    status: SubscriptionAlertState['status'],
    snoozedUntil?: string,
  ) => void;

  startSweep: () => StackSweep;
  recordSweepDecision: (
    sweepId: string,
    subscriptionId: string,
    decision: SubscriptionStatus,
    notes?: string,
  ) => void;
  completeSweep: (sweepId: string) => StackSweep | undefined;

  resetAllData: () => void;
}

function alertKey(subscriptionId: string, alertType: string) {
  return `${subscriptionId}:${alertType}`;
}

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      profile: DEFAULT_PROFILE,
      subscriptions: [],
      alertStates: {},
      sweeps: [],
      hasHydrated: false,

      setHasHydrated: (value) => set({ hasHydrated: value }),

      updateProfile: (patch) =>
        set((state) => ({
          profile: { ...state.profile, ...patch, updatedAt: new Date().toISOString() },
        })),

      completeOnboarding: () =>
        set((state) => ({
          profile: { ...state.profile, onboardingCompleted: true, updatedAt: new Date().toISOString() },
        })),

      addSubscription: (sub) => {
        const now = new Date().toISOString();
        const newSub: Subscription = {
          ...sub,
          id: generateId(),
          userId: get().profile.id,
          createdAt: now,
          updatedAt: now,
        };
        set((state) => ({ subscriptions: [newSub, ...state.subscriptions] }));
        return newSub;
      },

      updateSubscription: (id, patch) =>
        set((state) => ({
          subscriptions: state.subscriptions.map((s) =>
            s.id === id ? { ...s, ...patch, updatedAt: new Date().toISOString() } : s,
          ),
        })),

      deleteSubscription: (id) =>
        set((state) => ({
          subscriptions: state.subscriptions.filter((s) => s.id !== id),
        })),

      setSubscriptionStatus: (id, status) =>
        set((state) => ({
          subscriptions: state.subscriptions.map((s) =>
            s.id === id
              ? {
                  ...s,
                  status,
                  lastReviewedAt: new Date().toISOString(),
                  updatedAt: new Date().toISOString(),
                }
              : s,
          ),
        })),

      setAlertStatus: (subscriptionId, alertType, status, snoozedUntil) =>
        set((state) => ({
          alertStates: {
            ...state.alertStates,
            [alertKey(subscriptionId, alertType)]: {
              subscriptionId,
              alertType,
              status,
              snoozedUntil,
              updatedAt: new Date().toISOString(),
            },
          },
        })),

      startSweep: () => {
        const sweep: StackSweep = {
          id: generateId(),
          userId: get().profile.id,
          startedAt: new Date().toISOString(),
          toolsReviewed: 0,
          toolsKept: 0,
          toolsMarkedCancelSoon: 0,
          toolsMarkedDowngrade: 0,
          estimatedMonthlySavings: 0,
          estimatedAnnualSavings: 0,
          decisions: [],
        };
        set((state) => ({ sweeps: [sweep, ...state.sweeps] }));
        return sweep;
      },

      recordSweepDecision: (sweepId, subscriptionId, decision, notes) => {
        const sweepDecision: SweepDecision = {
          id: generateId(),
          sweepId,
          subscriptionId,
          decision,
          notes,
          createdAt: new Date().toISOString(),
        };
        set((state) => ({
          sweeps: state.sweeps.map((sweep) =>
            sweep.id === sweepId
              ? {
                  ...sweep,
                  decisions: [
                    ...sweep.decisions.filter((d) => d.subscriptionId !== subscriptionId),
                    sweepDecision,
                  ],
                }
              : sweep,
          ),
        }));
        get().setSubscriptionStatus(subscriptionId, decision);
      },

      completeSweep: (sweepId) => {
        const state = get();
        const sweep = state.sweeps.find((s) => s.id === sweepId);
        if (!sweep) return undefined;

        const toolsKept = sweep.decisions.filter((d) => d.decision === 'keep').length;
        const toolsMarkedCancelSoon = sweep.decisions.filter(
          (d) => d.decision === 'cancel_soon',
        ).length;
        const toolsMarkedDowngrade = sweep.decisions.filter(
          (d) => d.decision === 'downgrade',
        ).length;

        const estimatedMonthlySavings = sweep.decisions.reduce((sum, d) => {
          if (d.decision !== 'cancel_soon' && d.decision !== 'downgrade') return sum;
          const sub = state.subscriptions.find((s) => s.id === d.subscriptionId);
          return sub ? sum + monthlyCostOf(sub) : sum;
        }, 0);

        const nextSweepDate = new Date();
        nextSweepDate.setDate(nextSweepDate.getDate() + 30);

        const updated: StackSweep = {
          ...sweep,
          completedAt: new Date().toISOString(),
          toolsReviewed: sweep.decisions.length,
          toolsKept,
          toolsMarkedCancelSoon,
          toolsMarkedDowngrade,
          estimatedMonthlySavings,
          estimatedAnnualSavings: estimatedMonthlySavings * 12,
          nextSweepDate: nextSweepDate.toISOString(),
        };

        set((s) => ({
          sweeps: s.sweeps.map((sw) => (sw.id === sweepId ? updated : sw)),
        }));

        return updated;
      },

      resetAllData: () =>
        set({
          profile: DEFAULT_PROFILE,
          subscriptions: [],
          alertStates: {},
          sweeps: [],
        }),
    }),
    {
      name: 'subdeck-storage',
      storage: createJSONStorage(() => AsyncStorage),
      onRehydrateStorage: () => (state) => {
        state?.setHasHydrated(true);
      },
    },
  ),
);
