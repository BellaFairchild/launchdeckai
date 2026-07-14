import { useRouter, type Href } from "expo-router";
import { Image, StyleSheet } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { AstroAvatar } from "@/components/astro/AstroAvatar";
import { Badge } from "@/components/ui/Badge";
import { FuelBadge } from "@/components/ui/FuelBadge";
import { drawerIcons, type DrawerIconName } from "@/constants/drawerIcons";
import { PLANS } from "@/constants/plans";
import { cn } from "@/lib/cn";
import { useUIStore } from "@/store/ui";
import { Pressable, ScrollView, Text, View } from "@/tw";

type Item = {
  label: string;
  icon: DrawerIconName;
  href?: Href;
  action?: "logout";
};

const ITEMS: Item[] = [
  { label: "Profile", icon: "profile", href: "/(modals)/profile" },
  { label: "Cargo Bay", icon: "cargo", href: "/(modals)/cargo" },
  { label: "Signal Deck", icon: "signal", href: "/(modals)/signal-deck" },
  {
    label: "Launch Library",
    icon: "launchLibrary",
    href: "/(modals)/launch-library",
  },
  { label: "Refuel Station", icon: "refuel", href: "/(modals)/refuel" },
  { label: "Settings", icon: "settings", href: "/(modals)/settings" },
  { label: "Support", icon: "support", href: "/(modals)/support" },
  { label: "Log Out", icon: "logout", action: "logout" },
];

const DRAWER_ICON_SIZE = 38;

/**
 * Slide-in command drawer (Docs/04). Rendered at the root so it overlays tabs
 * and screens. Items route to the corresponding modal screens.
 */
export function DrawerOverlay() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { drawerOpen, closeDrawer, plan, fuel, signOut } = useUIStore();

  if (!drawerOpen) return null;

  const onItem = (item: Item) => {
    closeDrawer();
    if (item.href) {
      router.push(item.href);
    } else if (item.action === "logout") {
      signOut();
    }
  };

  return (
    <View style={styles.overlay} className="flex-row">
      <View
        style={{
          paddingTop: insets.top + 12,
          paddingBottom: insets.bottom + 12,
        }}
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
          {ITEMS.map((item) => {
            const isLogout = item.action === "logout";
            return (
              <Pressable
                key={item.label}
                onPress={() => onItem(item)}
                accessibilityRole="button"
                accessibilityLabel={item.label}
                className="min-h-[44px] flex-row items-center gap-3 rounded-2xl px-2.5 py-2 active:bg-bg-card"
              >
                <Image
                  source={drawerIcons[item.icon]}
                  style={{
                    width: DRAWER_ICON_SIZE,
                    height: DRAWER_ICON_SIZE,
                    borderRadius: 11,
                  }}
                  resizeMode="contain"
                  accessibilityIgnoresInvertColors
                />
                <Text
                  className={cn(
                    "font-body text-base",
                    isLogout ? "text-status-error" : "text-text-primary",
                  )}
                >
                  {item.label}
                </Text>
              </Pressable>
            );
          })}
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

const styles = StyleSheet.create({
  overlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 50,
  },
});
