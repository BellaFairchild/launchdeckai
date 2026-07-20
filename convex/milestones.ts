import { v } from "convex/values";
import { mutation } from "./_generated/server";

import { adjustFuel, recalcReadiness, requireUser } from "./helpers";

export const complete = mutation({
  args: { milestoneId: v.id("milestones") },
  handler: async (ctx, args) => {
    const user = await requireUser(ctx);
    const milestone = await ctx.db.get("milestones", args.milestoneId);
    if (!milestone) throw new Error("Milestone not found");

    const mission = await ctx.db.get("missions", milestone.missionId);
    if (!mission || mission.userId !== user._id)
      throw new Error("Unauthorized");
    if (milestone.isLocked)
      throw new Error("Milestone is locked for this plan");
    if (milestone.status === "completed") return;

    const template = await ctx.db.get(
      "milestoneTemplates",
      milestone.templateId,
    );
    if (!template) throw new Error("Milestone template not found");

    await ctx.db.patch("milestones", milestone._id, {
      status: "completed",
      completedAt: Date.now(),
    });
    await adjustFuel(ctx, {
      user,
      amount: template.fuelReward,
      reason: "milestone_completed",
      missionId: mission._id,
    });
    await ctx.db.patch("users", user._id, {
      currentStreak: user.currentStreak + 1,
    });
    await recalcReadiness(ctx, mission._id);
  },
});
