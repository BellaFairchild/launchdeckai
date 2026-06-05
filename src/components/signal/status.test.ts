/**
 * Pure unit tests for signalStatus(signalId, assets).
 *
 * Rules (from status.ts + Docs/07):
 *   no linked asset            → "not_loaded"
 *   linked, status in_prep     → "in_prep"
 *   linked, status flight_ready→ "flight_ready"
 *   linked, status exported    → "flight_ready"
 *
 * Real signal ids: pre_1..pre_6, day_1..day_6, post_1..post_4
 */
import { signalStatus } from "./status";
import type { Asset } from "@/types";

function base(over: Partial<Asset>): Asset {
  return {
    id: "a",
    type: "signal_asset",
    title: "t",
    status: "in_prep",
    category: "social",
    updatedAt: 0,
    ...over,
  };
}

// ── not_loaded ────────────────────────────────────────────────────────────────

it("returns not_loaded when assets array is empty", () => {
  expect(signalStatus("pre_1", [])).toBe("not_loaded");
});

it("returns not_loaded when no asset links to the given signalId", () => {
  // pre_2 is linked, pre_1 is not
  const assets = [base({ id: "a1", signalId: "pre_2", status: "flight_ready" })];
  expect(signalStatus("pre_1", assets)).toBe("not_loaded");
});

it("returns not_loaded for a launch-day signal when only a pre-launch asset exists", () => {
  const assets = [base({ id: "a1", signalId: "pre_1", status: "flight_ready" })];
  expect(signalStatus("day_1", assets)).toBe("not_loaded");
});

// ── in_prep ───────────────────────────────────────────────────────────────────

it("returns in_prep when the linked asset has status in_prep", () => {
  const assets = [base({ id: "a1", signalId: "pre_1", status: "in_prep" })];
  expect(signalStatus("pre_1", assets)).toBe("in_prep");
});

it("returns in_prep for a post-launch signal (post_4) with a draft asset", () => {
  const assets = [base({ id: "a1", signalId: "post_4", status: "in_prep" })];
  expect(signalStatus("post_4", assets)).toBe("in_prep");
});

it("returns in_prep when the linked asset has status needs_clearance", () => {
  // needs_clearance is not flight_ready or exported → falls through to in_prep
  const assets = [base({ id: "a1", signalId: "day_3", status: "needs_clearance" })];
  expect(signalStatus("day_3", assets)).toBe("in_prep");
});

// ── flight_ready ──────────────────────────────────────────────────────────────

it("returns flight_ready when the linked asset has status flight_ready", () => {
  const assets = [base({ id: "a1", signalId: "pre_1", status: "flight_ready" })];
  expect(signalStatus("pre_1", assets)).toBe("flight_ready");
});

it("returns flight_ready when the linked asset has status exported", () => {
  const assets = [base({ id: "a1", signalId: "day_3", status: "exported" })];
  expect(signalStatus("day_3", assets)).toBe("flight_ready");
});

it("returns flight_ready for the last signal (post_4) when its asset is exported", () => {
  const assets = [base({ id: "a1", signalId: "post_4", status: "exported" })];
  expect(signalStatus("post_4", assets)).toBe("flight_ready");
});

// ── isolation: other signals don't bleed in ──────────────────────────────────

it("ignores an asset linked to a different signal", () => {
  // pre_2 is flight_ready but we're asking about pre_1
  const assets = [base({ id: "a1", signalId: "pre_2", status: "flight_ready" })];
  expect(signalStatus("pre_1", assets)).toBe("not_loaded");
});

it("uses the first matching asset when multiple assets exist for different signals", () => {
  const assets = [
    base({ id: "a1", signalId: "day_1", status: "in_prep" }),
    base({ id: "a2", signalId: "day_2", status: "flight_ready" }),
    base({ id: "a3", signalId: "pre_6", status: "in_prep" }),
  ];
  expect(signalStatus("day_1", assets)).toBe("in_prep");
  expect(signalStatus("day_2", assets)).toBe("flight_ready");
  expect(signalStatus("pre_6", assets)).toBe("in_prep");
  // unlinked signal
  expect(signalStatus("post_1", assets)).toBe("not_loaded");
});
