import type { ReactNode } from "react";
import type { ViewStyle } from "react-native";
import Svg, {
  Circle,
  Defs,
  G,
  Line,
  LinearGradient,
  Path,
  Rect,
  Stop,
} from "react-native-svg";

import { GradientView } from "@/components/ui/GradientView";
import { Icon, type IconName } from "@/components/ui/Icon";
import { Text, View } from "@/tw";

/** #RGB / #RRGGBB → rgba() at the given alpha. */
function withAlpha(hex: string, alpha: number): string {
  let h = hex.replace("#", "");
  if (h.length === 3)
    h = h
      .split("")
      .map((c) => c + c)
      .join("");
  const r = parseInt(h.slice(0, 2), 16);
  const g = parseInt(h.slice(2, 4), 16);
  const b = parseInt(h.slice(4, 6), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

type Step = {
  n: string;
  title: string;
  caption: string;
  color: string;
  /** Legend icon — "rocket" is hand-drawn; the rest come from the Icon set. */
  icon: IconName | "rocket";
  /** Station position on the trajectory, in the 320×150 viewBox. */
  node: { x: number; y: number };
};

// Ordered Foundation → Launch. Colors progress blue → teal → gold to read as a
// rising launch gradient; nodes climb left-to-right like an ascending arc.
const STEPS: Step[] = [
  { n: "01", title: "Foundation", caption: "Name, pitch & audience", color: "#3B82F6", icon: "blueprints", node: { x: 44, y: 124 } },
  { n: "02", title: "Assets", caption: "Forge launch content", color: "#4DC8C0", icon: "box", node: { x: 120, y: 100 } },
  { n: "03", title: "Broadcasting", caption: "Schedule your signals", color: "#10B7D6", icon: "signal", node: { x: 206, y: 70 } },
  { n: "04", title: "Launch", caption: "Submit & lift off", color: "#F3B233", icon: "rocket", node: { x: 282, y: 38 } },
];

const GROUND_Y = 140;

// A launch arc: nearly flat off the pad, steepening into liftoff. The path is
// authored to thread each station node so the dashed line visually connects them.
const FLIGHT_PATH =
  "M16,140 C30,134 34,130 44,124 " +
  "C80,116 92,110 120,100 " +
  "C160,86 178,80 206,70 " +
  "C244,58 260,50 282,38";

const STARS: { x: number; y: number; r: number; o: number }[] = [
  { x: 34, y: 36, r: 1.3, o: 0.5 },
  { x: 88, y: 24, r: 0.9, o: 0.4 },
  { x: 150, y: 30, r: 1.1, o: 0.55 },
  { x: 196, y: 18, r: 0.8, o: 0.35 },
  { x: 244, y: 26, r: 1.2, o: 0.5 },
  { x: 300, y: 64, r: 1, o: 0.4 },
  { x: 268, y: 96, r: 0.9, o: 0.3 },
  { x: 120, y: 46, r: 0.8, o: 0.3 },
  { x: 70, y: 70, r: 0.9, o: 0.3 },
];

const CARD_GLOW: ViewStyle = {
  shadowColor: "#10B7D6",
  shadowOpacity: 0.18,
  shadowRadius: 22,
  shadowOffset: { width: 0, height: 10 },
  elevation: 10,
};

/** Rocket primitives, nose pointing up in local coords centered at (0,0). */
function rocketBody(flame: boolean): ReactNode {
  return (
    <>
      {flame ? (
        <>
          <Path d="M-2.6,12 C-1.6,16.4 -0.8,18.6 0,21 C0.8,18.6 1.6,16.4 2.6,12 Z" fill="#FFD65A" />
          <Path d="M-1.3,12 C-0.7,15 0,16.8 0,18 C0,16.8 0.7,15 1.3,12 Z" fill="#FF9B42" />
        </>
      ) : null}
      {/* fins */}
      <Path d="M-5,2 L-9,10.5 L-4.6,7.8 Z" fill="#F3B233" />
      <Path d="M5,2 L9,10.5 L4.6,7.8 Z" fill="#F3B233" />
      {/* fuselage */}
      <Path
        d="M0,-14 C3.4,-14 5,-8 5,-2 C5,3.4 4.4,7.4 3,10 L-3,10 C-4.4,7.4 -5,3.4 -5,-2 C-5,-8 -3.4,-14 0,-14 Z"
        fill="#F5F7FA"
      />
      {/* nozzle */}
      <Path d="M-3,10 L3,10 L2.2,12.4 L-2.2,12.4 Z" fill="#F3B233" />
      {/* window */}
      <Circle cx={0} cy={-3.6} r={2.3} fill="#0A1220" />
      <Circle cx={0} cy={-3.6} r={2.3} fill="none" stroke="#10B7D6" strokeWidth={1.1} />
    </>
  );
}

/**
 * "Launch Flight Path" — a standalone trajectory infographic mapping the four
 * mission phases (Foundation → Assets → Broadcasting → Launch) as an ascending
 * launch arc. Decorative; summarized for screen readers via the container label.
 */
export function LaunchFlightPath() {
  return (
    <View
      accessibilityRole="image"
      accessibilityLabel="Launch flight path — four phases: 1 Foundation, 2 Assets, 3 Broadcasting, 4 Launch."
      style={CARD_GLOW}
      className="overflow-hidden rounded-3xl border border-border-med"
    >
      {/* Deep-space surface, indigo-lifted at the top. */}
      <GradientView colors={["#0C1838", "#070D18"]} direction="vertical" />
      {/* lit top edge */}
      <View
        pointerEvents="none"
        className="absolute inset-x-0 top-0 h-px bg-white/8"
      />

      <View className="p-4">
        {/* Header */}
        <View className="mb-1 flex-row items-end justify-between">
          <View>
            <Text className="font-mono text-[11px] uppercase tracking-[2.5px] text-brand-teal">
              Launch Flight Path
            </Text>
            <Text className="mt-0.5 font-display text-base font-bold text-text-primary">
              From foundation to liftoff
            </Text>
          </View>
          <View className="rounded-full border border-border-default bg-bg-card px-2.5 py-1">
            <Text className="font-mono text-[10px] uppercase tracking-wider text-text-tertiary">
              4 Phases
            </Text>
          </View>
        </View>

        {/* Trajectory */}
        <View style={{ width: "100%", aspectRatio: 320 / 150 }}>
          <Svg width="100%" height="100%" viewBox="0 0 320 150">
            <Defs>
              <LinearGradient id="flight" x1="0" y1="1" x2="1" y2="0">
                <Stop offset="0" stopColor="#3B82F6" />
                <Stop offset="0.5" stopColor="#10B7D6" />
                <Stop offset="1" stopColor="#F3B233" />
              </LinearGradient>
            </Defs>

            {/* Soft liftoff glow behind the rocket — stacked translucent
                circles give a round, seam-free falloff on every platform. */}
            <Circle cx={284} cy={36} r={62} fill="#F3B233" fillOpacity={0.05} />
            <Circle cx={284} cy={36} r={40} fill="#F3B233" fillOpacity={0.06} />
            <Circle cx={284} cy={36} r={22} fill="#F3B233" fillOpacity={0.09} />

            {/* Starfield */}
            {STARS.map((s, i) => (
              <Circle key={i} cx={s.x} cy={s.y} r={s.r} fill="#FFFFFF" fillOpacity={s.o} />
            ))}

            {/* Ground / pad baseline */}
            <Line x1={14} y1={GROUND_Y} x2={306} y2={GROUND_Y} stroke="#1E2D45" strokeWidth={1} />
            <Rect x={36} y={137} width={16} height={3} rx={1} fill="#27406A" />

            {/* Altitude gridlines dropping from each station to the ground */}
            {STEPS.map((s) => (
              <Line
                key={`tick-${s.n}`}
                x1={s.node.x}
                y1={s.node.y + 9}
                x2={s.node.x}
                y2={GROUND_Y}
                stroke={s.color}
                strokeWidth={1}
                strokeOpacity={0.14}
                strokeDasharray="1 4"
              />
            ))}

            {/* Trajectory — soft glow underlay + dashed gradient flight line */}
            <Path d={FLIGHT_PATH} stroke="#10B7D6" strokeOpacity={0.16} strokeWidth={8} strokeLinecap="round" fill="none" />
            <Path
              d={FLIGHT_PATH}
              stroke="url(#flight)"
              strokeWidth={3}
              strokeLinecap="round"
              strokeDasharray="2 6"
              fill="none"
            />

            {/* Station orbs */}
            {STEPS.slice(0, 3).map((s) => (
              <G key={`node-${s.n}`}>
                <Circle cx={s.node.x} cy={s.node.y} r={11} fill={s.color} fillOpacity={0.16} />
                <Circle cx={s.node.x} cy={s.node.y} r={6.5} fill="#0A1220" stroke={s.color} strokeWidth={2} />
                <Circle cx={s.node.x} cy={s.node.y} r={2.6} fill={s.color} />
              </G>
            ))}

            {/* Apex — rocket lifting off along the trajectory tangent */}
            <Circle cx={282} cy={38} r={15} fill="#F3B233" fillOpacity={0.18} />
            <G transform="translate(282 38) rotate(34)">{rocketBody(true)}</G>
          </Svg>
        </View>

        {/* Legend — one column under each station */}
        <View className="mt-1 flex-row">
          {STEPS.map((s) => (
            <View key={s.n} className="flex-1 items-center px-1">
              <View
                className="mb-1.5 h-10 w-10 items-center justify-center rounded-2xl border"
                style={{
                  borderColor: withAlpha(s.color, 0.4),
                  backgroundColor: withAlpha(s.color, 0.12),
                }}
              >
                {s.icon === "rocket" ? (
                  <Svg width={20} height={20} viewBox="-12 -16 24 36">
                    {rocketBody(false)}
                  </Svg>
                ) : (
                  <Icon name={s.icon} size={20} color={s.color} />
                )}
              </View>
              <Text
                className="font-mono text-[10px] font-bold tracking-wider"
                style={{ color: s.color }}
              >
                {s.n}
              </Text>
              <Text className="mt-0.5 text-center font-display text-[13px] font-bold text-text-primary">
                {s.title}
              </Text>
              <Text className="mt-0.5 text-center font-body text-[11px] leading-4 text-text-tertiary">
                {s.caption}
              </Text>
            </View>
          ))}
        </View>
      </View>
    </View>
  );
}
