import { useIsFocused } from "expo-router";
import type { ReactNode } from "react";
import { StyleSheet, View } from "react-native";

type Props = {
  children: ReactNode;
};

/**
 * Bottom tabs on web keep inactive routes mounted. Transparent scene styles let
 * multiple tab UIs paint on top of each other. Only render children when focused.
 */
export function TabScreen({ children }: Props) {
  const focused = useIsFocused();
  if (!focused) return null;
  return <View style={styles.root}>{children}</View>;
}

const styles = StyleSheet.create({
  root: { flex: 1, overflow: "hidden" },
});
