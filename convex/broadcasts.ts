import { mutation } from "./_generated/server";
import type { MutationCtx } from "./_generated/server";
import { v } from "convex/values";
import type { Id } from "./_generated/dataModel";

import { requireUser } from "./helpers";

/** The signed-in user's active mission, or null. */
async function activeMission(ctx: MutationCtx, userId: Id<"users">) {
  return await ctx.db
    .query("missions")
    .withIndex("by_userId", (q) => q.eq("userId", userId))
    .filter((q) => q.eq(q.field("status"), "active"))
    .first();
}

/** Upsert a broadcast plan for a signal (one per signal). Free — no plan gate. */
export const schedule = mutation({
  args: {
    signalId: v.string(),
    destinationUrl: v.string(),
    scheduledAt: v.number(),
  },
  handler: async (ctx, args) => {
    const user = await requireUser(ctx);
    const mission = await activeMission(ctx, user._id);
    if (!mission) throw new Error("No active mission");

    const existing = await ctx.db
      .query("broadcasts")
      .withIndex("by_mission_signal", (q) =>
        q.eq("missionId", mission._id).eq("signalId", args.signalId),
      )
      .unique();

    if (existing) {
      await ctx.db.patch(existing._id, {
        destinationUrl: args.destinationUrl,
        scheduledAt: args.scheduledAt,
      });
      return existing._id;
    }

    return await ctx.db.insert("broadcasts", {
      missionId: mission._id,
      userId: user._id,
      signalId: args.signalId,
      destinationUrl: args.destinationUrl,
      scheduledAt: args.scheduledAt,
    });
  },
});

/** Remove a signal's broadcast plan. */
export const cancel = mutation({
  args: { signalId: v.string() },
  handler: async (ctx, args) => {
    const user = await requireUser(ctx);
    const mission = await activeMission(ctx, user._id);
    if (!mission) return;

    const existing = await ctx.db
      .query("broadcasts")
      .withIndex("by_mission_signal", (q) =>
        q.eq("missionId", mission._id).eq("signalId", args.signalId),
      )
      .unique();

    if (existing) await ctx.db.delete(existing._id);
  },
});
