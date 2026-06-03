import React from "react";
import type { ViewStyle } from "react-native";
import {
  Easing,
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withRepeat,
  withTiming,
} from "react-native-reanimated";

import { colors } from "@/constants/colors";
import { cn } from "@/lib/cn";
import { Animated } from "@/tw/animated";

type Props = {
  children: React.ReactNode;
  className?: string;
  /** Peak vertical drift in px (default 8). Kept small so it reads as a hover, not a bounce. */
  amplitude?: number;
  /** Half-cycle (rise OR fall) duration in ms. Full breath is 2x this. Default 2800. */
  duration?: number;
  /** Glow hue beneath the surface; lifts with the float to sell the hover. */
  glowColor?: string;
};

/**
 * Calm "hovering above the deck" effect: a gentle vertical drift paired with a
 * glow that deepens as the surface rises (an object further from a surface casts a
 * larger, softer shadow). Glow IS the elevation, per DESIGN.md, never a gray drop
 * shadow. Honors reduced motion: when on, the surface rests with its base glow and
 * does not animate. Pass overflow-hidden + a radius via className when clipping
 * children (e.g. a nebula backdrop).
 */
export function Floating({
  children,
  className,
  amplitude = 8,
  duration = 2800,
  glowColor = colors.rocketTeal,
}: Props) {
  const reduced = useReducedMotion();
  const t = useSharedValue(0);

  React.useEffect(() => {
    if (reduced) {
      t.value = 0;
      return;
    }
    t.value = withRepeat(
      withTiming(1, { duration, easing: Easing.inOut(Easing.ease) }),
      -1,
      true,
    );
  }, [reduced, duration, t]);

  // Resting glow — matches the hero's prior HERO_GLOW so nothing jumps at p=0.
  const base: ViewStyle = {
    shadowColor: glowColor,
    shadowOffset: { width: 0, height: 12 },
  };

  const animated = useAnimatedStyle(() => {
    const p = t.value; // 0 (rest) → 1 (peak lift)
    return {
      transform: [{ translateY: -amplitude * p }],
      shadowOpacity: 0.28 + p * 0.16,
      shadowRadius: 24 + p * 12,
      elevation: 12 + p * 8,
    };
  });

  return (
    <Animated.View style={[base, animated]} className={cn(className)}>
      {children}
    </Animated.View>
  );
}
