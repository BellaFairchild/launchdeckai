import { useConvexAuth, useMutation } from "convex/react";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useCallback, useEffect, useMemo, useState } from "react";
import { KeyboardAvoidingView, Platform } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { ScreenBackground } from "@/components/layout/ScreenBackground";
import { Button } from "@/components/ui/Button";
import { track } from "@/lib/analytics";
import { playSignature } from "@/lib/audio";
import { authEnabled } from "@/lib/auth";
import { cn } from "@/lib/cn";
import { haptics } from "@/lib/haptics";
import {
  clearOnboardingDraft,
  getOnboardingDraft,
  saveOnboardingDraft,
} from "@/lib/onboardingDraft";
import { useMissionStore } from "@/store/mission";
import { Pressable, ScrollView, Text, TextInput, View } from "@/tw";
import type { Platform as AppPlatform, MissionStage } from "@/types";
import { api } from "@cvx/_generated/api";

const DAY = 24 * 60 * 60 * 1000;

type OnboardingPhase = "intent" | "mission" | "full";

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

function resolvePhase(
  phaseParam: string | string[] | undefined,
  isAuthenticated: boolean,
): OnboardingPhase {
  const raw = Array.isArray(phaseParam) ? phaseParam[0] : phaseParam;
  if (raw === "intent") return "intent";
  if (raw === "mission") return "mission";
  if (authEnabled && !isAuthenticated) return "intent";
  if (isAuthenticated) return "mission";
  return "full";
}

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
  const params = useLocalSearchParams<{ phase?: string }>();
  const { isAuthenticated } = useConvexAuth();
  const updateMission = useMissionStore((s) => s.updateMission);
  const createMission = useMutation(api.missions.createMission);
  const [submitting, setSubmitting] = useState(false);
  const [hydrated, setHydrated] = useState(false);

  const phase = resolvePhase(params.phase, isAuthenticated);

  const minStep = phase === "mission" ? 3 : 0;
  const maxStep = phase === "intent" ? 2 : 6;
  const totalSteps = phase === "intent" ? 3 : phase === "mission" ? 4 : 7;

  const [step, setStep] = useState(minStep);
  const [appName, setAppName] = useState("");
  const [oneLiner, setOneLiner] = useState("");
  const [audience, setAudience] = useState("");
  const [platform, setPlatform] = useState<AppPlatform>("ios");
  const [stage, setStage] = useState<MissionStage>("building");
  const [dateOffset, setDateOffset] = useState<number | null>(14 * DAY);

  useEffect(() => {
    let cancelled = false;
    void getOnboardingDraft().then((draft) => {
      if (cancelled || !draft) {
        if (!cancelled) setHydrated(true);
        return;
      }
      setAppName(draft.appName);
      setOneLiner(draft.oneLiner);
      setAudience(draft.audience);
      if (phase === "intent") {
        setStep(Math.min(Math.max(draft.step, 0), 2));
      } else if (phase === "full") {
        setStep(Math.min(Math.max(draft.step, 0), 6));
      } else {
        setStep(Math.min(Math.max(draft.step, 3), 6));
      }
      if (!cancelled) setHydrated(true);
    });
    return () => {
      cancelled = true;
    };
  }, [phase]);

  const progressIndex = phase === "mission" ? step - 3 : step;
  const progressLabel = `${progressIndex + 1}/${totalSteps}`;

  const canNext =
    (step === 0 && appName.trim().length > 0) ||
    (step === 1 && oneLiner.trim().length > 0) ||
    (step === 2 && audience.trim().length > 0) ||
    step >= 3;

  const persistIntentDraft = useCallback(
    async (nextStep: number) => {
      await saveOnboardingDraft({
        appName: appName.trim(),
        oneLiner: oneLiner.trim(),
        audience: audience.trim(),
        step: nextStep,
      });
    },
    [appName, oneLiner, audience],
  );

  const handleContinue = useCallback(async () => {
    if (step <= 2) {
      const nextStep = step + 1;
      await persistIntentDraft(Math.min(nextStep, 2));

      if (step === 2) {
        if (authEnabled && !isAuthenticated) {
          router.replace("/(auth)/save-plan");
          return;
        }
        if (phase === "intent") {
          router.replace("/(auth)/onboarding?phase=mission");
          return;
        }
      }

      setStep(nextStep);
      return;
    }

    if (step < maxStep) {
      setStep((s) => s + 1);
    }
  }, [
    step,
    persistIntentDraft,
    isAuthenticated,
    phase,
    maxStep,
    router,
  ]);

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
        await clearOnboardingDraft();
        celebrate();
        router.replace("/(tabs)/deck");
      } catch {
        setSubmitting(false);
      }
      return;
    }

    updateMission({ ...payload, status: "active" });
    celebrate();
    router.replace("/(tabs)/deck");
  };

  const showBack = step > minStep;
  const isConfirmStep = step === 6;
  const headerLabel = useMemo(() => {
    if (phase === "intent") return "Intent capture";
    return "Mission setup";
  }, [phase]);

  if (!hydrated) {
    return (
      <ScreenBackground>
        <SafeAreaView style={{ flex: 1 }} edges={["top", "bottom"]} />
      </ScreenBackground>
    );
  }

  return (
    <ScreenBackground>
      <SafeAreaView style={{ flex: 1 }} edges={["top", "bottom"]}>
        <KeyboardAvoidingView
          style={{ flex: 1 }}
          behavior={Platform.OS === "ios" ? "padding" : undefined}
        >
          <View className="flex-row gap-1.5 px-5 pt-3">
            {Array.from({ length: totalSteps }).map((_, i) => (
              <View
                key={i}
                className={cn(
                  "h-1.5 flex-1 rounded-full",
                  i <= progressIndex ? "bg-brand-teal" : "bg-border-default",
                )}
              />
            ))}
          </View>

          <ScrollView contentContainerClassName="flex-1 gap-4 px-6 py-6">
            <Text className="font-mono text-xs uppercase tracking-[2px] text-brand-teal">
              {headerLabel} · {progressLabel}
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

          <View className="gap-2 px-6 pb-4">
            <View className="flex-row gap-2">
              {showBack ? (
                <Button
                  label="Back"
                  variant="ghost"
                  onPress={() => setStep((s) => Math.max(minStep, s - 1))}
                />
              ) : null}
              <View className="flex-1">
                {!isConfirmStep ? (
                  <Button
                    label="Continue"
                    fullWidth
                    disabled={!canNext}
                    onPress={() => void handleContinue()}
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
            {isConfirmStep ? (
              <Pressable
                onPress={() => router.push("/(modals)/refuel")}
                accessibilityRole="link"
                accessibilityLabel="See what Commander unlocks"
                className="items-center py-2"
              >
                <Text className="text-center font-body text-xs text-text-tertiary">
                  See what Commander unlocks
                </Text>
              </Pressable>
            ) : null}
          </View>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </ScreenBackground>
  );
}
