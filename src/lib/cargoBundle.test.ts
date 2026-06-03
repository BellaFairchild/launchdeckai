import { buildCargoBundle } from "./cargoBundle";
import type { Asset } from "@/types";

function asset(id: string, status: Asset["status"], content?: string): Asset {
  return {
    id,
    type: "social_blast",
    title: id.toUpperCase(),
    status,
    category: "social",
    content,
    updatedAt: 0,
  };
}

describe("buildCargoBundle", () => {
  it("includes only flight-ready assets, in order", () => {
    const { ids, doc } = buildCargoBundle([
      asset("a", "flight_ready", "Alpha"),
      asset("b", "in_prep", "Beta"),
      asset("c", "flight_ready", "Gamma"),
    ]);
    expect(ids).toEqual(["a", "c"]);
    expect(doc).toBe("## A\n\nAlpha\n\n---\n\n## C\n\nGamma");
  });

  it("falls back to a placeholder when an asset has no content", () => {
    const { doc } = buildCargoBundle([asset("a", "flight_ready")]);
    expect(doc).toBe("## A\n\n(no content yet)");
  });

  it("returns empty ids + doc when nothing is flight-ready", () => {
    expect(buildCargoBundle([asset("a", "in_prep", "x")])).toEqual({ ids: [], doc: "" });
  });
});
