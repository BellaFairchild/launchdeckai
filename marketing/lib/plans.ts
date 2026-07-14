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
  features: string[];
}

export type FeatureMatrixValue = boolean | string;

export interface FeatureMatrixRow {
  label: string;
  cadet: FeatureMatrixValue;
  commander: FeatureMatrixValue;
  admiral: FeatureMatrixValue;
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
    features: [
      "Mission control Deck",
      "1 active Mission",
      "25 Fuel cap (5/day drip)",
      "Basic Foundry tools",
      "Cargo Bay view",
      "Signal Deck viewing & prep",
      "Astro coaching (standard)",
      "Blueprint guided forms",
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
    features: [
      "Everything in Cadet",
      "3 active Missions",
      "1,500 Fuel / month",
      "All core Foundry tools",
      "Signal Pack ZIP export",
      "Streak Shield",
      "Priority Blueprint templates",
      "Advanced Astro coaching",
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
    features: [
      "Everything in Commander",
      "Unlimited active Missions",
      "5,000 Fuel / month",
      "Astro command mode",
      "Public Launch Decks (later)",
      "Priority support",
      "Early access to new features",
      "Custom Signal Deck slots (later)",
    ],
  },
};

export const PLAN_ORDER: Plan[] = ["cadet", "commander", "admiral"];

export const FEATURE_MATRIX: FeatureMatrixRow[] = [
  {
    label: "Active Missions",
    cadet: "1",
    commander: "3",
    admiral: "Unlimited",
  },
  {
    label: "Monthly Fuel",
    cadet: "25 cap · 5/day",
    commander: "1,500",
    admiral: "5,000",
  },
  {
    label: "Mission control Deck",
    cadet: true,
    commander: true,
    admiral: true,
  },
  {
    label: "Guided Blueprints",
    cadet: true,
    commander: true,
    admiral: true,
  },
  {
    label: "Foundry AI generation",
    cadet: "Basic",
    commander: "All core tools",
    admiral: "All core tools",
  },
  {
    label: "Cargo Bay vault",
    cadet: "View only",
    commander: true,
    admiral: true,
  },
  {
    label: "Signal Deck timeline",
    cadet: "View & prep",
    commander: true,
    admiral: true,
  },
  {
    label: "Signal Pack ZIP export",
    cadet: false,
    commander: true,
    admiral: true,
  },
  {
    label: "Streak Shield",
    cadet: false,
    commander: true,
    admiral: true,
  },
  {
    label: "Astro command mode",
    cadet: false,
    commander: false,
    admiral: true,
  },
  {
    label: "Public Launch Decks",
    cadet: false,
    commander: false,
    admiral: "Later",
  },
  {
    label: "Priority support",
    cadet: false,
    commander: false,
    admiral: true,
  },
];
