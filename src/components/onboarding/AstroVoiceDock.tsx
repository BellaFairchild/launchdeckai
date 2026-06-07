import { useCallback, useRef } from "react";
import { useReducedMotion } from "react-native-reanimated";

import { AstroAvatar } from "@/components/astro/AstroAvatar";
import { COACH } from "@/constants/onboardingCoach";
import { track } from "@/lib/analytics";
import { cn } from "@/lib/cn";
import { haptics } from "@/lib/haptics";
import { useSpeechToText } from "@/lib/useSpeechToText";
import { Pressable, Text, View } from "@/tw";

export type DictationTarget = {
  value: string;
  onChange: (next: string) => void;
};

export type VoiceField = "app_name" | "one_liner" | "audience";

type Props = {
  /** Absolute onboarding step index (0-6). */
  step: number;
  /** Analytics field key; present on text steps only. */
  field?: VoiceField;
  /** The active text field's binding; present on text steps only. */
  dictationTarget?: DictationTarget;
  /** Future seam: a conversational handler for finalized utterances. */
  onUtterance?: (transcript: string) => void;
};

export function AstroVoiceDock({
  step,
  field,
  dictationTarget,
  onUtterance,
}: Props) {
  const coach = COACH[step] ?? COACH[0];
  const baseRef = useRef("");
  const reducedMotion = useReducedMotion();

  const { isAvailable, isListening, error, start, stop } = useSpeechToText({
    onResult: (text, isFinal) => {
      if (dictationTarget) {
        const sep = baseRef.current && text ? " " : "";
        dictationTarget.onChange(baseRef.current + sep + text);
      }
      if (isFinal) {
        if (field) track("onboarding_voice_used", { field });
        onUtterance?.(text);
      }
    },
  });

  const showMic = Boolean(dictationTarget) && isAvailable;

  const permissionDenied = error === "not-allowed";
  const bubbleText = isListening
    ? "Listening…"
    : permissionDenied && dictationTarget
      ? "Mic's off — enable it in Settings."
      : coach.line;

  const handleMicPress = useCallback(() => {
    if (isListening) {
      haptics.light();
      stop();
      return;
    }
    baseRef.current = dictationTarget?.value ?? "";
    haptics.light();
    void start();
  }, [isListening, stop, start, dictationTarget]);

  const orb = (
    <AstroAvatar plan="cadet" variant="orb" pose={coach.pose} size={52} />
  );

  return (
    <View
      pointerEvents="box-none"
      className="absolute bottom-24 right-4 items-end gap-2"
      style={{ maxWidth: 240 }}
    >
      <View
        className="rounded-2xl rounded-br-sm border border-border-med bg-bg-card px-3 py-2"
        style={{ maxWidth: 220 }}
      >
        <Text className="font-body text-xs text-text-secondary">
          {bubbleText}
        </Text>
      </View>

      {showMic ? (
        <Pressable
          onPress={handleMicPress}
          accessibilityRole="button"
          accessibilityLabel={isListening ? "Stop dictating" : "Dictate"}
          accessibilityState={{ busy: isListening }}
        >
          {orb}
          <View
            className={cn(
              "absolute -bottom-1 -right-1 h-6 w-6 items-center justify-center rounded-full border border-border-default",
              isListening ? "bg-brand-teal" : "bg-bg-surface",
            )}
            style={isListening && !reducedMotion ? { opacity: 0.92 } : undefined}
          >
            <Text style={{ fontSize: 11 }}>{isListening ? "■" : "🎤"}</Text>
          </View>
        </Pressable>
      ) : (
        <View accessible={false}>{orb}</View>
      )}
    </View>
  );
}
