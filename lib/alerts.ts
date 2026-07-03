import { differenceInCalendarDays, parseISO } from 'date-fns';
import type {
  AlertStatus,
  AlertType,
  Subscription,
  SubscriptionAlertState,
} from '../types/models';

export interface DerivedAlert {
  id: string;
  subscription: Subscription;
  alertType: AlertType;
  alertDate: string;
  daysUntil: number;
  status: AlertStatus;
  snoozedUntil?: string;
  message: string;
}

export type AlertGroup =
  | 'due_today'
  | 'this_week'
  | 'next_14_days'
  | 'next_30_days'
  | 'trials_ending'
  | 'cancel_soon'
  | 'snoozed'
  | 'reviewed';

const ACTIVE_STATUSES: Set<string> = new Set(['keep', 'review_later', 'downgrade', 'cancel_soon']);

function relevantDate(sub: Subscription): { date: string; type: AlertType } | null {
  if (sub.trialEndDate && sub.billingType === 'trial') {
    return { date: sub.trialEndDate, type: 'trial_ending' };
  }
  if (sub.status === 'cancel_soon' && sub.cancelByDate) {
    return { date: sub.cancelByDate, type: 'cancel_by' };
  }
  if (sub.renewalDate) {
    return { date: sub.renewalDate, type: 'renewal' };
  }
  return null;
}

function messageFor(type: AlertType, daysUntil: number): string {
  if (type === 'trial_ending') {
    return daysUntil <= 0 ? 'Trial ending today' : 'Trial ending soon';
  }
  if (type === 'cancel_by') {
    return 'Marked for cancellation';
  }
  if (daysUntil <= 0) return 'Review before charge';
  if (daysUntil <= 7) return 'Renews this week';
  return 'Renews soon';
}

export function deriveAlerts(
  subscriptions: Subscription[],
  alertStates: Record<string, SubscriptionAlertState>,
): DerivedAlert[] {
  const today = new Date();
  const alerts: DerivedAlert[] = [];

  for (const sub of subscriptions) {
    if (!sub.alertEnabled) continue;
    if (!ACTIVE_STATUSES.has(sub.status)) continue;

    const relevant = relevantDate(sub);
    if (!relevant) continue;

    const daysUntil = differenceInCalendarDays(parseISO(relevant.date), today);
    if (daysUntil > 30 || daysUntil < -3) continue;

    const state = alertStates[sub.id];
    const status: AlertStatus = state?.status ?? 'pending';

    alerts.push({
      id: `${sub.id}-${relevant.type}`,
      subscription: sub,
      alertType: relevant.type,
      alertDate: relevant.date,
      daysUntil,
      status,
      snoozedUntil: state?.snoozedUntil,
      message: messageFor(relevant.type, daysUntil),
    });
  }

  return alerts.sort((a, b) => a.daysUntil - b.daysUntil);
}

export function groupAlert(alert: DerivedAlert): AlertGroup {
  if (alert.status === 'snoozed') return 'snoozed';
  if (alert.status === 'reviewed' || alert.status === 'dismissed' || alert.status === 'completed') {
    return 'reviewed';
  }
  if (alert.alertType === 'trial_ending') return 'trials_ending';
  if (alert.alertType === 'cancel_by') return 'cancel_soon';
  if (alert.daysUntil <= 0) return 'due_today';
  if (alert.daysUntil <= 7) return 'this_week';
  if (alert.daysUntil <= 14) return 'next_14_days';
  return 'next_30_days';
}

export const ALERT_GROUP_LABELS: Record<AlertGroup, string> = {
  due_today: 'Due Today',
  this_week: 'This Week',
  next_14_days: 'Next 14 Days',
  next_30_days: 'Next 30 Days',
  trials_ending: 'Trials Ending',
  cancel_soon: 'Cancel Soon',
  snoozed: 'Snoozed',
  reviewed: 'Reviewed',
};

export const ALERT_GROUP_ORDER: AlertGroup[] = [
  'due_today',
  'this_week',
  'next_14_days',
  'next_30_days',
  'trials_ending',
  'cancel_soon',
  'snoozed',
  'reviewed',
];

export function groupAlerts(alerts: DerivedAlert[]): Record<AlertGroup, DerivedAlert[]> {
  const groups: Record<AlertGroup, DerivedAlert[]> = {
    due_today: [],
    this_week: [],
    next_14_days: [],
    next_30_days: [],
    trials_ending: [],
    cancel_soon: [],
    snoozed: [],
    reviewed: [],
  };
  for (const alert of alerts) {
    groups[groupAlert(alert)].push(alert);
  }
  return groups;
}
