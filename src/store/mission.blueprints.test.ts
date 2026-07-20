/**
 * Blueprints domain — store-level tests (Docs/11 Blueprints cases).
 *
 * Real completion formula (blueprintCompletion in store/mission.ts):
 *   Math.round((filled / section.fields.length) * 100)
 *   where `filled` = count of fields[f.key]?.trim() that are truthy.
 *
 * Section used: "app_store" (4 fields: subtitle, keywords, promoText, description)
 *   0 filled → 0%
 *   2 filled → Math.round(2/4 * 100) = 50%
 *   4 filled → 100%
 *
 * Section used: "beta_testing" (3 fields: testflightSetup, feedbackChannel, testerCount)
 *   0 filled → 0%
 *   1 filled → Math.round(1/3 * 100) = 33%
 *   3 filled → 100%
 *
 * Blueprints state shape: Record<BlueprintSection, Blueprint> (a plain object map,
 * keyed by section id — NOT an array). Confirmed in store/mission.ts buildBlueprints().
 */

import type { Blueprint, BlueprintSection } from "@/types";
import { BLUEPRINT_SECTIONS } from "@/constants/blueprintSections";
import { useMissionStore } from "./mission";

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

// ---------------------------------------------------------------------------
// Reset before each test
// ---------------------------------------------------------------------------

beforeEach(() => {
  useMissionStore.setState({
    convex: null,
    blueprints: makeBlueprints(),
  });
});

// ---------------------------------------------------------------------------
// 1. saveBlueprint — app_store section (4 fields)
// ---------------------------------------------------------------------------

describe("saveBlueprint — app_store section (4 fields)", () => {
  it("saving an empty fields object yields completionStatus 0", () => {
    useMissionStore.getState().saveBlueprint("app_store", {});
    const bp = useMissionStore.getState().blueprints["app_store"];
    expect(bp.completionStatus).toBe(0);
    expect(bp.fields).toEqual({});
  });

  it("saving whitespace-only values yields completionStatus 0 (blank doesn't count)", () => {
    useMissionStore.getState().saveBlueprint("app_store", {
      subtitle: "   ",
      keywords: "",
      promoText: "\t",
      description: "",
    });
    const bp = useMissionStore.getState().blueprints["app_store"];
    expect(bp.completionStatus).toBe(0);
  });

  it("filling 2 of 4 fields yields completionStatus 50", () => {
    useMissionStore.getState().saveBlueprint("app_store", {
      subtitle: "Calm task tracking",
      keywords: "tasks, focus, productivity",
    });
    const bp = useMissionStore.getState().blueprints["app_store"];
    // 2/4 = 0.5 → Math.round(50) = 50
    expect(bp.completionStatus).toBe(50);
  });

  it("filling all 4 fields yields completionStatus 100", () => {
    useMissionStore.getState().saveBlueprint("app_store", {
      subtitle: "Calm task tracking",
      keywords: "tasks, focus, productivity, calm",
      promoText: "New: weekly focus reviews.",
      description: "FocusFlow helps you...",
    });
    const bp = useMissionStore.getState().blueprints["app_store"];
    expect(bp.completionStatus).toBe(100);
  });

  it("persists the exact fields object into blueprints[app_store].fields", () => {
    const input = {
      subtitle: "Calm task tracking",
      keywords: "tasks, focus",
    };
    useMissionStore.getState().saveBlueprint("app_store", input);
    const bp = useMissionStore.getState().blueprints["app_store"];
    expect(bp.fields).toEqual(input);
    expect(bp.section).toBe("app_store");
  });

  it("does not mutate other sections when saving app_store", () => {
    const beforeSave = useMissionStore.getState().blueprints["beta_testing"];
    useMissionStore.getState().saveBlueprint("app_store", {
      subtitle: "Test",
      keywords: "test",
    });
    const afterSave = useMissionStore.getState().blueprints["beta_testing"];
    expect(afterSave).toEqual(beforeSave);
  });

  it("delegates to convex adapter and does NOT mutate local state when convex is set", () => {
    const mockSave = jest.fn();
    useMissionStore.setState({
      convex: {
        completeMilestone: jest.fn(),
        saveBlueprint: mockSave,
        updateAssetStatus: jest.fn(),
        createFoundryAsset: jest.fn(async () => {}),
        scheduleBroadcast: jest.fn(),
        cancelBroadcast: jest.fn(),
      },
    });
    const fields = { subtitle: "Calm task tracking" };
    useMissionStore.getState().saveBlueprint("app_store", fields);
    // adapter was called with section, fields, and computed completionStatus
    expect(mockSave).toHaveBeenCalledWith("app_store", fields, 25);
    // local state NOT mutated — still 0
    const bp = useMissionStore.getState().blueprints["app_store"];
    expect(bp.completionStatus).toBe(0);
    expect(bp.fields).toEqual({});
  });
});

// ---------------------------------------------------------------------------
// 2. saveBlueprint — beta_testing section (3 fields)
// ---------------------------------------------------------------------------

describe("saveBlueprint — beta_testing section (3 fields)", () => {
  it("saving empty fields yields completionStatus 0", () => {
    useMissionStore.getState().saveBlueprint("beta_testing", {});
    const bp = useMissionStore.getState().blueprints["beta_testing"];
    expect(bp.completionStatus).toBe(0);
  });

  it("filling 1 of 3 fields yields completionStatus 33", () => {
    useMissionStore.getState().saveBlueprint("beta_testing", {
      testflightSetup: "Internal track + 50 testers.",
    });
    const bp = useMissionStore.getState().blueprints["beta_testing"];
    // 1/3 = 0.333... → Math.round(33.33) = 33
    expect(bp.completionStatus).toBe(33);
  });

  it("filling all 3 fields yields completionStatus 100", () => {
    useMissionStore.getState().saveBlueprint("beta_testing", {
      testflightSetup: "Internal track + 50 testers.",
      feedbackChannel: "In-app form + Discord.",
      testerCount: "100",
    });
    const bp = useMissionStore.getState().blueprints["beta_testing"];
    expect(bp.completionStatus).toBe(100);
  });
});

// ---------------------------------------------------------------------------
// 3. Blueprints shape — Record (not array)
// ---------------------------------------------------------------------------

describe("blueprints state shape", () => {
  it("is a plain Record keyed by section id (not an array)", () => {
    const { blueprints } = useMissionStore.getState();
    // Must be a plain object, not an array
    expect(Array.isArray(blueprints)).toBe(false);
    expect(typeof blueprints).toBe("object");
  });

  it("contains an entry for every known section", () => {
    const { blueprints } = useMissionStore.getState();
    for (const section of BLUEPRINT_SECTIONS) {
      expect(blueprints[section.id]).toBeDefined();
      expect(blueprints[section.id].section).toBe(section.id);
    }
  });

  it("all sections start with completionStatus 0 when seeded with empty fields", () => {
    const { blueprints } = useMissionStore.getState();
    for (const section of BLUEPRINT_SECTIONS) {
      expect(blueprints[section.id].completionStatus).toBe(0);
    }
  });
});
