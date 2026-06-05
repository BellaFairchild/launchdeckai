/**
 * Cargo Bay modal — empty-state tests.
 *
 * When assets.length === 0 the modal renders:
 *   title: "No assets yet"
 *   message: "Forge your first asset in the Foundry."
 *   CTA label: "Open Foundry"
 *   CTA route: "/(tabs)/foundry"
 */
import { render, screen, fireEvent } from "@testing-library/react-native";
import { useMissionStore } from "@/store/mission";

const mockPush = jest.fn();

// ── expo-router ──────────────────────────────────────────────────────────────
jest.mock("expo-router", () => ({ useRouter: () => ({ push: mockPush }) }));

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
  return { GradientView: (props: any) => <View testID="gradient" {...props} /> };
});

// ── Icon (uses react-native-svg) ─────────────────────────────────────────────
jest.mock("@/components/ui/Icon", () => {
  const { Text } = require("react-native");
  return { Icon: (props: any) => <Text testID={`icon-${props.name}`} /> };
});

// ── CategoryGrid (complex child, not under test here) ────────────────────────
jest.mock("@/components/cargo/CategoryGrid", () => {
  const { View, Text } = require("react-native");
  return {
    CategoryGrid: () => (
      <View testID="category-grid">
        <Text>CategoryGrid</Text>
      </View>
    ),
  };
});

// ── cargoBundle (used only in the non-empty Export path) ─────────────────────
jest.mock("@/lib/cargoBundle", () => ({
  buildCargoBundle: jest.fn(() => ({ ids: [], doc: "" })),
}));

import CargoModal from "./cargo";

beforeEach(() => {
  jest.clearAllMocks();
  useMissionStore.setState({ convex: null, assets: [] });
});

// ---------------------------------------------------------------------------
// Empty state
// ---------------------------------------------------------------------------

it("shows the empty-state title when there are no assets", () => {
  render(<CargoModal />);
  expect(screen.getByText("No assets yet")).toBeTruthy();
});

it("shows the empty-state message when there are no assets", () => {
  render(<CargoModal />);
  expect(screen.getByText("Forge your first asset in the Foundry.")).toBeTruthy();
});

it('shows the "Open Foundry" CTA when there are no assets', () => {
  render(<CargoModal />);
  expect(screen.getByText("Open Foundry")).toBeTruthy();
});

it('pressing "Open Foundry" routes to /(tabs)/foundry', () => {
  render(<CargoModal />);
  fireEvent.press(screen.getByText("Open Foundry"));
  expect(mockPush).toHaveBeenCalledWith("/(tabs)/foundry");
});

it("does NOT render the CategoryGrid when there are no assets", () => {
  render(<CargoModal />);
  expect(screen.queryByTestId("category-grid")).toBeNull();
});

// ---------------------------------------------------------------------------
// Non-empty state (smoke-test: grid renders, empty-state absent)
// ---------------------------------------------------------------------------

it("renders the CategoryGrid (not the empty state) when assets exist", () => {
  useMissionStore.setState({
    convex: null,
    assets: [
      {
        id: "a_1",
        type: "social_blast",
        title: "Tweet",
        status: "in_prep",
        category: "social",
        updatedAt: 0,
      },
    ],
  });

  render(<CargoModal />);

  expect(screen.queryByText("No assets yet")).toBeNull();
  expect(screen.getByTestId("category-grid")).toBeTruthy();
});
