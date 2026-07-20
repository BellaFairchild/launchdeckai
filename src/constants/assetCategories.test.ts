import { groupByCategory, withAlpha } from "./assetCategories";
import type { Asset } from "@/types";

function asset(id: string, category: Asset["category"]): Asset {
  return { id, type: "social_blast", title: id, status: "in_prep", category, updatedAt: 0 };
}

describe("groupByCategory", () => {
  it("groups by category in display order and drops empty categories", () => {
    const groups = groupByCategory([
      asset("a", "social"),
      asset("b", "app_store"),
      asset("c", "social"),
    ]);
    // app_store comes before social in CATEGORY_ORDER
    expect(groups.map((g) => g.category)).toEqual(["app_store", "social"]);
    expect(groups[0].assets.map((a) => a.id)).toEqual(["b"]);
    expect(groups[1].assets.map((a) => a.id)).toEqual(["a", "c"]);
  });

  it("returns an empty array when there are no assets", () => {
    expect(groupByCategory([])).toEqual([]);
  });
});

describe("withAlpha", () => {
  it("converts a 6-digit hex to rgba", () => {
    expect(withAlpha("#4DC8C0", 0.5)).toBe("rgba(77, 200, 192, 0.5)");
  });
  it("expands a 3-digit hex", () => {
    expect(withAlpha("#abc", 1)).toBe("rgba(170, 187, 204, 1)");
  });
});
