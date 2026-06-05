import { Redirect } from "expo-router";
import { useEffect, useState } from "react";
import { ActivityIndicator, View } from "react-native";
import { useConvexAuth, useQuery } from "convex/react";

import { api } from "@cvx/_generated/api";
import { authEnabled } from "@/lib/auth";
import {
  getOnboardingDraft,
  getSkipWelcomeBack,
  hasIntentDraft,
} from "@/lib/onboardingDraft";
import { resolveEntryRoute } from "@/lib/onboardingRoutes";

function Splash() {
  return (
    <View style={{ flex: 1, alignItems: "center", justifyContent: "center", backgroundColor: "#060B14" }}>
      <ActivityIndicator size="large" color="#4DC8C0" />
    </View>
  );
}

export type AuthGateState = {
  isLoading: boolean;
  isAuthenticated: boolean;
  launchData: { mission?: unknown } | null | undefined;
  draftReady: boolean;
  hasDraft: boolean;
  intentComplete: boolean;
  skipWelcomeBack: boolean;
};

export function resolveAuthGateHref(state: AuthGateState): string | "loading" | "splash" {
  const {
    isLoading,
    isAuthenticated,
    launchData,
    draftReady,
    hasDraft,
    intentComplete,
    skipWelcomeBack,
  } = state;

  if (isLoading || (isAuthenticated && launchData === undefined) || !draftReady) {
    return "splash";
  }

  return resolveEntryRoute({
    authEnabled: true,
    isLoading: false,
    isAuthenticated,
    hasDraft,
    intentComplete,
    hasMission: Boolean(launchData?.mission),
    skipWelcomeBack,
  });
}

/**
 * Entry route. Demo mode → straight to the Deck. With Clerk enabled, route by
 * auth + draft + mission state via resolveEntryRoute.
 */
export default function Index() {
  if (!authEnabled) return <Redirect href="/(tabs)/deck" />;
  return <AuthGate />;
}

function AuthGate() {
  const { isLoading, isAuthenticated } = useConvexAuth();
  const data = useQuery(api.missions.getLaunchData, isAuthenticated ? {} : "skip");
  const [draftReady, setDraftReady] = useState(false);
  const [hasDraft, setHasDraft] = useState(false);
  const [intentComplete, setIntentComplete] = useState(false);
  const [skipWelcomeBack, setSkipWelcomeBack] = useState(false);

  useEffect(() => {
    Promise.all([hasIntentDraft(), getOnboardingDraft(), getSkipWelcomeBack()]).then(
      ([intent, draft, skip]) => {
        setIntentComplete(intent);
        setHasDraft(Boolean(draft));
        setSkipWelcomeBack(skip);
        setDraftReady(true);
      },
    );
  }, []);

  const href = resolveAuthGateHref({
    isLoading,
    isAuthenticated,
    launchData: data,
    draftReady,
    hasDraft,
    intentComplete,
    skipWelcomeBack,
  });

  if (href === "splash" || href === "loading") return <Splash />;
  return <Redirect href={href} />;
}
