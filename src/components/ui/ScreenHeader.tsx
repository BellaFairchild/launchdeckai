import React from "react";
import { View, Text } from "@/tw";

type Props = {
  title: string;
  subtitle?: string;
  /** Optional element rendered on the right (e.g. FuelBadge, action). */
  right?: React.ReactNode;
  /** Optional element rendered on the left (e.g. menu/back button). */
  left?: React.ReactNode;
};

export function ScreenHeader({ title, subtitle, right, left }: Props) {
  return (
    <View className="flex-row items-center gap-3 px-5 pb-3 pt-2">
      {left ? <View>{left}</View> : null}
      <View className="flex-1">
        <Text className="font-display text-2xl font-bold text-text-primary">
          {title}
        </Text>
        {subtitle ? (
          <Text className="font-body text-sm text-text-secondary">{subtitle}</Text>
        ) : null}
      </View>
      {right ? <View>{right}</View> : null}
    </View>
  );
}
