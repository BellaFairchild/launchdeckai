import { create } from "zustand";
import type { Plan } from "@/constants/plans";

/**
 * Client-only UI state (Docs/03: client owns ephemeral UI state).
 * `plan` and `fuel` here are temporary placeholders until Convex/Clerk land
 * in Phase 4 — they let navigation render the correct Astro accent meanwhile.
 */
type UIState = {
  drawerOpen: boolean;
  openDrawer: () => void;
  closeDrawer: () => void;
  toggleDrawer: () => void;

  // TEMP placeholders (replaced by backend-owned state in Phase 4+)
  plan: Plan;
  fuel: number;
  setPlan: (plan: Plan) => void;
};

export const useUIStore = create<UIState>((set) => ({
  drawerOpen: false,
  openDrawer: () => set({ drawerOpen: true }),
  closeDrawer: () => set({ drawerOpen: false }),
  toggleDrawer: () => set((s) => ({ drawerOpen: !s.drawerOpen })),

  plan: "cadet",
  fuel: 420,
  setPlan: (plan) => set({ plan }),
}));
