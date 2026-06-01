import { Stack, useRouter } from "expo-router";
import { StyleSheet, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { Pressable, Text } from "@/tw";

/** Shared close (X) header for all modal screens so they're dismissible on every platform. */
function ModalHeader() {
  const router = useRouter();
  return (
    <SafeAreaView edges={["top"]} style={{ backgroundColor: "#060B14" }}>
      <View className="flex-row items-center justify-end border-b border-border-default px-3 py-2">
        <Pressable
          onPress={() => router.back()}
          accessibilityRole="button"
          accessibilityLabel="Close"
          className="h-11 w-11 items-center justify-center"
        >
          <Text className="text-xl text-text-secondary">✕</Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

export default function ModalsLayout() {
  return (
    <View style={styles.root}>
      <Stack
        screenOptions={{
          headerShown: true,
          header: () => <ModalHeader />,
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
