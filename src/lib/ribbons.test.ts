import { deriveRibbons } from "./ribbons";

it("awards First Launch once any milestone is complete", () => {
  const ribbons = deriveRibbons({ completedMilestones: 1, forgedAssets: 0, signalsReady: 0, streak: 0 });
  expect(ribbons.find((r) => r.id === "first_launch")?.earned).toBe(true);
});

it("locks Forge Master until 3 assets are forged", () => {
  expect(deriveRibbons({ completedMilestones: 0, forgedAssets: 2, signalsReady: 0, streak: 0 })
    .find((r) => r.id === "forge_master")?.earned).toBe(false);
  expect(deriveRibbons({ completedMilestones: 0, forgedAssets: 3, signalsReady: 0, streak: 0 })
    .find((r) => r.id === "forge_master")?.earned).toBe(true);
});

it("always returns the full ribbon catalog (earned + unearned)", () => {
  const ribbons = deriveRibbons({ completedMilestones: 0, forgedAssets: 0, signalsReady: 0, streak: 0 });
  expect(ribbons).toHaveLength(4);
  expect(ribbons.every((r) => r.earned === false)).toBe(true);
});
