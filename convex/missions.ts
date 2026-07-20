import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

import {
    adjustFuel,
    enrichMilestone,
    ensureMilestoneTemplates,
    getActiveMission,
    recalcReadiness,
    requireUser,
} from "./helpers";
import { BLUEPRINT_SECTIONS, planMeets } from "./templates";

/**
 * Foundation milestones the onboarding flow inherently completes (name,
 * one-liner, audience). Marked done + Fuel awarded the moment the Mission is
 * created — the "Fuel earned" reward beat from the onboarding spec.
 */
const ONBOARDING_COMPLETED_SLUGS = ["ms_name", "ms_oneliner", "ms_audience"];

/**
 * One bundled subscription powering the whole app's data layer when signed in.
 * Returns null user when signed out; null mission when onboarding isn't done.
 */
export const getLaunchData = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return null;
    const user = await ctx.db
      .query("users")
      .withIndex("by_clerkId", (q) => q.eq("clerkId", identity.subject))
      .unique();
    if (!user)
      return {
        user: null,
        mission: null,
        milestones: [],
        blueprints: [],
        assets: [],
        broadcasts: [],
      };

    const mission = await getActiveMission(ctx, user._id);

    if (!mission) {
      return {
        user,
        mission: null,
        milestones: [],
        blueprints: [],
        assets: [],
        broadcasts: [],
      };
    }

    const [milestonesRaw, blueprints, assets, broadcasts] = await Promise.all([
      ctx.db
        .query("milestones")
        .withIndex("by_missionId", (q) => q.eq("missionId", mission._id))
        .collect(),
      ctx.db
        .query("blueprints")
        .withIndex("by_missionId", (q) => q.eq("missionId", mission._id))
        .collect(),
      ctx.db
        .query("assets")
        .withIndex("by_missionId", (q) => q.eq("missionId", mission._id))
        .collect(),
      ctx.db
        .query("broadcasts")
        .withIndex("by_missionId", (q) => q.eq("missionId", mission._id))
        .collect(),
    ]);

    const milestones = await Promise.all(
      milestonesRaw.map((m) => enrichMilestone(ctx, m)),
    );

    return { user, mission, milestones, blueprints, assets, broadcasts };
  },
});

/** Create the first Mission + default milestones + starter Blueprints (Docs/06). */
export const createMission = mutation({
  args: {
    appName: v.string(),
    appDescription: v.string(),
    oneLiner: v.string(),
    targetAudience: v.string(),
    platform: v.union(
      v.literal("ios"),
      v.literal("android"),
      v.literal("both"),
    ),
    stage: v.union(
      v.literal("building"),
      v.literal("testing"),
      v.literal("store_prep"),
      v.literal("ready_to_submit"),
    ),
    launchDate: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const user = await requireUser(ctx);
    const now = Date.now();

    const missionId = await ctx.db.insert("missions", {
      userId: user._id,
      appName: args.appName,
      appDescription: args.appDescription,
      oneLiner: args.oneLiner,
      targetAudience: args.targetAudience,
      platform: args.platform,
      launchDate: args.launchDate,
      stage: args.stage,
      status: "active",
      readinessScore: 0,
      createdAt: now,
      updatedAt: now,
    });

    const templates = await ensureMilestoneTemplates(ctx);
    let onboardingFuel = 0;
    for (const template of templates) {
      const isLocked = !planMeets(user.plan, template.requiredPlan);
      const autoComplete =
        !isLocked && ONBOARDING_COMPLETED_SLUGS.includes(template.slug);
      await ctx.db.insert("milestones", {
        missionId,
        templateId: template._id,
        status: autoComplete ? "completed" : "pending",
        completedAt: autoComplete ? now : undefined,
        isLocked,
      });
      if (autoComplete) onboardingFuel += template.fuelReward;
    }

    // Award the foundation Fuel in one batched adjustment (the passed user's
    // fuelBalance is read once, so a single call avoids stale-balance overwrites).
    if (onboardingFuel > 0) {
      await adjustFuel(ctx, {
        user,
        amount: onboardingFuel,
        reason: "milestone_completed",
        missionId,
      });
    }

    for (const section of BLUEPRINT_SECTIONS) {
      const fields: Record<string, string> =
        section === "app_info"
          ? { appName: args.appName, oneLiner: args.oneLiner }
          : {};
      const completionStatus = section === "app_info" ? 25 : 0;
      await ctx.db.insert("blueprints", {
        missionId,
        section,
        fields,
        completionStatus,
        updatedAt: now,
      });
    }

    await recalcReadiness(ctx, missionId);
    return missionId;
  },
});
