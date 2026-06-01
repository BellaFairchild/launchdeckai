import React from "react";
import type { DimensionValue } from "react-native";

import { View } from "@/tw";
import { GradientView } from "./GradientView";

type Props = {
  /** 0–100. */
  value: number;
  height?: number;
  /** Two-stop gradient for the fill. Defaults to the electric launch blue. */
  fill?: readonly string[];
  glow?: boolean;
};

/** Horizontal progress meter — readiness, blueprint completion, etc. */
export function ProgressBar({
  value,
  height = 10,
  fill = ["#2A4BFF", "#3B82F6"],
  glow = true,
}: Props) {
  const pct = Math.max(0, Math.min(100, value));
  const width = `${pct}%` as DimensionValue;
  const radius = height / 2;

  return (
    <View
      className="w-full overflow-hidden bg-bg-depleted"
      style={{ height, borderRadius: radius }}
    >
      <View
        style={[
          { height, width, borderRadius: radius, overflow: "hidden" },
          glow && pct > 0
            ? {
                shadowColor: "#3B82F6",
                shadowOpacity: 0.6,
                shadowRadius: 8,
                shadowOffset: { width: 0, height: 0 },
              }
            : null,
        ]}
      >
        <GradientView colors={fill} direction="horizontal" />
      </View>
    </View>
  );
}
