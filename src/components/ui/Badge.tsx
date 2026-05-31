import React from "react";
import { Text, View } from "@/tw";
import { cn } from "@/lib/cn";

export type BadgeVariant =
  | "plan"
  | "status"
  | "fuel"
  | "readiness"
  | "signal"
  | "locked";

type Props = {
  label: string;
  variant?: BadgeVariant;
  className?: string;
};

const CONTAINER: Record<BadgeVariant, string> = {
  plan: "bg-brand-gold/15 border border-brand-gold/40",
  status: "bg-bg-surface border border-border-med",
  fuel: "bg-brand-flame/15 border border-brand-flame/40",
  readiness: "bg-brand-teal/15 border border-brand-teal/40",
  signal: "bg-brand-blue/15 border border-brand-blue/40",
  locked: "bg-bg-depleted border border-border-default",
};

const LABEL: Record<BadgeVariant, string> = {
  plan: "text-brand-gold",
  status: "text-text-secondary",
  fuel: "text-brand-flame",
  readiness: "text-brand-teal",
  signal: "text-brand-blue-light",
  locked: "text-text-tertiary",
};

export function Badge({ label, variant = "status", className }: Props) {
  return (
    <View
      className={cn(
        "self-start rounded-full px-2.5 py-1",
        CONTAINER[variant],
        className,
      )}
    >
      <Text className={cn("font-mono text-[11px] uppercase tracking-wider", LABEL[variant])}>
        {variant === "locked" ? `🔒 ${label}` : label}
      </Text>
    </View>
  );
}
