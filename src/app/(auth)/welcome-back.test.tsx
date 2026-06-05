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

jest.mock("@/components/ui/ProgressRing", () => {
  const { Text, View } = require("react-native");
  return {
    ProgressRing: ({
      progress,
      caption,
    }: {
      progress: number;
      caption?: string;
    }) => (
      <View>
        <Text>{`${Math.round(progress)}%`}</Text>
        {caption ? <Text>{caption}</Text> : null}
      </View>
    ),
  };
});

const mockTrack = jest.fn();
jest.mock("@/lib/analytics", () => ({ track: (...args: unknown[]) => mockTrack(...args) }));

const mockSetSkipWelcomeBack = jest.fn(async () => undefined);
jest.mock("@/lib/onboardingDraft", () => ({
  setSkipWelcomeBack: (...args: unknown[]) => mockSetSkipWelcomeBack(...args),
}));

let mockFirstName: string | null = "Alex";
jest.mock("@clerk/clerk-expo", () => ({
  useUser: () => ({
    user: mockFirstName ? { firstName: mockFirstName } : { firstName: null },
  }),
}));

let mockLaunchData: {
  mission: { appName: string; readinessScore: number } | null;
} = {
  mission: { appName: "FocusFlow", readinessScore: 42 },
};

jest.mock("convex/react", () => ({
  useQuery: () => mockLaunchData,
}));

import WelcomeBackScreen from "./welcome-back";

beforeEach(() => {
  jest.clearAllMocks();
  mockFirstName = "Alex";
  mockLaunchData = {
    mission: { appName: "FocusFlow", readinessScore: 42 },
  };
});

it("shows mission name and Return to Deck", () => {
  render(<WelcomeBackScreen />);
  expect(screen.getByText(/Welcome back, Alex/)).toBeTruthy();
  expect(screen.getByText("FocusFlow")).toBeTruthy();
  expect(screen.getByText("Return to Deck")).toBeTruthy();
  expect(mockTrack).toHaveBeenCalledWith("welcome_back_viewed");
});

it("falls back to Pilot when firstName is missing", () => {
  mockFirstName = null;
  render(<WelcomeBackScreen />);
  expect(screen.getByText(/Welcome back, Pilot/)).toBeTruthy();
});

it("Return to Deck sets skip pref and navigates", async () => {
  render(<WelcomeBackScreen />);
  fireEvent.press(screen.getByText("Return to Deck"));

  await waitFor(() => {
    expect(mockTrack).toHaveBeenCalledWith("welcome_back_continue");
    expect(mockSetSkipWelcomeBack).toHaveBeenCalled();
    expect(mockReplace).toHaveBeenCalledWith("/(tabs)/deck");
  });
});
