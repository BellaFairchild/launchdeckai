import React from "react";
import { StyleSheet, View } from "react-native";
import Svg, { Defs, LinearGradient, Rect, Stop } from "react-native-svg";

type Props = {
  /** Two or more stop colors, top→bottom or per `direction`. */
  colors: readonly string[];
  /** Gradient axis. "vertical" (default), "horizontal", or "diagonal". */
  direction?: "vertical" | "horizontal" | "diagonal";
  /** Optional per-stop offsets (0–1). Defaults to evenly spaced. */
  locations?: readonly number[];
};

const AXIS: Record<NonNullable<Props["direction"]>, [string, string, string, string]> = {
  vertical: ["0", "0", "0", "1"],
  horizontal: ["0", "0", "1", "0"],
  diagonal: ["0", "0", "1", "1"],
};

/**
 * Absolutely-fills its parent with an SVG linear gradient. Parent must clip
 * (overflow-hidden + rounded). Uses react-native-svg (already in the native
 * build) so no extra dependency / dev-client rebuild is needed.
 */
export function GradientView({ colors, direction = "vertical", locations }: Props) {
  // react-native-svg gradient ids are global per render tree; keep them unique.
  const rawId = React.useId();
  const id = `grad-${rawId.replace(/[^a-zA-Z0-9]/g, "")}`;
  const [x1, y1, x2, y2] = AXIS[direction];

  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none">
      <Svg width="100%" height="100%">
        <Defs>
          <LinearGradient id={id} x1={x1} y1={y1} x2={x2} y2={y2}>
            {colors.map((c, i) => (
              <Stop
                key={i}
                offset={locations?.[i] ?? i / Math.max(1, colors.length - 1)}
                stopColor={c}
              />
            ))}
          </LinearGradient>
        </Defs>
        <Rect width="100%" height="100%" fill={`url(#${id})`} />
      </Svg>
    </View>
  );
}
