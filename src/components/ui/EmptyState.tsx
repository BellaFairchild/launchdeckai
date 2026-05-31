import React from "react";
import { View, Text } from "@/tw";
import { Button } from "./Button";

type Props = {
  /** Emoji or short glyph shown above the title. */
  icon?: string;
  title: string;
  message?: string;
  ctaLabel?: string;
  onCtaPress?: () => void;
};

export function EmptyState({ icon = "🛰️", title, message, ctaLabel, onCtaPress }: Props) {
  return (
    <View className="items-center justify-center gap-3 px-8 py-12">
      <Text className="text-4xl">{icon}</Text>
      <Text className="text-center font-display text-lg font-bold text-text-primary">
        {title}
      </Text>
      {message ? (
        <Text className="text-center font-body text-sm text-text-secondary">
          {message}
        </Text>
      ) : null}
      {ctaLabel && onCtaPress ? (
        <Button label={ctaLabel} onPress={onCtaPress} size="sm" className="mt-2" />
      ) : null}
    </View>
  );
}
