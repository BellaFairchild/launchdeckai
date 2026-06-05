import React from "react";
import {
  fireEvent,
  render,
  screen,
  waitFor,
} from "@testing-library/react-native";

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
    withRepeat: (v: unknown) => v,
    useReducedMotion: () => false,
    Easing: { inOut: () => () => 0, ease: () => 0 },
  };
});

jest.mock("@/components/ui/GradientView", () => ({
  GradientView: () => null,
}));

jest.mock("react-native-safe-area-context", () => {
  const { View } = require("react-native");
  return {
    SafeAreaView: ({ children }: { children: React.ReactNode }) => (
      <View>{children}</View>
    ),
    useSafeAreaInsets: () => ({ top: 0, bottom: 0, left: 0, right: 0 }),
  };
});

const mockReplace = jest.fn();
const mockPush = jest.fn();
let mockSearchParams: { phase?: string } = { phase: "mission" };

jest.mock("expo-router", () => {
  const { View } = require("react-native");
  const RouterLink = (props: { children?: React.ReactNode }) => (
    <View>{props.children}</View>
  );
  RouterLink.Trigger = () => null;
  RouterLink.Menu = () => null;
  RouterLink.MenuAction = () => null;
  RouterLink.Preview = () => null;
  return {
    useRouter: () => ({ replace: mockReplace, push: mockPush }),
    useLocalSearchParams: () => mockSearchParams,
    Link: RouterLink,
  };
});

jest.mock("@/components/layout/ScreenBackground", () => {
  const { View } = require("react-native");
  return {
    ScreenBackground: ({ children }: { children: React.ReactNode }) => (
      <View>{children}</View>
    ),
  };
});

jest.mock("@/lib/analytics", () => ({ track: jest.fn() }));
jest.mock("@/lib/audio", () => ({
  playSignature: jest.fn(),
}));
jest.mock("@/lib/haptics", () => ({ haptics: { success: jest.fn() } }));

jest.mock("@/lib/auth", () => ({
  authEnabled: true,
}));

const mockSaveOnboardingDraft = jest.fn(async () => undefined);
const mockGetOnboardingDraft = jest.fn(async () => null);
const mockClearOnboardingDraft = jest.fn(async () => undefined);
const mockCreateMission = jest.fn(async () => undefined);

jest.mock("@/lib/onboardingDraft", () => ({
  getOnboardingDraft: (...args: unknown[]) => mockGetOnboardingDraft(...args),
  saveOnboardingDraft: (...args: unknown[]) =>
    mockSaveOnboardingDraft(...args),
  clearOnboardingDraft: (...args: unknown[]) =>
    mockClearOnboardingDraft(...args),
}));

jest.mock("convex/react", () => ({
  useConvexAuth: () => ({ isAuthenticated: true, isLoading: false }),
  useMutation: () => mockCreateMission,
}));

import OnboardingScreen from "./onboarding";

beforeEach(() => {
  jest.clearAllMocks();
  mockSearchParams = { phase: "mission" };
  mockGetOnboardingDraft.mockResolvedValue(null);
  mockSaveOnboardingDraft.mockResolvedValue(undefined);
  mockClearOnboardingDraft.mockResolvedValue(undefined);
  mockCreateMission.mockResolvedValue(undefined);
});

it("hydrates mission fields from draft on mount", async () => {
  mockGetOnboardingDraft.mockResolvedValue({
    appName: "DraftApp",
    oneLiner: "Saved pitch",
    audience: "Indie hackers",
    step: 5,
  });

  render(<OnboardingScreen />);

  await waitFor(() => {
    expect(screen.getByText(/Mission setup · 3\/4/)).toBeOnTheScreen();
  });

  expect(screen.getByText("Target launch")).toBeOnTheScreen();
});

it("shows confirm summary with hydrated draft values", async () => {
  mockGetOnboardingDraft.mockResolvedValue({
    appName: "DraftApp",
    oneLiner: "Saved pitch",
    audience: "Indie hackers",
    step: 6,
  });

  render(<OnboardingScreen />);

  await waitFor(() => {
    expect(screen.getByText(/DraftApp/)).toBeOnTheScreen();
  });

  expect(screen.getByText(/Saved pitch/)).toBeOnTheScreen();
  expect(screen.getByText(/Indie hackers/)).toBeOnTheScreen();
});

it("clears onboarding draft after createMission succeeds", async () => {
  mockGetOnboardingDraft.mockResolvedValue({
    appName: "DraftApp",
    oneLiner: "Saved pitch",
    audience: "Indie hackers",
    step: 6,
  });

  render(<OnboardingScreen />);

  await waitFor(() => {
    expect(screen.getByText("Create my Mission")).toBeOnTheScreen();
  });

  fireEvent.press(screen.getByText("Create my Mission"));

  await waitFor(() => {
    expect(mockCreateMission).toHaveBeenCalled();
    expect(mockClearOnboardingDraft).toHaveBeenCalled();
    expect(mockReplace).toHaveBeenCalledWith("/(tabs)/deck");
  });
});

it("navigates to refuel when Commander link is pressed", async () => {
  mockGetOnboardingDraft.mockResolvedValue({
    appName: "DraftApp",
    oneLiner: "Saved pitch",
    audience: "Indie hackers",
    step: 6,
  });

  render(<OnboardingScreen />);

  await waitFor(() => {
    expect(
      screen.getByLabelText("See what Commander unlocks"),
    ).toBeOnTheScreen();
  });

  fireEvent.press(screen.getByLabelText("See what Commander unlocks"));

  expect(mockPush).toHaveBeenCalledWith("/(modals)/refuel");
  expect(mockCreateMission).not.toHaveBeenCalled();
});
