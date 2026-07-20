import { v } from "convex/values";
import { mutation } from "./_generated/server";

import { adjustFuel, getActiveMission, requireUser } from "./helpers";
import { FOUNDRY_TOOLS, planMeets } from "./templates";

const assetStatus = v.union(
  v.literal("not_loaded"),
  v.literal("in_prep"),
  v.literal("needs_clearance"),
  v.literal("flight_ready"),
  v.literal("exported"),
);

/**
 * Persist a Foundry-generated asset and deduct Fuel server-side (Docs/03):
 * plan + fuel are validated here, not trusted from the client. Call this only
 * AFTER the AI action returns content, so Fuel is never charged on a failure.
 */
export const createFoundryAsset = mutation({
  args: {
    tool: v.string(),
    assetType: v.string(),
    category: v.string(),
    title: v.string(),
    content: v.string(),
    signalId: v.optional(v.string()),
    signalLabel: v.optional(v.string()),
    signalPhase: v.optional(
      v.union(
        v.literal("pre_launch"),
        v.literal("launch_day"),
        v.literal("post_launch"),
      ),
    ),
  },
  handler: async (ctx, args) => {
    const user = await requireUser(ctx);
    const econ = FOUNDRY_TOOLS[args.tool];
    if (!econ) throw new Error("Unknown Foundry tool");
    if (!planMeets(user.plan, econ.requiredPlan))
      throw new Error("Plan required");
    if (user.fuelBalance < econ.fuelCost) throw new Error("Insufficient Fuel");

    const mission = await getActiveMission(ctx, user._id);
    if (!mission) throw new Error("No active mission");

    const now = Date.now();
    const assetId = await ctx.db.insert("assets", {
      missionId: mission._id,
      userId: user._id,
      type: args.assetType,
      title: args.title,
      content: args.content,
      status: "in_prep",
      category: args.category,
      signalId: args.signalId,
      signalLabel: args.signalLabel,
      signalPhase: args.signalPhase,
      createdAt: now,
      updatedAt: now,
    });

    await adjustFuel(ctx, {
      user,
      amount: -econ.fuelCost,
      reason: "foundry_generation",
      missionId: mission._id,
    });

    return assetId;
  },
});

export const updateStatus = mutation({
  args: { assetId: v.id("assets"), status: assetStatus },
  handler: async (ctx, args) => {
    const user = await requireUser(ctx);
    const asset = await ctx.db.get("assets", args.assetId);
    if (!asset || asset.userId !== user._id) throw new Error("Unauthorized");
    await ctx.db.patch("assets", asset._id, {
      status: args.status,
      updatedAt: Date.now(),
    });
  },
});
