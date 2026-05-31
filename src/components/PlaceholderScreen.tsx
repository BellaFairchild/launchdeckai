import React from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import { View, Text } from "@/tw";

type Props = {
  title: string;
  subtitle?: string;
  /** e.g. "Phase 6 · Deck" — shown as a small mono eyebrow */
  phase?: string;
};

/**
 * Temporary placeholder used while routes are scaffolded in Phase 1.
 * Replaced screen-by-screen in later build phases.
 */
export function PlaceholderScreen({ title, subtitle, phase }: Props) {
  return (
    <View className="flex-1 bg-bg-deep">
      <SafeAreaView style={{ flex: 1 }}>
        <View className="flex-1 items-center justify-center gap-3 px-8">
          {phase ? (
            <Text className="font-mono text-xs uppercase tracking-[2px] text-brand-teal">
              {phase}
            </Text>
          ) : null}
          <Text className="text-center font-display text-3xl font-bold text-text-primary">
            {title}
          </Text>
          {subtitle ? (
            <Text className="text-center font-body text-base text-text-secondary">
              {subtitle}
            </Text>
          ) : null}
        </View>
      </SafeAreaView>
    </View>
  );
}
