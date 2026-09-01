import "@/global.css";

import { Arvo_400Regular } from "@expo-google-fonts/arvo";
import { Ledger_400Regular } from "@expo-google-fonts/ledger";
import { useFonts } from "expo-font";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { StatusBar } from "expo-status-bar";
import { useEffect } from "react";
import { StyleSheet, View } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { SafeAreaProvider } from "react-native-safe-area-context";

import { AudioController } from "@/components/AudioController";
import { DataSync } from "@/components/DataSync";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { DrawerOverlay } from "@/components/navigation/DrawerOverlay";
import { ScreenPreviewFab } from "@/components/navigation/ScreenPreviewFab";
import { initAnalytics } from "@/lib/analytics";
import { ConvexClientProvider } from "@/lib/convex";
import { registerBroadcastResponseListener } from "@/lib/notifications";

const DEEP = "#060B14";

// Keep the splash screen up until the brand fonts are ready, so text never
// flashes in a system fallback first. Registered family names must match the
// --font-display / --font-body tokens in global.css.
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [fontsLoaded] = useFonts({
    Arvo: Arvo_400Regular,
    Ledger: Ledger_400Regular,
  });

  useEffect(() => {
    initAnalytics();
  }, []);

  useEffect(() => {
    const sub = registerBroadcastResponseListener();
    return () => sub.remove();
  }, []);

  useEffect(() => {
    if (fontsLoaded) SplashScreen.hideAsync();
  }, [fontsLoaded]);

  if (!fontsLoaded) return null;

  return (
    <GestureHandlerRootView style={{ flex: 1, backgroundColor: DEEP }}>
      <SafeAreaProvider>
        <ConvexClientProvider>
          <DataSync />
          <AudioController />
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
              <ScreenPreviewFab />
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
