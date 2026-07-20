import { useConvexAuth, useMutation } from "convex/react";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useCallback, useEffect, useState } from "react";
import {
    KeyboardAvoidingView,
    Platform,
    type ImageSourcePropType,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { ScreenBackground } from "@/components/layout/ScreenBackground";
import { AstroVoiceDock } from "@/components/onboarding/AstroVoiceDock";
import {
    IntentPitchStep,
    type IntentData,
} from "@/components/onboarding/IntentPitchStep";
import { Button } from "@/components/ui/Button";
import {
    launchDateIcons,
    type LaunchDateKey,
} from "@/constants/launchDateIcons";
import { platformIcons } from "@/constants/platformIcons";
import { stageIcons } from "@/constants/stageIcons";
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
import { Pressable, ScrollView, Text, View } from "@/tw";
import { Image } from "@/tw/image";
import type { Platform as AppPlatform, MissionStage } from "@/types";
import { api } from "@cvx/_generated/api";

const DAY = 24 * 60 * 60 * 1000;

type OnboardingPhase = "intent" | "mission" | "full";

const PLATFORMS: { id: AppPlatform; label: string; subtitle: string }[] = [
  { id: "ios", label: "iOS", subtitle: "App Store" },
  { id: "android", label: "Android", subtitle: "Google Play" },
  { id: "both", label: "Both", subtitle: "App Store + Google Play" },
];

const STAGES: { id: MissionStage; label: string }[] = [
  { id: "building", label: "Building" },
  { id: "testing", label: "Testing" },
  { id: "store_prep", label: "Store Prep" },
  { id: "ready_to_submit", label: "Ready to Submit" },
];

const DATE_OPTIONS: {
  id: LaunchDateKey;
  label: string;
  offset: number | null;
}[] = [
  { id: "two_weeks", label: "~2 weeks", offset: 14 * DAY },
  { id: "one_month", label: "~1 month", offset: 30 * DAY },
  { id: "three_months", label: "~3 months", offset: 90 * DAY },
  { id: "not_sure", label: "Not sure yet", offset: null },
];

/** Mission phase covers absolute steps 3-6 (platform, stage, date, confirm). */
const MISSION_MIN_STEP = 3;
const MISSION_MAX_STEP = 6;
const MISSION_TOTAL = MISSION_MAX_STEP - MISSION_MIN_STEP + 1;

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

function PlatformOption({
  label,
  subtitle,
  icon,
  active,
  onPress,
}: {
  label: string;
  subtitle: string;
  icon: (typeof platformIcons)[AppPlatform];
  active: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={`${label}, ${subtitle}`}
      accessibilityState={{ selected: active }}
      className={cn(
        "min-w-0 flex-1 items-center rounded-2xl border px-2 py-3.5",
        active
          ? "border-brand-teal bg-brand-teal/15"
          : "border-border-med bg-bg-surface",
      )}
    >
      <Image
        source={icon}
        accessibilityIgnoresInvertColors
        className="h-14 w-14"
        style={{ objectFit: "contain" }}
      />
      <Text
        className={cn(
          "mt-2 text-center font-body text-sm font-semibold",
          active ? "text-brand-teal" : "text-text-primary",
        )}
      >
        {label}
      </Text>
      <Text className="mt-0.5 text-center font-body text-[11px] leading-tight text-text-tertiary">
        {subtitle}
      </Text>
    </Pressable>
  );
}

function StageOption({
  label,
  icon,
  active,
  onPress,
}: {
  label: string;
  icon: ImageSourcePropType;
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
        "min-w-0 flex-1 items-center rounded-2xl border px-2 py-3.5",
        active
          ? "border-brand-teal bg-brand-teal/15"
          : "border-border-med bg-bg-surface",
      )}
    >
      <Image
        source={icon}
        accessibilityIgnoresInvertColors
        className="h-14 w-14"
        style={{ objectFit: "contain" }}
      />
      <Text
        className={cn(
          "mt-2 text-center font-body text-sm font-semibold",
          active ? "text-brand-teal" : "text-text-primary",
        )}
      >
        {label}
      </Text>
    </Pressable>
  );
}

export default function OnboardingScreen() {
  if (!authEnabled) {
    return <OnboardingScreenContent isAuthenticated={false} />;
  }
  return <AuthenticatedOnboardingScreen />;
}

function AuthenticatedOnboardingScreen() {
  const { isAuthenticated } = useConvexAuth();
  const createMission = useMutation(api.missions.createMission);
  return (
    <OnboardingScreenContent
      isAuthenticated={isAuthenticated}
      createMission={createMission}
    />
  );
}

type OnboardingScreenContentProps = {
  isAuthenticated: boolean;
  createMission?: (payload: {
    appName: string;
    oneLiner: string;
    appDescription: string;
    targetAudience: string;
    platform: AppPlatform;
    stage: MissionStage;
    launchDate?: number;
  }) => Promise<unknown>;
};

