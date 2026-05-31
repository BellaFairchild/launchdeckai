import { Tabs } from "expo-router";
import { View, type ColorValue } from "react-native";

const COLORS = {
  deep: "#060B14",
  surface: "#0A1220",
  border: "#1E2D45",
  active: "#4DC8C0",
  inactive: "#64748B",
};

/** Minimal dot icon stand-in until the real icon set lands in Phase 2/3. */
function Dot({ color }: { color: ColorValue }) {
  return (
    <View
      style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: color }}
    />
  );
}

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: COLORS.active,
        tabBarInactiveTintColor: COLORS.inactive,
        tabBarStyle: {
          backgroundColor: COLORS.surface,
          borderTopColor: COLORS.border,
        },
        sceneStyle: { backgroundColor: COLORS.deep },
      }}
    >
      <Tabs.Screen
        name="deck"
        options={{
          title: "Deck",
          tabBarIcon: ({ color }) => <Dot color={color} />,
        }}
      />
      <Tabs.Screen
        name="missions"
        options={{
          title: "Missions",
          tabBarIcon: ({ color }) => <Dot color={color} />,
        }}
      />
      <Tabs.Screen
        name="blueprints"
        options={{
          title: "Blueprints",
          tabBarIcon: ({ color }) => <Dot color={color} />,
        }}
      />
      <Tabs.Screen
        name="foundry"
        options={{
          title: "Foundry",
          tabBarIcon: ({ color }) => <Dot color={color} />,
        }}
      />
    </Tabs>
  );
}
