import { v } from "convex/values";
import { mutation } from "./_generated/server";

import { getActiveMission, recalcReadiness, requireUser } from "./helpers";

export const save = mutation({
  args: {
    section: v.string(),
    fields: v.record(v.string(), v.string()),
    completionStatus: v.number(),
  },
  handler: async (ctx, args) => {
    const user = await requireUser(ctx);
    const mission = await getActiveMission(ctx, user._id);
    if (!mission) throw new Error("No active mission");

    const blueprint = await ctx.db
      .query("blueprints")
      .withIndex("by_missionId", (q) => q.eq("missionId", mission._id))
      .filter((q) => q.eq(q.field("section"), args.section))
      .first();
    if (!blueprint) throw new Error("Blueprint section not found");

    await ctx.db.patch("blueprints", blueprint._id, {
      fields: args.fields,
      completionStatus: Math.max(0, Math.min(100, args.completionStatus)),
      updatedAt: Date.now(),
    });
    await recalcReadiness(ctx, mission._id);
  },
});
