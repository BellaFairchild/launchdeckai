import { useAction } from "convex/react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { FadeIn } from "react-native-reanimated";

import {
    AstroVoiceDock,
    type DictationTarget,
    type VoiceField,
} from "@/components/onboarding/AstroVoiceDock";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { INTENT_COACH, type CoachLine } from "@/constants/onboardingCoach";
import { DIALOGUE } from "@/constants/onboardingDialogue";
import { track } from "@/lib/analytics";
import { cn } from "@/lib/cn";
import { haptics } from "@/lib/haptics";
import { Pressable, ScrollView, Text, TextInput, View } from "@/tw";
import { Animated } from "@/tw/animated";
import { api } from "@cvx/_generated/api";

export type IntentData = {
  appName: string;
  oneLiner: string;
  audience: string;
  pitch: string;
};

type SubPhase = "pitch" | "forging" | "results" | "manual";

type FocusField = "name" | "oneLiner" | "audience";

const FIELD_TO_VOICE: Record<FocusField, VoiceField> = {
  name: "app_name",
  oneLiner: "one_liner",
  audience: "audience",
};

type Props = {
  initial?: Partial<IntentData>;
  onComplete: (data: IntentData) => void | Promise<void>;
};

const PITCH = DIALOGUE.pitch;

export function IntentPitchStep({ initial, onComplete }: Props) {
  const forge = useAction(api.ai.generateMissionBrief);

  const [subPhase, setSubPhase] = useState<SubPhase>(
    initial?.appName ? "results" : "pitch",
  );
  const [pitch, setPitch] = useState(initial?.pitch ?? "");
  const [appName, setAppName] = useState(initial?.appName ?? "");
  const [oneLiner, setOneLiner] = useState(initial?.oneLiner ?? "");
  const [audience, setAudience] = useState(initial?.audience ?? "");
  const [edited, setEdited] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [phraseIndex, setPhraseIndex] = useState(0);
  const [focused, setFocused] = useState<FocusField | null>(null);

  // Rotate the forging phrases while the action is in flight.
  useEffect(() => {
    if (subPhase !== "forging") return;
    const id = setInterval(() => {
      setPhraseIndex((i) => (i + 1) % PITCH.forgePhrases.length);
    }, 1100);
    return () => clearInterval(id);
  }, [subPhase]);

  const canForge = pitch.trim().length >= 12;
  const canConfirm =
    appName.trim().length > 0 &&
    oneLiner.trim().length > 0 &&
    audience.trim().length > 0;

  const handleForge = useCallback(async () => {
    if (!canForge) return;
    haptics.light();
    setError(null);
    setPhraseIndex(0);
    setSubPhase("forging");
    try {
      const res = await forge({ pitch: pitch.trim() });
      setAppName(res.name);
      setOneLiner(res.oneLiner);
      setAudience(res.audience);
      setEdited(false);
      setSubPhase("results");
      track("pitch_forged", { mock: res.mock });
    } catch {
      setError(PITCH.error);
      setSubPhase("manual");
    }
  }, [canForge, forge, pitch]);

  const handleConfirm = useCallback(() => {
    if (!canConfirm) return;
    haptics.light();
    void onComplete({
      appName: appName.trim(),
      oneLiner: oneLiner.trim(),
      audience: audience.trim(),
      pitch: pitch.trim() || oneLiner.trim(),
    });
  }, [canConfirm, onComplete, appName, oneLiner, audience, pitch]);

  const editField = useCallback(
    (set: (v: string) => void) => (next: string) => {
      set(next);
      setEdited(true);
    },
    [],
  );

  // Voice dock wiring: dictate into the pitch box (pitch phase) or the focused
  // field (results / manual). Coach line tracks the sub-phase.
  const { voiceField, dictationTarget, coach } = useMemo((): {
    voiceField?: VoiceField;
    dictationTarget?: DictationTarget;
    coach: CoachLine;
  } => {
    if (subPhase === "pitch") {
      return {
        voiceField: "pitch",
        dictationTarget: { value: pitch, onChange: setPitch },
        coach: INTENT_COACH.pitch,
      };
    }
    const coachLine =
      subPhase === "manual" ? INTENT_COACH.manual : INTENT_COACH.results;
    if (focused) {
      const target: DictationTarget =
        focused === "name"
          ? { value: appName, onChange: editField(setAppName) }
          : focused === "oneLiner"
            ? { value: oneLiner, onChange: editField(setOneLiner) }
            : { value: audience, onChange: editField(setAudience) };
      return { voiceField: FIELD_TO_VOICE[focused], dictationTarget: target, coach: coachLine };
    }
    return { coach: coachLine };
  }, [subPhase, pitch, focused, appName, oneLiner, audience, editField]);

  return (
    <View className="flex-1">
      {/* 2-step intent progress: pitch → brief */}
      <View className="flex-row gap-1.5 px-5 pt-3">
        {[0, 1].map((i) => (
          <View
            key={i}
            className={cn(
              "h-1.5 flex-1 rounded-full",
              (subPhase === "pitch" ? 0 : 1) >= i
                ? "bg-brand-teal"
                : "bg-border-default",
            )}
          />
        ))}
      </View>

      <ScrollView contentContainerClassName="grow gap-4 px-6 py-6">
        <Text className="font-mono text-xs uppercase tracking-[2px] text-brand-teal">
          Mission briefing
        </Text>

        {subPhase === "pitch" && (
          <Animated.View entering={FadeIn.duration(400)} className="gap-3">
            <Text className="font-display text-2xl font-bold text-text-primary">
              What are you building?
            </Text>
            <Text className="font-body text-sm text-text-secondary">
              {PITCH.prompt}
            </Text>
            <TextInput
              value={pitch}
              onChangeText={setPitch}
              placeholder={PITCH.placeholder}
              placeholderTextColor="#64748B"
              multiline
              autoFocus
              accessibilityLabel="Your pitch"
              className="min-h-[160px] rounded-2xl border border-border-med bg-bg-card px-4 py-3 font-body text-base text-text-primary"
              style={{ textAlignVertical: "top" }}
            />
            <Text className="font-body text-xs text-text-tertiary">
              {PITCH.micro}
            </Text>
          </Animated.View>
        )}

        {subPhase === "forging" && (
          <Animated.View
            entering={FadeIn.duration(400)}
            className="grow items-center justify-center gap-4 py-12"
          >
            <View className="h-12 w-12 items-center justify-center rounded-full border-2 border-brand-teal bg-brand-teal/15">
              <Text className="font-mono text-base text-brand-teal">✦</Text>
            </View>
            <Text className="font-body text-base text-text-secondary">
              {PITCH.forgePhrases[phraseIndex]}
            </Text>
          </Animated.View>
        )}

        {(subPhase === "results" || subPhase === "manual") && (
          <Animated.View entering={FadeIn.duration(400)} className="gap-3">
            <Text className="font-display text-2xl font-bold text-text-primary">
              {subPhase === "results" ? "Your mission brief" : "Your app, your words"}
            </Text>
            {error ? (
              <Text className="font-body text-sm text-status-error">{error}</Text>
            ) : (
              <Text className="font-body text-sm text-text-secondary">
                {subPhase === "results" ? PITCH.resultsIntro : null}
              </Text>
            )}

            <EditableField
              label={PITCH.fieldLabels.name}
              value={appName}
              onChangeText={editField(setAppName)}
              placeholder="FocusFlow"
              onFocus={() => setFocused("name")}
              onBlur={() => setFocused(null)}
            />
            <EditableField
              label={PITCH.fieldLabels.oneLiner}
              value={oneLiner}
              onChangeText={editField(setOneLiner)}
              placeholder="Mindful task tracking for overwhelmed builders."
              multiline
              onFocus={() => setFocused("oneLiner")}
              onBlur={() => setFocused(null)}
            />
            <EditableField
              label={PITCH.fieldLabels.audience}
              value={audience}
              onChangeText={editField(setAudience)}
              placeholder="Solo founders, indie hackers, freelancers"
              onFocus={() => setFocused("audience")}
              onBlur={() => setFocused(null)}
            />

            {subPhase === "results" && edited ? (
              <Text className="font-body text-xs text-brand-teal">
                {PITCH.lockedIn}
              </Text>
            ) : null}
          </Animated.View>
        )}
      </ScrollView>

      <View className="gap-2 px-6 pb-4">
        {subPhase === "pitch" ? (
          <>
            <Button
              label={PITCH.forgeCta}
              fullWidth
              disabled={!canForge}
              onPress={() => void handleForge()}
            />
            <Pressable
              onPress={() => {
                haptics.light();
                setSubPhase("manual");
              }}
              accessibilityRole="button"
              accessibilityLabel={PITCH.manualCta}
              className="items-center py-2"
            >
              <Text className="font-body text-xs text-text-tertiary">
                {PITCH.manualCta}
              </Text>
            </Pressable>
          </>
        ) : null}

        {subPhase === "results" ? (
          <>
            <Button
              label={PITCH.confirmCta}
              fullWidth
              disabled={!canConfirm}
              onPress={handleConfirm}
            />
            <Pressable
              onPress={() => {
                haptics.light();
                setSubPhase("pitch");
              }}
              accessibilityRole="button"
              accessibilityLabel="Re-forge from a new pitch"
              className="items-center py-2"
            >
              <Text className="font-body text-xs text-text-tertiary">
                {PITCH.reforgeCta}
              </Text>
            </Pressable>
          </>
        ) : null}

        {subPhase === "manual" ? (
          <Button
            label={PITCH.confirmCta}
            fullWidth
            disabled={!canConfirm}
            onPress={handleConfirm}
          />
        ) : null}
      </View>

      {subPhase !== "forging" ? (
        <AstroVoiceDock
          step={0}
          field={voiceField}
          dictationTarget={dictationTarget}
          coach={coach}
        />
      ) : null}
    </View>
  );
}

function EditableField({
  label,
  value,
  onChangeText,
  placeholder,
  multiline,
  onFocus,
  onBlur,
}: {
  label: string;
  value: string;
  onChangeText: (next: string) => void;
  placeholder: string;
  multiline?: boolean;
  onFocus: () => void;
  onBlur: () => void;
}) {
  return (
    <Card className="gap-1.5">
      <Text className="font-mono text-[11px] uppercase tracking-[1.5px] text-text-tertiary">
        {label}
      </Text>
      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor="#64748B"
        multiline={multiline}
        onFocus={onFocus}
        onBlur={onBlur}
        accessibilityLabel={label}
        className="font-body text-base text-text-primary"
        style={multiline ? { textAlignVertical: "top" } : undefined}
      />
    </Card>
  );
}
