import React from "react";
import { ActivityIndicator } from "react-native";
import { Pressable, Text, View } from "@/tw";
import { cn } from "@/lib/cn";

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
};

const CONTAINER: Record<ButtonVariant, string> = {
  primary: "bg-brand-teal active:opacity-90",
  secondary: "bg-bg-surface border border-border-med active:opacity-90",
  ghost: "bg-transparent active:opacity-70",
  premium: "bg-brand-gold active:opacity-90",
  danger: "bg-status-error active:opacity-90",
  locked: "bg-bg-depleted border border-border-default opacity-80",
};

const LABEL: Record<ButtonVariant, string> = {
  primary: "text-bg-deep",
  secondary: "text-text-primary",
  ghost: "text-brand-teal",
  premium: "text-bg-deep",
  danger: "text-white",
  locked: "text-text-tertiary",
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
}: Props) {
  const isDisabled = disabled || loading || variant === "locked";
  return (
    <Pressable
      onPress={isDisabled ? undefined : onPress}
      accessibilityRole="button"
      accessibilityState={{ disabled: isDisabled }}
      className={cn(
        "min-h-[44px] flex-row items-center justify-center gap-2 rounded-full",
        SIZE[size],
        CONTAINER[variant],
        fullWidth && "w-full",
        disabled && variant !== "locked" && "opacity-50",
        className,
      )}
    >
      {loading ? (
        <ActivityIndicator size="small" color="#060B14" />
      ) : (
        <>
          {left ? <View>{left}</View> : null}
          <Text className={cn("font-body font-semibold", TEXT_SIZE[size], LABEL[variant])}>
            {variant === "locked" ? `🔒 ${label}` : label}
          </Text>
        </>
      )}
    </Pressable>
  );
}
