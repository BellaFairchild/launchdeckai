import { render, screen, fireEvent } from "@testing-library/react-native";
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
