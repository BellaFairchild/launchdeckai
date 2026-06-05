export type EntryRouteInput = {
  authEnabled: boolean;
  isLoading: boolean;
  isAuthenticated: boolean;
  hasDraft?: boolean;
  intentComplete?: boolean;
  hasMission?: boolean;
  skipWelcomeBack?: boolean;
};

export function resolveEntryRoute(input: EntryRouteInput): string | "loading" {
  if (!input.authEnabled) return "/(tabs)/deck";
  if (input.isLoading) return "loading";

  if (!input.isAuthenticated) {
    if (input.intentComplete) return "/(auth)/save-plan";
    if (input.hasDraft) return "/(auth)/landing";
    return "/(auth)/landing";
  }

  if (input.hasMission) {
    return input.skipWelcomeBack ? "/(tabs)/deck" : "/(auth)/welcome-back";
  }
  return "/(auth)/onboarding";
}
