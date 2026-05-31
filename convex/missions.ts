import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

import { requireUser, recalcReadiness } from "./helpers";
import { MILESTONE_TEMPLATES, BLUEPRINT_SECTIONS, planMeets } from "./templates";

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
    if (!user) return { user: null, mission: null, milestones: [], blueprints: [], assets: [] };

    const mission = await ctx.db
      .query("missions")
      .withIndex("by_userId", (q) => q.eq("userId", user._id))
      .filter((q) => q.eq(q.field("status"), "active"))
      .first();

    if (!mission) {
      return { user, mission: null, milestones: [], blueprints: [], assets: [] };
    }

    const [milestones, blueprints, assets] = await Promise.all([
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
    ]);

    return { user, mission, milestones, blueprints, assets };
  },
});

/** Create the first Mission + default milestones + starter Blueprints (Docs/06). */
export const createMission = mutation({
  args: {
    appName: v.string(),
    appDescription: v.string(),
    oneLiner: v.string(),
    targetAudience: v.string(),
    platform: v.union(v.literal("ios"), v.literal("android"), v.literal("both")),
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
    });

    for (const t of MILESTONE_TEMPLATES) {
      await ctx.db.insert("milestones", {
        missionId,
        templateId: t.id,
        title: t.title,
        description: t.description,
        category: t.category,
        completed: false,
        fuelReward: t.fuelReward,
        requiredPlan: t.requiredPlan,
        isLocked: !planMeets(user.plan, t.requiredPlan),
      });
    }

    for (const section of BLUEPRINT_SECTIONS) {
      const fields: Record<string, string> =
        section === "app_info"
          ? { appName: args.appName, oneLiner: args.oneLiner }
          : {};
      const completionStatus = section === "app_info" ? 25 : 0;
      await ctx.db.insert("blueprints", { missionId, section, fields, completionStatus });
    }

    await recalcReadiness(ctx, missionId);
    return missionId;
  },
});
