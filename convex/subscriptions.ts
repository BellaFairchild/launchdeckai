import { v } from "convex/values";
import { internalMutation } from "./_generated/server";

const plan = v.union(
  v.literal("cadet"),
  v.literal("commander"),
  v.literal("admiral"),
);

/**
 * Apply a RevenueCat entitlement change to a user (called from the webhook,
 * Docs/08+09). Plan is backend-owned; downgrades lock access but never delete
 * data. No-op for unknown users.
 */
export const applyEntitlement = internalMutation({
  args: {
    clerkId: v.string(),
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
  },
  handler: async (ctx, args) => {
    const user = await ctx.db
      .query("users")
      .withIndex("by_clerkId", (q) => q.eq("clerkId", args.clerkId))
      .unique();
    if (!user) return;

    await ctx.db.patch("users", user._id, { plan: args.plan });

    const existing = await ctx.db
      .query("subscriptions")
      .withIndex("by_userId", (q) => q.eq("userId", user._id))
      .unique();
    const data = {
      userId: user._id,
      plan: args.plan,
      status: args.status,
      revenueCatCustomerId: args.revenueCatCustomerId,
      productId: args.productId,
    };
    if (existing) await ctx.db.patch("subscriptions", existing._id, data);
    else await ctx.db.insert("subscriptions", data);
  },
});
