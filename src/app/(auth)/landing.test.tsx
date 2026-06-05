import React from "react";
import { fireEvent, render, screen } from "@testing-library/react-native";

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

const mockPush = jest.fn();
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
    useRouter: () => ({ push: mockPush, replace: mockPush }),
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

import LandingScreen from "./landing";

beforeEach(() => {
  jest.clearAllMocks();
});

it("renders relief headline and both CTAs", () => {
  render(<LandingScreen />);
  expect(screen.getByText(/less overwhelm/i)).toBeTruthy();
  expect(screen.getByText("Get Started")).toBeTruthy();
  expect(screen.getByText("I already have an account")).toBeTruthy();
});

it("Get Started navigates to intent flow", () => {
  render(<LandingScreen />);
  fireEvent.press(screen.getByText("Get Started"));
  expect(mockPush).toHaveBeenCalledWith("/(auth)/onboarding?phase=intent");
});
