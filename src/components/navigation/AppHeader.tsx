import { useRouter } from "expo-router";
import { Image } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { FuelBadge } from "@/components/ui/FuelBadge";
import { drawerIcons } from "@/constants/drawerIcons";
import { useUIStore } from "@/store/ui";
import { Pressable, Text, View } from "@/tw";

/** Shared top bar on tab screens: drawer menu, wordmark, and Fuel pill. */
export function AppHeader() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const openDrawer = useUIStore((s) => s.openDrawer);
  const fuel = useUIStore((s) => s.fuel);

  return (
    <View
      style={{ paddingTop: insets.top }}
      className="border-b border-border-default bg-bg-deep"
    >
      <View className="h-12 flex-row items-center justify-between px-4">
        <Pressable
          onPress={openDrawer}
          accessibilityRole="button"
          accessibilityLabel="Open menu"
          className="h-11 w-11 items-center justify-center -ml-2"
        >
          <Image
            source={drawerIcons.menu}
            style={{ width: 30, height: 30, borderRadius: 9 }}
            resizeMode="contain"
            accessibilityIgnoresInvertColors
          />
        </Pressable>

        <Text className="font-display text-base font-bold tracking-wide text-text-primary">
          Launch<Text className="text-brand-teal">Deck</Text>AI
        </Text>

        <Pressable
          onPress={() => router.push("/(modals)/refuel")}
          accessibilityRole="button"
          accessibilityLabel="Refuel"
        >
          <FuelBadge amount={fuel} size="sm" />
        </Pressable>
      </View>
    </View>
  );
}
