import React from "react";
import { StyleSheet, View, type ViewProps } from "react-native";

import { StarryNight } from "@/components/StarryNight";

type Props = ViewProps & {
  children: React.ReactNode;
};

/**
 * Full-screen shell with the starfield pinned behind content. Keeps the
 * background out of flex flow so navigators and scenes don't stack on web.
 */
export function ScreenBackground({ children, style, ...rest }: Props) {
  return (
    <View style={[styles.root, style]} {...rest}>
      <View style={styles.background} pointerEvents="none">
        <StarryNight />
      </View>
      <View style={styles.content}>{children}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: "#060B14",
    overflow: "hidden",
  },
  background: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 0,
  },
  content: {
    flex: 1,
    zIndex: 1,
  },
});
