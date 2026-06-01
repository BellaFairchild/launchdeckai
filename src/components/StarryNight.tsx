import React, { useMemo } from "react";
import { StyleSheet, useWindowDimensions, View } from "react-native";
import Animated, {
    Easing,
    useAnimatedStyle,
    useSharedValue,
    withRepeat,
    withTiming,
} from "react-native-reanimated";

/**
 * Calm cosmic starfield background (port of the web prototype's StarryNight).
 * Performance-minded for RN: stars are static Views; a single shared "twinkle"
 * value animates one bright layer, and two nebula glows gently pulse — so the
 * whole effect is ~3 animated nodes, not hundreds. Render it as the first child
 * of a screen's root View so content sits on top.
 */
type Star = { x: number; y: number; size: number; opacity: number };

function makeStars(count: number, w: number, h: number): Star[] {
  return Array.from({ length: count }).map(() => ({
    x: Math.random() * w,
    y: Math.random() * h,
    size: Math.random() * 1.8 + 0.8,
    opacity: Math.random() * 0.7 + 0.2,
  }));
}

export function StarryNight() {
  const { width, height } = useWindowDimensions();
  const dim = useMemo(() => makeStars(80, width, height), [width, height]);
  const bright = useMemo(() => makeStars(36, width, height), [width, height]);

  const twinkle = useSharedValue(0.5);
  const neb = useSharedValue(0);
  React.useEffect(() => {
    twinkle.value = withRepeat(
      withTiming(1, { duration: 2600, easing: Easing.inOut(Easing.ease) }),
      -1,
      true,
    );
    neb.value = withRepeat(
      withTiming(1, { duration: 9000, easing: Easing.inOut(Easing.ease) }),
      -1,
      true,
    );
  }, [twinkle, neb]);

  const twinkleStyle = useAnimatedStyle(() => ({
    opacity: 0.35 + twinkle.value * 0.55,
  }));
  const nebStyle = useAnimatedStyle(() => ({
    opacity: 0.05 + neb.value * 0.05,
    transform: [{ scale: 0.9 + neb.value * 0.2 }],
  }));

  return (
    <View style={[StyleSheet.absoluteFill, { pointerEvents: "none" }]}>
      <Animated.View
        style={[
          styles.nebula,
          {
            backgroundColor: "#1426A8",
            top: height * 0.1,
            left: width * 0.05,
            width: width * 0.7,
            height: width * 0.7,
          },
          nebStyle,
        ]}
      />
      <Animated.View
        style={[
          styles.nebula,
          {
            backgroundColor: "#10B7D6",
            bottom: height * 0.1,
            right: width * 0.02,
            width: width * 0.8,
            height: width * 0.8,
          },
          nebStyle,
        ]}
      />

      {dim.map((s, i) => (
        <View
          key={`d${i}`}
          style={[
            styles.star,
            {
              left: s.x,
              top: s.y,
              width: s.size,
              height: s.size,
              opacity: s.opacity,
            },
          ]}
        />
      ))}

      <Animated.View
        style={[
          StyleSheet.absoluteFill,
          twinkleStyle,
          { pointerEvents: "none" },
        ]}
      >
        {bright.map((s, i) => (
          <View
            key={`b${i}`}
            style={[
              styles.star,
              {
                left: s.x,
                top: s.y,
                width: s.size + 0.6,
                height: s.size + 0.6,
                opacity: s.opacity,
              },
            ]}
          />
        ))}
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  nebula: { position: "absolute", borderRadius: 9999 },
  star: {
    position: "absolute",
    backgroundColor: "#FFFFFF",
    borderRadius: 9999,
  },
});
