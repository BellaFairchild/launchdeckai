import { Tabs, useRouter } from 'expo-router';
import { Pressable, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import type { BottomTabBarProps } from 'expo-router/build/react-navigation/bottom-tabs';

const TAB_ITEMS = [
  { name: 'index', label: 'Deck', icon: '♦' },
  { name: 'stack', label: 'Stack', icon: '▤' },
  { name: 'alerts', label: 'Alerts', icon: '●' },
  { name: 'insights', label: 'Insights', icon: '▲' },
] as const;

function CustomTabBar({ state, navigation }: BottomTabBarProps) {
  const insets = useSafeAreaInsets();
  const router = useRouter();

  return (
    <View
      className="flex-row items-center border-t border-bg-border bg-bg-raised px-2"
      style={{ paddingBottom: insets.bottom || 12, paddingTop: 10 }}
    >
      {TAB_ITEMS.slice(0, 2).map((item, i) => {
        const routeIndex = state.routes.findIndex((r) => r.name === item.name);
        const focused = state.index === routeIndex;
        return (
          <TabButton
            key={item.name}
            label={item.label}
            icon={item.icon}
            focused={focused}
            onPress={() => navigation.navigate(item.name)}
          />
        );
      })}

      <View className="w-16 items-center">
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Add subscription"
          onPress={() => router.push('/add-subscription')}
          className="-mt-8 h-16 w-16 items-center justify-center rounded-full bg-brand-teal shadow-lg active:bg-brand-tealDark"
        >
          <Text className="text-3xl font-light text-bg">+</Text>
        </Pressable>
      </View>

      {TAB_ITEMS.slice(2).map((item) => {
        const routeIndex = state.routes.findIndex((r) => r.name === item.name);
        const focused = state.index === routeIndex;
        return (
          <TabButton
            key={item.name}
            label={item.label}
            icon={item.icon}
            focused={focused}
            onPress={() => navigation.navigate(item.name)}
          />
        );
      })}
    </View>
  );
}

function TabButton({
  label,
  icon,
  focused,
  onPress,
}: {
  label: string;
  icon: string;
  focused: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      className="min-h-[48px] flex-1 items-center justify-center"
    >
      <Text className={`text-lg ${focused ? 'text-brand-teal' : 'text-text-muted'}`}>{icon}</Text>
      <Text className={`mt-0.5 text-xs font-medium ${focused ? 'text-brand-teal' : 'text-text-muted'}`}>
        {label}
      </Text>
    </Pressable>
  );
}

export default function TabsLayout() {
  return (
    <Tabs screenOptions={{ headerShown: false }} tabBar={(props) => <CustomTabBar {...props} />}>
      <Tabs.Screen name="index" options={{ title: 'Deck' }} />
      <Tabs.Screen name="stack" options={{ title: 'Stack' }} />
      <Tabs.Screen name="alerts" options={{ title: 'Alerts' }} />
      <Tabs.Screen name="insights" options={{ title: 'Insights' }} />
    </Tabs>
  );
}
