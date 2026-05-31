import { Tabs } from "expo-router";

import { TabBar } from "@/components/navigation/TabBar";
import { AppHeader } from "@/components/navigation/AppHeader";

const DEEP = "#060B14";

export default function TabsLayout() {
  return (
    <Tabs
      tabBar={(props) => <TabBar {...props} />}
      screenOptions={{
        headerShown: true,
        header: () => <AppHeader />,
        sceneStyle: { backgroundColor: DEEP },
      }}
    >
      <Tabs.Screen name="deck" options={{ title: "Deck" }} />
      <Tabs.Screen name="missions" options={{ title: "Missions" }} />
      <Tabs.Screen name="blueprints" options={{ title: "Blueprints" }} />
      <Tabs.Screen name="foundry" options={{ title: "Foundry" }} />
    </Tabs>
  );
}
