import type { Doc, Id } from "./_generated/dataModel";
import type { MutationCtx, QueryCtx } from "./_generated/server";

import { MILESTONE_TEMPLATES, planMeets } from "./templates";

/** Client-facing milestone shape returned from getLaunchData (template joined server-side). */
export type EnrichedMilestone = Doc<"milestones"> & {
  title: string;
  description: string;
  category: string;
  fuelReward: number;
  requiredPlan: Doc<"milestoneTemplates">["requiredPlan"];
  completed: boolean;
};

/**
 * Resolve the signed-in user from Clerk identity (never trust a client userId).
 * clerkId is mapped from identity.subject (Clerk user id).
 */
export async function requireUser(
  ctx: QueryCtx | MutationCtx,
): Promise<Doc<"users">> {
  const identity = await ctx.auth.getUserIdentity();
  if (!identity) throw new Error("Not authenticated");
  const user = await ctx.db
    .query("users")
    .withIndex("by_clerkId", (q) => q.eq("clerkId", identity.subject))
    .unique();
  if (!user) throw new Error("User not found — create the user record first");
  return user;
}

/** The signed-in user's active mission, or null. */
export async function getActiveMission(
  ctx: QueryCtx | MutationCtx,
  userId: Id<"users">,
): Promise<Doc<"missions"> | null> {
  return await ctx.db
    .query("missions")
    .withIndex("by_userId_status", (q) =>
      q.eq("userId", userId).eq("status", "active"),
    )
    .first();
}

/** Seed milestoneTemplates from server constants when empty (idempotent). */
export async function ensureMilestoneTemplates(
  ctx: MutationCtx,
): Promise<Doc<"milestoneTemplates">[]> {
  const existing = await ctx.db
    .query("milestoneTemplates")
    .withIndex("by_order")
    .collect();
  if (existing.length > 0) {
    return existing.sort((a, b) => a.order - b.order);
  }

  const seeded: Doc<"milestoneTemplates">[] = [];
  for (let i = 0; i < MILESTONE_TEMPLATES.length; i++) {
    const t = MILESTONE_TEMPLATES[i];
    const id = await ctx.db.insert("milestoneTemplates", {
      slug: t.slug,
      title: t.title,
      description: t.description,
      category: t.category,
      fuelReward: t.fuelReward,
      requiredPlan: t.requiredPlan,
      order: i,
    });
    const doc = await ctx.db.get("milestoneTemplates", id);
    if (doc) seeded.push(doc);
  }
  return seeded;
}

export async function enrichMilestone(
  ctx: QueryCtx | MutationCtx,
  milestone: Doc<"milestones">,
): Promise<EnrichedMilestone> {
  const template = await ctx.db.get("milestoneTemplates", milestone.templateId);
  if (!template) {
    throw new Error(`Missing milestone template for ${milestone._id}`);
  }
  return {
    ...milestone,
    title: template.title,
    description: template.description,
    category: template.category,
    fuelReward: template.fuelReward,
    requiredPlan: template.requiredPlan,
    completed: milestone.status === "completed",
  };
}

/** Backend-owned readiness: % of milestones completed (Docs/09). */
export async function recalcReadiness(
  ctx: MutationCtx,
  missionId: Id<"missions">,
): Promise<number> {
  const milestones = await ctx.db
    .query("milestones")
    .withIndex("by_missionId", (q) => q.eq("missionId", missionId))
    .collect();
  const score =
    milestones.length === 0
      ? 0
      : Math.round(
          (milestones.filter((m) => m.status === "completed").length /
            milestones.length) *
            100,
        );
  const now = Date.now();
  await ctx.db.patch("missions", missionId, {
    readinessScore: score,
    updatedAt: now,
  });
  return score;
}

/** Adjust Fuel and write a fuelHistory record. Fuel never goes below zero. */
export async function adjustFuel(
  ctx: MutationCtx,
  args: {
    user: Doc<"users">;
    amount: number;
    reason: Doc<"fuelHistory">["reason"];
    missionId?: Id<"missions">;
  },
): Promise<void> {
  const next = Math.max(0, args.user.fuelBalance + args.amount);
  await ctx.db.patch("users", args.user._id, { fuelBalance: next });
  await ctx.db.insert("fuelHistory", {
    userId: args.user._id,
    missionId: args.missionId,
    amount: args.amount,
    reason: args.reason,
    createdAt: Date.now(),
  });
}

/** Recompute milestone lock flags after a plan change. */
export async function refreshMilestoneLocks(
  ctx: MutationCtx,
  user: Doc<"users">,
  missionId: Id<"missions">,
): Promise<void> {
  const milestones = await ctx.db
    .query("milestones")
    .withIndex("by_missionId", (q) => q.eq("missionId", missionId))
    .collect();

  for (const milestone of milestones) {
    const template = await ctx.db.get(
      "milestoneTemplates",
      milestone.templateId,
    );
    if (!template) continue;
    const isLocked = !planMeets(user.plan, template.requiredPlan);
    if (milestone.isLocked !== isLocked) {
      await ctx.db.patch("milestones", milestone._id, { isLocked });
    }
  }
}
