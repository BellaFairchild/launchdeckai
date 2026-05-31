import React from "react";
import { useRouter, type Href } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { Pressable, ScrollView, Text, View } from "@/tw";
import { AstroAvatar } from "@/components/astro/AstroAvatar";
import { FuelBadge } from "@/components/ui/FuelBadge";
import { Badge } from "@/components/ui/Badge";
import { useUIStore } from "@/store/ui";
import { PLANS } from "@/constants/plans";

type Item = { label: string; glyph: string; href?: Href; action?: "logout" };

const ITEMS: Item[] = [
  { label: "Profile", glyph: "👤", href: "/(modals)/profile" },
  { label: "Cargo Bay", glyph: "📦", href: "/(modals)/cargo" },
  { label: "Signal Deck", glyph: "📡", href: "/(modals)/signal-deck" },
  { label: "Launch Library", glyph: "📚", href: "/(modals)/launch-library" },
  { label: "Refuel Station", glyph: "⛽", href: "/(modals)/refuel" },
  { label: "Settings", glyph: "⚙️", href: "/(modals)/settings" },
  { label: "Support", glyph: "🛟", href: "/(modals)/support" },
  { label: "Log Out", glyph: "↩️", action: "logout" },
];

/**
 * Slide-in command drawer (Docs/04). Rendered at the root so it overlays tabs
 * and screens. Items route to the corresponding modal screens.
 */
export function DrawerOverlay() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { drawerOpen, closeDrawer, plan, fuel } = useUIStore();

  if (!drawerOpen) return null;

  const onItem = (item: Item) => {
    closeDrawer();
    if (item.href) {
      router.push(item.href);
    } else if (item.action === "logout") {
      // Wired to Clerk sign-out in Phase 4.
      console.log("[LaunchDeckAI] Log out (pending Phase 4 auth)");
    }
  };

  return (
    <View className="absolute inset-0 z-50 flex-row">
      <View
        style={{ paddingTop: insets.top + 12, paddingBottom: insets.bottom + 12 }}
        className="w-[80%] max-w-[320px] border-r border-border-med bg-bg-surface"
      >
        <View className="flex-row items-center gap-3 px-5 pb-4">
          <AstroAvatar plan={plan} variant="orb" size={44} />
          <View className="flex-1">
            <Text className="font-display text-base font-bold text-text-primary">
              Commander
            </Text>
            <View className="mt-1 flex-row items-center gap-2">
              <Badge label={PLANS[plan].name} variant="plan" />
              <FuelBadge amount={fuel} size="sm" />
            </View>
          </View>
        </View>

        <ScrollView contentContainerClassName="px-3 gap-1">
          {ITEMS.map((item) => (
            <Pressable
              key={item.label}
              onPress={() => onItem(item)}
              accessibilityRole="button"
              className="min-h-[44px] flex-row items-center gap-3 rounded-2xl px-3 py-2 active:bg-bg-card"
            >
              <Text className="text-lg">{item.glyph}</Text>
              <Text className="font-body text-base text-text-primary">{item.label}</Text>
            </Pressable>
          ))}
        </ScrollView>
      </View>

      <Pressable
        onPress={closeDrawer}
        accessibilityLabel="Close menu"
        className="flex-1 bg-black/60"
      />
    </View>
  );
}
