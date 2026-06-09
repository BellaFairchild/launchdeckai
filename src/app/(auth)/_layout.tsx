import { Stack } from "expo-router";
import { StyleSheet, View } from "react-native";

export default function AuthLayout() {
  return (
    <View style={styles.root}>
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: styles.content,
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: "#060B14" },
  content: { flex: 1, backgroundColor: "#060B14" },
});
