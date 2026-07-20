import { useRouter } from "expo-router";
import { useCallback, useEffect } from "react";
import { SafeAreaView } from "react-native-safe-area-context";

import { ScreenBackground } from "@/components/layout/ScreenBackground";
import { Button } from "@/components/ui/Button";
import { GradientView } from "@/components/ui/GradientView";
import { track } from "@/lib/analytics";
import { authEnabled } from "@/lib/auth";
import { Text, View } from "@/tw";

const BENEFITS = ["App plan", "Checklists", "Writing help"] as const;

export default function LandingScreen() {
  const router = useRouter();

  useEffect(() => {
    track("landing_viewed");
  }, []);

  const onGetStarted = useCallback(() => {
    track("landing_get_started");
    router.push("/(auth)/onboarding?phase=intent");
  }, [router]);

  const onHaveAccount = useCallback(() => {
    track("landing_have_account");
    if (authEnabled) {
      router.push("/(auth)/sign-in");
      return;
    }
    router.replace("/(tabs)/deck");
  }, [router]);

  return (
    <ScreenBackground>
      <SafeAreaView style={{ flex: 1 }}>
        <View className="flex-1 justify-between px-7 pb-6 pt-8">
          <View className="items-center gap-3">
            <View className="relative h-14 w-14 items-center justify-center overflow-hidden rounded-2xl border border-white/10">
              <GradientView
                colors={["#1500FD", "#10B7D6"]}
                direction="diagonal"
              />
              <View className="absolute -right-1 -top-1 h-3.5 w-3.5 rounded-full border-2 border-bg-deep bg-brand-gold" />
            </View>

            <View className="items-center gap-1">
              <Text
                accessibilityRole="header"
                className="font-display text-lg font-extrabold uppercase tracking-[0.25em] text-text-primary"
              >
                LaunchDeck
                <Text className="text-brand-teal">AI</Text>
              </Text>
              <Text className="font-mono text-xs uppercase tracking-widest text-text-tertiary">
                BUILDER COMPANION
              </Text>
            </View>
          </View>

          <View className="gap-4">
            <Text
              accessibilityRole="header"
              className="text-center font-display text-3xl font-black leading-tight tracking-tight text-text-primary"
            >
              Plan your app launch with{" "}
              <Text className="text-brand-teal underline decoration-brand-gold/40">
                less overwhelm
              </Text>
            </Text>

            <Text className="text-center font-body text-sm leading-relaxed text-text-secondary">
              Organize your app idea, launch tasks, store details, marketing,
              and next steps in one guided workspace.
            </Text>

            <View className="mt-1 flex-row flex-wrap justify-center gap-2">
              {BENEFITS.map((benefit) => (
                <View
                  key={benefit}
                  className="rounded-full border border-border-med bg-bg-surface px-3.5 py-1.5"
                >
                  <Text className="font-body text-xs font-semibold tracking-wide text-text-secondary">
                    {benefit}
                  </Text>
                </View>
              ))}
            </View>
          </View>

          <View className="gap-3">
            <Button label="Get Started" fullWidth onPress={onGetStarted} />
            <Button
              label="I already have an account"
              variant="ghost"
              fullWidth
              onPress={onHaveAccount}
            />
          </View>
        </View>
      </SafeAreaView>
    </ScreenBackground>
  );
}
