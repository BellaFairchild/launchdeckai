import type { Asset, AssetCategory } from "@/types";

/**
 * Display metadata per Cargo Bay asset category. Hexes validated in the design
 * mockup; they drive the CategoryCard's gradient ring, glyph tint, and the grid
 * order. Glyphs are emoji to match the Foundry tool convention.
 */
export const CATEGORY_META: Record<
  AssetCategory,
  { label: string; glyph: string; hex: string }
> = {
  app_store: { label: "App Store", glyph: "🏪", hex: "#4DC8C0" },
  social: { label: "Social", glyph: "📣", hex: "#1DA1F2" },
  media: { label: "Media", glyph: "🎬", hex: "#F59E0B" },
  pr: { label: "PR", glyph: "🗞️", hex: "#FE2C55" },
  legal: { label: "Legal", glyph: "⚖️", hex: "#A78BFA" },
  files: { label: "Files", glyph: "📁", hex: "#64748B" },
};

/** Stable display order for the category grid. */
export const CATEGORY_ORDER: AssetCategory[] = [
  "app_store",
  "social",
  "media",
  "pr",
  "legal",
  "files",
];

/** A non-empty category bucket, in display order. */
export type CategoryGroup = { category: AssetCategory; assets: Asset[] };

/** Group assets by category in display order, dropping empty categories. */
export function groupByCategory(assets: Asset[]): CategoryGroup[] {
  return CATEGORY_ORDER.map((category) => ({
    category,
    assets: assets.filter((a) => a.category === category),
  })).filter((group) => group.assets.length > 0);
}

/** #RGB / #RRGGBB → an rgba() string at the given alpha. */
export function withAlpha(hex: string, alpha: number): string {
  let h = hex.replace("#", "");
  if (h.length === 3) {
    h = h
      .split("")
      .map((c) => c + c)
      .join("");
  }
  const r = parseInt(h.slice(0, 2), 16);
  const g = parseInt(h.slice(2, 4), 16);
  const b = parseInt(h.slice(4, 6), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}
