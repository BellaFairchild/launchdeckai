import { Tabs } from "expo-router";
import { Platform, StyleSheet } from "react-native";

import { ScreenBackground } from "@/components/layout/ScreenBackground";
import { AppHeader } from "@/components/navigation/AppHeader";
import { TabBar } from "@/components/navigation/TabBar";

const isWeb = Platform.OS === "web";

export default function TabsLayout() {
  return (
    <ScreenBackground>
      <Tabs
        tabBar={(props) => <TabBar {...props} />}
        screenOptions={{
          headerShown: true,
          header: () => <AppHeader />,
          // sceneStyle (RN-Navigation v7) replaces the old navigator-level
          // style / sceneContainerStyle props.
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

const styles = StyleSheet.create({
  scene: { flex: 1, backgroundColor: "transparent", overflow: "hidden" },
});
