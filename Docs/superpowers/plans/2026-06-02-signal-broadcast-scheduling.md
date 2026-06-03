# Signal Broadcast Scheduling Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Let a user attach a destination link + date/time to any Signal Deck signal, persist it (Convex-synced), and get a calm local-notification reminder that deep-links to the destination — with Forge (make content) and Broadcast (schedule the send) as independent actions, free for all tiers.

**Architecture:** Broadcast plans flow like `assets` already do — Convex `broadcasts` table → `getLaunchData` query → `DataSync` hydrates → mission store → screens read uniformly. The device-local reminder is keyed by a deterministic notification identifier `broadcast:{signalId}`, so it needs no stored id and reconciles from synced data after a reinstall.

**Tech Stack:** Expo SDK 56, React Native 0.85, React 19.2, Convex, Zustand, expo-notifications, expo-linking, react-native-svg. Tests: jest-expo + @testing-library/react-native (v14, React 19 async render).

**Spec:** `docs/superpowers/specs/2026-06-02-signal-broadcast-scheduling-design.md`

---

## File Structure

**Created:**
- `babel.config.js` — root Babel config (needed so jest-expo can transform; equals Metro's implicit default).
- `jest.config.js` — jest-expo preset, path-alias mapping, setup files.
- `jest.setup.js` — global test mocks (haptics, audio) + RNTL matchers.
- `src/lib/url.ts` — pure URL validation/normalization helpers.
- `convex/broadcasts.ts` — `schedule` / `cancel` mutations.
- `src/lib/url.test.ts`, `src/lib/notifications.test.ts`, `src/store/mission.broadcast.test.ts`, `src/components/signal/BroadcastScheduler.test.tsx`, `src/components/signal/SignalActions.test.tsx`, `src/components/ui/Icon.test.tsx` — tests.

**Modified:**
- `convex/schema.ts` — add `broadcasts` table.
- `convex/missions.ts` — thread `broadcasts` into `getLaunchData`.
- `src/types.ts` — add `Broadcast` interface.
- `src/lib/analytics.ts` — add two event names.
- `src/store/mission.ts` — `broadcasts` state + `scheduleBroadcast`/`cancelBroadcast` actions + adapter.
- `src/components/DataSync.tsx` — map + hydrate broadcasts, inject adapter, reconcile reminders.
- `src/lib/notifications.ts` — selective cancel + broadcast reminder helpers + reconcile + response handler.
- `src/components/ui/Icon.tsx` — add `link` glyph.
- `src/components/signal/BroadcastScheduler.tsx` — destination field, edit/remove, new confirm signature.
- `src/components/signal/SignalActions.tsx` — independent Forge + Broadcast actions, store-driven chip.
- `src/components/signal/SignalCalendar.tsx` — scheduled marker; pass `signalId`/`platform`.
- `src/app/(modals)/signal-deck.tsx` — pass `signalId`/`platform`/broadcasts down.
- `src/app/_layout.tsx` — register the notification-response listener.

---

## Task 0: Test harness (jest-expo + RNTL)

**Files:**
- Create: `babel.config.js`, `jest.config.js`, `jest.setup.js`
- Modify: `package.json` (scripts + devDependencies, via installer)
- Test: `src/lib/__smoke__.test.ts` (temporary smoke test, deleted in last step)

- [ ] **Step 1: Install test dependencies**

Run:
```bash
npx expo install jest-expo
npm i -D jest @testing-library/react-native @types/jest react-test-renderer@19.2.3
```
Expected: deps added to `devDependencies`; no peer-dependency errors that block install. If npm reports a React version conflict on `react-test-renderer`, re-run that one package with `--legacy-peer-deps`.

- [ ] **Step 2: Create `babel.config.js`**

```js
module.exports = function (api) {
  api.cache(true);
  return { presets: ["babel-preset-expo"] };
};
```

- [ ] **Step 3: Create `jest.config.js`**

```js
/** jest-expo preset + path aliases mirroring tsconfig.json. */
module.exports = {
  preset: "jest-expo",
  setupFilesAfterEnv: [
    "@testing-library/react-native/extend-expect",
    "<rootDir>/jest.setup.js",
  ],
  moduleNameMapper: {
    "^@/assets/(.*)$": "<rootDir>/assets/$1",
    "^@cvx/(.*)$": "<rootDir>/convex/$1",
    "^@/(.*)$": "<rootDir>/src/$1",
  },
  transformIgnorePatterns: [
    "node_modules/(?!((jest-)?react-native|@react-native(-community)?|expo(nent)?|@expo(nent)?/.*|@expo-google-fonts/.*|react-navigation|@react-navigation/.*|@unimodules/.*|unimodules|sentry-expo|nativewind|react-native-css|react-native-svg|react-native-reanimated|react-native-gesture-handler|zustand))",
  ],
};
```

Note: `moduleNameMapper` order matters — the specific `@/assets` and `@cvx` entries must precede the catch-all `@/`.

- [ ] **Step 4: Create `jest.setup.js`**

```js
/* Global test environment: silence native-only modules our UI imports. */
jest.mock("@/lib/haptics", () => ({
  haptics: {
    light: jest.fn(),
    medium: jest.fn(),
    success: jest.fn(),
    warning: jest.fn(),
    selection: jest.fn(),
  },
}));

jest.mock("@/lib/audio", () => ({
  playClick: jest.fn(),
  playSignature: jest.fn(),
}));
```

- [ ] **Step 5: Add test scripts to `package.json`**

In the `"scripts"` block, add:
```json
"test": "jest",
"test:watch": "jest --watch"
```

- [ ] **Step 6: Write a smoke test**

Create `src/lib/__smoke__.test.ts`:
```ts
test("jest harness runs", () => {
  expect(1 + 1).toBe(2);
});
```

- [ ] **Step 7: Run the smoke test**

Run: `npm test -- src/lib/__smoke__.test.ts`
Expected: PASS, 1 test. If it fails on a transform error from a `node_modules` package, add that package name to the `transformIgnorePatterns` group in `jest.config.js` and re-run.

- [ ] **Step 8: Delete the smoke test and commit**

```bash
rm src/lib/__smoke__.test.ts
git add babel.config.js jest.config.js jest.setup.js package.json package-lock.json
git commit -m "test: stand up jest-expo + RNTL harness"
```

---

## Task 1: Domain type + analytics events

**Files:**
- Modify: `src/types.ts` (after the `SignalTemplate` interface, end of file)
- Modify: `src/lib/analytics.ts:12-27`

- [ ] **Step 1: Add the `Broadcast` type**

Append to `src/types.ts`:
```ts
/**
 * A scheduled broadcast for a single signal: where to post + when. The
 * device-local reminder is keyed by `broadcast:{signalId}`, so no notification
 * id is stored here.
 */
export interface Broadcast {
  signalId: string;
  destinationUrl: string;
  scheduledAt: number; // epoch ms
}
```

- [ ] **Step 2: Add the two analytics events**

In `src/lib/analytics.ts`, extend the `AnalyticsEvent` union — add these two members after `"broadcast_scheduled"`:
```ts
  | "broadcast_cancelled"
  | "broadcast_reminder_tapped"
```

- [ ] **Step 3: Typecheck**

Run: `npx tsc --noEmit`
Expected: no new errors referencing `src/types.ts` or `src/lib/analytics.ts`.

- [ ] **Step 4: Commit**

```bash
git add src/types.ts src/lib/analytics.ts
git commit -m "feat: Broadcast type + broadcast analytics events"
```

---

## Task 2: URL validation helpers (pure, TDD)

**Files:**
- Create: `src/lib/url.ts`
- Test: `src/lib/url.test.ts`

- [ ] **Step 1: Write the failing test**

Create `src/lib/url.test.ts`:
```ts
import { isValidDestinationUrl, normalizeDestinationUrl } from "./url";

describe("isValidDestinationUrl", () => {
  it("accepts http(s) URLs", () => {
    expect(isValidDestinationUrl("https://x.com/compose")).toBe(true);
    expect(isValidDestinationUrl("http://producthunt.com/posts/x")).toBe(true);
  });
  it("accepts a bare domain", () => {
    expect(isValidDestinationUrl("buffer.com/queue")).toBe(true);
    expect(isValidDestinationUrl("linkedin.com")).toBe(true);
  });
  it("rejects empty, whitespace, and non-URLs", () => {
    expect(isValidDestinationUrl("")).toBe(false);
    expect(isValidDestinationUrl("   ")).toBe(false);
    expect(isValidDestinationUrl("not a url")).toBe(false);
  });
});

describe("normalizeDestinationUrl", () => {
  it("leaves http(s) URLs untouched", () => {
    expect(normalizeDestinationUrl("https://x.com")).toBe("https://x.com");
  });
  it("prepends https:// to a bare domain", () => {
    expect(normalizeDestinationUrl("buffer.com/queue")).toBe("https://buffer.com/queue");
  });
  it("trims surrounding whitespace", () => {
    expect(normalizeDestinationUrl("  x.com  ")).toBe("https://x.com");
  });
});
```

- [ ] **Step 2: Run it to verify it fails**

Run: `npm test -- src/lib/url.test.ts`
Expected: FAIL — "Cannot find module './url'".

- [ ] **Step 3: Implement `src/lib/url.ts`**

```ts
/** Lightweight destination-URL validation for the Broadcast scheduler. */

/** True if the value looks like a URL or a bare domain (e.g. "x.com/x"). */
export function isValidDestinationUrl(value: string): boolean {
  const v = value.trim();
  if (!v) return false;
  if (/^https?:\/\/\S+\.\S+/i.test(v)) return true;
  if (/^[\w-]+(\.[\w-]+)+(\/\S*)?$/i.test(v)) return true;
  return false;
}

/** Ensure a protocol so the reminder can open it; assumes the value is valid. */
export function normalizeDestinationUrl(value: string): string {
  const v = value.trim();
  return /^https?:\/\//i.test(v) ? v : `https://${v}`;
}
```

- [ ] **Step 4: Run it to verify it passes**

Run: `npm test -- src/lib/url.test.ts`
Expected: PASS — 6 tests.

- [ ] **Step 5: Commit**

```bash
git add src/lib/url.ts src/lib/url.test.ts
git commit -m "feat: destination-URL validation helpers"
```

---

## Task 3: Convex broadcasts table + functions

**Files:**
- Modify: `convex/schema.ts` (inside `defineSchema({...})`, after the `assets` table)
- Create: `convex/broadcasts.ts`
- Modify: `convex/missions.ts:32-47`

- [ ] **Step 1: Add the `broadcasts` table to the schema**

In `convex/schema.ts`, add inside `defineSchema({ ... })` (after the `assets` table block):
```ts
  broadcasts: defineTable({
    missionId: v.id("missions"),
    userId: v.id("users"),
    signalId: v.string(),
    destinationUrl: v.string(),
    scheduledAt: v.number(),
  })
    .index("by_missionId", ["missionId"])
    .index("by_mission_signal", ["missionId", "signalId"]),
