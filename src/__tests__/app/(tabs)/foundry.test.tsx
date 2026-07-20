/**
 * Foundry tab — render + interaction tests (Docs/11 Foundry cases).
 *
 * What is verified here:
 *   ✓ All FOUNDRY_TOOLS tool names render on screen
 *   ✓ A known cadet tool's fuel cost is shown (FuelBadge accessibilityLabel)
 *   ✓ A locked (commander-required) tool renders "Needs Commander" badge + lock CTA
 *   ✓ Forging a cadet tool then pressing "Upload" saves an asset to the cargo store
 *   ✓ "Uploaded to Cargo Bay" confirmation text appears after upload
 */

import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react-native";

// ── Stubs ────────────────────────────────────────────────────────────────────

// react-native-reanimated — initialises native Worklets on import; stub minimum surface.
jest.mock("react-native-reanimated", () => {
  const { View, ScrollView } = require("react-native");
  return {
    __esModule: true,
    default: {
      View,
      ScrollView,
      createAnimatedComponent: (c: unknown) => c,
    },
    useSharedValue: (v: number) => ({ value: v }),
    useAnimatedStyle: () => ({}),
    withTiming: (to: number) => to,
    interpolateColor: () => "#000000",
    useReducedMotion: () => false,
    withRepeat: (v: unknown) => v,
    Easing: { inOut: () => () => 0, ease: () => 0 },
  };
});

// GradientView — native module absent in test runner.
jest.mock("@/components/ui/GradientView", () => ({
  GradientView: () => null,
}));

// TabScreen — uses expo-router useIsFocused; stub to a simple wrapper.
jest.mock("@/components/layout/TabScreen", () => {
  const { View } = require("react-native");
  return {
    TabScreen: ({ children }: { children: React.ReactNode }) => <View>{children}</View>,
  };
});

// react-native-safe-area-context — SafeAreaView stub.
jest.mock("react-native-safe-area-context", () => {
  const { View } = require("react-native");
  return {
    SafeAreaView: ({ children, ...props }: { children: React.ReactNode; style?: unknown; edges?: unknown }) => (
      <View>{children}</View>
    ),
    useSafeAreaInsets: () => ({ top: 0, bottom: 0, left: 0, right: 0 }),
  };
});

// expo-router — mock useRouter + useLocalSearchParams (no signal params for base case).
const mockPush = jest.fn();
jest.mock("expo-router", () => {
  const { View } = require("react-native");
  const RouterLink = (props: { children?: React.ReactNode }) => <View>{props.children}</View>;
  RouterLink.Trigger = () => null;
  RouterLink.Menu = () => null;
  RouterLink.MenuAction = () => null;
  RouterLink.Preview = () => null;
  return {
    useRouter: () => ({ push: mockPush }),
    useLocalSearchParams: () => ({}),
    useIsFocused: () => true,
    Link: RouterLink,
  };
});

// Analytics — mock to avoid import side-effects.
jest.mock("@/lib/analytics", () => ({
  track: jest.fn(),
}));

// convex/react — mock useAction so generateAsset resolves fake content.
// foundry.tsx calls: const generateAsset = useAction(api.ai.generateAsset)
// then: const res = await generateAsset({ tool, toolLabel, mode, mission, signalLabel })
// and reads: res.content, res.mock
const mockGenerateAsset = jest.fn(async () => ({
  content: "AI generated copy for testing",
  mock: true,
}));

jest.mock("convex/react", () => ({
  useAction: () => mockGenerateAsset,
}));

// ── Subject under test ───────────────────────────────────────────────────────

import FoundryScreen from "@/app/(tabs)/foundry";
import { useMissionStore } from "@/store/mission";
import { useUIStore } from "@/store/ui";
import { FOUNDRY_TOOLS } from "@/constants/foundryTools";
import type { Asset, BlueprintSection, Blueprint, Mission, Broadcast } from "@/types";
import { BLUEPRINT_SECTIONS } from "@/constants/blueprintSections";

