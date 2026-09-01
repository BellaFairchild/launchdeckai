import { render, screen } from "@testing-library/react-native";
import React from "react";

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

jest.mock("expo-linking", () => ({
  createURL: (path: string) => `launchdeck://${path}`,
}));

jest.mock("@/components/layout/ScreenBackground", () => {
  const { View } = require("react-native");
  return {
    ScreenBackground: ({ children }: { children: React.ReactNode }) => (
      <View>{children}</View>
    ),
  };
});

jest.mock("@/lib/analytics", () => ({ track: jest.fn() }));

jest.mock("@/lib/auth", () => ({
  authEnabled: true,
  CLERK_PUBLISHABLE_KEY: "pk_test_mock",
}));

const mockSignUpCreate = jest.fn();
const mockPrepareEmailAddressVerification = jest.fn();
const mockSetActive = jest.fn();
const mockStartSSOFlow = jest.fn();

jest.mock("@clerk/clerk-expo", () => ({
  useSignUp: () => ({
    signUp: {
      create: mockSignUpCreate,
      prepareEmailAddressVerification: mockPrepareEmailAddressVerification,
    },
    setActive: mockSetActive,
    isLoaded: true,
  }),
  useSSO: () => ({
    startSSOFlow: mockStartSSOFlow,
  }),
}));

jest.mock("@/components/auth/ClerkCaptcha", () => ({
  ClerkCaptcha: () => null,
}));

import SavePlanScreen from "@/app/(auth)/save-plan";

beforeEach(() => {
  jest.clearAllMocks();
});

it("renders title and OAuth buttons", () => {
  render(<SavePlanScreen />);
  expect(screen.getByText("Save your app plan")).toBeTruthy();
  expect(screen.getByText("Continue with Google")).toBeTruthy();
  expect(screen.getByText("Continue with Apple")).toBeTruthy();
  expect(screen.getByText("Create Account")).toBeTruthy();
});
