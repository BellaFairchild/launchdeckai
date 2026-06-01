import React from "react";

import { Text, View } from "@/tw";
import { cn } from "@/lib/cn";
import { Icon } from "./Icon";
import { colors } from "@/constants/colors";

type Props = {
  /** Current Fuel balance. */
  amount: number;
  /** Show a low-fuel warning treatment. */
  warning?: boolean;
  /** Glow treatment for "just earned" moments. */
  glow?: boolean;
  size?: "sm" | "md";
  className?: string;
};

/** Fuel = the app's energy/credits currency. Flame icon + amount. */
export function FuelBadge({ amount, warning, glow, size = "md", className }: Props) {
  const isSmall = size === "sm";
  const flameColor = warning ? colors.statusWarning : colors.brandFlame;
  return (
    <View
      accessibilityLabel={`${amount} Fuel`}
      style={
        glow
          ? {
              shadowColor: colors.brandGold,
              shadowOpacity: 0.5,
              shadowRadius: 10,
              shadowOffset: { width: 0, height: 0 },
              elevation: 6,
            }
          : undefined
      }
      className={cn(
        "flex-row items-center gap-1.5 self-start rounded-full border px-3 py-1",
        warning
          ? "border-status-warning/50 bg-status-warning/10"
          : "border-brand-flame/40 bg-brand-flame/10",
        glow && "border-brand-gold",
        className,
      )}
    >
      <Icon name="flame" size={isSmall ? 12 : 14} color={flameColor} />
      <Text
        className={cn(
          "font-mono font-medium",
          isSmall ? "text-xs" : "text-sm",
          warning ? "text-status-warning" : "text-brand-flame",
        )}
      >
        {amount.toLocaleString()}
      </Text>
    </View>
  );
}
