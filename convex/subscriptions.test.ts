/// <reference types="vite/client" />
import { expect, test } from "vitest";
import { internal } from "./_generated/api";
import { seeded } from "./test.setup";

test("a downgrade lowers plan but keeps all user data", async () => {
  const { t, userId, missionId } = await seeded();

  // Elevate the user to admiral so we can observe a downgrade.
  await t.run((ctx) => ctx.db.patch(userId, { plan: "admiral" }));

  // Simulate a plan expiry → downgrade to cadet.
  await t.mutation(internal.subscriptions.applyEntitlement, {
    clerkId: "clerk_test",
    plan: "cadet",
    status: "expired",
  });

  const { user, mission } = await t.run(async (ctx) => ({
    user: await ctx.db.get(userId),
    mission: await ctx.db.get(missionId),
  }));

  // Plan downgraded.
  expect(user?.plan).toBe("cadet");
  // Mission data is intact — downgrade never deletes rows.
  expect(mission).not.toBeNull();
  expect(mission?.appName).toBe("TestApp");
});

test("applyEntitlement upserts subscription row on upgrade", async () => {
  const { t, userId } = await seeded();

  // No subscription row exists yet; applyEntitlement should create one.
  await t.mutation(internal.subscriptions.applyEntitlement, {
    clerkId: "clerk_test",
    plan: "commander",
    status: "active",
  });

  const { user, subscription } = await t.run(async (ctx) => ({
    user: await ctx.db.get(userId),
    subscription: await ctx.db
      .query("subscriptions")
      .withIndex("by_userId", (q) => q.eq("userId", userId))
      .unique(),
  }));

  expect(user?.plan).toBe("commander");
  expect(subscription?.plan).toBe("commander");
  expect(subscription?.status).toBe("active");
});

test("applyEntitlement is a no-op for an unknown clerkId", async () => {
  const { t } = await seeded();

  // Should not throw — just silently return.
  await expect(
    t.mutation(internal.subscriptions.applyEntitlement, {
      clerkId: "clerk_unknown",
      plan: "admiral",
      status: "active",
    }),
  ).resolves.toBeNull();
});
