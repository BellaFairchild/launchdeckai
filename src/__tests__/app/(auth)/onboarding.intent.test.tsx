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
    FadeIn: { duration: () => ({}) },
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
jest.mock("@/lib/audio", () => ({ playSignature: jest.fn() }));
jest.mock("@/lib/haptics", () => ({
  haptics: { success: jest.fn(), light: jest.fn() },
}));

jest.mock("@/lib/auth", () => ({ authEnabled: true }));

const mockSaveOnboardingDraft = jest.fn(async () => undefined);
const mockGetOnboardingDraft = jest.fn<Promise<unknown>, unknown[]>(
  async () => null,
);

jest.mock("@/lib/onboardingDraft", () => ({
  getOnboardingDraft: (...args: unknown[]) => mockGetOnboardingDraft(...args),
  saveOnboardingDraft: (...args: unknown[]) => mockSaveOnboardingDraft(...args),
  clearOnboardingDraft: jest.fn(async () => undefined),
}));

const mockForge = jest.fn(async () => ({
  name: "FocusFlow",
  oneLiner: "Mindful task tracking for builders",
  audience: "Solo founders who tried every productivity app",
  mock: true,
}));

jest.mock("convex/react", () => ({
  useConvexAuth: () => ({ isAuthenticated: false, isLoading: false }),
  useMutation: () => jest.fn(),
  useAction: () => mockForge,
}));

jest.mock("expo-speech-recognition", () => ({
  ExpoSpeechRecognitionModule: {
    isRecognitionAvailable: () => false,
    requestPermissionsAsync: async () => ({ granted: false }),
    start: jest.fn(),
    stop: jest.fn(),
  },
  useSpeechRecognitionEvent: () => undefined,
}));

jest.mock("@/components/astro/AstroAvatar", () => {
  const { View } = require("react-native");
  return { AstroAvatar: () => <View testID="astro-avatar" /> };
});

import OnboardingScreen from "@/app/(auth)/onboarding";

beforeEach(() => {
  jest.clearAllMocks();
  mockSearchParams = { phase: "intent" };
  mockGetOnboardingDraft.mockResolvedValue(null);
  mockSaveOnboardingDraft.mockResolvedValue(undefined);
  mockForge.mockResolvedValue({
    name: "FocusFlow",
    oneLiner: "Mindful task tracking for builders",
    audience: "Solo founders who tried every productivity app",
    mock: true,
  });
});

it("opens on the pitch step with Astro's coaching line", async () => {
  render(<OnboardingScreen />);

  await waitFor(() => {
    expect(screen.getByLabelText("Your pitch")).toBeOnTheScreen();
  });
  expect(screen.getByText(/your own words/i)).toBeOnTheScreen();
  expect(screen.getByText("Forge My Mission Brief")).toBeOnTheScreen();
});

it("forges a brief, then confirms to save-plan with the captured pitch", async () => {
  render(<OnboardingScreen />);

  await waitFor(() => {
    expect(screen.getByLabelText("Your pitch")).toBeOnTheScreen();
  });

  fireEvent.changeText(
    screen.getByLabelText("Your pitch"),
    "A habit tracker that adapts to your real schedule.",
  );
  fireEvent.press(screen.getByText("Forge My Mission Brief"));

  // Results cards render from the forge action.
  await waitFor(() => {
    expect(screen.getByDisplayValue("FocusFlow")).toBeOnTheScreen();
  });
  expect(mockForge).toHaveBeenCalledWith({
    pitch: "A habit tracker that adapts to your real schedule.",
  });

  fireEvent.press(screen.getByText("This Is My App"));

  await waitFor(() => {
    expect(mockSaveOnboardingDraft).toHaveBeenCalledWith({
      appName: "FocusFlow",
      oneLiner: "Mindful task tracking for builders",
      audience: "Solo founders who tried every productivity app",
      pitch: "A habit tracker that adapts to your real schedule.",
      step: 2,
    });
    expect(mockReplace).toHaveBeenCalledWith("/(auth)/save-plan");
  });
});

it("supports manual entry as a fallback", async () => {
  render(<OnboardingScreen />);

  await waitFor(() => {
    expect(screen.getByText("I'll fill it in myself")).toBeOnTheScreen();
  });
  fireEvent.press(screen.getByText("I'll fill it in myself"));

  fireEvent.changeText(screen.getByLabelText("App name"), "ManualApp");
  fireEvent.changeText(screen.getByLabelText("One-liner"), "Typed by hand");
  fireEvent.changeText(screen.getByLabelText("Audience"), "Power users");
  fireEvent.press(screen.getByText("This Is My App"));

  await waitFor(() => {
    expect(mockSaveOnboardingDraft).toHaveBeenCalledWith(
      expect.objectContaining({
        appName: "ManualApp",
        oneLiner: "Typed by hand",
        audience: "Power users",
        step: 2,
      }),
    );
    expect(mockReplace).toHaveBeenCalledWith("/(auth)/save-plan");
  });
  expect(mockForge).not.toHaveBeenCalled();
});

it("hydrates into the results view when a draft already has a brief", async () => {
  mockGetOnboardingDraft.mockResolvedValue({
    appName: "DraftApp",
    oneLiner: "Saved one-liner",
    audience: "Indie hackers",
    pitch: "Saved pitch text that is long enough",
    step: 2,
  });

  render(<OnboardingScreen />);

  await waitFor(() => {
    expect(screen.getByDisplayValue("DraftApp")).toBeOnTheScreen();
  });
  expect(screen.getByDisplayValue("Saved one-liner")).toBeOnTheScreen();
  expect(screen.getByText("This Is My App")).toBeOnTheScreen();
});
