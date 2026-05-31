import { mutation } from "./_generated/server";
import { v } from "convex/values";

import { requireUser } from "./helpers";

export const save = mutation({
  args: {
    section: v.string(),
    fields: v.record(v.string(), v.string()),
    completionStatus: v.number(),
  },
  handler: async (ctx, args) => {
    const user = await requireUser(ctx);
    const mission = await ctx.db
      .query("missions")
      .withIndex("by_userId", (q) => q.eq("userId", user._id))
      .filter((q) => q.eq(q.field("status"), "active"))
      .first();
    if (!mission) throw new Error("No active mission");

    const blueprint = await ctx.db
      .query("blueprints")
      .withIndex("by_missionId", (q) => q.eq("missionId", mission._id))
      .filter((q) => q.eq(q.field("section"), args.section))
      .first();
    if (!blueprint) throw new Error("Blueprint section not found");

    await ctx.db.patch(blueprint._id, {
      fields: args.fields,
      completionStatus: Math.max(0, Math.min(100, args.completionStatus)),
    });
  },
});
