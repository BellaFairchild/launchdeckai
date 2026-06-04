import type { AssetType, AssetCategory, Plan } from "@/types";

/**
 * The platform each tool forges *for*. Drives the card's hover/press color
 * system (border tint, ambient wash, icon glow) so each tool wears its
 * destination's brand color. See PLATFORM_BRAND below + FoundryToolCard.
 */
export type ToolPlatform =
  | "apple"
  | "twitter"
  | "email"
  | "linkedin"
  | "tiktok"
  | "producthunt"
  | "signal";

export interface FoundryTool {
  id: string;
  name: string;
  description: string;
  assetType: AssetType;
  category: AssetCategory;
  fuelCost: number;
  requiredPlan: Plan;
  glyph: string;
  platform: ToolPlatform;
}

/** Brand color + short label per platform. Hex feeds the dynamic card glow. */
export const PLATFORM_BRAND: Record<ToolPlatform, { hex: string; label: string }> = {
  apple: { hex: "#FFFFFF", label: "App Store" },
  twitter: { hex: "#1DA1F2", label: "X / Twitter" },
  email: { hex: "#F97316", label: "Email" },
  linkedin: { hex: "#0A66C2", label: "Press / LinkedIn" },
  tiktok: { hex: "#FE2C55", label: "Video" },
  producthunt: { hex: "#DA552F", label: "Product Hunt" },
  signal: { hex: "#4DC8C0", label: "Signal Deck" },
};

/** Foundry generation tools (Docs/06). AI runs server-side via Convex Actions (Phase 9). */
export const FOUNDRY_TOOLS: FoundryTool[] = [
  { id: "app_store_copy", name: "App Store Copy", description: "Subtitle, keywords, and a converting description.", assetType: "app_store_copy", category: "app_store", fuelCost: 20, requiredPlan: "cadet", glyph: "🏪", platform: "apple" },
  { id: "social_blast", name: "Social Blast", description: "Launch posts for X, Instagram, and LinkedIn.", assetType: "social_blast", category: "social", fuelCost: 15, requiredPlan: "cadet", glyph: "📣", platform: "twitter" },
  { id: "email_sequence", name: "Email Sequence", description: "Tease, launch, and follow-up emails.", assetType: "email_sequence", category: "pr", fuelCost: 20, requiredPlan: "cadet", glyph: "✉️", platform: "email" },
  { id: "press_kit", name: "Press Kit", description: "Everything media needs in one place.", assetType: "press_kit", category: "pr", fuelCost: 25, requiredPlan: "commander", glyph: "🗞️", platform: "linkedin" },
  { id: "video_script", name: "Video Script", description: "High-conversion hook + voiceover script.", assetType: "video_script", category: "media", fuelCost: 25, requiredPlan: "commander", glyph: "🎬", platform: "tiktok" },
  { id: "product_hunt_copy", name: "Product Hunt Copy", description: "Tagline, description, and first comment.", assetType: "product_hunt_copy", category: "social", fuelCost: 20, requiredPlan: "commander", glyph: "🐱", platform: "producthunt" },
  { id: "signal_asset", name: "Signal Deck Asset Forge", description: "Forge the asset a specific signal needs.", assetType: "signal_asset", category: "social", fuelCost: 15, requiredPlan: "cadet", glyph: "📡", platform: "signal" },
];

export function foundryToolById(id: string): FoundryTool | undefined {
  return FOUNDRY_TOOLS.find((t) => t.id === id);
}
