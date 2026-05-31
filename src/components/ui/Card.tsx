import React from "react";
import { Pressable, View } from "@/tw";
import { cn } from "@/lib/cn";

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
};

const VARIANT: Record<CardVariant, string> = {
  glass: "bg-bg-card border border-border-default",
  elevated: "bg-bg-surface border border-border-med",
  premium: "bg-bg-card border border-brand-gold/50",
  warning: "bg-bg-card border border-status-warning/50",
  success: "bg-bg-card border border-status-success/50",
};

export function Card({ children, variant = "glass", onPress, className }: Props) {
  const classes = cn("rounded-3xl p-4", VARIANT[variant], className);
  if (onPress) {
    return (
      <Pressable onPress={onPress} className={cn(classes, "active:opacity-90")}>
        {children}
      </Pressable>
    );
  }
  return <View className={classes}>{children}</View>;
}
