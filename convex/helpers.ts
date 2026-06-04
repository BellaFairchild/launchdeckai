import type { Doc, Id } from "./_generated/dataModel";
import type { MutationCtx, QueryCtx } from "./_generated/server";

/**
 * Resolve the signed-in user from Clerk identity (never trust a client userId).
 * Identity.subject is the Clerk user id, mapped to users.clerkId.
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
          (milestones.filter((m) => m.completed).length / milestones.length) *
            100,
        );
  await ctx.db.patch("missions", missionId, { readinessScore: score });
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
  });
}
