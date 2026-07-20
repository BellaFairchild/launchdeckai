/**
 * Pure unit tests for launch.ts helpers.
 * Covers: tMinus shape/labels, formatLaunchDate fallback, readinessLabel ranges.
 */

import {
  tMinus,
  formatLaunchDate,
  readinessLabel,
  launchCountdownParts,
  isLaunchEve,
} from "./launch";

const DAY = 86_400_000;
const HOUR = 3_600_000;

// ── tMinus ─────────────────────────────────────────────────────────────────

describe("tMinus", () => {
  it("returns label 'Set a date' and hasDate=false with no launch date", () => {
    const result = tMinus(undefined);
    expect(result.hasDate).toBe(false);
    expect(result.days).toBe(0);
    expect(result.label).toBe("Set a date");
  });

  it("counts T-5 whole days to launch", () => {
    const now = Date.now();
    const result = tMinus(now + 5 * DAY, now);
    expect(result.hasDate).toBe(true);
    expect(result.days).toBe(5);
    expect(result.label).toBe("T-5");
  });

  it("counts T-14 days to launch (Docs §11: T-Minus countdown correct)", () => {
    const now = Date.now();
    const result = tMinus(now + 14 * DAY, now);
    expect(result.label).toBe("T-14");
    expect(result.days).toBe(14);
  });

  it("returns T-0 on launch day (0 days remaining)", () => {
    const now = Date.now();
    // Exactly now → Math.ceil(0 / DAY) = 0
    const result = tMinus(now, now);
    expect(result.hasDate).toBe(true);
    expect(result.days).toBe(0);
    expect(result.label).toBe("T-0");
  });

  it("returns label 'Launched' and negative days after launch date has passed", () => {
    const now = Date.now();
    const result = tMinus(now - DAY, now);
    expect(result.hasDate).toBe(true);
    expect(result.days).toBeLessThan(0);
    expect(result.label).toBe("Launched");
  });

  it("uses Math.ceil — a partial day counts as a full day", () => {
    const now = Date.now();
    // 4.5 days → Math.ceil(4.5) = 5
    const result = tMinus(now + 4.5 * DAY, now);
    expect(result.days).toBe(5);
    expect(result.label).toBe("T-5");
  });
});

// ── formatLaunchDate ────────────────────────────────────────────────────────

describe("formatLaunchDate", () => {
  it("returns 'No date set' when called with undefined", () => {
    expect(formatLaunchDate(undefined)).toBe("No date set");
  });

  it("returns a non-empty locale string when a timestamp is given", () => {
    const jan1 = new Date(2026, 0, 1).getTime(); // 1 Jan 2026
    const result = formatLaunchDate(jan1);
    // The exact string is locale-dependent — but it must be non-empty and
    // contain "2026" and a numeric day, confirming real formatting occurred.
    expect(result).toBeTruthy();
    expect(result).toContain("2026");
    expect(result).not.toBe("No date set");
  });
});

// ── readinessLabel ──────────────────────────────────────────────────────────

describe("readinessLabel", () => {
  it("labels 0% as 'Just getting started'", () => {
    expect(readinessLabel(0)).toBe("Just getting started");
  });

  it("labels 29% as 'Just getting started'", () => {
    expect(readinessLabel(29)).toBe("Just getting started");
  });

  it("labels 30% as 'Getting organized'", () => {
    expect(readinessLabel(30)).toBe("Getting organized");
  });

  it("labels 59% as 'Getting organized'", () => {
    expect(readinessLabel(59)).toBe("Getting organized");
  });

  it("labels 60% as 'Building momentum'", () => {
    expect(readinessLabel(60)).toBe("Building momentum");
  });

  it("labels 89% as 'Building momentum'", () => {
    expect(readinessLabel(89)).toBe("Building momentum");
  });

  it("labels 90% as 'Launch ready!'", () => {
    expect(readinessLabel(90)).toBe("Launch ready!");
  });

  it("labels 100% as 'Launch ready!'", () => {
    expect(readinessLabel(100)).toBe("Launch ready!");
  });
});

// ── launchCountdownParts ────────────────────────────────────────────────────

describe("launchCountdownParts", () => {
  it("returns hasDate=false with all zeros when no date provided", () => {
    const parts = launchCountdownParts(undefined);
    expect(parts.hasDate).toBe(false);
    expect(parts.launched).toBe(false);
    expect(parts.days).toBe(0);
    expect(parts.hours).toBe(0);
    expect(parts.minutes).toBe(0);
    expect(parts.seconds).toBe(0);
  });

  it("returns launched=true when launch date is in the past", () => {
    const now = Date.now();
    const parts = launchCountdownParts(now - DAY, now);
    expect(parts.hasDate).toBe(true);
    expect(parts.launched).toBe(true);
  });

  it("decomposes a future timestamp into days/hours/minutes/seconds", () => {
    const now = 0;
    const future = 2 * DAY + 3 * HOUR + 4 * 60_000 + 5_000;
    const parts = launchCountdownParts(future, now);
    expect(parts.hasDate).toBe(true);
    expect(parts.launched).toBe(false);
    expect(parts.days).toBe(2);
    expect(parts.hours).toBe(3);
    expect(parts.minutes).toBe(4);
    expect(parts.seconds).toBe(5);
  });
});

// ── isLaunchEve ─────────────────────────────────────────────────────────────

describe("isLaunchEve", () => {
  it("returns false when no launch date", () => {
    expect(isLaunchEve(undefined)).toBe(false);
  });

  it("returns true when launch is 24h away (within 48h window)", () => {
    const now = Date.now();
    expect(isLaunchEve(now + 24 * HOUR, now)).toBe(true);
  });

  it("returns false when launch is more than 48h away", () => {
    const now = Date.now();
    expect(isLaunchEve(now + 72 * HOUR, now)).toBe(false);
  });

  it("returns false after launch (past date)", () => {
    const now = Date.now();
    expect(isLaunchEve(now - HOUR, now)).toBe(false);
  });
});
