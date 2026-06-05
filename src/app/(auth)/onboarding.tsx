import { useMutation } from "convex/react";
import { useRouter } from "expo-router";
import { useState } from "react";
import { KeyboardAvoidingView, Platform } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { ScreenBackground } from "@/components/layout/ScreenBackground";
import { Button } from "@/components/ui/Button";
import { track } from "@/lib/analytics";
import { playSignature } from "@/lib/audio";
import { authEnabled } from "@/lib/auth";
import { cn } from "@/lib/cn";
import { haptics } from "@/lib/haptics";
import { useMissionStore } from "@/store/mission";
import { Pressable, ScrollView, Text, TextInput, View } from "@/tw";
import type { Platform as AppPlatform, MissionStage } from "@/types";
import { api } from "@cvx/_generated/api";

const DAY = 24 * 60 * 60 * 1000;

const PLATFORMS: { id: AppPlatform; label: string }[] = [
  { id: "ios", label: "iOS" },
  { id: "android", label: "Android" },
  { id: "both", label: "Both" },
];

const STAGES: { id: MissionStage; label: string }[] = [
  { id: "building", label: "Building" },
  { id: "testing", label: "Testing" },
  { id: "store_prep", label: "Store Prep" },
  { id: "ready_to_submit", label: "Ready to Submit" },
];

const DATE_OPTIONS: { label: string; offset: number | null }[] = [
  { label: "~2 weeks", offset: 14 * DAY },
  { label: "~1 month", offset: 30 * DAY },
  { label: "~3 months", offset: 90 * DAY },
  { label: "Not sure yet", offset: null },
];

function Chip({
  label,
  active,
  onPress,
}: {
  label: string;
  active: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityState={{ selected: active }}
      className={cn(
        "rounded-full border px-4 py-2.5",
        active
          ? "border-brand-teal bg-brand-teal/15"
          : "border-border-med bg-bg-surface",
      )}
    >
      <Text
        className={cn(
          "font-body text-sm font-semibold",
          active ? "text-brand-teal" : "text-text-secondary",
        )}
      >
        {label}
      </Text>
    </Pressable>
  );
}

