import React from "react";
import { ConvexProvider, ConvexReactClient } from "convex/react";
import { ConvexProviderWithClerk } from "convex/react-clerk";
import { ClerkProvider, useAuth } from "@clerk/clerk-expo";
import * as Storage from "./storage";

import { authEnabled, CLERK_PUBLISHABLE_KEY } from "./auth";

/**
 * Convex client. EXPO_PUBLIC_CONVEX_URL is written to .env.local by `npx convex dev`.
 * When a Clerk key is present we wrap with ClerkProvider + ConvexProviderWithClerk
 * so Convex validates the Clerk session; otherwise a plain ConvexProvider (demo).
 */
const url = process.env.EXPO_PUBLIC_CONVEX_URL ?? "https://placeholder.convex.cloud";

const convex = new ConvexReactClient(url, {
  unsavedChangesWarning: false,
});

/** Persist the Clerk session token in the device secure store. */
const tokenCache = {
  async getToken(key: string) {
    return await Storage.getItemAsync(key);
  },
  async saveToken(key: string, value: string) {
    await Storage.setItemAsync(key, value);
  },
};

export function ConvexClientProvider({ children }: { children: React.ReactNode }) {
  if (!authEnabled) {
    return <ConvexProvider client={convex}>{children}</ConvexProvider>;
  }
  return (
    <ClerkProvider publishableKey={CLERK_PUBLISHABLE_KEY} tokenCache={tokenCache}>
      <ConvexProviderWithClerk client={convex} useAuth={useAuth}>
        {children}
      </ConvexProviderWithClerk>
    </ClerkProvider>
  );
}
