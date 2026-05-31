import React from "react";
import Svg, { Circle } from "react-native-svg";
import { View, Text } from "@/tw";
import { colors } from "@/constants/colors";

type Props = {
  /** 0-100 */
  progress: number;
  size?: number;
  strokeWidth?: number;
  color?: string;
  trackColor?: string;
  /** Big number shown in the center; defaults to the rounded percent. */
  centerLabel?: string;
  /** Small caption under the center label. */
  caption?: string;
};

/** Circular progress ring — Mission Readiness, Blueprint progress, Signal readiness. */
export function ProgressRing({
  progress,
  size = 120,
  strokeWidth = 10,
  color = colors.brandTeal,
  trackColor = colors.borderDefault,
  centerLabel,
  caption,
}: Props) {
  const clamped = Math.max(0, Math.min(100, progress));
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const dashOffset = circumference * (1 - clamped / 100);
  const center = size / 2;

  return (
    <View
      accessibilityLabel={`${Math.round(clamped)} percent${caption ? ` ${caption}` : ""}`}
      style={{ width: size, height: size }}
      className="items-center justify-center"
    >
      <Svg width={size} height={size}>
        <Circle
          cx={center}
          cy={center}
          r={radius}
          stroke={trackColor}
          strokeWidth={strokeWidth}
          fill="none"
        />
        <Circle
          cx={center}
          cy={center}
          r={radius}
          stroke={color}
          strokeWidth={strokeWidth}
          fill="none"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={dashOffset}
          transform={`rotate(-90 ${center} ${center})`}
        />
      </Svg>
      <View className="absolute items-center">
        <Text className="font-display text-2xl font-bold text-text-primary">
          {centerLabel ?? `${Math.round(clamped)}%`}
        </Text>
        {caption ? (
          <Text className="font-mono text-[11px] uppercase tracking-wider text-text-tertiary">
            {caption}
          </Text>
        ) : null}
      </View>
    </View>
  );
}