```

- [ ] **Step 2: Create `convex/broadcasts.ts`**

```ts
import { mutation } from "./_generated/server";
import { v } from "convex/values";

import { requireUser } from "./helpers";

/** The signed-in user's active mission, or throw. */
async function activeMission(ctx: any, userId: any) {
  const mission = await ctx.db
    .query("missions")
    .withIndex("by_userId", (q: any) => q.eq("userId", userId))
    .filter((q: any) => q.eq(q.field("status"), "active"))
    .first();
  return mission;
}

/** Upsert a broadcast plan for a signal (one per signal). Free — no plan gate. */
export const schedule = mutation({
  args: {
    signalId: v.string(),
    destinationUrl: v.string(),
    scheduledAt: v.number(),
  },
  handler: async (ctx, args) => {
    const user = await requireUser(ctx);
    const mission = await activeMission(ctx, user._id);
    if (!mission) throw new Error("No active mission");

    const existing = await ctx.db
      .query("broadcasts")
      .withIndex("by_mission_signal", (q) =>
        q.eq("missionId", mission._id).eq("signalId", args.signalId),
      )
      .unique();

    if (existing) {
      await ctx.db.patch(existing._id, {
        destinationUrl: args.destinationUrl,
        scheduledAt: args.scheduledAt,
      });
      return existing._id;
    }

    return await ctx.db.insert("broadcasts", {
      missionId: mission._id,
      userId: user._id,
      signalId: args.signalId,
      destinationUrl: args.destinationUrl,
      scheduledAt: args.scheduledAt,
    });
  },
});

/** Remove a signal's broadcast plan. */
export const cancel = mutation({
  args: { signalId: v.string() },
  handler: async (ctx, args) => {
    const user = await requireUser(ctx);
    const mission = await activeMission(ctx, user._id);
    if (!mission) return;

    const existing = await ctx.db
      .query("broadcasts")
      .withIndex("by_mission_signal", (q) =>
        q.eq("missionId", mission._id).eq("signalId", args.signalId),
      )
      .unique();

    if (existing) await ctx.db.delete(existing._id);
  },
});
```

- [ ] **Step 3: Thread broadcasts into `getLaunchData`**

In `convex/missions.ts`, change the `Promise.all` (lines ~32-45) to also load broadcasts, and add it to both `return` payloads.

The destructuring becomes:
```ts
    const [milestones, blueprints, assets, broadcasts] = await Promise.all([
      ctx.db
        .query("milestones")
        .withIndex("by_missionId", (q) => q.eq("missionId", mission._id))
        .collect(),
      ctx.db
        .query("blueprints")
        .withIndex("by_missionId", (q) => q.eq("missionId", mission._id))
        .collect(),
      ctx.db
        .query("assets")
        .withIndex("by_missionId", (q) => q.eq("missionId", mission._id))
        .collect(),
      ctx.db
        .query("broadcasts")
        .withIndex("by_missionId", (q) => q.eq("missionId", mission._id))
        .collect(),
    ]);

    return { user, mission, milestones, blueprints, assets, broadcasts };
