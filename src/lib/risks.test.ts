/**
 * Unit tests for the mission risk engine (risks.ts).
 * Pins: healthy state yields no risks; specific unhealthy states surface the
 * correct risk id/severity; risk ordering (high before med).
 *
 * RiskSeverity is "high" | "med" — there is NO "critical" severity in this
 * engine (the UI component is named "Critical Risk Detected" but risks only
 * carry "high" or "med").
 */

import { deriveRisks, riskActionLabel } from "./risks";
import type { Asset, Milestone, Mission } from "@/types";

// ── Helpers ─────────────────────────────────────────────────────────────────

const DAY = 86_400_000;

function baseMission(overrides: Partial<Mission> = {}): Mission {
  return {
    id: "m_test",
    appName: "TestApp",
    appDescription: "A test app",
    oneLiner: "One line.",
    targetAudience: "Developers",
    platform: "ios",
    stage: "building", // NOT store_prep — screenshot + copy checks won't fire
    status: "active",
    readinessScore: 80,
    launchDate: undefined,
    ...overrides,
  };
}

function emailFlightReady(): Asset {
  return {
    id: "a_email",
    type: "email_sequence",
    title: "Email Teaser",
    status: "flight_ready",
    category: "pr",
    updatedAt: Date.now(),
  };
}

// ── Healthy state: no risks ──────────────────────────────────────────────────

describe("deriveRisks — healthy state", () => {
  it("returns an empty array when all checks pass (building stage, email ready, launch not imminent)", () => {
    const mission = baseMission();
    const milestones: Milestone[] = [];
    const assets: Asset[] = [emailFlightReady()];
    const risks = deriveRisks(mission, milestones, assets);
    expect(risks).toHaveLength(0);
  });

  it("returns no risks for store_prep stage when screenshots exist, store copy is ready, and email is ready", () => {
    const mission = baseMission({ stage: "store_prep", readinessScore: 80 });
    const assets: Asset[] = [
      emailFlightReady(),
      { id: "a_img", type: "image", title: "Screenshot", status: "flight_ready", category: "app_store", updatedAt: Date.now() },
      { id: "a_copy", type: "app_store_copy", title: "Store Description", status: "flight_ready", category: "app_store", updatedAt: Date.now() },
    ];
    const risks = deriveRisks(mission, [], assets);
    expect(risks).toHaveLength(0);
  });
});

// ── Email sequence risk (med) ────────────────────────────────────────────────

describe("deriveRisks — missing email sequence", () => {
  it("surfaces a 'med' email_sequence risk when no email asset is flight_ready", () => {
    const mission = baseMission();
    const assets: Asset[] = [
      { id: "a_email_bad", type: "email_sequence", title: "Email", status: "in_prep", category: "pr", updatedAt: Date.now() },
    ];
    const risks = deriveRisks(mission, [], assets);
    const emailRisk = risks.find((r) => r.id === "email_sequence");
    expect(emailRisk).toBeDefined();
    expect(emailRisk!.severity).toBe("med");
    expect(emailRisk!.label).toBe("Email sequence not configured");
  });

  it("surfaces email risk even with no assets at all", () => {
    const risks = deriveRisks(baseMission(), [], []);
    expect(risks.some((r) => r.id === "email_sequence")).toBe(true);
  });
});

// ── Screenshots risk (high) ──────────────────────────────────────────────────

describe("deriveRisks — missing screenshots in store_prep", () => {
  it("surfaces a 'high' screenshot risk in store_prep when no ready image exists", () => {
    const mission = baseMission({ stage: "store_prep" });
    // Email is ready so that risk doesn't interfere with counting
    const assets: Asset[] = [emailFlightReady()];
    const risks = deriveRisks(mission, [], assets);
    const screenshotRisk = risks.find((r) => r.id === "app_store_screenshots");
    expect(screenshotRisk).toBeDefined();
    expect(screenshotRisk!.severity).toBe("high");
    expect(screenshotRisk!.label).toBe("App Store metadata missing screenshots");
  });

  it("does NOT surface screenshot risk when stage is 'building' (only store_prep + ready_to_submit)", () => {
    const mission = baseMission({ stage: "building" });
    const assets: Asset[] = [emailFlightReady()]; // no images
    const risks = deriveRisks(mission, [], assets);
    expect(risks.find((r) => r.id === "app_store_screenshots")).toBeUndefined();
  });

  it("surfaces screenshot risk for ready_to_submit stage too", () => {
    const mission = baseMission({ stage: "ready_to_submit" });
    const assets: Asset[] = [emailFlightReady()];
    const risks = deriveRisks(mission, [], assets);
    expect(risks.find((r) => r.id === "app_store_screenshots")).toBeDefined();
  });

  it("an 'exported' image also satisfies the screenshot check (isReady covers exported)", () => {
    const mission = baseMission({ stage: "store_prep" });
    const assets: Asset[] = [
      emailFlightReady(),
      { id: "a_img", type: "image", title: "Screenshot", status: "exported", category: "app_store", updatedAt: Date.now() },
    ];
    const risks = deriveRisks(mission, [], assets);
    expect(risks.find((r) => r.id === "app_store_screenshots")).toBeUndefined();
  });
});