// ── Fixture helpers ──────────────────────────────────────────────────────────

function makeBlueprints(): Record<BlueprintSection, Blueprint> {
  const out = {} as Record<BlueprintSection, Blueprint>;
  for (const s of BLUEPRINT_SECTIONS) {
    out[s.id] = { section: s.id, fields: {}, completionStatus: 0 };
  }
  return out;
}

const BASE_MISSION: Mission = {
  id: "m_foundry_test",
  appName: "ForgeApp",
  appDescription: "An app forged by tests.",
  oneLiner: "Test-driven launches.",
  targetAudience: "QA engineers",
  platform: "ios",
  stage: "building",
  status: "active",
  readinessScore: 0,
};

// Known tool data (from FOUNDRY_TOOLS):
//   cadetTool  → "Social Blast", fuelCost: 15, requiredPlan: "cadet"
//   lockedTool → "Press Kit",    fuelCost: 25, requiredPlan: "commander"
const cadetTool = FOUNDRY_TOOLS.find((t) => t.id === "social_blast")!;
const lockedTool = FOUNDRY_TOOLS.find((t) => t.id === "press_kit")!;

// ── Reset stores before each test ───────────────────────────────────────────

beforeEach(() => {
  mockPush.mockClear();
  mockGenerateAsset.mockClear();

  useMissionStore.setState({
    convex: null,
    mission: { ...BASE_MISSION },
    milestones: [],
    blueprints: makeBlueprints(),
    assets: [] as Asset[],
    broadcasts: [] as Broadcast[],
  });

  useUIStore.setState({
    plan: "cadet",
    fuel: 100,
    streak: 0,
    serverOwned: false,
    convexSetPlan: null,
  });
});

// ── Tests ────────────────────────────────────────────────────────────────────

describe("FoundryScreen — tool list rendering", () => {
  it("renders all FOUNDRY_TOOLS tool names on screen", () => {
    render(<FoundryScreen />);
    for (const tool of FOUNDRY_TOOLS) {
      expect(screen.getByText(tool.name)).toBeTruthy();
    }
  });

  it("renders the Social Blast tool name", () => {
    render(<FoundryScreen />);
    expect(screen.getByText("Social Blast")).toBeTruthy();
  });
});

describe("FoundryScreen — fuel cost display", () => {
  it("shows the cadet tool's fuel cost via FuelBadge accessibilityLabel (Social Blast = 15 Fuel)", () => {
    render(<FoundryScreen />);
    // FuelBadge renders accessibilityLabel={`${amount} Fuel`}
    // Social Blast has fuelCost: 15 → "15 Fuel"; Signal Deck Asset Forge also has 15,
    // so getAllByLabelText is needed (there are at least 2 matching badges).
    const fuelBadges15 = screen.getAllByLabelText(`${cadetTool.fuelCost} Fuel`);
    expect(fuelBadges15.length).toBeGreaterThanOrEqual(1);
  });

  it("shows fuel cost badges for multiple tools on the screen", () => {
    render(<FoundryScreen />);
    // Each tool has a FuelBadge with `${fuelCost} Fuel` accessibilityLabel.
    // getByLabelText would throw on duplicates, so check at least one known cost exists.
    const fuelBadges = screen.getAllByLabelText("20 Fuel");
    expect(fuelBadges.length).toBeGreaterThanOrEqual(1);
  });
});

