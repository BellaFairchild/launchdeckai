import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import type { QueryCtx, MutationCtx } from "./_generated/server";
import type { Doc } from "./_generated/dataModel";

/**
 * Non-throwing identity lookup — mirrors the pattern in users.getCurrentUser.
 * Returns null in demo mode (no identity) or when the user record doesn't exist
 * yet, so these functions are safe to call from DataSync without auth.
 */
async function getCurrentUserOrNull(
  ctx: QueryCtx | MutationCtx,
): Promise<Doc<"users"> | null> {
  const identity = await ctx.auth.getUserIdentity();
  if (!identity) return null;
  return await ctx.db
    .query("users")
    .withIndex("by_clerkId", (q) => q.eq("clerkId", identity.subject))
    .unique();
}

export const listSaved = query({
  args: {},
  handler: async (ctx) => {
    const user = await getCurrentUserOrNull(ctx);
    if (!user) return [];
    const rows = await ctx.db
      .query("savedResources")
      .withIndex("by_userId", (q) => q.eq("userId", user._id))
      .collect();
    return rows.map((r) => r.resourceId);
  },
});

export const toggleSaved = mutation({
  args: { resourceId: v.string() },
  handler: async (ctx, { resourceId }) => {
    const user = await getCurrentUserOrNull(ctx);
    if (!user) return false;
    const existing = await ctx.db
      .query("savedResources")
      .withIndex("by_user_resource", (q) =>
        q.eq("userId", user._id).eq("resourceId", resourceId),
      )
      .unique();
    if (existing) {
      await ctx.db.delete(existing._id);
      return false;
    }
    await ctx.db.insert("savedResources", { userId: user._id, resourceId });
    return true;
  },
});