// ── Store copy risk (med) ────────────────────────────────────────────────────

describe("deriveRisks — store copy in prep during store_prep", () => {
  it("surfaces a 'med' store_copy risk when copy exists but is not ready", () => {
    const mission = baseMission({ stage: "store_prep" });
    const assets: Asset[] = [
      emailFlightReady(),
      { id: "a_img", type: "image", title: "Screenshot", status: "flight_ready", category: "app_store", updatedAt: Date.now() },
      { id: "a_copy", type: "app_store_copy", title: "Store Description", status: "in_prep", category: "app_store", updatedAt: Date.now() },
    ];
    const risks = deriveRisks(mission, [], assets);
    const copyRisk = risks.find((r) => r.id === "store_copy");
    expect(copyRisk).toBeDefined();
    expect(copyRisk!.severity).toBe("med");
    expect(copyRisk!.label).toBe("Store description still in prep");
  });

  it("does NOT fire store_copy risk when no store copy asset exists at all", () => {
    const mission = baseMission({ stage: "store_prep" });
    const assets: Asset[] = [emailFlightReady()];
    const risks = deriveRisks(mission, [], assets);
    expect(risks.find((r) => r.id === "store_copy")).toBeUndefined();
  });
});

// ── Launch readiness risk (high) ─────────────────────────────────────────────

describe("deriveRisks — launch readiness when deadline is close", () => {
  it("surfaces a 'high' launch_readiness risk when launch is within 7 days and readiness < 70%", () => {
    const now = Date.now();
    const mission = baseMission({
      launchDate: now + 3 * DAY,
      readinessScore: 50,
    });
    const assets: Asset[] = [emailFlightReady()];
    const risks = deriveRisks(mission, [], assets);
    const readinessRisk = risks.find((r) => r.id === "launch_readiness");
    expect(readinessRisk).toBeDefined();
    expect(readinessRisk!.severity).toBe("high");
    // Label contains both the days count and the readiness percentage
    expect(readinessRisk!.label).toMatch(/readiness at 50%/);
    expect(readinessRisk!.label).toMatch(/Launch in \d+d/);
  });

  it("does NOT fire readiness risk when launch is > 7 days away", () => {
    const now = Date.now();
    const mission = baseMission({
      launchDate: now + 10 * DAY,
      readinessScore: 30,
    });
    const assets: Asset[] = [emailFlightReady()];
    const risks = deriveRisks(mission, [], assets);
    expect(risks.find((r) => r.id === "launch_readiness")).toBeUndefined();
  });

  it("does NOT fire readiness risk when readiness >= 70% even with close launch", () => {
    const now = Date.now();
    const mission = baseMission({
      launchDate: now + 2 * DAY,
      readinessScore: 70,
    });
    const assets: Asset[] = [emailFlightReady()];
    const risks = deriveRisks(mission, [], assets);
    expect(risks.find((r) => r.id === "launch_readiness")).toBeUndefined();
  });
});

// ── Ordering: high before med ────────────────────────────────────────────────

describe("deriveRisks — ordering", () => {
  it("returns high-severity risks before med-severity risks", () => {
    const now = Date.now();
    const mission = baseMission({
      stage: "store_prep",
      launchDate: now + 3 * DAY,
      readinessScore: 40,
    });
    // No email (med), no screenshots (high), launch close + low readiness (high)
    const assets: Asset[] = [];
    const risks = deriveRisks(mission, [], assets);

    expect(risks.length).toBeGreaterThan(0);
    // All high risks appear before any med risk
    let seenMed = false;
    for (const risk of risks) {
      if (risk.severity === "med") seenMed = true;
      if (seenMed) {
        expect(risk.severity).toBe("med");
      }
    }
  });
});

// ── riskActionLabel ──────────────────────────────────────────────────────────

describe("riskActionLabel", () => {
  it("returns 'Open Cargo Bay →' for cargo routes", () => {
    expect(riskActionLabel("/(modals)/cargo")).toBe("Open Cargo Bay →");
  });

  it("returns 'Review Mission Plan →' for mission routes", () => {
    expect(riskActionLabel("/(tabs)/missions")).toBe("Review Mission Plan →");
  });

  it("returns 'Open Blueprints →' for blueprint routes", () => {
    expect(riskActionLabel("/(tabs)/blueprints")).toBe("Open Blueprints →");
  });

  it("returns 'Resolve Now →' for unrecognised routes", () => {
    expect(riskActionLabel("/(tabs)/foundry")).toBe("Resolve Now →");
  });
});
