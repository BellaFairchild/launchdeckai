import React from "react";
import { View } from "@/tw";
import { cn } from "@/lib/cn";

export type SignalStatus = "not_loaded" | "in_prep" | "flight_ready";

type Props = {
  status: SignalStatus;
  size?: "sm" | "md";
};

/**
 * Three vertical bars used across Signal Deck (Docs/05 + Docs/07):
 *   not_loaded  -> 0/3 grey
 *   in_prep     -> 2/3 orange
 *   flight_ready-> 3/3 green
 */
const FILLED: Record<SignalStatus, number> = {
  not_loaded: 0,
  in_prep: 2,
  flight_ready: 3,
};

const FILL_COLOR: Record<SignalStatus, string> = {
  not_loaded: "bg-border-med",
  in_prep: "bg-status-warning",
  flight_ready: "bg-status-success",
};

const LABEL: Record<SignalStatus, string> = {
  not_loaded: "Not loaded",
  in_prep: "In prep",
  flight_ready: "Flight ready",
};

export function SignalBars({ status, size = "md" }: Props) {
  const filled = FILLED[status];
  const heights = size === "sm" ? ["h-2", "h-3", "h-4"] : ["h-3", "h-4", "h-5"];
  const width = size === "sm" ? "w-1" : "w-1.5";
  return (
    <View
      accessibilityLabel={`Signal status: ${LABEL[status]} (${filled}/3)`}
      className="flex-row items-end gap-1"
    >
      {[0, 1, 2].map((i) => (
        <View
          key={i}
          className={cn(
            "rounded-sm",
            width,
            heights[i],
            i < filled ? FILL_COLOR[status] : "bg-border-default",
          )}
        />
      ))}
    </View>
  );
}
