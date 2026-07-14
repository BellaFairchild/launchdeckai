import { ClerkProvider, useAuth } from "@clerk/clerk-expo";
import { ConvexProvider, ConvexReactClient } from "convex/react";
import { ConvexProviderWithClerk } from "convex/react-clerk";
import * as SecureStore from "expo-secure-store";
import React from "react";
import { Platform } from "react-native";

import { authEnabled, CLERK_PUBLISHABLE_KEY } from "./auth";

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
 * Persist the Clerk session token in the device secure store (native only).
 * On web SecureStore has no implementation, so we leave the token cache
 * undefined and let Clerk use its own browser storage.
 */
const tokenCache =
  Platform.OS === "web"
    ? undefined
    : {
        async getToken(key: string) {
          try {
            return await SecureStore.getItemAsync(key);
          } catch {
            return null;
          }
        },
        async saveToken(key: string, value: string) {
          try {
            await SecureStore.setItemAsync(key, value);
          } catch {
            // ignore
          }
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