function OnboardingScreenContent({
  isAuthenticated,
  createMission,
}: OnboardingScreenContentProps) {
  const router = useRouter();
  const params = useLocalSearchParams<{ phase?: string }>();
  const updateMission = useMissionStore((s) => s.updateMission);
  const [submitting, setSubmitting] = useState(false);
  const [hydrated, setHydrated] = useState(false);

  const phase = resolvePhase(params.phase, isAuthenticated);

  const [step, setStep] = useState(MISSION_MIN_STEP);
  const [appName, setAppName] = useState("");
  const [oneLiner, setOneLiner] = useState("");
  const [audience, setAudience] = useState("");
  const [pitch, setPitch] = useState("");
  const [platform, setPlatform] = useState<AppPlatform>("ios");
  const [stage, setStage] = useState<MissionStage>("building");
  const [dateOffset, setDateOffset] = useState<number | null>(14 * DAY);

  useEffect(() => {
    let cancelled = false;
    void getOnboardingDraft().then((draft) => {
      if (cancelled) return;
      if (draft) {
        setAppName(draft.appName);
        setOneLiner(draft.oneLiner);
        setAudience(draft.audience);
        setPitch(draft.pitch ?? "");
        if (phase === "mission") {
          setStep(Math.min(Math.max(draft.step, MISSION_MIN_STEP), MISSION_MAX_STEP));
        }
      }
      setHydrated(true);
    });
    return () => {
      cancelled = true;
    };
  }, [phase]);

  // The intent phase (pitch → AI brief) is its own self-contained component.
  // "full" (demo) starts in intent and advances to the mission steps in-place.
  const [intentDone, setIntentDone] = useState(phase === "mission");
  const inIntent = phase === "intent" || (phase === "full" && !intentDone);

  const handleIntentComplete = useCallback(
    async (data: IntentData) => {
      setAppName(data.appName);
      setOneLiner(data.oneLiner);
      setAudience(data.audience);
      setPitch(data.pitch);
      await saveOnboardingDraft({
        appName: data.appName,
        oneLiner: data.oneLiner,
        audience: data.audience,
        pitch: data.pitch,
        step: 2,
      });

      if (authEnabled && !isAuthenticated) {
        router.replace("/(auth)/save-plan");
        return;
      }
      if (phase === "intent") {
        router.replace("/(auth)/onboarding?phase=mission");
        return;
      }
      // full / demo: continue to the mission steps in this same screen.
      setIntentDone(true);
      setStep(MISSION_MIN_STEP);
    },
    [isAuthenticated, phase, router],
  );

  const handleContinue = useCallback(() => {
    if (step < MISSION_MAX_STEP) setStep((s) => s + 1);
  }, [step]);

  const finish = async () => {
    if (submitting) return;
    const payload = {
      appName: appName.trim() || "My App",
      oneLiner: oneLiner.trim(),
      // Full pitch becomes the AI context for every future Foundry/Copilot call.
      appDescription: pitch.trim() || oneLiner.trim(),
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

    if (authEnabled && createMission) {
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

  if (!hydrated) {
    return (
      <ScreenBackground>
        <SafeAreaView style={{ flex: 1 }} edges={["top", "bottom"]} />
      </ScreenBackground>
    );
  }

  const missionIndex = step - MISSION_MIN_STEP;
  const isConfirmStep = step === MISSION_MAX_STEP;
  const showBack = step > MISSION_MIN_STEP;

  return (
    <ScreenBackground>
      <SafeAreaView style={{ flex: 1 }} edges={["top", "bottom"]}>
        <KeyboardAvoidingView
          style={{ flex: 1 }}
          behavior={Platform.OS === "ios" ? "padding" : undefined}
        >
          {inIntent ? (
            <IntentPitchStep
              initial={{ appName, oneLiner, audience, pitch }}
              onComplete={handleIntentComplete}
            />
          ) : (
            <>
              <View className="flex-row gap-1.5 px-5 pt-3">
                {Array.from({ length: MISSION_TOTAL }).map((_, i) => (
                  <View
                    key={i}
                    className={cn(
                      "h-1.5 flex-1 rounded-full",
                      i <= missionIndex ? "bg-brand-teal" : "bg-border-default",
                    )}
                  />
                ))}
              </View>

              <ScrollView contentContainerClassName="grow gap-4 px-6 py-6">
                <Text className="font-mono text-xs uppercase tracking-[2px] text-brand-teal">
                  Mission setup · {missionIndex + 1}/{MISSION_TOTAL}
                </Text>

                {step === 3 && (
                  <View className="gap-3">
                    <Text className="font-display text-2xl font-bold text-text-primary">
                      Platform
                    </Text>
                    <Text className="font-body text-sm text-text-secondary">
                      Where are you launching?
                    </Text>
                    <View className="flex-row gap-2">
                      {PLATFORMS.map((p) => (
                        <PlatformOption
                          key={p.id}
                          label={p.label}
                          subtitle={p.subtitle}
                          icon={platformIcons[p.id]}
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
                    <Text className="font-body text-sm text-text-secondary">
                      Where are you in the launch journey?
                    </Text>
                    <View className="flex-row flex-wrap gap-2">
                      {STAGES.map((s) => (
                        <View key={s.id} className="w-[48%]">
                          <StageOption
                            label={s.label}
                            icon={stageIcons[s.id]}
                            active={stage === s.id}
                            onPress={() => setStage(s.id)}
                          />
                        </View>
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
                        <View key={d.id} className="w-[48%]">
                          <StageOption
                            label={d.label}
                            icon={launchDateIcons[d.id]}
                            active={dateOffset === d.offset}
                            onPress={() => setDateOffset(d.offset)}
                          />
                        </View>
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
                      onPress={() =>
                        setStep((s) => Math.max(MISSION_MIN_STEP, s - 1))
                      }
                    />
                  ) : null}
                  <View className="flex-1">
                    {!isConfirmStep ? (
                      <Button
                        label="Continue"
                        fullWidth
                        onPress={handleContinue}
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
              <AstroVoiceDock step={step} />
            </>
          )}
        </KeyboardAvoidingView>
      </SafeAreaView>
    </ScreenBackground>
  );
}
