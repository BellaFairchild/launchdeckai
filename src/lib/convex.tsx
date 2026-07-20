import { ClerkProvider, useAuth } from "@clerk/clerk-expo";
import { ConvexProvider, ConvexReactClient } from "convex/react";
import { ConvexProviderWithClerk } from "convex/react-clerk";
import React from "react";

import { authEnabled, CLERK_PUBLISHABLE_KEY } from "./auth";
import { getStorageItem, setStorageItem } from "./secureStorage";

/**
 * Convex client. EXPO_PUBLIC_CONVEX_URL is written to .env.local by `npx convex dev`.
 * When a Clerk key is present we wrap with ClerkProvider + ConvexProviderWithClerk
 * so Convex validates the Clerk session; otherwise a plain ConvexProvider (demo).
 */
const url =
  process.env.EXPO_PUBLIC_CONVEX_URL ?? "https://placeholder.convex.cloud";

const convex = new ConvexReactClient(url, {
  unsavedChangesWarning: false,
});

/**
 * Persist the Clerk session token. Native uses the Keychain/Keystore-backed
 * SecureStore; web falls back to localStorage (see lib/secureStorage) so the
 * session survives a refresh instead of being dropped.
 */
const tokenCache = {
  getToken(key: string) {
    return getStorageItem(key);
  },
  saveToken(key: string, value: string) {
    return setStorageItem(key, value);
  },
};

export function ConvexClientProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  if (!authEnabled) {
    return <ConvexProvider client={convex}>{children}</ConvexProvider>;
  }
  return (
    <ClerkProvider
      publishableKey={CLERK_PUBLISHABLE_KEY}
      tokenCache={tokenCache}
    >
      <ConvexProviderWithClerk client={convex} useAuth={useAuth}>
        {children}
      </ConvexProviderWithClerk>
    </ClerkProvider>
  );
}
