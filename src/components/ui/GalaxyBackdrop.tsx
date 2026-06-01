import React from "react";
import { StyleSheet, View } from "react-native";
import Svg, {
  Circle,
  Defs,
  Ellipse,
  RadialGradient,
  Rect,
  Stop,
} from "react-native-svg";

/**
 * Procedural Andromeda-style galaxy for the Deck hero — a tilted luminous disk
 * with a warm nucleus, a faint dust lane, scattered stars, and a dark vignette
 * so the card's rounded edges stay deep. Pure react-native-svg (already in the
 * native build) so there's no binary asset or extra dependency.
 *
 * Drawn in a 360×320 user space and sliced to fill its parent. Parent must clip.
 */

// Deterministic star field (kept static so it doesn't reshuffle each render).
const STARS: ReadonlyArray<[number, number, number, number]> = [
  // x, y, r, opacity
  [28, 36, 1.1, 0.7], [66, 90, 0.8, 0.5], [110, 28, 1.3, 0.85], [150, 70, 0.7, 0.4],
  [210, 40, 1.0, 0.7], [250, 96, 0.9, 0.55], [300, 44, 1.2, 0.8], [336, 110, 0.8, 0.5],
  [44, 150, 0.9, 0.6], [330, 168, 1.0, 0.65], [20, 220, 1.2, 0.75], [90, 250, 0.8, 0.45],
  [150, 280, 1.0, 0.6], [220, 264, 0.7, 0.4], [284, 246, 1.1, 0.7], [338, 286, 0.9, 0.55],
  [120, 200, 0.7, 0.4], [240, 190, 0.8, 0.5], [60, 300, 1.0, 0.6], [300, 300, 0.8, 0.45],
];

export function GalaxyBackdrop() {
  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none">
      <Svg
        width="100%"
        height="100%"
        viewBox="0 0 360 320"
        preserveAspectRatio="xMidYMid slice"
      >
        <Defs>
          {/* Galaxy disk — warm core fading to bluish arms then nothing */}
          <RadialGradient
            id="disk"
            cx={180}
            cy={186}
            r={170}
            gradientUnits="userSpaceOnUse"
          >
            <Stop offset={0} stopColor="#FBEFD6" stopOpacity={0.88} />
            <Stop offset={0.18} stopColor="#E7C79A" stopOpacity={0.64} />
            <Stop offset={0.42} stopColor="#9A7FD6" stopOpacity={0.42} />
            <Stop offset={0.7} stopColor="#2E459C" stopOpacity={0.26} />
            <Stop offset={1} stopColor="#0A1430" stopOpacity={0} />
          </RadialGradient>

          {/* Bright nucleus */}
          <RadialGradient
            id="core"
            cx={180}
            cy={186}
            r={54}
            gradientUnits="userSpaceOnUse"
          >
            <Stop offset={0} stopColor="#FFFAF0" stopOpacity={0.92} />
            <Stop offset={0.45} stopColor="#F6DCAC" stopOpacity={0.78} />
            <Stop offset={1} stopColor="#F6DCAC" stopOpacity={0} />
          </RadialGradient>

          {/* Vignette — keeps the card edges dark like the reference */}
          <RadialGradient
            id="vignette"
            cx={180}
            cy={146}
            r={250}
            gradientUnits="userSpaceOnUse"
          >
            <Stop offset={0} stopColor="#060B14" stopOpacity={0} />
            <Stop offset={0.55} stopColor="#060B14" stopOpacity={0} />
            <Stop offset={1} stopColor="#05080F" stopOpacity={0.92} />
          </RadialGradient>
        </Defs>

        {/* deep base */}
        <Rect x={0} y={0} width={360} height={320} fill="#070D1C" />

        {/* stars (behind the disk) */}
        {STARS.map(([x, y, r, o], i) => (
          <Circle key={i} cx={x} cy={y} r={r} fill="#FFFFFF" opacity={o} />
        ))}

        {/* galaxy disk, tilted */}
        <Ellipse
          cx={180}
          cy={186}
          rx={152}
          ry={50}
          fill="url(#disk)"
          transform="rotate(-24 180 186)"
        />
        {/* faint dust lane: a darker offset sliver across the disk */}
        <Ellipse
          cx={180}
          cy={194}
          rx={150}
          ry={44}
          fill="#0A1024"
          opacity={0.25}
          transform="rotate(-24 180 186)"
        />
        {/* nucleus */}
        <Ellipse
          cx={180}
          cy={186}
          rx={46}
          ry={18}
          fill="url(#core)"
          transform="rotate(-24 180 186)"
        />

        {/* vignette on top */}
        <Rect x={0} y={0} width={360} height={320} fill="url(#vignette)" />
      </Svg>
    </View>
  );
}
