/// <reference types="vite/client" />
import { expect, test } from "vitest";
import { api } from "./_generated/api";
import { seeded, modules } from "./test.setup";
import { convexTest } from "convex-test";
import schema from "./schema";

test("completing a milestone awards fuel and writes fuel history", async () => {
  const { t, userId, missionId } = await seeded();

  const milestoneId = await t.run((ctx) =>
    ctx.db.insert("milestones", {
      missionId,
      templateId: "ms_name",
      title: "Name your app",
      description: "Choose a memorable, clear name.",
      category: "foundation",
      completed: false,
      fuelReward: 10,
      requiredPlan: "cadet",
      isLocked: false,
    }),
  );

  await t
    .withIdentity({ subject: "clerk_test" })
    .mutation(api.milestones.complete, { milestoneId });

  const { user, milestone, history } = await t.run(async (ctx) => ({
    user: await ctx.db.get(userId),
    milestone: await ctx.db.get(milestoneId),
    history: await ctx.db.query("fuelHistory").collect(),
  }));

  expect(milestone?.completed).toBe(true);
  expect(user?.fuelBalance).toBe(35); // 25 + 10
  expect(
    history.some(
      (h) => h.reason === "milestone_completed" && h.amount === 10,
    ),
  ).toBe(true);
});

test("recalculates readiness after completion", async () => {
  const { t, missionId } = await seeded();

  // Insert two milestones; we'll complete one of them (50% readiness).
  const milestoneId = await t.run(async (ctx) => {
    const id = await ctx.db.insert("milestones", {
      missionId,
      templateId: "ms_name",
      title: "Name your app",
      description: "Choose a memorable name.",
      category: "foundation",
      completed: false,
      fuelReward: 10,
      requiredPlan: "cadet",
      isLocked: false,
    });
    // Second milestone stays incomplete.
    await ctx.db.insert("milestones", {
      missionId,
      templateId: "ms_oneliner",
      title: "Write your one-liner",
      description: "One sentence that nails the value.",
      category: "foundation",
      completed: false,
      fuelReward: 10,
      requiredPlan: "cadet",
      isLocked: false,
    });
    return id;
  });

  await t
    .withIdentity({ subject: "clerk_test" })
    .mutation(api.milestones.complete, { milestoneId });

  const mission = await t.run((ctx) => ctx.db.get(missionId));
  // 1 of 2 milestones complete → readinessScore should be 50.
  expect(mission?.readinessScore).toBe(50);
});

test("rejects completion from a different user (ownership)", async () => {
  const { t, missionId } = await seeded();

  const milestoneId = await t.run((ctx) =>
    ctx.db.insert("milestones", {
      missionId,
      templateId: "ms_name",
      title: "Name your app",
      description: "Choose a memorable name.",
      category: "foundation",
      completed: false,
      fuelReward: 10,
      requiredPlan: "cadet",
      isLocked: false,
    }),
  );

  // Insert a second user so requireUser succeeds for clerk_other;
  // execution will reach the ownership guard (mission.userId !== user._id).
  await t.run((ctx) =>
    ctx.db.insert("users", {
      clerkId: "clerk_other",
      email: "other@test.com",
      displayName: "Other User",
      plan: "cadet",
      fuelBalance: 25,
      currentStreak: 0,
      level: 1,
    }),
  );

  // A second user tries to complete a milestone belonging to clerk_test's mission.
  await expect(
    t
      .withIdentity({ subject: "clerk_other" })
      .mutation(api.milestones.complete, { milestoneId }),
  ).rejects.toThrow("Unauthorized");
});
