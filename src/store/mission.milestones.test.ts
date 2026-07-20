/**
 * Missions domain — store-level tests (Docs/11 Missions cases).
 *
 * Real completeMilestone LOCAL path (convex: null, serverOwned: false):
 *   1. Finds the milestone by id
 *   2. Sets completed: true on that milestone
 *   3. Recalculates mission.readinessScore
 *   4. Calls useUIStore.getState().addFuel(target.fuelReward)
 *      — addFuel is a no-op when serverOwned: true, so tests keep serverOwned: false
 *
 * Locking: the store keeps ALL milestones regardless of requiredPlan.
 * The screen computes `locked = !planMeets(plan, m.requiredPlan)` at render time.
 * The `isLocked` field on Milestone is a stored marker; plan-based gating is UI.
 *
 * Seeding strategy: useMissionStore.setState({ convex: null, milestones: [...] })
 * to set a known fixture directly. useUIStore.setState({ plan, fuel, serverOwned })
 * to control fuel state.
 */

import type { Milestone, Mission, Blueprint, BlueprintSection, Asset } from "@/types";
import { useMissionStore } from "./mission";
import { useUIStore } from "./ui";
import { BLUEPRINT_SECTIONS } from "@/constants/blueprintSections";

// ---------------------------------------------------------------------------
// Fixture helpers
// ---------------------------------------------------------------------------

function makeBlueprints(): Record<BlueprintSection, Blueprint> {
  const out = {} as Record<BlueprintSection, Blueprint>;
  for (const s of BLUEPRINT_SECTIONS) {
    out[s.id] = { section: s.id, fields: {}, completionStatus: 0 };
  }
  return out;
}

const BASE_MISSION: Mission = {
  id: "m_test",
  appName: "TestApp",
  appDescription: "Test desc",
  oneLiner: "Test one-liner",
  targetAudience: "Testers",
  platform: "ios",
  stage: "building",
  status: "active",
  readinessScore: 0,
};

/** An incomplete, unlocked cadet milestone. */
const CADET_MILESTONE: Milestone = {
  id: "ms_test_cadet",
  title: "Name your app",
  description: "Pick a name.",
  category: "foundation",
  completed: false,
  fuelReward: 10,
  requiredPlan: "cadet",
  isLocked: false,
};

/** An incomplete milestone requiring commander plan — plan-locked for a cadet user. */
const COMMANDER_MILESTONE: Milestone = {
  id: "ms_test_commander",
  title: "Create a launch video script",
  description: "High-conversion hook.",
  category: "assets",
  completed: false,
  fuelReward: 25,
  requiredPlan: "commander",
  isLocked: false,
};

const ASSETS: Asset[] = [];

// ---------------------------------------------------------------------------
// Before each: reset both stores to a known, isolated state
// ---------------------------------------------------------------------------

beforeEach(() => {
  // Local (demo) mode — no Convex adapter
  useMissionStore.setState({
    convex: null,
    mission: { ...BASE_MISSION, readinessScore: 0 },
    milestones: [{ ...CADET_MILESTONE }, { ...COMMANDER_MILESTONE }],
    blueprints: makeBlueprints(),
    assets: ASSETS,
    broadcasts: [],
  });

  // Client-owned fuel so addFuel actually mutates state
  useUIStore.setState({
    plan: "cadet",
    fuel: 25,
    streak: 0,
    serverOwned: false,
    convexSetPlan: null,
  });
});

// ---------------------------------------------------------------------------
// 1. completeMilestone: marks done + awards fuel (local mode)
// ---------------------------------------------------------------------------

