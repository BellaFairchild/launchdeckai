import type { Asset } from "@/types";

/**
 * Package every flight-ready asset into one share document. Returns the asset
 * ids included (to flip to `exported` after a successful share) and the joined
 * markdown text. Non-flight-ready assets are excluded.
 */
export function buildCargoBundle(assets: Asset[]): { ids: string[]; doc: string } {
  const ready = assets.filter((a) => a.status === "flight_ready");
  const doc = ready
    .map((a) => `## ${a.title}\n\n${a.content?.trim() || "(no content yet)"}`)
    .join("\n\n---\n\n");
  return { ids: ready.map((a) => a.id), doc };
}
