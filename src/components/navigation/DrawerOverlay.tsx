import { useRouter, type Href } from "expo-router";
import { StyleSheet } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { AstroAvatar } from "@/components/astro/AstroAvatar";
import { Badge } from "@/components/ui/Badge";
import { FuelBadge } from "@/components/ui/FuelBadge";
import { Icon, type IconName } from "@/components/ui/Icon";
import { cn } from "@/lib/cn";
import { colors } from "@/constants/colors";
import { PLANS } from "@/constants/plans";
import { useUIStore } from "@/store/ui";
import { Pressable, ScrollView, Text, View } from "@/tw";

type Item = { label: string; icon: IconName; href?: Href; action?: "logout" };

const ITEMS: Item[] = [
  { label: "Profile", icon: "user", href: "/(modals)/profile" },
  { label: "Cargo Bay", icon: "box", href: "/(modals)/cargo" },
  { label: "Signal Deck", icon: "signal", href: "/(modals)/signal-deck" },
  { label: "Launch Library", icon: "book", href: "/(modals)/launch-library" },
  { label: "Refuel Station", icon: "flame", href: "/(modals)/refuel" },
  { label: "Settings", icon: "settings", href: "/(modals)/settings" },
  { label: "Support", icon: "help", href: "/(modals)/support" },
  { label: "Log Out", icon: "logout", action: "logout" },
];

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
            const tint = isLogout ? colors.statusError : colors.brandTeal;
            return (
              <Pressable
                key={item.label}
                onPress={() => onItem(item)}
                accessibilityRole="button"
                className="min-h-[44px] flex-row items-center gap-3 rounded-2xl px-2.5 py-2 active:bg-bg-card"
              >
                <View
                  className={cn(
                    "h-9 w-9 items-center justify-center rounded-xl border",
                    isLogout
                      ? "border-status-error/30 bg-status-error/10"
                      : "border-border-default bg-bg-card",
                  )}
                >
                  <Icon name={item.icon} size={18} color={tint} />
                </View>
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
