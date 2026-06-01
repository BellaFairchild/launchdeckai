import React from "react";
import { useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { Pressable, Text, View } from "@/tw";
import { FuelBadge } from "@/components/ui/FuelBadge";
import { Icon } from "@/components/ui/Icon";
import { colors } from "@/constants/colors";
import { useUIStore } from "@/store/ui";

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
          <Icon name="menu" size={24} color={colors.textPrimary} />
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
