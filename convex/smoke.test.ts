/// <reference types="vite/client" />
import { expect, test } from "vitest";
import { api } from "./_generated/api";
import { seeded, modules } from "./test.setup";
import { convexTest } from "convex-test";
import schema from "./schema";

test("seed creates a user with cadet plan and 25 fuel", async () => {
  const { t, userId, missionId } = await seeded();
  const docs = await t.run(async (ctx) => ({
    user: await ctx.db.get(userId),
    mission: await ctx.db.get(missionId),
  }));
  expect(docs.user?.plan).toBe("cadet");
  expect(docs.user?.fuelBalance).toBe(25);
  expect(docs.user?.currentStreak).toBe(0);
  expect(docs.user?.level).toBe(1);
  expect(docs.mission?.status).toBe("active");
  expect(docs.mission?.stage).toBe("building");
  expect(docs.mission?.readinessScore).toBe(0);
});

test("getCurrentUser returns the seeded user when authenticated", async () => {
  const { t } = await seeded();
  const user = await t
    .withIdentity({ subject: "clerk_test" })
    .query(api.users.getCurrentUser, {});
  expect(user).not.toBeNull();
  expect(user?.plan).toBe("cadet");
  expect(user?.clerkId).toBe("clerk_test");
});

test("getOrCreateUser is idempotent — returns same id on second call", async () => {
  const t = convexTest(schema, modules);
  // First call creates the user.
  const id1 = await t
    .withIdentity({
      subject: "clerk_idempotent",
      email: "idempotent@test.com",
      name: "Idempotent User",
    })
    .mutation(api.users.getOrCreateUser, {});
  // Second call returns the same id.
  const id2 = await t
    .withIdentity({
      subject: "clerk_idempotent",
      email: "idempotent@test.com",
      name: "Idempotent User",
    })
    .mutation(api.users.getOrCreateUser, {});
  expect(id1).toBe(id2);
});
