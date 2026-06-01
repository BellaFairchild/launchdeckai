import { Stack } from "expo-router";
import { StyleSheet } from "react-native";

export default function AuthLayout() {
  return (
    <Stack
      style={styles.root}
      screenOptions={{
        headerShown: false,
        contentStyle: styles.content,
      }}
    />
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: "#060B14" },
  content: { flex: 1, backgroundColor: "#060B14" },
});
