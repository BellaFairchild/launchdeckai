import type { BlueprintSection } from "@/types";

export interface BlueprintField {
  key: string;
  label: string;
  example: string;
  multiline?: boolean;
}

export interface BlueprintSectionMeta {
  id: BlueprintSection;
  title: string;
  description: string;
  /** Emoji glyph shown on the section card (matches Foundry tool cards). */
  glyph: string;
  /** Foundry tool relevant to this section, if any. */
  foundryTool?: string;
  fields: BlueprintField[];
}

/** Blueprint section definitions (Docs/06). Powers Foundry, Copilot, Signal Deck context. */
export const BLUEPRINT_SECTIONS: BlueprintSectionMeta[] = [
  {
    id: "app_info",
    title: "App Info",
    description: "The core of your Mission.",
    glyph: "📱",
    fields: [
      { key: "appName", label: "App name", example: "FocusFlow" },
      { key: "oneLiner", label: "One-liner", example: "Mindful task tracking for overwhelmed builders." },
      { key: "problemSolved", label: "Problem you solve", example: "Builders burn out juggling too many tasks.", multiline: true },
      { key: "mainBenefit", label: "Main benefit", example: "Calm, focused progress every day.", multiline: true },
    ],
  },
  {
    id: "app_store",
    title: "App Store",
    description: "Store listing copy and metadata.",
    glyph: "🏪",
    foundryTool: "app_store_copy",
    fields: [
      { key: "subtitle", label: "Subtitle", example: "Calm task tracking" },
      { key: "keywords", label: "Keywords", example: "tasks, focus, productivity, calm" },
      { key: "promoText", label: "Promotional text", example: "New: weekly focus reviews.", multiline: true },
      { key: "description", label: "Description", example: "FocusFlow helps you...", multiline: true },
    ],
  },
  {
    id: "legal_compliance",
    title: "Legal & Compliance",
    description: "Privacy, terms, and data handling.",
    glyph: "⚖️",
    fields: [
      { key: "privacyUrl", label: "Privacy policy URL", example: "https://focusflow.app/privacy" },
      { key: "termsUrl", label: "Terms URL", example: "https://focusflow.app/terms" },
      { key: "dataCollection", label: "Data you collect", example: "Email, usage analytics.", multiline: true },
    ],
  },
  {
    id: "marketing",
    title: "Marketing",
    description: "Audience, channels, and positioning.",
    glyph: "📣",
    fields: [
      { key: "targetAudience", label: "Target audience", example: "Solo founders, indie hackers." },
      { key: "channels", label: "Channels", example: "X, Product Hunt, TikTok, email." },
      { key: "valueProp", label: "Value proposition", example: "Launch calm, not chaotic.", multiline: true },
    ],
  },
  {
    id: "beta_testing",
    title: "Beta Testing",
    description: "Get real feedback before launch.",
    glyph: "🧪",
    fields: [
      { key: "testflightSetup", label: "TestFlight / Play testing", example: "Internal track + 50 testers." },
      { key: "feedbackChannel", label: "Feedback channel", example: "In-app form + Discord." },
      { key: "testerCount", label: "Target tester count", example: "100" },
    ],
  },
  {
    id: "pre_launch",
    title: "Pre-Launch",
    description: "Build anticipation.",
    glyph: "⏳",
    fields: [
      { key: "waitlistGoal", label: "Waitlist goal", example: "500 signups" },
      { key: "teaserPlan", label: "Teaser plan", example: "Dev logs + reveal teaser.", multiline: true },
    ],
  },
  {
    id: "launch_day",
    title: "Launch Day",
    description: "Coordinate the big day.",
    glyph: "🚀",
    fields: [
      { key: "launchTime", label: "Launch time", example: "06:00 PT (Product Hunt)" },
      { key: "productHuntPlan", label: "Product Hunt plan", example: "Submit 06:00, rally first comment.", multiline: true },
    ],
  },
  {
    id: "post_launch",
    title: "Post-Launch",
    description: "Sustain momentum.",
    glyph: "📈",
    fields: [
      { key: "retentionPlan", label: "Retention plan", example: "Onboarding emails, weekly tips.", multiline: true },
      { key: "reviewStrategy", label: "Review strategy", example: "Prompt happy users at day 30." },
    ],
  },
];
