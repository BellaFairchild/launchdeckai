import { internalMutation, internalQuery, mutation, query } from "./_generated/server";
import { v } from "convex/values";

import { adjustFuel, getUserOrNull, requireUser } from "./helpers";
import { COPILOT_STANDARD_COST, FOUNDRY_TOOLS, planMeets } from "./templates";

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

const aiAuthResult = v.union(
  v.object({ ok: v.literal(true) }),
  v.object({ ok: v.literal(false), mock: v.literal(true) }),
);

/**
 * Gate live Foundry generation. Unauthenticated / no-user callers get mock
 * drafts. Plan and Fuel are enforced here so the Anthropic key cannot be
 * burned from the public action without an entitled account.
 */
export const authorizeFoundryGeneration = internalQuery({
  args: { tool: v.string() },
  returns: aiAuthResult,
  handler: async (ctx, args) => {
    const user = await getUserOrNull(ctx);
    if (!user) return { ok: false, mock: true };
    const econ = FOUNDRY_TOOLS[args.tool];
    if (!econ) throw new Error("Unknown Foundry tool");
    if (!planMeets(user.plan, econ.requiredPlan)) throw new Error("Plan required");
    if (user.fuelBalance < econ.fuelCost) throw new Error("Insufficient Fuel");
    return { ok: true };
  },
});

/** Gate a Copilot turn. Powerful mode requires Admiral; standard deducts Fuel. */
export const authorizeCopilotTurn = internalQuery({
  args: {
    mode: v.union(v.literal("standard"), v.literal("powerful")),
  },
  returns: aiAuthResult,
  handler: async (ctx, args) => {
    const user = await getUserOrNull(ctx);
    if (!user) return { ok: false, mock: true };
    if (args.mode === "powerful" && !planMeets(user.plan, "admiral")) {
      throw new Error("Plan required");
    }
    if (args.mode === "standard" && user.fuelBalance < COPILOT_STANDARD_COST) {
      throw new Error("Insufficient Fuel");
    }
    return { ok: true };
  },
});

/** Deduct Copilot Fuel after a successful live reply (standard mode only). */
export const consumeCopilotFuel = internalMutation({
  args: {},
  returns: v.null(),
  handler: async (ctx) => {
    const user = await requireUser(ctx);
    if (user.fuelBalance < COPILOT_STANDARD_COST) {
      throw new Error("Insufficient Fuel");
    }
    await adjustFuel(ctx, {
      user,
      amount: -COPILOT_STANDARD_COST,
      reason: "copilot_message",
    });
    return null;
  },
});
