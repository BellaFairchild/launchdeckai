import "@/global.css";

import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { SafeAreaProvider } from "react-native-safe-area-context";

import { ErrorBoundary } from "@/components/ErrorBoundary";
import { DrawerOverlay } from "@/components/navigation/DrawerOverlay";
import { ConvexClientProvider } from "@/lib/convex";

const DEEP = "#060B14";

export default function RootLayout() {
  return (
    <GestureHandlerRootView style={{ flex: 1, backgroundColor: DEEP }}>
      <SafeAreaProvider>
        <ConvexClientProvider>
          <ErrorBoundary>
          <StatusBar style="light" />
          <Stack
            screenOptions={{
              headerShown: false,
              contentStyle: { backgroundColor: DEEP },
            }}
          >
            <Stack.Screen name="(tabs)" />
            <Stack.Screen name="(auth)" />
            <Stack.Screen name="(modals)" options={{ presentation: "modal" }} />
          </Stack>
          <DrawerOverlay />
          </ErrorBoundary>
        </ConvexClientProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
