import { Redirect } from "expo-router";

import { authEnabled } from "@/lib/auth";

/**
 * Auth screens that call Clerk hooks must sit behind this gate. In demo mode
 * (no EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY) ConvexClientProvider skips ClerkProvider,
 * so calling useSignIn/useUser without the gate crashes on web and native.
 */
export function ClerkAuthGate({ children }: { children: React.ReactNode }) {
  if (!authEnabled) return <Redirect href="/(tabs)/deck" />;
  return <>{children}</>;
}
