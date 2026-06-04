import { v } from "convex/values";
import { mutation } from "./_generated/server";

import { getActiveMission, requireUser } from "./helpers";

/** Upsert a broadcast plan for a signal (one per signal). Free — no plan gate. */
export const schedule = mutation({
  args: {
    signalId: v.string(),
    destinationUrl: v.string(),
    scheduledAt: v.number(),
  },
  handler: async (ctx, args) => {
    const user = await requireUser(ctx);
    const mission = await getActiveMission(ctx, user._id);
    if (!mission) throw new Error("No active mission");

    const existing = await ctx.db
      .query("broadcasts")
      .withIndex("by_missionId_and_signalId", (q) =>
        q.eq("missionId", mission._id).eq("signalId", args.signalId),
      )
      .unique();

    if (existing) {
      await ctx.db.patch("broadcasts", existing._id, {
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

/** Remove a signal's broadcast plan (active mission or orphaned on archived missions). */
export const cancel = mutation({
  args: { signalId: v.string() },
  handler: async (ctx, args) => {
    const user = await requireUser(ctx);

    const mission = await getActiveMission(ctx, user._id);
    if (mission) {
      const onActive = await ctx.db
        .query("broadcasts")
        .withIndex("by_missionId_and_signalId", (q) =>
          q.eq("missionId", mission._id).eq("signalId", args.signalId),
        )
        .unique();
      if (onActive) {
        await ctx.db.delete("broadcasts", onActive._id);
        return;
      }
    }

    const existing = await ctx.db
      .query("broadcasts")
      .withIndex("by_userId_and_signalId", (q) =>
        q.eq("userId", user._id).eq("signalId", args.signalId),
      )
      .unique();

    if (existing) await ctx.db.delete("broadcasts", existing._id);
  },
});
