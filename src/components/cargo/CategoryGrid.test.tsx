import { render, screen, fireEvent } from "@testing-library/react-native";
import type { Asset } from "@/types";

const mockPush = jest.fn();

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
jest.mock("expo-router", () => ({ useRouter: () => ({ push: mockPush }) }));

import { CategoryGrid } from "./CategoryGrid";

function asset(id: string, category: Asset["category"], title: string): Asset {
  return { id, type: "social_blast", title, status: "in_prep", category, updatedAt: 0 };
}

beforeEach(() => jest.clearAllMocks());

it("renders one card per non-empty category with counts, hiding empties", () => {
  render(
    <CategoryGrid
      assets={[
        asset("a", "social", "A"),
        asset("b", "social", "B"),
        asset("c", "app_store", "C"),
      ]}
    />,
  );
  expect(screen.getByRole("button", { name: "App Store, 1 asset" })).toBeTruthy();
  expect(screen.getByRole("button", { name: "Social, 2 assets" })).toBeTruthy();
  expect(screen.queryByRole("button", { name: /Media/ })).toBeNull();
});

it("expands a category to its rows and opens the detail route on row press", () => {
  render(<CategoryGrid assets={[asset("a", "social", "Tweet thread")]} />);
  // collapsed — the row title is hidden
  expect(screen.queryByText("Tweet thread")).toBeNull();

  fireEvent.press(screen.getByRole("button", { name: "Social, 1 asset" }));
  expect(screen.getByText("Tweet thread")).toBeTruthy();

  fireEvent.press(screen.getByRole("button", { name: "Open Tweet thread" }));
  expect(mockPush).toHaveBeenCalledWith("/(modals)/cargo-asset/a");
});
