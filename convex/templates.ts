/**
 * Server-side templates + economics (source of truth for fuel costs and plan
 * gates — never trust the client). Keep in sync with the client constants in
 * src/constants/{milestoneTemplates,blueprintSections,foundryTools}.ts.
 */
type Plan_ = "cadet" | "commander" | "admiral";

export const MILESTONE_TEMPLATES: {
  id: string;
  title: string;
  description: string;
  category: string;
  fuelReward: number;
  requiredPlan: Plan_;
}[] = [
  { id: "ms_name", title: "Name your app", description: "Choose a memorable, clear name.", category: "foundation", fuelReward: 10, requiredPlan: "cadet" },
  { id: "ms_oneliner", title: "Write your one-liner", description: "One sentence that nails the value.", category: "foundation", fuelReward: 10, requiredPlan: "cadet" },
  { id: "ms_audience", title: "Define your target audience", description: "Who is this for, specifically?", category: "foundation", fuelReward: 10, requiredPlan: "cadet" },
  { id: "ms_store_desc", title: "Write App Store description", description: "Compelling store copy that converts.", category: "store", fuelReward: 20, requiredPlan: "cadet" },
  { id: "ms_screenshots", title: "Prepare screenshots (min 3)", description: "Show off your interface.", category: "store", fuelReward: 15, requiredPlan: "cadet" },
  { id: "ms_store_setup", title: "Set up App Store Connect / Play Console", description: "Create your store listings.", category: "store", fuelReward: 15, requiredPlan: "cadet" },
  { id: "ms_social", title: "Generate a Social Blast", description: "Launch announcement posts.", category: "assets", fuelReward: 20, requiredPlan: "cadet" },
  { id: "ms_video", title: "Create a launch video script", description: "High-conversion hook + voiceover.", category: "assets", fuelReward: 25, requiredPlan: "commander" },
  { id: "ms_presskit", title: "Build a press kit", description: "Everything media needs in one place.", category: "assets", fuelReward: 25, requiredPlan: "commander" },
  { id: "ms_email", title: "Draft a launch email sequence", description: "Tease, launch, follow-up.", category: "marketing", fuelReward: 20, requiredPlan: "cadet" },
  { id: "ms_ph", title: "Prepare Product Hunt copy", description: "Tagline, description, first comment.", category: "marketing", fuelReward: 20, requiredPlan: "commander" },
  { id: "ms_signal", title: "Stage your Signal Deck sequence", description: "Know what to post, when, where.", category: "marketing", fuelReward: 15, requiredPlan: "cadet" },
  { id: "ms_submit", title: "Submit to App Store / Play", description: "Send your build for review.", category: "launch", fuelReward: 30, requiredPlan: "cadet" },
  { id: "ms_launched", title: "Mark Mission as Launched", description: "Blastoff! Celebrate the launch.", category: "launch", fuelReward: 50, requiredPlan: "cadet" },
  { id: "ms_thankyou", title: "Send a thank-you email", description: "Thank early adopters.", category: "post_launch", fuelReward: 15, requiredPlan: "cadet" },
  { id: "ms_reviews", title: "Request day-30 reviews", description: "Turn happy users into ratings.", category: "post_launch", fuelReward: 15, requiredPlan: "cadet" },
];

export const BLUEPRINT_SECTIONS = [
  "app_info",
  "app_store",
  "legal_compliance",
  "marketing",
  "beta_testing",
  "pre_launch",
  "launch_day",
  "post_launch",
] as const;

/** Foundry tool fuel costs + required plan (server-authoritative). */
export const FOUNDRY_TOOLS: Record<string, { fuelCost: number; requiredPlan: Plan_ }> = {
  app_store_copy: { fuelCost: 20, requiredPlan: "cadet" },
  social_blast: { fuelCost: 15, requiredPlan: "cadet" },
  email_sequence: { fuelCost: 20, requiredPlan: "cadet" },
  press_kit: { fuelCost: 25, requiredPlan: "commander" },
  video_script: { fuelCost: 25, requiredPlan: "commander" },
  product_hunt_copy: { fuelCost: 20, requiredPlan: "commander" },
  signal_asset: { fuelCost: 15, requiredPlan: "cadet" },
};

const PLAN_ORDER: Plan_[] = ["cadet", "commander", "admiral"];
export function planMeets(plan: string, required: Plan_): boolean {
  return PLAN_ORDER.indexOf(plan as Plan_) >= PLAN_ORDER.indexOf(required);
}

export const COPILOT_STANDARD_COST = 2;
