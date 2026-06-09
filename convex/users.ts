import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

import { requireUser } from "./helpers";

/** The current user record, or null when signed out / not yet created. */
export const getCurrentUser = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return null;
    return await ctx.db
      .query("users")
      .withIndex("by_clerkId", (q) => q.eq("clerkId", identity.subject))
      .unique();
  },
});

/**
 * Create the Convex user record on first sign-in (idempotent). Identity is
 * derived from Clerk — never trusted from the client (Docs/03 security).
 */
export const getOrCreateUser = mutation({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");

    const existing = await ctx.db
      .query("users")
      .withIndex("by_clerkId", (q) => q.eq("clerkId", identity.subject))
      .unique();
    if (existing) return existing._id;

    return await ctx.db.insert("users", {
      clerkId: identity.subject,
      email: identity.email ?? "",
      displayName: identity.name ?? identity.nickname ?? "Commander",
      plan: "cadet",
      // Cadet starter Fuel so the Foundry/Copilot work right after sign-up.
      fuelBalance: 25,
      currentStreak: 0,
      level: 1,
    });
  },
});

/**
 * Dev-convenience plan switch (lets you exercise plan gates before RevenueCat
 * is wired in Phase 13 — replace with the entitlement webhook path then).
 *
 * SECURITY: this lets the signed-in user set their *own* plan, so on a
 * production deployment it is a paywall bypass (any user could grant themselves
 * Admiral). It is therefore gated off by default and only enabled when the
 * Convex env explicitly opts in via `ALLOW_DEV_PLAN_SWITCH=true`
 * (`npx convex env set ALLOW_DEV_PLAN_SWITCH true`). Plan is otherwise
 * backend-owned and driven by the RevenueCat entitlement webhook (Docs/08+09).
 */
export const setPlan = mutation({
  args: {
    plan: v.union(v.literal("cadet"), v.literal("commander"), v.literal("admiral")),
  },
  handler: async (ctx, args) => {
    if (process.env.ALLOW_DEV_PLAN_SWITCH !== "true") {
      throw new Error(
        "setPlan is disabled. Plan changes flow from the RevenueCat entitlement " +
          "webhook; enable the dev switch with ALLOW_DEV_PLAN_SWITCH=true.",
      );
    }
    const user = await requireUser(ctx);
    await ctx.db.patch(user._id, { plan: args.plan });
  },
});
