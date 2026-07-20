import { useConvexAuth } from "convex/react";
import { Redirect, Tabs } from "expo-router";
import { ActivityIndicator, Platform, StyleSheet, View } from "react-native";

import { ScreenBackground } from "@/components/layout/ScreenBackground";
import { AppHeader } from "@/components/navigation/AppHeader";
import { TabBar } from "@/components/navigation/TabBar";
import { authEnabled } from "@/lib/auth";

const isWeb = Platform.OS === "web";

function AuthSplash() {
  return (
    <View style={styles.splash}>
      <ActivityIndicator size="large" color="#4DC8C0" />
    </View>
  );
}

function TabsShell() {
  return (
    <ScreenBackground>
      <Tabs
        style={styles.tabs}
        sceneContainerStyle={styles.sceneContainer}
        tabBar={(props) => <TabBar {...props} />}
        screenOptions={{
          headerShown: true,
          header: () => <AppHeader />,
          sceneStyle: styles.scene,
          lazy: true,
          // freezeOnBlur is native-only; on web it does not detach ghost scenes.
          freezeOnBlur: !isWeb,
        }}
      >
        <Tabs.Screen name="deck" options={{ title: "Deck" }} />
        <Tabs.Screen name="missions" options={{ title: "Missions" }} />
        <Tabs.Screen name="blueprints" options={{ title: "Blueprints" }} />
        <Tabs.Screen name="foundry" options={{ title: "Foundry" }} />
      </Tabs>
    </ScreenBackground>
  );
}

function AuthenticatedTabsLayout() {
  const { isLoading, isAuthenticated } = useConvexAuth();

  if (isLoading) return <AuthSplash />;
  if (!isAuthenticated) return <Redirect href="/(auth)/sign-in" />;

  return <TabsShell />;
}

export default function TabsLayout() {
  if (!authEnabled) return <TabsShell />;
  return <AuthenticatedTabsLayout />;
}

const styles = StyleSheet.create({
  splash: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#060B14",
  },
  tabs: { flex: 1 },
  sceneContainer: {
    flex: 1,
    backgroundColor: "transparent",
    overflow: "hidden",
  },
  scene: { flex: 1, backgroundColor: "transparent", overflow: "hidden" },
});
