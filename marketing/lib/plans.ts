export type Plan = "cadet" | "commander" | "admiral";

export interface PlanSpec {
  id: Plan;
  name: string;
  beltColor: string;
  price: string;
  priceYearly?: string;
  bestFor: string;
  fuel: string;
  activeMissions: string;
  highlights: string[];
}

export const PLANS: Record<Plan, PlanSpec> = {
  cadet: {
    id: "cadet",
    name: "Cadet",
    beltColor: "#1E2D45",
    price: "Free",
    bestFor: "First-time builders getting organized",
    fuel: "25 Fuel cap · 5/day drip",
    activeMissions: "1 Active Mission",
    highlights: [
      "Basic Foundry access",
      "Cargo Bay view",
      "Signal Deck viewing & prep",
    ],
  },
  commander: {
    id: "commander",
    name: "Commander",
    beltColor: "#9CA3AF",
    price: "$19/mo",
    priceYearly: "$152/yr",
    bestFor: "Serious builders preparing for launch",
    fuel: "1,500 Fuel / mo",
    activeMissions: "3 Active Missions",
    highlights: [
      "All core Foundry tools",
      "Signal Pack ZIP export",
      "Streak Shield",
    ],
  },
  admiral: {
    id: "admiral",
    name: "Admiral",
    beltColor: "#F3B233",
    price: "$49/mo",
    priceYearly: "$390/yr",
    bestFor: "Advanced creators and power launchers",
    fuel: "5,000 Fuel / mo",
    activeMissions: "Unlimited Missions",
    highlights: [
      "Powerful Astro command mode",
      "Public Launch Decks (later)",
      "Priority support",
    ],
  },
};

export const PLAN_ORDER: Plan[] = ["cadet", "commander", "admiral"];
