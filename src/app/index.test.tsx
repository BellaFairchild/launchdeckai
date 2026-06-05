import { resolveAuthGateHref } from "./index";
import { resolveEntryRoute } from "@/lib/onboardingRoutes";

jest.mock("@/lib/auth", () => ({ authEnabled: true }));

describe("resolveAuthGateHref", () => {
  const ready = {
    draftReady: true,
    hasDraft: false,
    intentComplete: false,
    skipWelcomeBack: false,
  };

  it("shows splash while auth is loading", () => {
    expect(
      resolveAuthGateHref({
        isLoading: true,
        isAuthenticated: false,
        launchData: undefined,
        ...ready,
      }),
    ).toBe("splash");
  });

  it("shows splash while launch data loads for signed-in user", () => {
    expect(
      resolveAuthGateHref({
        isLoading: false,
        isAuthenticated: true,
        launchData: undefined,
        ...ready,
      }),
    ).toBe("splash");
  });

  it("shows splash until draft state is loaded", () => {
    expect(
      resolveAuthGateHref({
        isLoading: false,
        isAuthenticated: false,
        launchData: undefined,
        draftReady: false,
        hasDraft: false,
        intentComplete: false,
        skipWelcomeBack: false,
      }),
    ).toBe("splash");
  });

  it("routes signed-out user with no draft to landing", () => {
    expect(
      resolveAuthGateHref({
        isLoading: false,
        isAuthenticated: false,
        launchData: undefined,
        ...ready,
      }),
    ).toBe("/(auth)/landing");
  });

  it("routes signed-out user with complete intent to save-plan", () => {
    expect(
      resolveAuthGateHref({
        isLoading: false,
        isAuthenticated: false,
        launchData: undefined,
        draftReady: true,
        hasDraft: true,
        intentComplete: true,
        skipWelcomeBack: false,
      }),
    ).toBe("/(auth)/save-plan");
  });

  it("routes signed-in user without mission to onboarding", () => {
    expect(
      resolveAuthGateHref({
        isLoading: false,
        isAuthenticated: true,
        launchData: { mission: null },
        ...ready,
      }),
    ).toBe("/(auth)/onboarding");
  });

  it("routes signed-in user with mission to welcome-back", () => {
    expect(
      resolveAuthGateHref({
        isLoading: false,
        isAuthenticated: true,
        launchData: { mission: { appName: "FocusFlow" } },
        ...ready,
      }),
    ).toBe("/(auth)/welcome-back");
  });

  it("routes signed-in user with mission and skip pref to deck", () => {
    expect(
      resolveAuthGateHref({
        isLoading: false,
        isAuthenticated: true,
        launchData: { mission: { appName: "FocusFlow" } },
        draftReady: true,
        hasDraft: false,
        intentComplete: false,
        skipWelcomeBack: true,
      }),
    ).toBe("/(tabs)/deck");
  });
});

describe("resolveEntryRoute demo mode", () => {
  it("demo mode goes straight to deck", () => {
    expect(
      resolveEntryRoute({ authEnabled: false, isLoading: false, isAuthenticated: false }),
    ).toBe("/(tabs)/deck");
  });
});
