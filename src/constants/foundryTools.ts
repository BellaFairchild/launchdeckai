import type { IconName } from "@/components/ui/Icon";
import type { AssetCategory, AssetType, Plan } from "@/types";

export interface FoundryTool {
  id: string;
  name: string;
  description: string;
  assetType: AssetType;
  category: AssetCategory;
  fuelCost: number;
  requiredPlan: Plan;
  /** Bespoke vector glyph (see components/ui/Icon) — never emoji. */
  icon: IconName;
}

/** Foundry generation tools (Docs/06). AI runs server-side via Convex Actions (Phase 9). */
export const FOUNDRY_TOOLS: FoundryTool[] = [
  {
    id: "app_store_copy",
    name: "App Store Copy",
    description: "Subtitle, keywords, and a converting description.",
    assetType: "app_store_copy",
    category: "app_store",
    fuelCost: 20,
    requiredPlan: "cadet",
    icon: "store",
  },
  {
    id: "social_blast",
    name: "Social Blast",
    description: "Launch posts for X, Instagram, and LinkedIn.",
    assetType: "social_blast",
    category: "social",
    fuelCost: 15,
    requiredPlan: "cadet",
    icon: "megaphone",
  },
  {
    id: "email_sequence",
    name: "Email Sequence",
    description: "Tease, launch, and follow-up emails.",
    assetType: "email_sequence",
    category: "pr",
    fuelCost: 20,
    requiredPlan: "cadet",
    icon: "mail",
  },
  {
    id: "press_kit",
    name: "Press Kit",
    description: "Everything media needs in one place.",
    assetType: "press_kit",
    category: "pr",
    fuelCost: 25,
    requiredPlan: "commander",
    icon: "press",
  },
  {
    id: "video_script",
    name: "Video Script",
    description: "High-conversion hook + voiceover script.",
    assetType: "video_script",
    category: "media",
    fuelCost: 25,
    requiredPlan: "commander",
    icon: "film",
  },
  {
    id: "product_hunt_copy",
    name: "Product Hunt Copy",
    description: "Tagline, description, and first comment.",
    assetType: "product_hunt_copy",
    category: "social",
    fuelCost: 20,
    requiredPlan: "commander",
    icon: "rocket",
  },
  {
    id: "signal_asset",
    name: "Signal Deck Asset Forge",
    description: "Forge the asset a specific signal needs.",
    assetType: "signal_asset",
    category: "social",
    fuelCost: 15,
    requiredPlan: "cadet",
    icon: "signal",
  },
];

export function foundryToolById(id: string): FoundryTool | undefined {
  return FOUNDRY_TOOLS.find((t) => t.id === id);
}
