import React from "react";
import Svg, {
  Circle,
  Defs,
  Ellipse,
  G,
  Line,
  Path,
  RadialGradient,
  Stop,
} from "react-native-svg";

import { View } from "@/tw";

const LIT = "#5BE7B0";
const LIT_BRIGHT = "#A6F5D6";
const UNLIT = "#21413C";

type Props = {
  /** Current fuel. */
  value: number;
  /** Tank capacity used to fill the arc. */
  max: number;
  size?: number;
  ticks?: number;
};

// Faint stars scattered inside the dome (fractions of the gauge width).
const STARS: ReadonlyArray<[number, number, number]> = [
  [0.22, 0.32, 0.5], [0.34, 0.18, 0.4], [0.5, 0.12, 0.55], [0.66, 0.18, 0.4],
  [0.78, 0.32, 0.5], [0.28, 0.5, 0.35], [0.72, 0.5, 0.35], [0.5, 0.4, 0.3],
];

/**
 * Semicircular fuel gauge: a 180° dial of tick marks that fill with the tank
 * level, a rocket at the hub, and an ignition flame beneath it. Pure
 * react-native-svg.
 */
export function FuelGauge({ value, max, size = 240, ticks = 28 }: Props) {
  const W = size;
  const R = W * 0.42;
  const cx = W / 2;
  const cy = R; // diameter line
  const H = R * 1.32;
  const ratio = Math.max(0, Math.min(1, max > 0 ? value / max : 0));

  const tickOuter = R;
  const tickInner = R - R * 0.16;
  const sw = Math.max(2.5, W * 0.016);

  const tickEls = Array.from({ length: ticks }).map((_, i) => {
    const f = i / (ticks - 1);
    const a = Math.PI - f * Math.PI; // 180° (left) → 0° (right) over the top
    const cosA = Math.cos(a);
    const sinA = Math.sin(a);
    const lit = f <= ratio + 0.0001;
    return (
      <Line
        key={i}
        x1={cx + tickInner * cosA}
        y1={cy - tickInner * sinA}
        x2={cx + tickOuter * cosA}
        y2={cy - tickOuter * sinA}
        stroke={lit ? LIT : UNLIT}
        strokeWidth={sw}
        strokeLinecap="round"
        opacity={lit ? 1 : 0.6}
      />
    );
  });

  // Rocket geometry (drawn in a 24×24 box, scaled and centered on the hub).
  const Hr = R * 0.64;
  const s = Hr / 24;
  const tx = cx - 12 * s;
  const ty = cy - Hr * 0.62;

  return (
    <View accessibilityLabel={`Fuel ${value} of ${max}`}>
      <Svg width={W} height={H} viewBox={`0 0 ${W} ${H}`}>
        <Defs>
          <RadialGradient id="flame" cx="0.5" cy="0.5" r="0.5">
            <Stop offset="0" stopColor="#FFF3D8" stopOpacity={0.95} />
            <Stop offset="0.35" stopColor="#FFB259" stopOpacity={0.8} />
            <Stop offset="0.7" stopColor="#FF7A3C" stopOpacity={0.4} />
            <Stop offset="1" stopColor="#FF7A3C" stopOpacity={0} />
          </RadialGradient>
          <RadialGradient id="litGlow" cx="0.5" cy="0.5" r="0.5">
            <Stop offset="0" stopColor={LIT_BRIGHT} stopOpacity={0.5} />
            <Stop offset="1" stopColor={LIT_BRIGHT} stopOpacity={0} />
          </RadialGradient>
        </Defs>

        {/* faint stars in the dome */}
        {STARS.map(([fx, fy, o], i) => (
          <Circle key={i} cx={fx * W} cy={fy * R} r={1.1} fill="#9FB6C9" opacity={o} />
        ))}

        {/* ignition flame */}
        <Ellipse cx={cx} cy={cy + R * 0.02} rx={R * 0.16} ry={R * 0.2} fill="url(#flame)" />

        {/* tick dial */}
        {tickEls}

        {/* rocket */}
        <G transform={`translate(${tx} ${ty}) scale(${s})`}>
          <Path
            d="M12 1.4 C15.4 4.8 16.4 9 16.1 13.4 C16 15.2 15.1 16.8 13.9 17.8 H10.1 C8.9 16.8 8 15.2 7.9 13.4 C7.6 9 8.6 4.8 12 1.4 Z"
            fill="#F7FAFF"
          />
          <Path d="M8.4 14.6 L5.5 19.2 L9 17.6 Z" fill="#E4ECF5" />
          <Path d="M15.6 14.6 L18.5 19.2 L15 17.6 Z" fill="#E4ECF5" />
          <Circle cx={12} cy={9.4} r={1.9} fill="#0E1520" />
        </G>
      </Svg>
    </View>
  );
}
