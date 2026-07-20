import { useUser } from "@clerk/clerk-expo";
import { useQuery } from "convex/react";
import { useRouter } from "expo-router";
import { useCallback, useEffect } from "react";
import { SafeAreaView } from "react-native-safe-area-context";

import { ClerkAuthGate } from "@/components/auth/ClerkAuthGate";
import { ScreenBackground } from "@/components/layout/ScreenBackground";
import { Button } from "@/components/ui/Button";
import { ProgressRing } from "@/components/ui/ProgressRing";
import { track } from "@/lib/analytics";
import { readinessLabel } from "@/lib/launch";
import { setSkipWelcomeBack } from "@/lib/onboardingDraft";
import { Text, View } from "@/tw";
import { api } from "@cvx/_generated/api";

export default function WelcomeBackScreen() {
  return (
    <ClerkAuthGate>
      <WelcomeBackContent />
    </ClerkAuthGate>
  );
}

function WelcomeBackContent() {
  const router = useRouter();
  const { user } = useUser();
  const data = useQuery(api.missions.getLaunchData, {});

  const firstName = user?.firstName?.trim() || "Pilot";
  const mission = data?.mission;
  const readiness = mission?.readinessScore ?? 0;

  useEffect(() => {
    track("welcome_back_viewed");
  }, []);

  const onReturnToDeck = useCallback(async () => {
    track("welcome_back_continue");
    await setSkipWelcomeBack();
    router.replace("/(tabs)/deck");
  }, [router]);

  return (
    <ScreenBackground>
      <SafeAreaView style={{ flex: 1 }}>
        <View className="flex-1 justify-between px-7 pb-6 pt-10">
          <View className="items-center gap-6">
            <Text
              accessibilityRole="header"
              className="text-center font-display text-3xl font-black leading-tight tracking-tight text-text-primary"
            >
              Welcome back, {firstName}
            </Text>

            {mission ? (
              <View className="items-center gap-4 rounded-3xl border border-border-med bg-bg-surface/80 px-6 py-8">
                <Text className="font-display text-2xl font-bold text-text-primary">
                  {mission.appName}
                </Text>
                <ProgressRing
                  progress={readiness}
                  size={100}
                  strokeWidth={8}
                  caption="readiness"
                />
                <Text className="text-center font-body text-sm text-text-secondary">
                  {readiness}% readiness · {readinessLabel(readiness)}
                </Text>
              </View>
            ) : null}
          </View>

          <Button label="Return to Deck" fullWidth onPress={onReturnToDeck} />
        </View>
      </SafeAreaView>
    </ScreenBackground>
  );
}
