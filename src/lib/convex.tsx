import React from "react";
import { ConvexProvider, ConvexReactClient } from "convex/react";

/**
 * Convex client. EXPO_PUBLIC_CONVEX_URL is written to .env.local by `npx convex dev`.
 * We always mount a provider (with a harmless placeholder if the URL is missing) so
 * `useAction`/`useQuery` hooks never crash when Convex isn't configured — calls just
 * fail at runtime and callers fall back to mock behavior.
 */
const url = process.env.EXPO_PUBLIC_CONVEX_URL ?? "https://placeholder.convex.cloud";

const convex = new ConvexReactClient(url, {
  unsavedChangesWarning: false,
});

export function ConvexClientProvider({ children }: { children: React.ReactNode }) {
  return <ConvexProvider client={convex}>{children}</ConvexProvider>;
}
