import { Tabs } from "expo-router";
import { View } from "react-native";

import { TabBar } from "@/components/navigation/TabBar";
import { AppHeader } from "@/components/navigation/AppHeader";
import { StarryNight } from "@/components/StarryNight";

const DEEP = "#060B14";

export default function TabsLayout() {
  return (
    <View style={{ flex: 1, backgroundColor: DEEP }}>
      <StarryNight />
      <Tabs
        tabBar={(props) => <TabBar {...props} />}
        screenOptions={{
          headerShown: true,
          header: () => <AppHeader />,
          sceneStyle: { backgroundColor: "transparent" },
        }}
      >
        <Tabs.Screen name="deck" options={{ title: "Deck" }} />
        <Tabs.Screen name="missions" options={{ title: "Missions" }} />
        <Tabs.Screen name="blueprints" options={{ title: "Blueprints" }} />
        <Tabs.Screen name="foundry" options={{ title: "Foundry" }} />
      </Tabs>
    </View>
  );
}
