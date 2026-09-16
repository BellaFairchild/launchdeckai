import type { MutationCtx, QueryCtx } from "./_generated/server";
import type { Doc, Id } from "./_generated/dataModel";

/**
 * Resolve the signed-in user from Clerk identity (never trust a client userId).
 * Identity.subject is the Clerk user id, mapped to users.clerkId.
 */
export async function getUserOrNull(
  ctx: QueryCtx | MutationCtx,
): Promise<Doc<"users"> | null> {
  const identity = await ctx.auth.getUserIdentity();
  if (!identity) return null;
  return await ctx.db
    .query("users")
    .withIndex("by_clerkId", (q) => q.eq("clerkId", identity.subject))
    .unique();
}

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

const MAX_DESTINATION_URL = 2048;

/**
 * Server-side destination URL check (keep in sync with src/lib/url.ts).
 * Rejects non-http(s) schemes, credentials-in-URL, and oversized values.
 */
export function parseDestinationUrl(raw: string): string {
  const v = raw.trim();
  if (!v || v.length > MAX_DESTINATION_URL || /\s/.test(v)) {
    throw new Error("Invalid destination URL");
  }
  const candidate = /^https?:\/\//i.test(v) ? v : `https://${v}`;
  let u: URL;
  try {
    u = new URL(candidate);
  } catch {
    throw new Error("Invalid destination URL");
  }
  if (u.protocol !== "http:" && u.protocol !== "https:") {
    throw new Error("Invalid destination URL");
  }
  if (u.username || u.password) {
    throw new Error("Invalid destination URL");
  }
  if (!u.hostname.includes(".")) {
    throw new Error("Invalid destination URL");
  }
  return u.toString();
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
  await ctx.db.patch(missionId, { readinessScore: score });
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
  await ctx.db.patch(args.user._id, { fuelBalance: next });
  await ctx.db.insert("fuelHistory", {
    userId: args.user._id,
    missionId: args.missionId,
    amount: args.amount,
    reason: args.reason,
  });
}