describe("completeMilestone — local mode (convex: null, serverOwned: false)", () => {
  it("sets completed: true on the target milestone", () => {
    useMissionStore.getState().completeMilestone("ms_test_cadet");
    const ms = useMissionStore.getState().milestones.find((m) => m.id === "ms_test_cadet");
    expect(ms?.completed).toBe(true);
  });

  it("does not affect other milestones in the list", () => {
    useMissionStore.getState().completeMilestone("ms_test_cadet");
    const other = useMissionStore.getState().milestones.find((m) => m.id === "ms_test_commander");
    expect(other?.completed).toBe(false);
  });

  it("awards fuelReward to UI-store fuel (25 + 10 = 35)", () => {
    useMissionStore.getState().completeMilestone("ms_test_cadet");
    expect(useUIStore.getState().fuel).toBe(35);
  });

  it("awards fuelReward matching the milestone's fuelReward value", () => {
    // Commander milestone (fuelReward: 25) — plan is cadet but store doesn't
    // gate completion; the screen gates it via planMeets at render time.
    // The store completes it if convex is null and it's not already completed.
    useMissionStore.getState().completeMilestone("ms_test_commander");
    expect(useUIStore.getState().fuel).toBe(25 + 25); // 50
  });

  it("is a no-op when milestone is already completed (fuel does not double-award)", () => {
    // Mark done first
    useMissionStore.getState().completeMilestone("ms_test_cadet");
    const fuelAfterFirst = useUIStore.getState().fuel;
    expect(fuelAfterFirst).toBe(35);

    // Call again — should be no-op
    useMissionStore.getState().completeMilestone("ms_test_cadet");
    expect(useUIStore.getState().fuel).toBe(35);
    const ms = useMissionStore.getState().milestones.find((m) => m.id === "ms_test_cadet");
    expect(ms?.completed).toBe(true);
  });

  it("updates mission readinessScore after completion", () => {
    // 2 milestones, 0 completed → 0%. After completing one → 50%.
    expect(useMissionStore.getState().mission.readinessScore).toBe(0);
    useMissionStore.getState().completeMilestone("ms_test_cadet");
    expect(useMissionStore.getState().mission.readinessScore).toBe(50);
  });

  it("does NOT award fuel when serverOwned is true (server path owns fuel)", () => {
    // Simulate server-owned mode: addFuel becomes a no-op
    useUIStore.setState({ serverOwned: true, fuel: 25 });
    useMissionStore.getState().completeMilestone("ms_test_cadet");
    // completed flag still set locally in demo completeMilestone
    const ms = useMissionStore.getState().milestones.find((m) => m.id === "ms_test_cadet");
    expect(ms?.completed).toBe(true);
    // fuel unchanged because addFuel is a no-op when serverOwned
    expect(useUIStore.getState().fuel).toBe(25);
  });

  it("delegates to convex adapter and does NOT mutate local state when convex is set", () => {
    const mockComplete = jest.fn();
    useMissionStore.setState({
      convex: {
        completeMilestone: mockComplete,
        saveBlueprint: jest.fn(),
        updateAssetStatus: jest.fn(),
        createFoundryAsset: jest.fn(async () => {}),
        scheduleBroadcast: jest.fn(),
        cancelBroadcast: jest.fn(),
      },
    });
    useMissionStore.getState().completeMilestone("ms_test_cadet");
    expect(mockComplete).toHaveBeenCalledWith("ms_test_cadet");
    // Local state should NOT have been mutated
    const ms = useMissionStore.getState().milestones.find((m) => m.id === "ms_test_cadet");
    expect(ms?.completed).toBe(false);
    // UI fuel unchanged
    expect(useUIStore.getState().fuel).toBe(25);
  });
});

// ---------------------------------------------------------------------------
// 2. Locked milestones remain visible in the store
// ---------------------------------------------------------------------------

describe("locked milestones — store visibility", () => {
  it("plan-locked milestones remain in the milestones list (never removed)", () => {
    // Commander milestone is plan-locked for a cadet user at the UI level,
    // but the store always retains it.
    const milestones = useMissionStore.getState().milestones;
    const locked = milestones.find((m) => m.id === "ms_test_commander");
    expect(locked).toBeDefined();
    expect(locked?.requiredPlan).toBe("commander");
  });

  it("completing another milestone does not remove the locked milestone", () => {
    useMissionStore.getState().completeMilestone("ms_test_cadet");
    const milestones = useMissionStore.getState().milestones;
    const locked = milestones.find((m) => m.id === "ms_test_commander");
    expect(locked).toBeDefined();
    expect(locked?.completed).toBe(false);
  });

  it("hydrate with isLocked: true milestone keeps it in the list", () => {
    const lockedMilestone: Milestone = {
      ...COMMANDER_MILESTONE,
      id: "ms_hydrated_locked",
      isLocked: true,
    };
    useMissionStore.getState().hydrate({
      mission: BASE_MISSION,
      milestones: [CADET_MILESTONE, lockedMilestone],
      blueprints: makeBlueprints(),
      assets: [],
      broadcasts: [],
    });
    const milestones = useMissionStore.getState().milestones;
    expect(milestones).toHaveLength(2);
    const found = milestones.find((m) => m.id === "ms_hydrated_locked");
    expect(found).toBeDefined();
    expect(found?.isLocked).toBe(true);
  });

  it("plan-locked milestone count stays stable as milestones are completed", () => {
    const countBefore = useMissionStore
      .getState()
      .milestones.filter((m) => m.requiredPlan === "commander").length;

    useMissionStore.getState().completeMilestone("ms_test_cadet");

    const countAfter = useMissionStore
      .getState()
      .milestones.filter((m) => m.requiredPlan === "commander").length;

    expect(countAfter).toBe(countBefore);
  });
});

// ---------------------------------------------------------------------------
// 3. hydrate replaces all mission state atomically
// ---------------------------------------------------------------------------

describe("hydrate", () => {
  it("replaces milestones, mission, blueprints, assets, and broadcasts atomically", () => {
    const newMission: Mission = { ...BASE_MISSION, id: "m_hydrated", appName: "HydratedApp" };
    const newMilestones: Milestone[] = [
      { ...CADET_MILESTONE, id: "ms_hydrated_1", completed: true },
    ];
    useMissionStore.getState().hydrate({
      mission: newMission,
      milestones: newMilestones,
      blueprints: makeBlueprints(),
      assets: [],
      broadcasts: [],
    });

    const state = useMissionStore.getState();
    expect(state.mission.appName).toBe("HydratedApp");
    expect(state.milestones).toHaveLength(1);
    expect(state.milestones[0].completed).toBe(true);
    expect(state.broadcasts).toEqual([]);
  });
});
