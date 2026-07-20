import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

/**
 * LaunchDeckAI Convex schema — source of truth: Docs/09_DATA_SCHEMA_AND_BACKEND_RULES.md.
 * Identity is always derived from Clerk on the server; never trust a client userId.
 * readinessScore is backend-calculated only (see helpers.recalcReadiness).
 */

const plan = v.union(
  v.literal("cadet"),
  v.literal("commander"),
  v.literal("admiral"),
);

const platform = v.union(
  v.literal("ios"),
  v.literal("android"),
  v.literal("both"),
);

const missionStage = v.union(
  v.literal("building"),
  v.literal("testing"),
  v.literal("store_prep"),
  v.literal("ready_to_submit"),
);

const missionStatus = v.union(
  v.literal("active"),
  v.literal("launched"),
  v.literal("archived"),
);

const milestoneCategory = v.union(
  v.literal("foundation"),
  v.literal("store"),
  v.literal("assets"),
  v.literal("marketing"),
  v.literal("launch"),
  v.literal("post_launch"),
);

const milestoneStatus = v.union(v.literal("pending"), v.literal("completed"));

const assetStatus = v.union(
  v.literal("not_loaded"),
  v.literal("in_prep"),
  v.literal("needs_clearance"),
  v.literal("flight_ready"),
  v.literal("exported"),
);

const fuelReason = v.union(
  v.literal("milestone_completed"),
  v.literal("foundry_generation"),
  v.literal("copilot_message"),
  v.literal("monthly_plan_grant"),
  v.literal("daily_drip"),
  v.literal("admin_adjustment"),
);

const copilotRole = v.union(
  v.literal("user"),
  v.literal("assistant"),
  v.literal("system"),
);

const subscriptionStatus = v.union(
  v.literal("active"),
  v.literal("trialing"),
  v.literal("expired"),
  v.literal("cancelled"),
  v.literal("grace_period"),
);

export default defineSchema({
  users: defineTable({
    clerkId: v.string(),
    email: v.string(),
    displayName: v.string(),
    plan,
    fuelBalance: v.number(),
    currentStreak: v.number(),
    /** Gamification tier — separate from subscription plan. */
    level: v.number(),
    createdAt: v.number(),
  }).index("by_clerkId", ["clerkId"]),

  missions: defineTable({
    userId: v.id("users"),
    appName: v.string(),
    oneLiner: v.string(),
    appDescription: v.string(),
    targetAudience: v.string(),
    platform,
    launchDate: v.optional(v.number()),
    stage: missionStage,
    status: missionStatus,
    /** Backend-owned; recalculated in helpers.recalcReadiness — never set from UI. */
    readinessScore: v.number(),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_userId", ["userId"])
    .index("by_userId_status", ["userId", "status"]),

  milestoneTemplates: defineTable({
    slug: v.string(),
    title: v.string(),
    description: v.string(),
    category: milestoneCategory,
    fuelReward: v.number(),
    requiredPlan: plan,
    order: v.number(),
  })
    .index("by_slug", ["slug"])
    .index("by_order", ["order"]),

  milestones: defineTable({
    missionId: v.id("missions"),
    templateId: v.id("milestoneTemplates"),
    status: milestoneStatus,
    completedAt: v.optional(v.number()),
    /** Plan gate snapshot at mission creation — revalidated on plan change later. */
    isLocked: v.boolean(),
  })
    .index("by_missionId", ["missionId"])
    .index("by_missionId_and_templateId", ["missionId", "templateId"]),

  blueprints: defineTable({
    missionId: v.id("missions"),
    section: v.string(),
    fields: v.record(v.string(), v.string()),
    completionStatus: v.number(),
    updatedAt: v.number(),
  }).index("by_missionId", ["missionId"]),

  assets: defineTable({
    missionId: v.id("missions"),
    userId: v.id("users"),
    type: v.string(),
    title: v.string(),
    content: v.optional(v.string()),
    status: assetStatus,
    category: v.string(),
    tone: v.optional(v.string()),
    signalId: v.optional(v.string()),
    signalLabel: v.optional(v.string()),
    signalPhase: v.optional(
      v.union(
        v.literal("pre_launch"),
        v.literal("launch_day"),
        v.literal("post_launch"),
      ),
    ),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_missionId", ["missionId"])
    .index("by_userId", ["userId"]),

  fuelHistory: defineTable({
    userId: v.id("users"),
    missionId: v.optional(v.id("missions")),
    amount: v.number(),
    reason: fuelReason,
    createdAt: v.number(),
  }).index("by_userId", ["userId"]),

  copilotMessages: defineTable({
    userId: v.id("users"),
    missionId: v.id("missions"),
    role: copilotRole,
    content: v.string(),
    mode: v.union(v.literal("standard"), v.literal("powerful")),
    fuelCost: v.number(),
    createdAt: v.number(),
  }).index("by_missionId", ["missionId"]),

  subscriptions: defineTable({
    userId: v.id("users"),
    plan,
    status: subscriptionStatus,
    revenueCatCustomerId: v.optional(v.string()),
    productId: v.optional(v.string()),
    updatedAt: v.number(),
  }).index("by_userId", ["userId"]),

  broadcasts: defineTable({
    missionId: v.id("missions"),
    userId: v.id("users"),
    signalId: v.string(),
    destinationUrl: v.string(),
    scheduledAt: v.number(),
  })
    .index("by_missionId", ["missionId"])
    .index("by_missionId_and_signalId", ["missionId", "signalId"])
    .index("by_userId_and_signalId", ["userId", "signalId"]),

  savedResources: defineTable({
    userId: v.id("users"),
    resourceId: v.string(),
  })
    .index("by_userId", ["userId"])
    .index("by_user_resource", ["userId", "resourceId"]),
});
