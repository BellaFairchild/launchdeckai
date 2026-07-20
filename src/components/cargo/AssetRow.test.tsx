/**
 * Render-level tests for AssetRow.
 *
 * AssetRow is a pure presentational component that accepts:
 *   - asset       — the Asset record to display
 *   - onOpen      — called when the card body is pressed
 *   - onMarkReady — called when the "Mark flight-ready" button is pressed
 *
 * These tests cover:
 *   1. "Mark flight-ready" button press fires onMarkReady
 *   2. Button is absent when the asset is already flight_ready or exported
 *   3. Linked-signal badge renders as "📡 <signalLabel>" when set, absent when unset
 */
import React from "react";
import { render, screen, fireEvent } from "@testing-library/react-native";
import type { Asset } from "@/types";

// ── @/tw (react-native-css pass-through) ─────────────────────────────────────
jest.mock("@/tw", () => {
  const RN = require("react-native");
  return {
    View: RN.View,
    Text: RN.Text,
    Pressable: RN.Pressable,
    ScrollView: RN.ScrollView,
    TextInput: RN.TextInput,
    useCSSVariable: () => "",
  };
});

// ── GradientView (uses react-native-svg, not available in Jest) ───────────────
jest.mock("@/components/ui/GradientView", () => {
  const { View } = require("react-native");
  return { GradientView: (props: any) => <View testID="gradient" /> };
});

// ── Icon (uses react-native-svg) ─────────────────────────────────────────────
jest.mock("@/components/ui/Icon", () => {
  const { Text } = require("react-native");
  return { Icon: (props: any) => <Text testID={`icon-${props.name}`} /> };
});

import { AssetRow } from "./AssetRow";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function makeAsset(overrides: Partial<Asset> = {}): Asset {
  return {
    id: "asset_1",
    type: "social_blast",
    title: "Launch tweet",
    status: "in_prep",
    category: "social",
    updatedAt: 0,
    ...overrides,
  };
}

beforeEach(() => jest.clearAllMocks());

// ---------------------------------------------------------------------------
// 1. "Mark flight-ready" button — press fires onMarkReady
// ---------------------------------------------------------------------------

it('pressing "Mark flight-ready" calls onMarkReady', () => {
  const onMarkReady = jest.fn();
  render(
    <AssetRow
      asset={makeAsset({ status: "in_prep" })}
      onOpen={jest.fn()}
      onMarkReady={onMarkReady}
    />,
  );

  fireEvent.press(screen.getByRole("button", { name: "Mark flight-ready" }));
  expect(onMarkReady).toHaveBeenCalledTimes(1);
});

it('also shows "Mark flight-ready" for needs_clearance status', () => {
  const onMarkReady = jest.fn();
  render(
    <AssetRow
      asset={makeAsset({ status: "needs_clearance" })}
      onOpen={jest.fn()}
      onMarkReady={onMarkReady}
    />,
  );

  fireEvent.press(screen.getByRole("button", { name: "Mark flight-ready" }));
  expect(onMarkReady).toHaveBeenCalledTimes(1);
});

// ---------------------------------------------------------------------------
// 2. Button absent when asset is already ready
// ---------------------------------------------------------------------------

it('does NOT show "Mark flight-ready" when status is flight_ready', () => {
  render(
    <AssetRow
      asset={makeAsset({ status: "flight_ready" })}
      onOpen={jest.fn()}
      onMarkReady={jest.fn()}
    />,
  );

  expect(screen.queryByRole("button", { name: "Mark flight-ready" })).toBeNull();
});

it('does NOT show "Mark flight-ready" when status is exported', () => {
  render(
    <AssetRow
      asset={makeAsset({ status: "exported" })}
      onOpen={jest.fn()}
      onMarkReady={jest.fn()}
    />,
  );

  expect(screen.queryByRole("button", { name: "Mark flight-ready" })).toBeNull();
});

// ---------------------------------------------------------------------------
// 3. Linked-signal badge
// ---------------------------------------------------------------------------

it('renders "📡 <signalLabel>" badge when signalLabel is set', () => {
  render(
    <AssetRow
      asset={makeAsset({ signalLabel: "Waitlist email teaser" })}
      onOpen={jest.fn()}
      onMarkReady={jest.fn()}
    />,
  );

  expect(screen.getByText("📡 Waitlist email teaser")).toBeTruthy();
});

it("does NOT render the signal badge when signalLabel is absent", () => {
  render(
    <AssetRow
      asset={makeAsset({ signalLabel: undefined })}
      onOpen={jest.fn()}
      onMarkReady={jest.fn()}
    />,
  );

  // No "📡" text anywhere in the tree
  expect(screen.queryByText(/📡/)).toBeNull();
});