```

Also update the two earlier early-return objects in the same handler to include `broadcasts: []`:
- the `if (!user)` return → `{ user: null, mission: null, milestones: [], blueprints: [], assets: [], broadcasts: [] }`
- the `if (!mission)` return → `{ user, mission: null, milestones: [], blueprints: [], assets: [], broadcasts: [] }`

- [ ] **Step 4: Regenerate Convex types + typecheck**

Run: `npx convex codegen`
Then: `npx tsc --noEmit`
Expected: codegen succeeds (regenerates `convex/_generated/api.d.ts` with `api.broadcasts`); no new type errors.

- [ ] **Step 5: Commit**

```bash
git add convex/schema.ts convex/broadcasts.ts convex/missions.ts convex/_generated
git commit -m "feat: Convex broadcasts table + schedule/cancel + getLaunchData wiring"
```

---

## Task 4: Mission store — broadcasts state + actions (TDD)

**Files:**
- Modify: `src/store/mission.ts`
- Test: `src/store/mission.broadcast.test.ts`

- [ ] **Step 1: Write the failing test**

Create `src/store/mission.broadcast.test.ts`:
```ts
import { useMissionStore } from "./mission";

const PLAN = { signalId: "pre_1", destinationUrl: "https://x.com/compose", scheduledAt: 1000 };

beforeEach(() => {
  useMissionStore.setState({ convex: null, broadcasts: [] });
});

describe("mission store broadcasts (demo mode)", () => {
  it("scheduleBroadcast adds a plan", () => {
    useMissionStore.getState().scheduleBroadcast(PLAN);
    expect(useMissionStore.getState().broadcasts).toEqual([PLAN]);
  });

  it("scheduleBroadcast replaces the plan for the same signal", () => {
    useMissionStore.getState().scheduleBroadcast(PLAN);
    const updated = { ...PLAN, destinationUrl: "https://buffer.com", scheduledAt: 2000 };
    useMissionStore.getState().scheduleBroadcast(updated);
    expect(useMissionStore.getState().broadcasts).toEqual([updated]);
  });

  it("cancelBroadcast removes the plan", () => {
    useMissionStore.getState().scheduleBroadcast(PLAN);
    useMissionStore.getState().cancelBroadcast("pre_1");
    expect(useMissionStore.getState().broadcasts).toEqual([]);
  });
});
```

- [ ] **Step 2: Run it to verify it fails**

Run: `npm test -- src/store/mission.broadcast.test.ts`
Expected: FAIL — `scheduleBroadcast` is not a function / `broadcasts` is undefined.

- [ ] **Step 3: Add broadcasts to the store**

In `src/store/mission.ts`:

(a) Import the type — extend the existing import from `@/types`:
```ts
import type { Mission, Milestone, Blueprint, Asset, BlueprintSection, Broadcast } from "@/types";
```

(b) Add to `ConvexAdapter` (after `createFoundryAsset`):
```ts
  scheduleBroadcast: (plan: Broadcast) => void;
  cancelBroadcast: (signalId: string) => void;
```

(c) Add to `MissionState` (after `assets: Asset[];`):
```ts
  broadcasts: Broadcast[];
```
and to the actions section (after `updateAssetStatus`):
```ts
  scheduleBroadcast: (plan: Broadcast) => void;
  cancelBroadcast: (signalId: string) => void;
```
and extend the `hydrate` signature to include broadcasts:
```ts
  hydrate: (data: {
    mission: Mission;
    milestones: Milestone[];
    blueprints: Record<BlueprintSection, Blueprint>;
    assets: Asset[];
    broadcasts: Broadcast[];
  }) => void;
```

(d) In the `create<MissionState>(...)` object: add initial state after `assets: INITIAL_ASSETS,`:
```ts
  broadcasts: [],
```

(e) Update `hydrate` to set broadcasts:
```ts
  hydrate: (data) =>
    set({
      mission: data.mission,
      milestones: data.milestones,
      blueprints: data.blueprints,
      assets: data.assets,
      broadcasts: data.broadcasts,
    }),
```

(f) Add the two actions (after `updateAssetStatus`):
```ts
  scheduleBroadcast: (plan) => {
    const convex = get().convex;
    if (convex) {
      convex.scheduleBroadcast(plan);
      return;
    }
    set({
      broadcasts: [
        ...get().broadcasts.filter((b) => b.signalId !== plan.signalId),
        plan,
      ],
    });
  },

  cancelBroadcast: (signalId) => {
    const convex = get().convex;
    if (convex) {
      convex.cancelBroadcast(signalId);
      return;
    }
    set({ broadcasts: get().broadcasts.filter((b) => b.signalId !== signalId) });
  },
```

- [ ] **Step 4: Run it to verify it passes**

Run: `npm test -- src/store/mission.broadcast.test.ts`
Expected: PASS — 3 tests.

- [ ] **Step 5: Commit**

```bash
git add src/store/mission.ts src/store/mission.broadcast.test.ts
git commit -m "feat: broadcasts state + scheduleBroadcast/cancelBroadcast in mission store"
```

---

## Task 5: DataSync — map, hydrate, adapter, reconcile

**Files:**
- Modify: `src/components/DataSync.tsx`

(Reconcile helper `reconcileBroadcastReminders` is created in Task 6; this task wires the call. Implement Task 6 first if executing strictly in order — but the import will resolve once both land. To keep commits green, this task adds everything except the reconcile call, then Task 6 adds the reconcile import + call back here in its final step.)

- [ ] **Step 1: Add the broadcast mapper**

In `src/components/DataSync.tsx`, after `mapAsset`, add:
```ts
function mapBroadcast(d: Doc<"broadcasts">): Broadcast {
  return {
    signalId: d.signalId,
    destinationUrl: d.destinationUrl,
    scheduledAt: d.scheduledAt,
  };
}
```
and extend the `@/types` import to include `Broadcast`:
```ts
import type { Mission, Milestone, Blueprint, Asset, BlueprintSection, Broadcast } from "@/types";
```

- [ ] **Step 2: Get the Convex mutations**

After `const createFoundryAsset = useMutation(api.assets.createFoundryAsset);`, add:
```ts
  const scheduleBroadcast = useMutation(api.broadcasts.schedule);
  const cancelBroadcast = useMutation(api.broadcasts.cancel);
```

- [ ] **Step 3: Inject the adapter methods**

Inside `useMissionStore.getState().setConvex({ ... })`, add after the `createFoundryAsset` adapter entry:
```ts
      scheduleBroadcast: (plan) => {
        void scheduleBroadcast({
          signalId: plan.signalId,
          destinationUrl: plan.destinationUrl,
          scheduledAt: plan.scheduledAt,
        });
      },
      cancelBroadcast: (signalId) => {
        void cancelBroadcast({ signalId });
      },
```
and add `scheduleBroadcast, cancelBroadcast` to that effect's dependency array.

- [ ] **Step 4: Hydrate broadcasts**

In the hydrate effect, update the `useMissionStore.getState().hydrate({ ... })` call to include:
```ts
        broadcasts: data.broadcasts.map(mapBroadcast),
```

- [ ] **Step 5: Typecheck**

Run: `npx tsc --noEmit`
Expected: no new errors. (`api.broadcasts.*` exists from Task 3 codegen.)

- [ ] **Step 6: Commit**

```bash
git add src/components/DataSync.tsx
git commit -m "feat: DataSync hydrates broadcasts + injects broadcast adapter"
```

---

## Task 6: Notifications — selective cancel, broadcast reminders, reconcile, deep-link (TDD)

**Files:**
- Modify: `src/lib/notifications.ts`
- Modify: `src/components/DataSync.tsx` (final step: reconcile call)
- Test: `src/lib/notifications.test.ts`

- [ ] **Step 1: Write the failing test**

Create `src/lib/notifications.test.ts`:
```ts
jest.mock("expo-notifications", () => ({
  setNotificationHandler: jest.fn(),
  getPermissionsAsync: jest.fn(async () => ({ status: "granted" })),
  requestPermissionsAsync: jest.fn(async () => ({ status: "granted" })),
  scheduleNotificationAsync: jest.fn(async () => undefined),
  cancelScheduledNotificationAsync: jest.fn(async () => undefined),
  getAllScheduledNotificationsAsync: jest.fn(async () => []),
  addNotificationResponseReceivedListener: jest.fn(() => ({ remove: jest.fn() })),
  SchedulableTriggerInputTypes: { DATE: "date", DAILY: "daily" },
}));