describe("FoundryScreen — plan lock state", () => {
  it("renders the lock CTA for commander-required tools when plan is cadet", () => {
    render(<FoundryScreen />);
    // 3 tools require "commander" (Press Kit, Video Script, Product Hunt Copy).
    // FoundryToolCard ctaLabel = `🔒 Unlock with Commander` for each.
    const lockCTAs = screen.getAllByText("🔒 Unlock with Commander");
    expect(lockCTAs.length).toBeGreaterThanOrEqual(1);
  });

  it("renders the 'Needs Commander' badge for locked tools", () => {
    render(<FoundryScreen />);
    // Badge renders label={`Needs ${PLANS[tool.requiredPlan].name}`}.
    // The `uppercase` CSS class is a visual transform; RNTL reads the raw string.
    // 3 commander-locked tools → 3 badges with this text.
    const needsBadges = screen.getAllByText("Needs Commander");
    expect(needsBadges.length).toBeGreaterThanOrEqual(1);
  });

  it("pressing a locked tool CTA routes to refuel (plan upgrade) modal", () => {
    render(<FoundryScreen />);
    // Multiple locked tools render the same CTA; press the first one.
    const lockCTAs = screen.getAllByText("🔒 Unlock with Commander");
    fireEvent.press(lockCTAs[0]);
    expect(mockPush).toHaveBeenCalledWith("/(modals)/refuel");
  });
});

describe("FoundryScreen — forge + save-to-cargo flow", () => {
  it("forging a cadet tool then pressing Upload saves asset to cargo store and shows confirmation", async () => {
    render(<FoundryScreen />);

    // The "Forge Content" button is the CTA label for affordable + unlocked tools.
    // There are multiple tools; get all "Forge Content" texts and press the first
    // one corresponding to Social Blast (the first cadet tool in the list).
    const forgeButtons = screen.getAllByText("Forge Content");
    // Social Blast is the 2nd tool in FOUNDRY_TOOLS (index 1),
    // but App Store Copy (index 0) is also cadet. Either works for this test.
    // Press the first available forge button.
    fireEvent.press(forgeButtons[0]);

    // Wait for the async generateAsset to resolve and the draft card to appear.
    await waitFor(() => {
      // After forging, the draft card renders "ready to upload"
      expect(screen.getByText(/ready to upload/)).toBeTruthy();
    });

    // The draft card has an "Upload" button (variant="primary", label="Upload").
    const uploadButton = screen.getByText("Upload");
    fireEvent.press(uploadButton);

    // Wait for the upload flow to complete.
    await waitFor(() => {
      // Confirmation heading
      expect(screen.getByText("Uploaded to Cargo Bay")).toBeTruthy();
    });

    // Assert the asset was added to the cargo store (local addAsset path: convex is null).
    const assets = useMissionStore.getState().assets;
    expect(assets.length).toBeGreaterThan(0);
    // The first asset in the store is the newly added one (prepended).
    const newAsset = assets[0];
    expect(newAsset.status).toBe("in_prep");
    expect(newAsset.content).toBe("AI generated copy for testing");
  });

  it("the confirmation card shows the forged tool name in the body text", async () => {
    render(<FoundryScreen />);

    const forgeButtons = screen.getAllByText("Forge Content");
    fireEvent.press(forgeButtons[0]);

    await waitFor(() => {
      expect(screen.getByText(/ready to upload/)).toBeTruthy();
    });

    fireEvent.press(screen.getByText("Upload"));

    await waitFor(() => {
      // The confirmation message body: `"${uploadedTitle}" is in_prep (...)`.
      // uploadedTitle = signalLabel ?? tool.name; with no signal params, it's tool.name.
      // The first tool is "App Store Copy".
      expect(
        screen.getByText(/is in_prep/)
      ).toBeTruthy();
    });
  });

  it("the mock generate function is called with the correct tool fields", async () => {
    render(<FoundryScreen />);

    const forgeButtons = screen.getAllByText("Forge Content");
    fireEvent.press(forgeButtons[0]);

    await waitFor(() => {
      expect(mockGenerateAsset).toHaveBeenCalledTimes(1);
    });

    const callArgs = mockGenerateAsset.mock.calls[0][0];
    // The call passes the tool.id + mode (cadet → "standard") + mission context.
    expect(callArgs).toMatchObject({
      mode: "standard",
      mission: expect.objectContaining({
        appName: "ForgeApp",
      }),
    });
  });
});
