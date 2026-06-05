import { render, screen, fireEvent, waitFor } from "@testing-library/react-native";
import { Share } from "react-native";
import * as Clipboard from "expo-clipboard";
import type { Asset } from "@/types";

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
jest.mock("expo-clipboard", () => ({ setStringAsync: jest.fn(async () => true) }));

import { AssetDetail } from "./AssetDetail";

function asset(overrides: Partial<Asset> = {}): Asset {
  return {
    id: "a",
    type: "social_blast",
    title: "Launch tweet",
    status: "flight_ready",
    category: "social",
    content: "Big news!",
    updatedAt: 0,
    ...overrides,
  };
}

beforeEach(() => jest.clearAllMocks());

it("renders content and shares/copies it", () => {
  const shareSpy = jest
    .spyOn(Share, "share")
    .mockResolvedValue({ action: "sharedAction" } as never);
  render(<AssetDetail asset={asset()} onBack={jest.fn()} />);
  expect(screen.getByText("Big news!")).toBeTruthy();

  fireEvent.press(screen.getByText("Share"));
  expect(shareSpy).toHaveBeenCalledWith({ message: "Big news!", title: "Launch tweet" });

  fireEvent.press(screen.getByText("Copy"));
  expect(Clipboard.setStringAsync).toHaveBeenCalledWith("Big news!");
});

it("shows a not-found state and Back fires onBack", () => {
  const onBack = jest.fn();
  render(<AssetDetail asset={undefined} onBack={onBack} />);
  expect(screen.getByText("Asset not found")).toBeTruthy();
  fireEvent.press(screen.getByText("Back to Cargo Bay"));
  expect(onBack).toHaveBeenCalled();
});

it("disables export when there is no content", () => {
  const shareSpy = jest.spyOn(Share, "share");
  render(<AssetDetail asset={asset({ content: "" })} onBack={jest.fn()} />);
  expect(screen.getByText(/No content yet/)).toBeTruthy();
  fireEvent.press(screen.getByText("Share"));
  expect(shareSpy).not.toHaveBeenCalled();
});

// ---------------------------------------------------------------------------
// Copy: label transition (gap — not covered by the combined share/copy test)
// ---------------------------------------------------------------------------

it('Copy button label changes to "Copied ✓" after a successful copy', async () => {
  render(<AssetDetail asset={asset()} onBack={jest.fn()} />);

  expect(screen.getByText("Copy")).toBeTruthy();

  // fireEvent is synchronous; waitFor lets the async setState flush.
  fireEvent.press(screen.getByText("Copy"));
  await waitFor(() => {
    expect(screen.getByText("Copied ✓")).toBeTruthy();
  });
});

// ---------------------------------------------------------------------------
// Signal-linked asset rendering
// NOTE: AssetDetail is a read-only display component — it shows title, category
// meta, status label, and content. It does NOT render a dedicated signal-link
// banner; signalId/signalLabel/signalPhase are Signal Deck concerns. These tests
// confirm that a signal-linked asset renders the core fields without crashing.
//
// Mark-flight-ready is NOT a button in AssetDetail (it is purely read-only).
// Status-update behaviour is covered in src/store/mission.assets.test.ts.
// ---------------------------------------------------------------------------

it("renders a signal-linked asset title and flight-ready status without crashing", () => {
  render(
    <AssetDetail
      asset={asset({
        title: "Waitlist email teaser",
        status: "flight_ready",
        signalId: "pre_4",
        signalLabel: "Waitlist email teaser",
        signalPhase: "pre_launch",
      })}
      onBack={jest.fn()}
    />,
  );

  expect(screen.getByText("Waitlist email teaser")).toBeTruthy();
  // STATUS_LABEL["flight_ready"] = "Flight ready"
  expect(screen.getByText(/Flight ready/)).toBeTruthy();
});

it("renders a launch-day signal-linked asset without a crash", () => {
  render(
    <AssetDetail
      asset={asset({
        title: "X/Twitter launch thread",
        status: "flight_ready",
        signalId: "day_3",
        signalLabel: "X/Twitter launch thread",
        signalPhase: "launch_day",
        content: "We just shipped 🚀",
      })}
      onBack={jest.fn()}
    />,
  );

  expect(screen.getByText("X/Twitter launch thread")).toBeTruthy();
  expect(screen.getByText("We just shipped 🚀")).toBeTruthy();
});