jest.mock("expo-linking", () => ({ openURL: jest.fn(async () => undefined) }));

import * as Notifications from "expo-notifications";
import * as Linking from "expo-linking";
import {
  scheduleBroadcastReminder,
  cancelBroadcastReminder,
  reconcileBroadcastReminders,
  handleBroadcastResponse,
} from "./notifications";

const FUTURE = Date.now() + 60 * 60 * 1000;
const PAST = Date.now() - 60 * 60 * 1000;

beforeEach(() => jest.clearAllMocks());

describe("scheduleBroadcastReminder", () => {
  it("schedules a dated reminder with a stable identifier and url payload", async () => {
    const ok = await scheduleBroadcastReminder({
      signalId: "pre_1",
      signalLabel: "Dev log thread",
      platform: "X/Twitter",
      destinationUrl: "https://x.com/compose",
      scheduledAt: FUTURE,
    });
    expect(ok).toBe(true);
    expect(Notifications.scheduleNotificationAsync).toHaveBeenCalledTimes(1);
    const arg = (Notifications.scheduleNotificationAsync as jest.Mock).mock.calls[0][0];
    expect(arg.identifier).toBe("broadcast:pre_1");
    expect(arg.content.data).toEqual({ url: "https://x.com/compose", signalId: "pre_1" });
  });

  it("does not schedule a reminder in the past", async () => {
    const ok = await scheduleBroadcastReminder({
      signalId: "pre_1",
      signalLabel: "x",
      platform: "X",
      destinationUrl: "https://x.com",
      scheduledAt: PAST,
    });
    expect(ok).toBe(false);
    expect(Notifications.scheduleNotificationAsync).not.toHaveBeenCalled();
  });
});

describe("cancelBroadcastReminder", () => {
  it("cancels by stable identifier", async () => {
    await cancelBroadcastReminder("pre_1");
    expect(Notifications.cancelScheduledNotificationAsync).toHaveBeenCalledWith("broadcast:pre_1");
  });
});

describe("reconcileBroadcastReminders", () => {
  it("reschedules future plans and cancels stale broadcast reminders", async () => {
    (Notifications.getAllScheduledNotificationsAsync as jest.Mock).mockResolvedValueOnce([
      { identifier: "broadcast:old" },
      { identifier: "launch:day" },
    ]);
    await reconcileBroadcastReminders(
      [{ signalId: "pre_1", destinationUrl: "https://x.com", scheduledAt: FUTURE }],
      (id) => (id === "pre_1" ? { label: "Dev log", platform: "X" } : undefined),
    );
    expect(Notifications.scheduleNotificationAsync).toHaveBeenCalledTimes(1); // pre_1 future
    expect(Notifications.cancelScheduledNotificationAsync).toHaveBeenCalledWith("broadcast:old");
    expect(Notifications.cancelScheduledNotificationAsync).not.toHaveBeenCalledWith("launch:day");
  });
});

describe("handleBroadcastResponse", () => {
  it("opens the url from the notification data", () => {
    handleBroadcastResponse({
      notification: { request: { content: { data: { url: "https://x.com/post" } } } },
    } as any);
    expect(Linking.openURL).toHaveBeenCalledWith("https://x.com/post");
  });

  it("is a no-op when there is no url", () => {
    handleBroadcastResponse({
      notification: { request: { content: { data: {} } } },
    } as any);
    expect(Linking.openURL).not.toHaveBeenCalled();
  });
});
```

- [ ] **Step 2: Run it to verify it fails**

Run: `npm test -- src/lib/notifications.test.ts`
Expected: FAIL — exported functions don't exist yet.

- [ ] **Step 3: Rewrite `src/lib/notifications.ts`**

Replace the whole file with:
```ts
import * as Notifications from "expo-notifications";
import * as Linking from "expo-linking";
import { Platform } from "react-native";

import { track } from "@/lib/analytics";

/** Launch reminders + per-signal broadcast reminders (Docs/02). No-op on web. */

if (Platform.OS !== "web") {
  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowBanner: true,
      shouldShowList: true,
      shouldPlaySound: false,
      shouldSetBadge: false,
    }),
  });
}

/** Stable identifiers so we can cancel selectively (never blanket-wipe). */
const LAUNCH_IDS = ["launch:daily-action", "launch:streak", "launch:day"];
const broadcastId = (signalId: string) => `broadcast:${signalId}`;

export async function requestNotificationPermission(): Promise<boolean> {
  if (Platform.OS === "web") return false;
  try {
    const { status } = await Notifications.getPermissionsAsync();
    if (status === "granted") return true;
    const req = await Notifications.requestPermissionsAsync();
    return req.status === "granted";
  } catch {
    return false;
  }
}

export async function scheduleLaunchReminders(launchDate?: number): Promise<void> {
  if (Platform.OS === "web") return;
  try {
    // Cancel ONLY the launch reminders — leave broadcast reminders intact.
    await Promise.all(
      LAUNCH_IDS.map((id) =>
        Notifications.cancelScheduledNotificationAsync(id).catch(() => {}),
      ),
    );

    await Notifications.scheduleNotificationAsync({
      identifier: "launch:daily-action",
      content: {
        title: "Today's Launch Action",
        body: "Make one move toward launch in LaunchDeckAI.",
      },
      trigger: { type: Notifications.SchedulableTriggerInputTypes.DAILY, hour: 9, minute: 0 },
    });

    await Notifications.scheduleNotificationAsync({
      identifier: "launch:streak",
      content: {
        title: "Keep your streak alive 🔥",
        body: "Pop into LaunchDeckAI before midnight.",
      },
      trigger: { type: Notifications.SchedulableTriggerInputTypes.DAILY, hour: 20, minute: 0 },
    });

    if (launchDate && launchDate > Date.now()) {
      await Notifications.scheduleNotificationAsync({
        identifier: "launch:day",
        content: {
          title: "Launch day! 🚀",
          body: "It's go time — transmit your Signal Deck.",
        },
        trigger: {
          type: Notifications.SchedulableTriggerInputTypes.DATE,
          date: new Date(launchDate),
        },
      });
    }
  } catch {
    // ignore scheduling failures (e.g. no permission)
  }
}

export async function cancelReminders(): Promise<void> {
  if (Platform.OS === "web") return;
  try {
    await Promise.all(
      LAUNCH_IDS.map((id) =>
        Notifications.cancelScheduledNotificationAsync(id).catch(() => {}),
      ),
    );
  } catch {
    // ignore
  }
}

export type BroadcastReminder = {
  signalId: string;
  signalLabel: string;
  platform: string;
  destinationUrl: string;
  scheduledAt: number;
};

