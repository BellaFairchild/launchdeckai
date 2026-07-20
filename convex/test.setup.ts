/// <reference types="vite/client" />
import { convexTest } from "convex-test";
import type { MutationCtx } from "./_generated/server";
import schema from "./schema";
import { MILESTONE_TEMPLATES } from "./templates";

// Module map — required so convex-test can discover function files under vitest.
export const modules = import.meta.glob("./**/*.ts");

export async function seedMilestoneTemplate(ctx: MutationCtx, slug: string) {
  const template = MILESTONE_TEMPLATES.find((t) => t.slug === slug);
  if (!template) throw new Error(`Unknown template slug: ${slug}`);
  return await ctx.db.insert("milestoneTemplates", {
    slug: template.slug,
    title: template.title,
    description: template.description,
    category: template.category,
    fuelReward: template.fuelReward,
    requiredPlan: template.requiredPlan,
    order: MILESTONE_TEMPLATES.indexOf(template),
  });
}

/** A test Convex instance with one cadet user (25 fuel) + one active mission. */
export async function seeded() {
  const t = convexTest(schema, modules);
  const ids = await t.run(async (ctx) => {
    const now = Date.now();
    const userId = await ctx.db.insert("users", {
      clerkId: "clerk_test",
      email: "test@launchdeckai.com",
      displayName: "Test Commander",
      plan: "cadet",
      fuelBalance: 25,
      currentStreak: 0,
      level: 1,
      createdAt: now,
    });

    const missionId = await ctx.db.insert("missions", {
      userId,
      appName: "TestApp",
      appDescription: "A test application for smoke tests",
      oneLiner: "Test app one liner",
      targetAudience: "Developers",
      platform: "ios",
      stage: "building",
      status: "active",
      readinessScore: 0,
      createdAt: now,
      updatedAt: now,
    });

    return { userId, missionId };
  });
  return { t, ...ids };
}
