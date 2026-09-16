import { create } from "zustand";
import type { Plan } from "@/constants/plans";

/**
 * Client-only UI state (Docs/03: client owns ephemeral UI state) PLUS a
 * hydration surface for plan/fuel/streak. In demo mode these are mock values;
 * when signed in, DataSync sets `serverOwned` and hydrates them from Convex.
 * Fuel/plan mutations are backend-owned (local setters become no-ops).
 */
type UIState = {
  drawerOpen: boolean;
  openDrawer: () => void;
  closeDrawer: () => void;
  toggleDrawer: () => void;

  plan: Plan;
  fuel: number;
  streak: number;

  /** Sign out (set by DataSync to Clerk's signOut when auth is enabled). */
  signOut: () => void;

  /** True once Convex owns plan/fuel (signed in). */
  serverOwned: boolean;
  setServerState: (s: {
    plan: Plan;
    fuel: number;
    streak: number;
  }) => void;
  clearServerState: () => void;

  setPlan: (plan: Plan) => void;
  addFuel: (amount: number) => void;
  /** Returns false if insufficient Fuel (no deduction). Always true when server-owned. */
  spendFuel: (amount: number) => boolean;
};

export const useUIStore = create<UIState>((set, get) => ({
  drawerOpen: false,
  openDrawer: () => set({ drawerOpen: true }),
  closeDrawer: () => set({ drawerOpen: false }),
  toggleDrawer: () => set((s) => ({ drawerOpen: !s.drawerOpen })),

  plan: "cadet",
  fuel: 420,
  streak: 3,

  signOut: () => {},

  serverOwned: false,
  setServerState: ({ plan, fuel, streak }) =>
    set({ serverOwned: true, plan, fuel, streak }),
  clearServerState: () =>
    set({ serverOwned: false, plan: "cadet", fuel: 420, streak: 3 }),

  setPlan: (plan) => {
    if (get().serverOwned) return; // plan is backend-owned (RevenueCat webhook)
    set({ plan });
  },
  addFuel: (amount) => {
    if (get().serverOwned) return; // server awards fuel; hydration updates it
    set((s) => ({ fuel: Math.max(0, s.fuel + amount) }));
  },
  spendFuel: (amount) => {
    if (get().serverOwned) return true; // server deducts; hydration updates it
    let ok = false;
    set((s) => {
      if (s.fuel >= amount) {
        ok = true;
        return { fuel: s.fuel - amount };
      }
      return {};
    });
    return ok;
  },
}));
