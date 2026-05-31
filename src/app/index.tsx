import { Redirect } from "expo-router";
import { ActivityIndicator, View } from "react-native";
import { useConvexAuth, useQuery } from "convex/react";

import { api } from "@cvx/_generated/api";
import { authEnabled } from "@/lib/auth";

function Splash() {
  return (
    <View style={{ flex: 1, alignItems: "center", justifyContent: "center", backgroundColor: "#060B14" }}>
      <ActivityIndicator size="large" color="#4DC8C0" />
    </View>
  );
}

/**
 * Entry route. Demo mode → straight to the Deck. With Clerk enabled, route by
 * auth + onboarding state: signed out → sign-in, no mission → onboarding,
 * otherwise → Deck.
 */
export default function Index() {
  if (!authEnabled) return <Redirect href="/(tabs)/deck" />;
  return <AuthGate />;
}

function AuthGate() {
  const { isLoading, isAuthenticated } = useConvexAuth();
  const data = useQuery(api.missions.getLaunchData, isAuthenticated ? {} : "skip");

  if (isLoading) return <Splash />;
  if (!isAuthenticated) return <Redirect href="/(auth)/sign-in" />;
  if (data === undefined) return <Splash />; // query loading
  if (!data || !data.mission) return <Redirect href="/(auth)/onboarding" />;
  return <Redirect href="/(tabs)/deck" />;
}
