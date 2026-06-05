import { resolveEntryRoute } from "./onboardingRoutes";

it("demo mode goes straight to deck", () => {
  expect(
    resolveEntryRoute({ authEnabled: false, isLoading: false, isAuthenticated: false }),
  ).toBe("/(tabs)/deck");
});

it("signed out with no draft goes to landing", () => {
  expect(
    resolveEntryRoute({
      authEnabled: true,
      isLoading: false,
      isAuthenticated: false,
      hasDraft: false,
    }),
  ).toBe("/(auth)/landing");
});

it("signed out with intent draft goes to save-plan", () => {
  expect(
    resolveEntryRoute({
      authEnabled: true,
      isLoading: false,
      isAuthenticated: false,
      hasDraft: true,
      intentComplete: true,
    }),
  ).toBe("/(auth)/save-plan");
});

it("signed in with mission goes to welcome-back by default", () => {
  expect(
    resolveEntryRoute({
      authEnabled: true,
      isLoading: false,
      isAuthenticated: true,
      hasMission: true,
      skipWelcomeBack: false,
    }),
  ).toBe("/(auth)/welcome-back");
});

it("signed in with mission and skip flag goes to deck", () => {
  expect(
    resolveEntryRoute({
      authEnabled: true,
      isLoading: false,
      isAuthenticated: true,
      hasMission: true,
      skipWelcomeBack: true,
    }),
  ).toBe("/(tabs)/deck");
});

it("signed in without mission goes to onboarding", () => {
  expect(
    resolveEntryRoute({
      authEnabled: true,
      isLoading: false,
      isAuthenticated: true,
      hasMission: false,
    }),
  ).toBe("/(auth)/onboarding");
});
