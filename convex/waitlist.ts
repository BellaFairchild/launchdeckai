import { mutation } from "./_generated/server";
import { v } from "convex/values";

const platformInterest = v.optional(
  v.union(
    v.literal("ios"),
    v.literal("android"),
    v.literal("both"),
    v.literal("unsure"),
  ),
);

const joinResult = v.object({
  status: v.union(v.literal("joined"), v.literal("already_joined")),
  message: v.string(),
});

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

export const joinWaitlist = mutation({
  args: {
    email: v.string(),
    source: v.optional(v.string()),
    referrer: v.optional(v.string()),
    platformInterest,
    /** Honeypot — bots fill this; humans leave it empty. */
    website: v.optional(v.string()),
  },
  returns: joinResult,
  handler: async (ctx, args) => {
    if (args.website && args.website.length > 0) {
      return {
        status: "joined" as const,
        message: "You're on the list, Commander.",
      };
    }

    const email = normalizeEmail(args.email);
    if (!EMAIL_PATTERN.test(email)) {
      throw new Error("Please enter a valid email address.");
    }

    const existing = await ctx.db
      .query("waitlistSignups")
      .withIndex("by_email", (q) => q.eq("email", email))
      .unique();

    if (existing) {
      return {
        status: "already_joined" as const,
        message: "You're already on the list, Commander. We'll be in touch.",
      };
    }

    await ctx.db.insert("waitlistSignups", {
      email,
      source: args.source,
      referrer: args.referrer,
      platformInterest: args.platformInterest,
      createdAt: Date.now(),
    });

    return {
      status: "joined" as const,
      message: "You're on the list, Commander.",
    };
  },
});
