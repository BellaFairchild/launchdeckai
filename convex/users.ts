import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

import {
    getActiveMission,
    refreshMilestoneLocks,
    requireUser,
} from "./helpers";

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
      createdAt: Date.now(),
    });
  },
});

/**
 * Dev-convenience plan switch (lets you exercise plan gates before RevenueCat
 * is wired in Phase 13 — replace with the entitlement webhook path then).
 */
export const setPlan = mutation({
  args: {
    plan: v.union(
      v.literal("cadet"),
      v.literal("commander"),
      v.literal("admiral"),
    ),
  },
  handler: async (ctx, args) => {
    const user = await requireUser(ctx);
    await ctx.db.patch("users", user._id, { plan: args.plan });
    const mission = await getActiveMission(ctx, user._id);
    if (mission) {
      await refreshMilestoneLocks(ctx, user, mission._id);
    }
  },
});
