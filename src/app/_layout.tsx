import "@/global.css";

import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { StyleSheet, View } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { SafeAreaProvider } from "react-native-safe-area-context";

import { DataSync } from "@/components/DataSync";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { DrawerOverlay } from "@/components/navigation/DrawerOverlay";
import { ConvexClientProvider } from "@/lib/convex";

const DEEP = "#060B14";

export default function RootLayout() {
  return (
    <GestureHandlerRootView style={{ flex: 1, backgroundColor: DEEP }}>
      <SafeAreaProvider>
        <ConvexClientProvider>
          <DataSync />
          <ErrorBoundary>
            <View style={styles.shell}>
              <StatusBar style="light" />
              <Stack
                style={styles.shell}
                screenOptions={{
                  headerShown: false,
                  contentStyle: styles.stackContent,
                }}
              >
                <Stack.Screen
                  name="index"
                  options={{
                    animation: "none",
                    contentStyle: styles.stackContent,
                  }}
                />
                <Stack.Screen name="(tabs)" />
                <Stack.Screen name="(auth)" />
                <Stack.Screen
                  name="(modals)"
                  options={{
                    presentation: "fullScreenModal",
                    contentStyle: styles.stackContent,
                  }}
                />
              </Stack>
              <DrawerOverlay />
            </View>
          </ErrorBoundary>
        </ConvexClientProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  shell: { flex: 1, backgroundColor: DEEP },
  stackContent: { flex: 1, backgroundColor: DEEP },
});