/** Schedule (or replace) a signal's broadcast reminder. Returns false if it
 *  couldn't be scheduled (web, past time, or permission denied). */
export async function scheduleBroadcastReminder(r: BroadcastReminder): Promise<boolean> {
  if (Platform.OS === "web") return false;
  if (r.scheduledAt <= Date.now()) return false;
  const granted = await requestNotificationPermission();
  if (!granted) return false;
  try {
    await Notifications.cancelScheduledNotificationAsync(broadcastId(r.signalId)).catch(
      () => {},
    );
    await Notifications.scheduleNotificationAsync({
      identifier: broadcastId(r.signalId),
      content: {
        title: "Time to broadcast 📡",
        body: `Post your ${r.signalLabel} on ${r.platform} now.`,
        data: { url: r.destinationUrl, signalId: r.signalId },
      },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.DATE,
        date: new Date(r.scheduledAt),
      },
    });
    return true;
  } catch {
    return false;
  }
}

export async function cancelBroadcastReminder(signalId: string): Promise<void> {
  if (Platform.OS === "web") return;
  try {
    await Notifications.cancelScheduledNotificationAsync(broadcastId(signalId));
  } catch {
    // ignore
  }
}

export type BroadcastLike = {
  signalId: string;
  destinationUrl: string;
  scheduledAt: number;
};

/** Reconcile device reminders against the synced plans: (re)schedule future
 *  plans and cancel any broadcast reminders that no longer have a future plan. */
export async function reconcileBroadcastReminders(
  broadcasts: BroadcastLike[],
  lookup: (signalId: string) => { label: string; platform: string } | undefined,
): Promise<void> {
  if (Platform.OS === "web") return;
  try {
    const wanted = new Set(
      broadcasts.filter((b) => b.scheduledAt > Date.now()).map((b) => broadcastId(b.signalId)),
    );

    const scheduled = await Notifications.getAllScheduledNotificationsAsync();
    for (const n of scheduled) {
      const id = (n as { identifier?: string }).identifier;
      if (id && id.startsWith("broadcast:") && !wanted.has(id)) {
        await Notifications.cancelScheduledNotificationAsync(id).catch(() => {});
      }
    }

    for (const b of broadcasts) {
      if (b.scheduledAt <= Date.now()) continue;
      const meta = lookup(b.signalId);
      if (!meta) continue;
      await scheduleBroadcastReminder({
        signalId: b.signalId,
        signalLabel: meta.label,
        platform: meta.platform,
        destinationUrl: b.destinationUrl,
        scheduledAt: b.scheduledAt,
      });
    }
  } catch {
    // ignore reconcile failures
  }
}

/** Open the destination URL carried by a tapped broadcast notification. */
export function handleBroadcastResponse(
  response: Notifications.NotificationResponse,
): void {
  const url = response?.notification?.request?.content?.data?.url;
  if (typeof url === "string" && url.length > 0) {
    track("broadcast_reminder_tapped");
    void Linking.openURL(url).catch(() => {});
  }
}

/** Register the tap listener; returns a subscription with `.remove()`. */
export function registerBroadcastResponseListener(): { remove: () => void } {
  if (Platform.OS === "web") return { remove() {} };
  return Notifications.addNotificationResponseReceivedListener(handleBroadcastResponse);
}
```

- [ ] **Step 4: Run it to verify it passes**

Run: `npm test -- src/lib/notifications.test.ts`
Expected: PASS — 7 tests.

- [ ] **Step 5: Wire reconcile into DataSync**

In `src/components/DataSync.tsx`, add imports near the top:
```ts
import { reconcileBroadcastReminders } from "@/lib/notifications";
import { SIGNAL_TEMPLATES } from "@/constants/signalTemplates";
```
Then, at the end of the hydrate effect (inside `if (data.mission) { ... }`, after the `hydrate({...})` call), add:
```ts
      void reconcileBroadcastReminders(
        data.broadcasts.map(mapBroadcast),
        (signalId) => {
          const t = SIGNAL_TEMPLATES.find((s) => s.id === signalId);
          return t ? { label: t.label, platform: t.platform } : undefined;
        },
      );
```

- [ ] **Step 6: Typecheck + commit**

Run: `npx tsc --noEmit`
Expected: no new errors.
```bash
git add src/lib/notifications.ts src/lib/notifications.test.ts src/components/DataSync.tsx
git commit -m "feat: broadcast reminders (selective cancel, reconcile, deep-link tap)"
```

---

## Task 7: Register the deep-link listener in the root layout

**Files:**
- Modify: `src/app/_layout.tsx`

- [ ] **Step 1: Add the listener effect**

In `src/app/_layout.tsx`:

(a) Add imports:
```ts
import { useEffect } from "react";
import { registerBroadcastResponseListener } from "@/lib/notifications";
```

(b) Inside `RootLayout()`, before the `return`, add:
```ts
  useEffect(() => {
    const sub = registerBroadcastResponseListener();
    return () => sub.remove();
  }, []);
```

- [ ] **Step 2: Typecheck**

Run: `npx tsc --noEmit`
Expected: no new errors.

- [ ] **Step 3: Commit**

```bash
git add src/app/_layout.tsx
git commit -m "feat: open broadcast destination on notification tap"
```

---

## Task 8: Add the `link` icon glyph (TDD)

**Files:**
- Modify: `src/components/ui/Icon.tsx`
- Test: `src/components/ui/Icon.test.tsx`

- [ ] **Step 1: Write the failing test**

Create `src/components/ui/Icon.test.tsx`:
```tsx
import { render } from "@testing-library/react-native";
import { Icon } from "./Icon";

it("renders the link glyph without crashing", () => {
  const { toJSON } = render(<Icon name="link" />);
  expect(toJSON()).toBeTruthy();
});
```

- [ ] **Step 2: Run it to verify it fails**

Run: `npm test -- src/components/ui/Icon.test.tsx`
Expected: FAIL — TypeScript/type error: `"link"` is not assignable to `IconName` (and the glyph returns null).

- [ ] **Step 3: Add the glyph**

In `src/components/ui/Icon.tsx`:

(a) Add `"link"` to the `IconName` union (after `"signal"`):
```ts
  | "link" // chain link — destination URL
```

(b) Add the case in the `switch` (after the `"signal"` case):
```tsx
    case "link":
      return (
        <>
          <Path d="M10.5 13.5 a3.5 3.5 0 0 1 0 -5 L13 6 a3.5 3.5 0 0 1 5 5 L16.6 12.4" {...stroke} />
          <Path d="M13.5 10.5 a3.5 3.5 0 0 1 0 5 L11 18 a3.5 3.5 0 0 1 -5 -5 L7.4 11.6" {...stroke} />
        </>
      );
```

- [ ] **Step 4: Run it to verify it passes**

Run: `npm test -- src/components/ui/Icon.test.tsx`
Expected: PASS — 1 test.

- [ ] **Step 5: Commit**

```bash
git add src/components/ui/Icon.tsx src/components/ui/Icon.test.tsx
git commit -m "feat: add link icon glyph"
```

---

## Task 9: BroadcastScheduler — destination field + edit/remove (TDD)

**Files:**
- Modify: `src/components/signal/BroadcastScheduler.tsx`
- Test: `src/components/signal/BroadcastScheduler.test.tsx`

The confirm signature changes from `onConfirm(when: Date)` to `onConfirm(when: Date, url: string)`. New props: `initialWhen?`, `initialUrl?`, `editing?`, `onRemove?`.

- [ ] **Step 1: Write the failing test**

Create `src/components/signal/BroadcastScheduler.test.tsx`:
```tsx
import { render, screen, fireEvent } from "@testing-library/react-native";
import { BroadcastScheduler } from "./BroadcastScheduler";

