import { resolveEntryRoute } from "./onboardingRoutes";

const base = {
  authEnabled: true,
  isLoading: false,
  isAuthenticated: false,
};

it("demo mode routes to deck", () => {
  expect(
    resolveEntryRoute({
      authEnabled: false,
      isLoading: false,
      isAuthenticated: false,
    }),
  ).toBe("/(tabs)/deck");
});

it("signed out with no draft routes to landing", () => {
  expect(resolveEntryRoute({ ...base, hasDraft: false })).toBe("/(auth)/landing");
});

it("signed out with intent complete routes to save-plan", () => {
  expect(resolveEntryRoute({ ...base, intentComplete: true })).toBe("/(auth)/save-plan");
});

it("signed in with mission routes to welcome-back", () => {
  expect(
    resolveEntryRoute({
      ...base,
      isAuthenticated: true,
      hasMission: true,
    }),
  ).toBe("/(auth)/welcome-back");
});

it("signed in with mission and skipWelcomeBack routes to deck", () => {
  expect(
    resolveEntryRoute({
      ...base,
      isAuthenticated: true,
      hasMission: true,
      skipWelcomeBack: true,
    }),
  ).toBe("/(tabs)/deck");
});

it("signed in without mission routes to onboarding", () => {
  expect(
    resolveEntryRoute({
      ...base,
      isAuthenticated: true,
      hasMission: false,
    }),
  ).toBe("/(auth)/onboarding");
});
