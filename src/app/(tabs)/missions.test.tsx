/**
 * Missions tab — render tests (Docs/11 Missions cases).
 *
 * Strategy: render the full MissionsScreen with the entangled sub-components
 * mocked (TabScreen, MissionHeroCard, LaunchFlightPath, GradientView,
 * GalaxyBackdrop, SVG, react-native-safe-area-context, react-native-reanimated)
 * so that the MilestoneRow list renders cleanly.
 *
 * What is verified here:
 *   ✓ A plan-locked milestone row is visible on screen (not hidden/removed)
 *   ✓ Pressing a locked milestone's checkbox calls router.push("/(modals)/refuel")
 */

import React from "react";
import { render, screen, fireEvent } from "@testing-library/react-native";

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
    useSharedValue: () => ({ value: 0 }),
    useAnimatedStyle: () => ({}),
    useReducedMotion: () => false,
    withRepeat: (v: unknown) => v,
    withTiming: (v: unknown) => v,
    ZoomIn: { springify: () => ({}) },
    FadeOut: {},
    Easing: { inOut: () => () => 0, ease: () => 0 },
  };
});

// GradientView — native module absent in test runner.
jest.mock("@/components/ui/GradientView", () => ({
  GradientView: () => null,
}));

// GalaxyBackdrop — uses react-native-svg; stub to null.
jest.mock("@/components/ui/GalaxyBackdrop", () => ({
  GalaxyBackdrop: () => null,
}));

// LaunchFlightPath — uses react-native-svg + GradientView; stub to null.
jest.mock("@/components/mission/LaunchFlightPath", () => ({
  LaunchFlightPath: () => null,
}));

// MissionHeroCard — uses GalaxyBackdrop + ProgressBar + GradientView; stub to null.
jest.mock("@/components/mission/MissionHeroCard", () => ({
  MissionHeroCard: () => null,
}));

// TabScreen — uses expo-router useIsFocused; stub to a simple wrapper that
// renders children (always focused in tests).
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
    SafeAreaView: ({ children, ...props }: { children: React.ReactNode }) => (
      <View {...props}>{children}</View>
    ),
    useSafeAreaInsets: () => ({ top: 0, bottom: 0, left: 0, right: 0 }),
  };
});

// expo-router — mock useRouter for push assertion.
// Must include a Link stub with static sub-components that @/tw reads on import.
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
    useIsFocused: () => true,
    Link: RouterLink,
  };
});

// ── Analytics — mock to avoid import side-effects ────────────────────────────
jest.mock("@/lib/analytics", () => ({
  track: jest.fn(),
}));

// ── Subject under test ───────────────────────────────────────────────────────

import MissionsScreen from "./missions";
import { useMissionStore } from "@/store/mission";
import { useUIStore } from "@/store/ui";
import type { Milestone, Mission, Blueprint, BlueprintSection, Asset } from "@/types";
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
  id: "m_render_test",
  appName: "RenderApp",
  appDescription: "desc",
  oneLiner: "one-liner",
  targetAudience: "Testers",
  platform: "ios",
  stage: "building",
  status: "active",
  readinessScore: 0,
};

/** A cadet milestone visible to all plans. */
const CADET_MILESTONE: Milestone = {
  id: "ms_render_cadet",
  title: "Name your app",
  description: "Pick a memorable name.",
  category: "foundation",
  completed: false,
  fuelReward: 10,
  requiredPlan: "cadet",
  isLocked: false,
};

/** A commander-required milestone — locked for a cadet user at render time. */
const COMMANDER_MILESTONE: Milestone = {
  id: "ms_render_commander",
  title: "Create a launch video script",
  description: "High-conversion hook.",
  category: "assets",
  completed: false,
  fuelReward: 25,
  requiredPlan: "commander",
  isLocked: false,
};

// ── Reset stores before each test ───────────────────────────────────────────

beforeEach(() => {
  mockPush.mockClear();

  useMissionStore.setState({
    convex: null,
    mission: { ...BASE_MISSION },
    milestones: [{ ...CADET_MILESTONE }, { ...COMMANDER_MILESTONE }],
    blueprints: makeBlueprints(),
    assets: [] as Asset[],
    broadcasts: [],
  });

  useUIStore.setState({
    plan: "cadet",
    fuel: 25,
    streak: 0,
    serverOwned: false,
    convexSetPlan: null,
  });
});

// ── Tests ────────────────────────────────────────────────────────────────────

describe("MissionsScreen — locked milestone visibility and routing", () => {
  it("renders the locked (commander) milestone title on screen", () => {
    render(<MissionsScreen />);
    // The milestone title appears in the MilestoneRow regardless of locked state.
    expect(screen.getByText("Create a launch video script")).toBeTruthy();
  });

  it("renders the unlocked (cadet) milestone title on screen", () => {
    render(<MissionsScreen />);
    expect(screen.getByText("Name your app")).toBeTruthy();
  });

  it("pressing the locked milestone checkbox calls router.push('/(modals)/refuel')", () => {
    render(<MissionsScreen />);

    // The locked milestone's Pressable has:
    //   accessibilityRole="checkbox"
    //   accessibilityState={{ checked: false, disabled: true }}
    // getByRole("checkbox", { disabled: true }) finds it via RNTL 13 role+state queries.
    const lockedCheckbox = screen.getByRole("checkbox", { disabled: true });
    fireEvent.press(lockedCheckbox);

    expect(mockPush).toHaveBeenCalledWith("/(modals)/refuel");
    expect(mockPush).toHaveBeenCalledTimes(1);
  });

  it("pressing the unlocked milestone checkbox does NOT navigate to refuel", () => {
    render(<MissionsScreen />);

    // The unlocked (cadet) milestone: accessibilityRole="checkbox", disabled: false, checked: false.
    const unlockedCheckbox = screen.getByRole("checkbox", { disabled: false, checked: false });
    fireEvent.press(unlockedCheckbox);

    expect(mockPush).not.toHaveBeenCalledWith("/(modals)/refuel");
  });

  it("completing the unlocked milestone sets it completed in the store", () => {
    render(<MissionsScreen />);
    const unlockedCheckbox = screen.getByRole("checkbox", { disabled: false, checked: false });
    fireEvent.press(unlockedCheckbox);

    const ms = useMissionStore
      .getState()
      .milestones.find((m) => m.id === "ms_render_cadet");
    expect(ms?.completed).toBe(true);
  });
});