jest.mock("@/components/ui/GradientView", () => ({
  GradientView: () => null,
}));

function setup(overrides = {}) {
  const onConfirm = jest.fn();
  const onClose = jest.fn();
  const onRemove = jest.fn();
  render(
    <BroadcastScheduler
      visible
      title="Dev log thread"
      onClose={onClose}
      onConfirm={onConfirm}
      onRemove={onRemove}
      {...overrides}
    />,
  );
  return { onConfirm, onClose, onRemove };
}

it("does not confirm until url + day + time are all valid", () => {
  const { onConfirm } = setup();
  fireEvent.press(screen.getByText("Schedule"));
  expect(onConfirm).not.toHaveBeenCalled();

  fireEvent.changeText(screen.getByPlaceholderText("https://… where you'll post"), "https://x.com/compose");
  fireEvent.press(screen.getByText("15"));
  fireEvent.changeText(screen.getByPlaceholderText("hh:mm"), "09:30");

  fireEvent.press(screen.getByText("Schedule"));
  expect(onConfirm).toHaveBeenCalledTimes(1);
  const [when, url] = onConfirm.mock.calls[0];
  expect(when).toBeInstanceOf(Date);
  expect(when.getDate()).toBe(15);
  expect(url).toBe("https://x.com/compose");
});

