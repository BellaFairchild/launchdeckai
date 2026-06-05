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
let mockSearchParams: { phase?: string } = { phase: "intent" };

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
    useRouter: () => ({ replace: mockReplace, push: mockReplace }),
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

jest.mock("@/lib/onboardingDraft", () => ({
  getOnboardingDraft: (...args: unknown[]) => mockGetOnboardingDraft(...args),
  saveOnboardingDraft: (...args: unknown[]) =>
    mockSaveOnboardingDraft(...args),
}));

jest.mock("convex/react", () => ({
  useConvexAuth: () => ({ isAuthenticated: false, isLoading: false }),
  useMutation: () => jest.fn(),
}));

import OnboardingScreen from "./onboarding";

beforeEach(() => {
  jest.clearAllMocks();
  mockSearchParams = { phase: "intent" };
  mockGetOnboardingDraft.mockResolvedValue(null);
  mockSaveOnboardingDraft.mockResolvedValue(undefined);
});

async function advanceIntentSteps() {
  fireEvent.changeText(screen.getByLabelText("App name"), "FocusFlow");
  fireEvent.press(screen.getByText("Continue"));

  await waitFor(() => {
    expect(screen.getByLabelText("One-liner description")).toBeOnTheScreen();
  });

  fireEvent.changeText(
    screen.getByLabelText("One-liner description"),
    "Mindful tasks for builders",
  );
  fireEvent.press(screen.getByText("Continue"));

  await waitFor(() => {
    expect(screen.getByLabelText("Target audience")).toBeOnTheScreen();
  });

  fireEvent.changeText(
    screen.getByLabelText("Target audience"),
    "Solo founders",
  );
  fireEvent.press(screen.getByText("Continue"));
}

it("hydrates intent fields from draft on mount", async () => {
  mockGetOnboardingDraft.mockResolvedValue({
    appName: "DraftApp",
    oneLiner: "Saved pitch",
    audience: "Indie hackers",
    step: 1,
  });

  render(<OnboardingScreen />);

  await waitFor(() => {
    expect(screen.getByDisplayValue("Saved pitch")).toBeOnTheScreen();
  });

  expect(screen.getByText(/Intent capture · 2\/3/)).toBeOnTheScreen();
});

it("persists draft after completing audience step", async () => {
  render(<OnboardingScreen />);

  await waitFor(() => {
    expect(screen.getByLabelText("App name")).toBeOnTheScreen();
  });

  await advanceIntentSteps();

  await waitFor(() => {
    expect(mockSaveOnboardingDraft).toHaveBeenCalledWith({
      appName: "FocusFlow",
      oneLiner: "Mindful tasks for builders",
      audience: "Solo founders",
      step: 2,
    });
  });
});

it("navigates to save-plan after step 2 when auth enabled and not authenticated", async () => {
  render(<OnboardingScreen />);

  await waitFor(() => {
    expect(screen.getByLabelText("App name")).toBeOnTheScreen();
  });

  await advanceIntentSteps();

  await waitFor(() => {
    expect(mockReplace).toHaveBeenCalledWith("/(auth)/save-plan");
  });
});

it("shows three progress segments in intent phase", async () => {
  render(<OnboardingScreen />);

  await waitFor(() => {
    expect(screen.getByText("Intent capture · 1/3")).toBeOnTheScreen();
  });
});
