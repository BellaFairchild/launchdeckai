import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

/**
 * LaunchDeckAI Convex schema — source of truth: Docs/09_DATA_SCHEMA_AND_BACKEND_RULES.md.
 * Convex owns all product truth (plan, fuel, missions, milestones, assets, etc.).
 * Phase 9 uses the AI action; the queries/mutations that read/write these tables
 * land with auth in Phase 4. Tables are defined now so the schema is complete.
 */

const plan = v.union(
  v.literal("cadet"),
  v.literal("commander"),
  v.literal("admiral"),
);

export default defineSchema({
  users: defineTable({
    clerkId: v.string(),
    email: v.string(),
    displayName: v.string(),
    plan,
    fuelBalance: v.number(),
    currentStreak: v.number(),
    level: v.number(),
  }).index("by_clerkId", ["clerkId"]),

  missions: defineTable({
    userId: v.id("users"),
    appName: v.string(),
    appDescription: v.string(),
    oneLiner: v.string(),
    targetAudience: v.string(),
    platform: v.union(v.literal("ios"), v.literal("android"), v.literal("both")),
    launchDate: v.optional(v.number()),
    stage: v.union(
      v.literal("building"),
      v.literal("testing"),
      v.literal("store_prep"),
      v.literal("ready_to_submit"),
    ),
    status: v.union(
      v.literal("active"),
      v.literal("launched"),
      v.literal("archived"),
    ),
    readinessScore: v.number(),
  }).index("by_userId", ["userId"]),

  milestones: defineTable({
    missionId: v.id("missions"),
    templateId: v.string(),
    title: v.string(),
    description: v.string(),
    category: v.string(),
    completed: v.boolean(),
    completedAt: v.optional(v.number()),
    fuelReward: v.number(),
    requiredPlan: plan,
    isLocked: v.boolean(),
  }).index("by_missionId", ["missionId"]),

  blueprints: defineTable({
    missionId: v.id("missions"),
    section: v.string(),
    fields: v.record(v.string(), v.string()),
    completionStatus: v.number(),
  }).index("by_missionId", ["missionId"]),

  assets: defineTable({
    missionId: v.id("missions"),
    userId: v.id("users"),
    type: v.string(),
    title: v.string(),
    content: v.optional(v.string()),
    status: v.union(
      v.literal("not_loaded"),
      v.literal("in_prep"),
      v.literal("needs_clearance"),
      v.literal("flight_ready"),
      v.literal("exported"),
    ),
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
  })
    .index("by_missionId", ["missionId"])
    .index("by_userId", ["userId"]),

  fuelHistory: defineTable({
    userId: v.id("users"),
    missionId: v.optional(v.id("missions")),
    amount: v.number(),
    reason: v.union(
      v.literal("milestone_completed"),
      v.literal("foundry_generation"),
      v.literal("copilot_message"),
      v.literal("monthly_plan_grant"),
      v.literal("daily_drip"),
      v.literal("admin_adjustment"),
    ),
  }).index("by_userId", ["userId"]),

  copilotMessages: defineTable({
    userId: v.id("users"),
    missionId: v.id("missions"),
    role: v.union(
      v.literal("user"),
      v.literal("assistant"),
      v.literal("system"),
    ),
    content: v.string(),
    mode: v.union(v.literal("standard"), v.literal("powerful")),
    fuelCost: v.number(),
  }).index("by_missionId", ["missionId"]),

  subscriptions: defineTable({
    userId: v.id("users"),
    plan,
    status: v.union(
      v.literal("active"),
      v.literal("trialing"),
      v.literal("expired"),
      v.literal("cancelled"),
      v.literal("grace_period"),
    ),
    revenueCatCustomerId: v.optional(v.string()),
    productId: v.optional(v.string()),
  }).index("by_userId", ["userId"]),
});
