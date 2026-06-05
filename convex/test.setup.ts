/// <reference types="vite/client" />
import { convexTest } from "convex-test";
import schema from "./schema";

// Module map — required so convex-test can discover function files under vitest.
// Must include _generated/**/*.js so convex-test can find the functions root.
export const modules = import.meta.glob("./**/*.*s");

/** A test Convex instance with one cadet user (25 fuel) + one active mission. */
export async function seeded() {
  const t = convexTest(schema, modules);
  const ids = await t.run(async (ctx) => {
    const userId = await ctx.db.insert("users", {
      clerkId: "clerk_test",
      email: "test@launchdeckai.com",
      displayName: "Test Commander",
      plan: "cadet",
      fuelBalance: 25,
      currentStreak: 0,
      level: 1,
    });

    const missionId = await ctx.db.insert("missions", {
      userId,
      appName: "TestApp",
      appDescription: "A test application for smoke tests",
      oneLiner: "Test app one liner",
      targetAudience: "Developers",
      platform: "ios",
      stage: "building",
      status: "active",
      readinessScore: 0,
    });

    return { userId, missionId };
  });
  return { t, ...ids };
}
