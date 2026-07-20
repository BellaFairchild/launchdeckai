import type { IconName } from "@/components/ui/Icon";
import type { Milestone, MilestoneCategory } from "@/types";

/** Category tint + glyph for milestone cards and section headers. */
export const MILESTONE_CATEGORY_META: Record<
  MilestoneCategory,
  { icon: IconName; hex: string }
> = {
  foundation: { icon: "blueprints", hex: "#3B82F6" },
  store: { icon: "book", hex: "#F59E0B" },
  assets: { icon: "box", hex: "#4DC8C0" },
  marketing: { icon: "signal", hex: "#10B7D6" },
  launch: { icon: "bolt", hex: "#F3B233" },
  post_launch: { icon: "clock", hex: "#4ADE80" },
};

export const MILESTONE_CATEGORIES: { id: MilestoneCategory; label: string }[] =
  [
    { id: "foundation", label: "Foundation" },
    { id: "store", label: "Store Prep" },
    { id: "assets", label: "Assets" },
    { id: "marketing", label: "Marketing" },
    { id: "launch", label: "Launch" },
    { id: "post_launch", label: "Post-Launch" },
  ];

/** Default milestones created for a new Mission (instances of these templates). */
export const MILESTONE_TEMPLATES: Omit<Milestone, "completed" | "isLocked">[] =
  [
    // Foundation
    {
      id: "ms_name",
      title: "Name your app",
      description: "Choose a memorable, clear name.",
      category: "foundation",
      fuelReward: 10,
      requiredPlan: "cadet",
    },
    {
      id: "ms_oneliner",
      title: "Write your one-liner",
      description: "One sentence that nails the value.",
      category: "foundation",
      fuelReward: 10,
      requiredPlan: "cadet",
    },
    {
      id: "ms_audience",
      title: "Define your target audience",
      description: "Who is this for, specifically?",
      category: "foundation",
      fuelReward: 10,
      requiredPlan: "cadet",
    },

    // Store Prep
    {
      id: "ms_store_desc",
      title: "Write App Store description",
      description: "Compelling store copy that converts.",
      category: "store",
      fuelReward: 20,
      requiredPlan: "cadet",
      linkedTool: "app_store_copy",
    },
    {
      id: "ms_screenshots",
      title: "Prepare screenshots (min 3)",
      description: "Show off your interface.",
      category: "store",
      fuelReward: 15,
      requiredPlan: "cadet",
    },
    {
      id: "ms_store_setup",
      title: "Set up App Store Connect / Play Console",
      description: "Create your store listings.",
      category: "store",
      fuelReward: 15,
      requiredPlan: "cadet",
    },

    // Assets
    {
      id: "ms_social",
      title: "Generate a Social Blast",
      description: "Launch announcement posts.",
      category: "assets",
      fuelReward: 20,
      requiredPlan: "cadet",
      linkedTool: "social_blast",
    },
    {
      id: "ms_video",
      title: "Create a launch video script",
      description: "High-conversion hook + voiceover.",
      category: "assets",
      fuelReward: 25,
      requiredPlan: "commander",
      linkedTool: "video_script",
    },
    {
      id: "ms_presskit",
      title: "Build a press kit",
      description: "Everything media needs in one place.",
      category: "assets",
      fuelReward: 25,
      requiredPlan: "commander",
      linkedTool: "press_kit",
    },

    // Marketing
    {
      id: "ms_email",
      title: "Draft a launch email sequence",
      description: "Tease, launch, follow-up.",
      category: "marketing",
      fuelReward: 20,
      requiredPlan: "cadet",
      linkedTool: "email_sequence",
    },
    {
      id: "ms_ph",
      title: "Prepare Product Hunt copy",
      description: "Tagline, description, first comment.",
      category: "marketing",
      fuelReward: 20,
      requiredPlan: "commander",
      linkedTool: "product_hunt_copy",
    },
    {
      id: "ms_signal",
      title: "Stage your Signal Deck sequence",
      description: "Know what to post, when, where.",
      category: "marketing",
      fuelReward: 15,
      requiredPlan: "cadet",
      linkedTool: "signal_deck",
    },

    // Launch
    {
      id: "ms_submit",
      title: "Submit to App Store / Play",
      description: "Send your build for review.",
      category: "launch",
      fuelReward: 30,
      requiredPlan: "cadet",
    },
    {
      id: "ms_launched",
      title: "Mark Mission as Launched",
      description: "Blastoff! Celebrate the launch.",
      category: "launch",
      fuelReward: 50,
      requiredPlan: "cadet",
    },

    // Post-Launch
    {
      id: "ms_thankyou",
      title: "Send a thank-you email",
      description: "Thank early adopters.",
      category: "post_launch",
      fuelReward: 15,
      requiredPlan: "cadet",
      linkedTool: "email_sequence",
    },
    {
      id: "ms_reviews",
      title: "Request day-30 reviews",
      description: "Turn happy users into ratings.",
      category: "post_launch",
      fuelReward: 15,
      requiredPlan: "cadet",
    },
  ];