it("prefills when editing and Remove fires onRemove", () => {
  const initialWhen = new Date(2026, 5, 20, 12, 0, 0);
  const { onRemove } = setup({ editing: true, initialWhen, initialUrl: "https://buffer.com" });
  expect(screen.getByDisplayValue("https://buffer.com")).toBeTruthy();
  expect(screen.getByDisplayValue("12:00")).toBeTruthy();
  fireEvent.press(screen.getByText("Remove broadcast"));
  expect(onRemove).toHaveBeenCalledTimes(1);
});
```

- [ ] **Step 2: Run it to verify it fails**

Run: `npm test -- src/components/signal/BroadcastScheduler.test.tsx`
Expected: FAIL — no destination field / placeholder not found, no "Remove broadcast".

- [ ] **Step 3: Update `BroadcastScheduler.tsx`**

(a) Extend imports — add `useEffect` and the URL helpers and `Icon` already imported. Add:
```ts
import { useEffect, useMemo, useState } from "react";
import { isValidDestinationUrl, normalizeDestinationUrl } from "@/lib/url";
```

(b) Replace the `Props` type:
```ts
type Props = {
  visible: boolean;
  /** Title shown above the picker, e.g. the signal label. */
  title?: string;
  /** Date the picker opens on. Defaults to today. */
  initialDate?: Date;
  /** When editing an existing plan: prefill day/time. */
  initialWhen?: Date;
  /** When editing an existing plan: prefill the destination URL. */
  initialUrl?: string;
  /** True when editing an existing plan (shows Remove). */
  editing?: boolean;
  onClose: () => void;
  /** Fires with the chosen broadcast date + time and destination URL. */
  onConfirm: (when: Date, url: string) => void;
  /** Remove the existing plan (only shown when editing). */
  onRemove?: () => void;
};
```

(c) Replace the component's state setup. Change the function signature destructure to include the new props, and set initial state from `initialWhen`/`initialUrl`:
```ts
export function BroadcastScheduler({
  visible,
  title,
  initialDate,
  initialWhen,
  initialUrl,
  editing,
  onClose,
  onConfirm,
  onRemove,
}: Props) {
  const base = initialWhen ?? initialDate ?? new Date();
  const today = new Date();

  const [year, setYear] = useState(base.getFullYear());
  const [month, setMonth] = useState(base.getMonth());
  const [day, setDay] = useState<number | null>(initialWhen ? initialWhen.getDate() : null);
  const [time, setTime] = useState(
    initialWhen
      ? `${String(initialWhen.getHours()).padStart(2, "0")}:${String(initialWhen.getMinutes()).padStart(2, "0")}`
      : "",
  );
  const [url, setUrl] = useState(initialUrl ?? "");
  const [picker, setPicker] = useState<"month" | "year" | null>(null);
```

(d) Add validity + update `canConfirm`:
```ts
  const urlValid = isValidDestinationUrl(url);
  const timeValid = TIME_RE.test(time);
  const canConfirm = urlValid && day !== null && timeValid;
```

(e) Update `confirm()` to pass the normalized URL:
```ts
  const confirm = () => {
    if (!canConfirm || day === null) return;
    const [hh, mm] = time.split(":").map((n) => parseInt(n, 10));
    const when = new Date(year, month, day, hh, mm, 0, 0);
    haptics.success();
    onConfirm(when, normalizeDestinationUrl(url));
  };
```

(f) Render the destination field. Inside the `<View className="p-5">`, immediately AFTER the `{title ? (...) : null}` block and BEFORE the `{/* Month / Year selectors */}` row, insert:
```tsx
            {/* Destination */}
            <Text className="mb-1.5 font-display text-lg font-bold text-text-primary">
              Destination
            </Text>
            <View
              className={cn(
                "mb-4 flex-row items-center gap-2.5 rounded-2xl border bg-bg-card px-4",
                url.length > 0 && !urlValid
                  ? "border-status-error/60"
                  : "border-border-default",
              )}
            >
              <Icon name="link" size={20} color={colors.textSecondary} />
              <TextInput
                value={url}
                onChangeText={setUrl}
                placeholder="https://… where you'll post"
                placeholderTextColor={colors.textTertiary}
                keyboardType="url"
                autoCapitalize="none"
                autoCorrect={false}
                accessibilityLabel="Broadcast destination URL"
                className="min-h-[48px] flex-1 font-body text-base text-text-primary"
              />
            </View>
            {url.length > 0 && !urlValid ? (
              <Text className="-mt-2.5 mb-3 font-body text-xs text-status-error">
                Enter a link like https://x.com/compose or buffer.com/queue.
              </Text>
            ) : null}
```

(g) Add the Remove control. In the actions row at the bottom, AFTER the closing of the `<View className="mt-5 flex-row gap-3">...</View>` actions block, insert:
```tsx
            {editing && onRemove ? (
              <Pressable
                onPress={onRemove}
                accessibilityRole="button"
                className="mt-3 items-center py-2 active:opacity-70"
              >
                <Text className="font-body text-sm text-status-error">
                  Remove broadcast
                </Text>
              </Pressable>
            ) : null}
```

(h) Keep `useEffect` import even if unused-by-warning? It IS used: add a reset when reopened. Add after state declarations:
```ts
  useEffect(() => {
    if (!visible) setPicker(null);
  }, [visible]);
```

- [ ] **Step 4: Run it to verify it passes**

Run: `npm test -- src/components/signal/BroadcastScheduler.test.tsx`
Expected: PASS — 2 tests.

- [ ] **Step 5: Commit**

```bash
git add src/components/signal/BroadcastScheduler.tsx src/components/signal/BroadcastScheduler.test.tsx
git commit -m "feat: destination field + edit/remove in BroadcastScheduler"
```

---

## Task 10: SignalActions — independent Forge + Broadcast (TDD)

**Files:**
- Modify: `src/components/signal/SignalActions.tsx`
- Test: `src/components/signal/SignalActions.test.tsx`

New props: `signalId: string`, `platform: string`. The component reads the broadcast for `signalId` from the store, drives a persistent chip + Cancel, and shows both a content action and a broadcast action regardless of `status`.

- [ ] **Step 1: Write the failing test**

Create `src/components/signal/SignalActions.test.tsx`:
```tsx
import { render, screen, fireEvent } from "@testing-library/react-native";
import { SignalActions } from "./SignalActions";
import { useMissionStore } from "@/store/mission";

jest.mock("@/components/ui/GradientView", () => ({ GradientView: () => null }));
jest.mock("@/lib/notifications", () => ({
  scheduleBroadcastReminder: jest.fn(async () => true),
  cancelBroadcastReminder: jest.fn(async () => undefined),
}));
import { cancelBroadcastReminder } from "@/lib/notifications";

function renderActions(status = "not_loaded") {
  return render(
    <SignalActions
      status={status as any}
      signalId="pre_1"
      platform="X/Twitter"
      label="Dev log thread"
      onForge={jest.fn()}
      onViewCargo={jest.fn()}
    />,
  );
}

beforeEach(() => {
  useMissionStore.setState({ convex: null, broadcasts: [] });
  jest.clearAllMocks();
});

it("shows both Forge and Broadcast actions when unscheduled", () => {
  renderActions("not_loaded");
  expect(screen.getByText("Forge →")).toBeTruthy();
  expect(screen.getByText("Broadcast →")).toBeTruthy();
});

it("reflects a scheduled plan and cancels it", () => {
  useMissionStore.setState({
    broadcasts: [{ signalId: "pre_1", destinationUrl: "https://x.com", scheduledAt: Date.now() + 3600_000 }],
  });
  renderActions("not_loaded");
  expect(screen.getByText(/Broadcast set for/)).toBeTruthy();

  fireEvent.press(screen.getByText("Cancel broadcast"));
  expect(useMissionStore.getState().broadcasts).toEqual([]);
  expect(cancelBroadcastReminder).toHaveBeenCalledWith("pre_1");
});
```

- [ ] **Step 2: Run it to verify it fails**

Run: `npm test -- src/components/signal/SignalActions.test.tsx`
Expected: FAIL — props/labels don't exist yet; "Forge →" not found.

- [ ] **Step 3: Rewrite `SignalActions.tsx`**

Replace the whole file with:
```tsx
import React, { useState } from "react";
import { Share } from "react-native";

import { BroadcastScheduler } from "@/components/signal/BroadcastScheduler";
import { Button } from "@/components/ui/Button";
import type { SignalStatus } from "@/components/ui/SignalBars";
import { track } from "@/lib/analytics";
import { playSignature } from "@/lib/audio";
import {
  scheduleBroadcastReminder,
  cancelBroadcastReminder,
} from "@/lib/notifications";
import { useMissionStore } from "@/store/mission";
import { Pressable, Text, View } from "@/tw";

type Props = {
  status: SignalStatus;
  /** Template id, e.g. "pre_1" — keys the broadcast plan. */
  signalId: string;
  /** Channel, e.g. "X/Twitter" — shown in the reminder body. */
  platform: string;
  /** Label of the signal, surfaced in the picker + reminder. */
  label?: string;
  onForge: () => void;
  onViewCargo: () => void;
};

/** Human-readable broadcast slot, e.g. "Jan 4, 2025 · 18:45". */
function formatWhen(when: Date): string {
  const date = when.toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
  const hh = String(when.getHours()).padStart(2, "0");
  const mm = String(when.getMinutes()).padStart(2, "0");
  return `${date} · ${hh}:${mm}`;
}

/** The content action — depends on whether the asset exists / is ready. */
function ContentAction({
  status,
  onForge,
  onViewCargo,
}: Pick<Props, "status" | "onForge" | "onViewCargo">) {
  if (status === "not_loaded") {
    return <Button label="Forge →" size="sm" variant="secondary" fullWidth onPress={onForge} />;
  }
  if (status === "in_prep") {
    return (
      <View className="gap-2">
        <Text className="font-body text-sm text-status-warning">Needs finishing</Text>
        <Button label="Finish in Cargo →" size="sm" variant="secondary" onPress={onViewCargo} />
      </View>
    );
  }
  return <Button label="View in Cargo" size="sm" variant="secondary" onPress={onViewCargo} />;
}

/**
 * Two independent actions per signal:
 *   Content  → Forge / Finish / View in Cargo Bay (depends on status)
 *   Broadcast→ schedule a send (destination + date/time → calm reminder)
 * Broadcast is always available, regardless of content status.
 */
export function SignalActions({
  status,
  signalId,
  platform,
  label,
  onForge,
  onViewCargo,
}: Props) {
  const [schedulerOpen, setSchedulerOpen] = useState(false);
  const broadcast = useMissionStore((s) =>
    s.broadcasts.find((b) => b.signalId === signalId),
  );
  const scheduleBroadcast = useMissionStore((s) => s.scheduleBroadcast);
  const cancelBroadcast = useMissionStore((s) => s.cancelBroadcast);

  const onShare = async () => {
    track("signal_shared", { label });
    try {
      await Share.share({
        message: label
          ? `Check out my launch signal: ${label}`
          : "Check out my launch signal on LaunchDeck",
      });
    } catch {
      // dismissed / unsupported — no-op.
    }
  };

  const onConfirm = (when: Date, url: string) => {
    setSchedulerOpen(false);
    scheduleBroadcast({ signalId, destinationUrl: url, scheduledAt: when.getTime() });
    void scheduleBroadcastReminder({
      signalId,
      signalLabel: label ?? "your signal",
      platform,
      destinationUrl: url,
      scheduledAt: when.getTime(),
    });
    track("broadcast_scheduled", { at: when.toISOString() });
    playSignature("signal_ready");
  };

  const onCancelBroadcast = () => {
    cancelBroadcast(signalId);
    void cancelBroadcastReminder(signalId);
    track("broadcast_cancelled", { signalId });
  };

  const scheduledWhen = broadcast ? new Date(broadcast.scheduledAt) : null;

  return (
    <View className="gap-3">
      <View className="flex-row gap-2">
        <View className="flex-1">
          <ContentAction status={status} onForge={onForge} onViewCargo={onViewCargo} />
        </View>
        <Button label="Share" size="sm" variant="secondary" className="flex-1" onPress={onShare} />
      </View>

      {scheduledWhen ? (
        <View className="gap-1.5 rounded-2xl border border-brand-teal/40 bg-brand-teal/5 p-3">
          <Text className="font-body text-sm text-brand-teal">
            ✓ Broadcast set for {formatWhen(scheduledWhen)}
          </Text>
          <View className="flex-row gap-2">
            <Button
              label="Edit"
              size="sm"
              variant="secondary"
              className="flex-1"
              onPress={() => {
                track("broadcast_scheduler_opened", { editing: true });
                setSchedulerOpen(true);
              }}
            />
            <Pressable
              onPress={onCancelBroadcast}
              accessibilityRole="button"
              className="flex-1 items-center justify-center rounded-full py-2 active:opacity-70"
            >
              <Text className="font-body text-sm text-status-error">Cancel broadcast</Text>
            </Pressable>
          </View>
        </View>
      ) : (
        <Button
          label="Broadcast →"
          size="sm"
          onPress={() => {
            track("broadcast_scheduler_opened");
            setSchedulerOpen(true);
          }}
        />
      )}

      <BroadcastScheduler
        visible={schedulerOpen}
        title={label}
        editing={!!broadcast}
        initialWhen={scheduledWhen ?? undefined}
        initialUrl={broadcast?.destinationUrl}
        onClose={() => setSchedulerOpen(false)}
        onConfirm={onConfirm}
        onRemove={
          broadcast
            ? () => {
                setSchedulerOpen(false);
                onCancelBroadcast();
              }
            : undefined
        }
      />
    </View>
  );
}
```

- [ ] **Step 4: Run it to verify it passes**

Run: `npm test -- src/components/signal/SignalActions.test.tsx`
Expected: PASS — 2 tests.

- [ ] **Step 5: Commit**

```bash
git add src/components/signal/SignalActions.tsx src/components/signal/SignalActions.test.tsx
git commit -m "feat: independent Forge + Broadcast actions, store-driven schedule chip"
```

---

## Task 11: Pass signalId/platform through call sites + calendar marker

**Files:**
- Modify: `src/app/(modals)/signal-deck.tsx`
- Modify: `src/components/signal/SignalCalendar.tsx`

`SignalActions` now requires `signalId` and `platform`. Update all three render sites and add a "Scheduled" marker to the calendar.

- [ ] **Step 1: Update the list view (signal-deck.tsx)**

In `src/app/(modals)/signal-deck.tsx`, the `SignalRow` component renders `<SignalActions .../>`. Update that call to pass the new props:
```tsx
          <SignalActions
            status={status}
            signalId={signal.id}
            platform={signal.platform}
            label={signal.label}
            onForge={onForge}
            onViewCargo={onViewCargo}
          />
```

- [ ] **Step 2: Update the calendar call sites (SignalCalendar.tsx)**

In `src/components/signal/SignalCalendar.tsx`, both `DayDetail` and `TimelineRow` render `<SignalActions .../>`. Update each:

In `DayDetail` (inside the `day.signals.map`):
```tsx
              <SignalActions
                status={status}
                signalId={s.id}
                platform={s.platform}
                label={s.label}
                onForge={() => onForge(s)}
                onViewCargo={onViewCargo}
              />
```

In `TimelineRow`:
```tsx
              <SignalActions
                status={status}
                signalId={signal.id}
                platform={signal.platform}
                label={signal.label}
                onForge={onForge}
                onViewCargo={onViewCargo}
              />
```

- [ ] **Step 3: Add a scheduled marker in the calendar**

In `src/components/signal/SignalCalendar.tsx`:

(a) Add imports:
```ts
import { Icon } from "@/components/ui/Icon";
import { useMissionStore } from "@/store/mission";
```

(b) Inside `SignalCalendar(...)`, read scheduled ids:
```ts
  const scheduledIds = useMissionStore((s) => {
    const set = new Set(s.broadcasts.map((b) => b.signalId));
    return set;
  });
```

(c) In `DayDetail`, the component needs the set. Add a `scheduledIds: Set<string>` prop to `DayDetail` and pass `scheduledIds` from the caller. Inside its `day.signals.map`, after the `<SignalActions .../>`, the scheduled chip is already covered by SignalActions; instead add a small marker beside the platform label. Replace the platform `<Text>` block with:
```tsx
                  <View className="flex-row items-center gap-1.5">
                    <Text className="font-mono text-[11px] uppercase tracking-wider text-text-tertiary">
                      {s.platform}
                    </Text>
                    {scheduledIds.has(s.id) ? (
                      <View className="flex-row items-center gap-1">
                        <Icon name="signal" size={12} color={colors.brandTeal} />
                        <Text className="font-mono text-[10px] uppercase tracking-wider text-brand-teal">
                          Scheduled
                        </Text>
                      </View>
                    ) : null}
                  </View>
```
Update the `DayDetail` usage to pass `scheduledIds={scheduledIds}` and its prop type to include `scheduledIds: Set<string>`.

(d) In `DayCell`, add a small dot when any of its signals is scheduled. Add a `scheduled: boolean` prop to `DayCell`, and in the caller compute `scheduled={day.signals.some((s) => scheduledIds.has(s.id))}`. Inside `DayCell`, in the header row next to `<SignalBars/>`, add:
```tsx
        {scheduled ? <Icon name="signal" size={14} color={colors.brandTeal} /> : null}
```

- [ ] **Step 4: Typecheck**

Run: `npx tsc --noEmit`
Expected: no new errors across `signal-deck.tsx` and `SignalCalendar.tsx`.

- [ ] **Step 5: Commit**

```bash
git add "src/app/(modals)/signal-deck.tsx" src/components/signal/SignalCalendar.tsx
git commit -m "feat: thread signalId/platform to SignalActions + calendar Scheduled marker"
```

---

## Task 12: Full verification

**Files:** none (verification + cleanup)

- [ ] **Step 1: Run the full test suite**

Run: `npm test`
Expected: PASS — all suites (url, mission.broadcast, notifications, Icon, BroadcastScheduler, SignalActions).

- [ ] **Step 2: Typecheck the whole project**

Run: `npx tsc --noEmit`
Expected: exit 0, no errors.

- [ ] **Step 3: Lint**

Run: `npm run lint`
Expected: no new errors in the files this plan touched. Fix any that appear.

- [ ] **Step 4: Manual web smoke (demo mode)**

Run: `npm run web`
Then verify in the browser:
- Open the Signal Deck modal → expand a signal → both **Forge →** and **Broadcast →** show.
- Tap **Broadcast →** → the scheduler opens with a **Destination** field on top. "Schedule" stays disabled until a valid URL + day + time are entered.
- Confirm → the row shows "✓ Broadcast set for …" with **Edit** / **Cancel broadcast**.
- Switch to **Calendar** view → the scheduled signal shows the teal **signal** marker + "Scheduled".
- **Cancel broadcast** → chip disappears, "Broadcast →" returns.
- (Web has no notifications — that path is expected to be silent.)

- [ ] **Step 5: Final commit**

```bash
git add -A
git commit -m "chore: verify signal broadcast scheduling (tests, typecheck, lint)"
```

---

## Notes & risks

- **expo-notifications `identifier` support:** the plan relies on passing `identifier` to `scheduleNotificationAsync` and cancelling by it. This is supported in expo-notifications SDK 56. If a runtime warns that a duplicate identifier is rejected, the `cancelScheduledNotificationAsync(...)` call right before scheduling (in `scheduleBroadcastReminder`) clears it first.
- **Bleeding-edge jest-expo:** Expo 56 / RN 0.85 / React 19.2 is new. If `npm test` errors on transforming a specific `node_modules` package, add that package to the `transformIgnorePatterns` group in `jest.config.js` (Task 0, Step 3) and re-run — that's the standard fix, not a logic change.
- **Demo vs Convex:** in demo mode (signed out) plans live only in the store and reminders are scheduled on-device at action time; reconcile runs on Convex hydration so signed-in plans survive reinstall.
