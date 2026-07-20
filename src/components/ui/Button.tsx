import React from "react";
import type { ViewStyle } from "react-native";
import { ActivityIndicator } from "react-native";

import { playClick, playLocked } from "@/lib/audio";
import { cn } from "@/lib/cn";
import { haptics } from "@/lib/haptics";
import { Pressable, Text, View } from "@/tw";
import { GradientView } from "./GradientView";
import { Icon } from "./Icon";

export type ButtonVariant =
  | "primary"
  | "secondary"
  | "ghost"
  | "premium"
  | "danger"
  | "locked";

type Props = {
  label: string;
  onPress?: () => void;
  variant?: ButtonVariant;
  size?: "sm" | "md" | "lg";
  disabled?: boolean;
  loading?: boolean;
  fullWidth?: boolean;
  /** Optional leading element (icon). */
  left?: React.ReactNode;
  className?: string;
  testID?: string;
  accessibilityLabel?: string;
};

/** Variants that paint a gradient fill behind their label. */
const FILL: Partial<Record<ButtonVariant, readonly string[]>> = {
  primary: ["#1426A8", "#10B7D6"], // launch gradient
  premium: ["#8B5327", "#F3B233"], // premium deck gradient
  danger: ["#FF7A6E", "#E2453F"],
};

const CONTAINER: Record<ButtonVariant, string> = {
  primary: "active:opacity-90",
  secondary: "bg-bg-surface border border-border-med active:opacity-90",
  ghost: "bg-transparent active:opacity-70",
  premium: "active:opacity-90",
  danger: "active:opacity-90",
  locked: "bg-bg-depleted border border-border-default opacity-80",
};

const LABEL: Record<ButtonVariant, string> = {
  primary: "text-white",
  secondary: "text-text-primary",
  ghost: "text-brand-teal",
  premium: "text-bg-deep",
  danger: "text-white",
  locked: "text-text-tertiary",
};

/** Color for the auto arrow / lock glyph, matched to the label. */
const GLYPH: Record<ButtonVariant, string> = {
  primary: "#FFFFFF",
  secondary: "#F5F7FA",
  ghost: "#4DC8C0",
  premium: "#060B14",
  danger: "#FFFFFF",
  locked: "#64748B",
};

const GLOW: Partial<Record<ButtonVariant, ViewStyle>> = {
  primary: {
    shadowColor: "#10B7D6",
    shadowOpacity: 0.45,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 6 },
    elevation: 8,
  },
  premium: {
    shadowColor: "#F3B233",
    shadowOpacity: 0.4,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 6 },
    elevation: 8,
  },
};

const SIZE = {
  sm: "px-4 py-2",
  md: "px-5 py-3",
  lg: "px-6 py-4",
} as const;

const TEXT_SIZE = {
  sm: "text-sm",
  md: "text-base",
  lg: "text-lg",
} as const;

const GLYPH_SIZE = { sm: 16, md: 18, lg: 20 } as const;

export function Button({
  label,
  onPress,
  variant = "primary",
  size = "md",
  disabled,
  loading,
  fullWidth,
  left,
  className,
  testID,
  accessibilityLabel,
}: Props) {
  const isDisabled = disabled || loading || variant === "locked";
  const fill = FILL[variant];

  // Strip a trailing arrow from the label and render it as a real icon instead.
  const trimmed = label.replace(/\s*[→›>]\s*$/, "");
  const hasArrow = trimmed !== label;
  const glyphColor = GLYPH[variant];

  return (
    <Pressable
      onPressIn={() => {
        if (variant === "locked") {
          playLocked();
          haptics.warning();
          return;
        }
        if (isDisabled) return;
        playClick();
        haptics.light();
      }}
      testID={testID}
      disabled={Boolean(disabled || loading)}
      onPress={isDisabled ? undefined : onPress}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel ?? trimmed}
      accessibilityState={{ disabled: isDisabled }}
      style={!isDisabled ? GLOW[variant] : undefined}
      className={cn(
        "relative min-h-[44px] flex-row items-center justify-center gap-2 overflow-hidden rounded-full",
        SIZE[size],
        CONTAINER[variant],
        fullWidth && "w-full",
        disabled && variant !== "locked" && "opacity-50",
        className,
      )}
    >
      {fill ? <GradientView colors={fill} direction="diagonal" /> : null}
      {loading ? (
        <ActivityIndicator size="small" color={glyphColor} />
      ) : (
        <>
          {variant === "locked" ? (
            <Icon name="lock" size={GLYPH_SIZE[size]} color={glyphColor} />
          ) : null}
          {left ? <View>{left}</View> : null}
          <Text
            className={cn(
              "font-body font-semibold",
              TEXT_SIZE[size],
              LABEL[variant],
            )}
          >
            {trimmed}
          </Text>
          {hasArrow ? (
            <Icon
              name="arrow-right"
              size={GLYPH_SIZE[size]}
              color={glyphColor}
            />
          ) : null}
        </>
      )}
    </Pressable>
  );
}