export default function OnboardingScreen() {
  const router = useRouter();
  const updateMission = useMissionStore((s) => s.updateMission);
  const createMission = useMutation(api.missions.createMission);
  const [submitting, setSubmitting] = useState(false);

  const [step, setStep] = useState(0);
  const [appName, setAppName] = useState("");
  const [oneLiner, setOneLiner] = useState("");
  const [audience, setAudience] = useState("");
  const [platform, setPlatform] = useState<AppPlatform>("ios");
  const [stage, setStage] = useState<MissionStage>("building");
  const [dateOffset, setDateOffset] = useState<number | null>(14 * DAY);

  const TOTAL = 7; // 6 inputs + confirmation
  const canNext =
    (step === 0 && appName.trim().length > 0) ||
    (step === 1 && oneLiner.trim().length > 0) ||
    (step === 2 && audience.trim().length > 0) ||
    step >= 3;

  const finish = async () => {
    if (submitting) return;
    const payload = {
      appName: appName.trim() || "My App",
      oneLiner: oneLiner.trim(),
      appDescription: oneLiner.trim(),
      targetAudience: audience.trim(),
      platform,
      stage,
      launchDate: dateOffset ? Date.now() + dateOffset : undefined,
    };

    const celebrate = () => {
      haptics.success();
      playSignature("milestone");
      track("onboarding_completed");
      track("mission_created", { platform, stage });
    };

    if (authEnabled) {
      setSubmitting(true);
      try {
        await createMission(payload);
        celebrate();
        router.replace("/(tabs)/deck");
      } catch {
        setSubmitting(false);
      }
      return;
    }

    // Demo mode — update the mock mission.
    updateMission({ ...payload, status: "active" });
    celebrate();
    router.replace("/(tabs)/deck");
  };

  return (
    <ScreenBackground>
      <SafeAreaView style={{ flex: 1 }} edges={["top", "bottom"]}>
        <KeyboardAvoidingView
          style={{ flex: 1 }}
          behavior={Platform.OS === "ios" ? "padding" : undefined}
        >
          {/* Progress */}
          <View className="flex-row gap-1.5 px-5 pt-3">
            {Array.from({ length: TOTAL }).map((_, i) => (
              <View
                key={i}
                className={cn(
                  "h-1.5 flex-1 rounded-full",
                  i <= step ? "bg-brand-teal" : "bg-border-default",
                )}
              />
            ))}
          </View>

          <ScrollView contentContainerClassName="flex-1 gap-4 px-6 py-6">
            <Text className="font-mono text-xs uppercase tracking-[2px] text-brand-teal">
              Mission setup · {step + 1}/{TOTAL}
            </Text>

            {step === 0 && (
              <View className="gap-3">
                <Text className="font-display text-2xl font-bold text-text-primary">
                  What&apos;s your app called?
                </Text>
                <TextInput
                  value={appName}
                  onChangeText={setAppName}
                  placeholder="FocusFlow"
                  placeholderTextColor="#64748B"
                  autoFocus
                  accessibilityLabel="App name"
                  className="rounded-2xl border border-border-med bg-bg-card px-4 py-3 font-body text-base text-text-primary"
                />
              </View>
            )}

            {step === 1 && (
              <View className="gap-3">
                <Text className="font-display text-2xl font-bold text-text-primary">
                  Your one-liner
                </Text>
                <Text className="font-body text-sm text-text-secondary">
                  One sentence that nails the value.
                </Text>
                <TextInput
                  value={oneLiner}
                  onChangeText={setOneLiner}
                  placeholder="Mindful task tracking for overwhelmed builders."
                  placeholderTextColor="#64748B"
                  multiline
                  accessibilityLabel="One-liner description"
                  className="min-h-[88px] rounded-2xl border border-border-med bg-bg-card px-4 py-3 font-body text-base text-text-primary"
                  style={{ textAlignVertical: "top" }}
                />
              </View>
            )}

            {step === 2 && (
              <View className="gap-3">
                <Text className="font-display text-2xl font-bold text-text-primary">
                  Who is it for?
                </Text>
                <TextInput
                  value={audience}
                  onChangeText={setAudience}
                  placeholder="Solo founders, indie hackers, freelancers"
                  placeholderTextColor="#64748B"
                  accessibilityLabel="Target audience"
                  className="rounded-2xl border border-border-med bg-bg-card px-4 py-3 font-body text-base text-text-primary"
                />
              </View>
            )}

            {step === 3 && (
              <View className="gap-3">
                <Text className="font-display text-2xl font-bold text-text-primary">
                  Platform
                </Text>
                <View className="flex-row flex-wrap gap-2">
                  {PLATFORMS.map((p) => (
                    <Chip
                      key={p.id}
                      label={p.label}
                      active={platform === p.id}
                      onPress={() => setPlatform(p.id)}
                    />
                  ))}
                </View>
              </View>
            )}

            {step === 4 && (
              <View className="gap-3">
                <Text className="font-display text-2xl font-bold text-text-primary">
                  Current stage
                </Text>
                <View className="flex-row flex-wrap gap-2">
                  {STAGES.map((s) => (
                    <Chip
                      key={s.id}
                      label={s.label}
                      active={stage === s.id}
                      onPress={() => setStage(s.id)}
                    />
                  ))}
                </View>
              </View>
            )}

            {step === 5 && (
              <View className="gap-3">
                <Text className="font-display text-2xl font-bold text-text-primary">
                  Target launch
                </Text>
                <Text className="font-body text-sm text-text-secondary">
                  Optional — you can change this later.
                </Text>
                <View className="flex-row flex-wrap gap-2">
                  {DATE_OPTIONS.map((d) => (
                    <Chip
                      key={d.label}
                      label={d.label}
                      active={dateOffset === d.offset}
                      onPress={() => setDateOffset(d.offset)}
                    />
                  ))}
                </View>
              </View>
            )}

            {step === 6 && (
              <View className="gap-2">
                <Text className="font-display text-2xl font-bold text-text-primary">
                  Ready for launch prep 🚀
                </Text>
                <Text className="font-body text-sm text-text-secondary">
                  {appName || "Your app"} — “{oneLiner || "your one-liner"}” for{" "}
                  {audience || "your audience"} on {platform}. We&apos;ll set up
                  your milestones and Blueprints.
                </Text>
              </View>
            )}
          </ScrollView>

          {/* Footer nav */}
          <View className="flex-row gap-2 px-6 pb-4">
            {step > 0 ? (
              <Button
                label="Back"
                variant="ghost"
                onPress={() => setStep((s) => s - 1)}
              />
            ) : null}
            <View className="flex-1">
              {step < TOTAL - 1 ? (
                <Button
                  label="Continue"
                  fullWidth
                  disabled={!canNext}
                  onPress={() => setStep((s) => s + 1)}
                />
              ) : (
                <Button
                  label="Create my Mission"
                  fullWidth
                  loading={submitting}
                  onPress={finish}
                />
              )}
            </View>
          </View>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </ScreenBackground>
  );
}
