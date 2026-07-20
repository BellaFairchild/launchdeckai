/// <reference types="vite/client" />
import { expect, test } from "vitest";
import { api } from "./_generated/api";
import { seeded } from "./test.setup";

// "social_blast" costs 15 fuel and requires "cadet" plan — both satisfied by the
// seeded user (25 fuel, cadet plan).
const TOOL = "social_blast";
const TOOL_COST = 15;

test("createFoundryAsset deducts fuel only on success and writes history", async () => {
  const { t, userId } = await seeded();

  const assetId = await t
    .withIdentity({ subject: "clerk_test" })
    .mutation(api.assets.createFoundryAsset, {
      tool: TOOL,
      assetType: "social_post",
      category: "marketing",
      title: "Launch Day Social Blast",
      content: "🚀 We're live!",
    });

  const { user, assets, history } = await t.run(async (ctx) => ({
    user: await ctx.db.get(userId),
    assets: await ctx.db.query("assets").collect(),
    history: await ctx.db.query("fuelHistory").collect(),
  }));

  expect(assetId).toBeTruthy();
  expect(assets).toHaveLength(1);
  expect(user?.fuelBalance).toBe(25 - TOOL_COST); // 10
  expect(
    history.some(
      (h) => h.reason === "foundry_generation" && h.amount === -TOOL_COST,
    ),
  ).toBe(true);
});

test("rejects when fuel is insufficient and leaves balance unchanged", async () => {
  const { t, userId } = await seeded();

  // Drop fuelBalance to 2 so it cannot cover TOOL_COST (15).
  await t.run((ctx) => ctx.db.patch(userId, { fuelBalance: 2 }));

  await expect(
    t
      .withIdentity({ subject: "clerk_test" })
      .mutation(api.assets.createFoundryAsset, {
        tool: TOOL,
        assetType: "social_post",
        category: "marketing",
        title: "Should Fail",
        content: "This should not be saved.",
      }),
  ).rejects.toThrow();

  const { user, assets } = await t.run(async (ctx) => ({
    user: await ctx.db.get(userId),
    assets: await ctx.db.query("assets").collect(),
  }));

  // Balance unchanged, no asset created.
  expect(user?.fuelBalance).toBe(2);
  expect(assets).toHaveLength(0);
});
