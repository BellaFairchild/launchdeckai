/**
 * Subscription tiers — Cadet / Commander / Admiral (Docs/08_ASTRO_AND_MONETIZATION.md).
 * Never use "Launch Pass" (renamed to Admiral). Backend validates entitlements;
 * this is display + client-side gating metadata only.
 */
export type Plan = "cadet" | "commander" | "admiral";

export interface PlanSpec {
  id: Plan;
  name: string;
  /** Astro belt + ring accent color */
  belt: "black" | "silver" | "gold";
  beltColor: string;
  price: string;
  priceYearly?: string;
  bestFor: string;
  fuel: string;
  activeMissions: string;
  aiAccess: string;
  exportAccess: boolean;
  highlights: string[];
}

export const PLANS: Record<Plan, PlanSpec> = {
  cadet: {
    id: "cadet",
    name: "Cadet",
    belt: "black",
    beltColor: "#1E2D45",
    price: "Free",
    bestFor: "First-time builders getting organized",
    fuel: "25 Fuel cap · 5/day drip",
    activeMissions: "1 Active Mission",
    aiAccess: "Standard Copilot (daily limit)",
    exportAccess: false,
    highlights: [
      "Basic Foundry access",
      "Cargo Bay view",
      "Signal Deck viewing & prep",
    ],
  },
  commander: {
    id: "commander",
    name: "Commander",
    belt: "silver",
    beltColor: "#9CA3AF",
    price: "$19/mo",
    priceYearly: "$152/yr",
    bestFor: "Serious builders preparing for launch",
    fuel: "1,500 Fuel / mo",
    activeMissions: "3 Active Missions",
    aiAccess: "Unlimited Copilot",
    exportAccess: true,
    highlights: [
      "All core Foundry tools",
      "Signal Pack ZIP export",
      "Streak Shield",
    ],
  },
  admiral: {
    id: "admiral",
    name: "Admiral",
    belt: "gold",
    beltColor: "#F3B233",
    price: "$49/mo",
    priceYearly: "$390/yr",
    bestFor: "Advanced creators and power launchers",
    fuel: "5,000 Fuel / mo",
    activeMissions: "Unlimited Missions",
    aiAccess: "Powerful AI mode",
    exportAccess: true,
    highlights: [
      "Powerful Astro command mode",
      "Public Launch Decks (later)",
      "Priority support",
    ],
  },
};

export const PLAN_ORDER: Plan[] = ["cadet", "commander", "admiral"];

/** True if `plan` meets or exceeds `required` (for client-side gate hints). */
export function planMeets(plan: Plan, required: Plan): boolean {
  return PLAN_ORDER.indexOf(plan) >= PLAN_ORDER.indexOf(required);
}
