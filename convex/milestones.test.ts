/// <reference types="vite/client" />
import { convexTest } from "convex-test";
import { expect, test } from "vitest";
import { api } from "./_generated/api";
import schema from "./schema";
import { modules, seeded, seedMilestoneTemplate } from "./test.setup";

test("completing a milestone awards fuel and writes fuel history", async () => {
  const { t, userId, missionId } = await seeded();

  const milestoneId = await t.run(async (ctx) => {
    const templateId = await seedMilestoneTemplate(ctx, "ms_name");
    return await ctx.db.insert("milestones", {
      missionId,
      templateId,
      status: "pending",
      isLocked: false,
    });
  });

  await t
    .withIdentity({ subject: "clerk_test" })
    .mutation(api.milestones.complete, { milestoneId });

  const { user, milestone, history } = await t.run(async (ctx) => ({
    user: await ctx.db.get(userId),
    milestone: await ctx.db.get(milestoneId),
    history: await ctx.db.query("fuelHistory").collect(),
  }));

  expect(milestone?.status).toBe("completed");
  expect(user?.fuelBalance).toBe(35); // 25 + 10
  expect(
    history.some((h) => h.reason === "milestone_completed" && h.amount === 10),
  ).toBe(true);
});

test("recalculates readiness after completion", async () => {
  const { t, missionId } = await seeded();

  const milestoneId = await t.run(async (ctx) => {
    const nameTemplateId = await seedMilestoneTemplate(ctx, "ms_name");
    const oneLinerTemplateId = await seedMilestoneTemplate(ctx, "ms_oneliner");
    const id = await ctx.db.insert("milestones", {
      missionId,
      templateId: nameTemplateId,
      status: "pending",
      isLocked: false,
    });
    await ctx.db.insert("milestones", {
      missionId,
      templateId: oneLinerTemplateId,
      status: "pending",
      isLocked: false,
    });
    return id;
  });

  await t
    .withIdentity({ subject: "clerk_test" })
    .mutation(api.milestones.complete, { milestoneId });

  const mission = await t.run((ctx) => ctx.db.get(missionId));
  expect(mission?.readinessScore).toBe(50);
});

test("rejects completion from a different user (ownership)", async () => {
  const { t, missionId } = await seeded();

  const milestoneId = await t.run(async (ctx) => {
    const templateId = await seedMilestoneTemplate(ctx, "ms_name");
    return await ctx.db.insert("milestones", {
      missionId,
      templateId,
      status: "pending",
      isLocked: false,
    });
  });

  await t.run(async (ctx) => {
    await ctx.db.insert("users", {
      clerkId: "clerk_other",
      email: "other@test.com",
      displayName: "Other User",
      plan: "cadet",
      fuelBalance: 25,
      currentStreak: 0,
      level: 1,
      createdAt: Date.now(),
    });
  });

  await expect(
    t
      .withIdentity({ subject: "clerk_other" })
      .mutation(api.milestones.complete, { milestoneId }),
  ).rejects.toThrow("Unauthorized");
});

test("createMission seeds milestones from milestoneTemplates", async () => {
  const t = convexTest(schema, modules);

  await t.run(async (ctx) => {
    await ctx.db.insert("users", {
      clerkId: "clerk_mission",
      email: "mission@test.com",
      displayName: "Mission User",
      plan: "cadet",
      fuelBalance: 25,
      currentStreak: 0,
      level: 1,
      createdAt: Date.now(),
    });
  });

  await t
    .withIdentity({ subject: "clerk_mission", email: "mission@test.com" })
    .mutation(api.missions.createMission, {
      appName: "LaunchDeck",
      appDescription: "Launch prep app",
      oneLiner: "Launch with less chaos",
      targetAudience: "Indie founders",
      platform: "ios",
      stage: "building",
    });

  const counts = await t.run(async (ctx) => ({
    templates: (await ctx.db.query("milestoneTemplates").collect()).length,
    milestones: (await ctx.db.query("milestones").collect()).length,
  }));

  expect(counts.templates).toBeGreaterThan(0);
  expect(counts.milestones).toBe(counts.templates);
});

test("createMission completes the foundation milestones and awards their Fuel", async () => {
  const t = convexTest(schema, modules);

  await t.run(async (ctx) => {
    await ctx.db.insert("users", {
      clerkId: "clerk_reward",
      email: "reward@test.com",
      displayName: "Reward User",
      plan: "cadet",
      fuelBalance: 25,
      currentStreak: 0,
      level: 1,
      createdAt: Date.now(),
    });
  });

  await t
    .withIdentity({ subject: "clerk_reward", email: "reward@test.com" })
    .mutation(api.missions.createMission, {
      appName: "LaunchDeck",
      appDescription: "The full founder pitch goes here.",
      oneLiner: "Launch with less chaos",
      targetAudience: "Indie founders",
      platform: "ios",
      stage: "building",
    });

  const result = await t.run(async (ctx) => {
    const user = await ctx.db
      .query("users")
      .withIndex("by_clerkId", (q) => q.eq("clerkId", "clerk_reward"))
      .unique();
    const milestones = await ctx.db.query("milestones").collect();
    const completed = await Promise.all(
      milestones
        .filter((m) => m.status === "completed")
        .map(async (m) => {
          const tmpl = await ctx.db.get("milestoneTemplates", m.templateId);
          return tmpl?.slug;
        }),
    );
    const fuelHistory = await ctx.db.query("fuelHistory").collect();
    return { fuelBalance: user?.fuelBalance, completed, fuelHistory };
  });

  // ms_name, ms_oneliner, ms_audience auto-complete (10 Fuel each → +30).
  expect(result.completed.sort()).toEqual([
    "ms_audience",
    "ms_name",
    "ms_oneliner",
  ]);
  expect(result.fuelBalance).toBe(55);
  expect(result.fuelHistory).toHaveLength(1);
  expect(result.fuelHistory[0]).toMatchObject({
    amount: 30,
    reason: "milestone_completed",
  });
});
