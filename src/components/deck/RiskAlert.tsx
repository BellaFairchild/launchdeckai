import { useRouter } from "expo-router";
import React from "react";
import type { ViewStyle } from "react-native";

import { colors } from "@/constants/colors";
import { haptics } from "@/lib/haptics";
import { cn } from "@/lib/cn";
import { riskActionLabel, type Risk, type RiskSeverity } from "@/lib/risks";
import { Pressable, Text, View } from "@/tw";
import { GradientView } from "@/components/ui/GradientView";
import { Icon } from "@/components/ui/Icon";

const GLOW: ViewStyle = {
  shadowColor: colors.statusError,
  shadowOpacity: 0.22,
  shadowRadius: 20,
  shadowOffset: { width: 0, height: 10 },
  elevation: 10,
};

const SEVERITY: Record<RiskSeverity, { label: string; pill: string; text: string }> = {
  high: {
    label: "High",
    pill: "border-status-error/50 bg-status-error/15",
    text: "text-status-error",
  },
  med: {
    label: "Med",
    pill: "border-brand-gold/50 bg-brand-gold/15",
    text: "text-brand-gold",
  },
};

function SeverityPill({ severity }: { severity: RiskSeverity }) {
  const s = SEVERITY[severity];
  return (
    <View className={cn("rounded-full border px-2.5 py-1", s.pill)}>
      <Text className={cn("font-mono text-[10px] uppercase tracking-wider", s.text)}>
        {s.label}
      </Text>
    </View>
  );
}

/**
 * Critical-risk alert for the Deck. Lists the most pressing launch gaps (from the
 * risk engine) and routes the commander straight to where each is resolved.
 * Renders nothing when there are no risks — the Deck stays calm when all-clear.
 */
export function RiskAlert({ risks }: { risks: Risk[] }) {
  const router = useRouter();
  if (risks.length === 0) return null;

  const shown = risks.slice(0, 3);
  const topTarget = shown[0].target;

  const go = (target: Risk["target"]) => {
    haptics.warning();
    router.push(target);
  };

  return (
    <View
      style={GLOW}
      className="relative overflow-hidden rounded-3xl border border-status-error/40"
    >
      <GradientView colors={["#2A1115", "#100A12"]} />
      <View
        pointerEvents="none"
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          height: 1,
          backgroundColor: "rgba(255,94,94,0.15)",
        }}
      />
      <View className="p-4">
        <View className="flex-row items-center gap-2">
          <Icon name="alert" size={18} color={colors.statusError} />
          <Text className="font-display text-base font-bold text-status-error">
            Critical Risk Detected
          </Text>
        </View>

        <View className="mt-3 gap-2">
          {shown.map((risk) => (
            <Pressable
              key={risk.id}
              onPress={() => go(risk.target)}
              accessibilityRole="button"
              accessibilityLabel={`${risk.label}. Severity ${SEVERITY[risk.severity].label}.`}
              className="flex-row items-center gap-3 rounded-2xl border border-border-default bg-bg-deep/60 px-3.5 py-3 active:opacity-80"
            >
              <Text className="flex-1 font-body text-sm text-text-primary">
                {risk.label}
              </Text>
              <SeverityPill severity={risk.severity} />
            </Pressable>
          ))}
        </View>

        <Pressable
          onPress={() => go(topTarget)}
          accessibilityRole="button"
          className="mt-3 min-h-[44px] flex-row items-center justify-center rounded-2xl border border-status-error/40 bg-status-error/10 px-4 py-3 active:opacity-80"
        >
          <Text className="font-body text-sm font-semibold text-status-error">
            {riskActionLabel(topTarget)}
          </Text>
        </Pressable>
      </View>
    </View>
  );
}
