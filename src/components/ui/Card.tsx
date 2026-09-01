import React from "react";
import type { ViewStyle } from "react-native";

import { cn } from "@/lib/cn";
import { Pressable, View } from "@/tw";
import { GradientView } from "./GradientView";

export type CardVariant =
  | "glass"
  | "elevated"
  | "premium"
  | "warning"
  | "success";

type Props = {
  children: React.ReactNode;
  variant?: CardVariant;
  onPress?: () => void;
  className?: string;
  /** Overrides/extends the variant's outer glow (e.g. a gold completion glow). */
  style?: ViewStyle;
  testID?: string;
  accessibilityLabel?: string;
};

/** Subtle top→bottom surface gradients: a lit top edge fading into the deep. */
const SURFACE: Record<CardVariant, readonly string[]> = {
  glass: ["#15233B", "#0B1220"],
  elevated: ["#1B2B47", "#0C1626"],
  premium: ["#241A11", "#0F1018"],
  warning: ["#2A1C12", "#100E16"],
  success: ["#10241B", "#0B1420"],
};

const BORDER: Record<CardVariant, string> = {
  glass: "border border-border-default",
  elevated: "border border-border-med",
  premium: "border border-brand-gold/45",
  warning: "border border-status-warning/45",
  success: "border border-status-success/45",
};

/** Soft drop shadow / colored glow per variant (maps to box-shadow on web). */
const SHADOW: Record<CardVariant, ViewStyle> = {
  glass: shadow("#01040A", 0.5, 16, 8, 6),
  elevated: shadow("#01040A", 0.6, 22, 12, 10),
  premium: shadow("#F3B233", 0.22, 20, 10, 10),
  warning: shadow("#FF9B42", 0.18, 18, 10, 8),
  success: shadow("#4ADE80", 0.16, 18, 10, 8),
};

function shadow(
  color: string,
  opacity: number,
  radius: number,
  y: number,
  elevation: number,
): ViewStyle {
  return {
    shadowColor: color,
    shadowOpacity: opacity,
    shadowRadius: radius,
    shadowOffset: { width: 0, height: y },
    elevation,
  };
}

export function Card({
  children,
  variant = "glass",
  onPress,
  className,
  style,
  testID,
  accessibilityLabel,
}: Props) {
  const inner = (
    <>
      <GradientView colors={SURFACE[variant]} />
      {/* lit top edge */}
      <View
        pointerEvents="none"
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          height: 1,
          backgroundColor: "rgba(255,255,255,0.07)",
        }}
      />
      <View className="p-[15px]">{children}</View>
    </>
  );

  const classes = cn(
    "relative overflow-hidden rounded-3xl",
    BORDER[variant],
    className,
  );

  if (onPress) {
    return (
      <Pressable
        testID={testID}
        accessibilityLabel={accessibilityLabel}
        accessibilityRole="button"
        onPress={onPress}
        style={[SHADOW[variant], style]}
        className={cn(classes, "active:opacity-90")}
      >
        {inner}
      </Pressable>
    );
  }
  return (
    <View
      testID={testID}
      accessibilityLabel={accessibilityLabel}
      style={[SHADOW[variant], style]}
      className={classes}
    >
      {inner}
    </View>
  );
}
