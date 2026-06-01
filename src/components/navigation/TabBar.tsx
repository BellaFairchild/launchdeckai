import React, { type ComponentProps } from "react";
import { useRouter, Tabs } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { Pressable, Text, View } from "@/tw";

// Derive the tab-bar props type from the Tabs component (expo-router vendors
// react-navigation internally, so there's no @react-navigation/bottom-tabs to import).
type TabBarProps = Parameters<
  NonNullable<ComponentProps<typeof Tabs>["tabBar"]>
>[0];
import { cn } from "@/lib/cn";
import { colors } from "@/constants/colors";
import { AstroAvatar } from "@/components/astro/AstroAvatar";
import { Icon, type IconName } from "@/components/ui/Icon";
import { GradientView } from "@/components/ui/GradientView";
import { useUIStore } from "@/store/ui";

const TAB_LABEL: Record<string, string> = {
  deck: "Deck",
  missions: "Missions",
  blueprints: "Blueprints",
  foundry: "Foundry",
};

function TabButton({
  routeKey,
  name,
  focused,
  onPress,
}: {
  routeKey: string;
  name: string;
  focused: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable
      key={routeKey}
      onPress={onPress}
      accessibilityRole="button"
      accessibilityState={{ selected: focused }}
      accessibilityLabel={TAB_LABEL[name] ?? name}
      className="flex-1 items-center justify-center gap-1 py-1"
    >
      <View
        style={
          focused
            ? {
                shadowColor: colors.brandTeal,
                shadowOpacity: 0.7,
                shadowRadius: 9,
                shadowOffset: { width: 0, height: 0 },
              }
            : undefined
        }
      >
        <Icon
          name={(name as IconName) ?? "deck"}
          size={24}
          color={focused ? colors.brandTeal : colors.textTertiary}
          strokeWidth={focused ? 2.2 : 2}
        />
      </View>
      <Text
        className={cn(
          "text-[11px]",
          focused
            ? "font-body font-semibold text-brand-teal"
            : "font-body text-text-tertiary",
        )}
      >
        {TAB_LABEL[name] ?? name}
      </Text>
    </Pressable>
  );
}

/**
 * Custom bottom tab bar (Docs/04): Deck · Missions · [Astro Copilot Orb] ·
 * Blueprints · Foundry. The center orb opens the Copilot modal and reflects
 * the user's plan via Astro's belt/ring accent.
 */
export function TabBar({ state, navigation }: TabBarProps) {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const plan = useUIStore((s) => s.plan);

  const routes = state.routes;
  const half = Math.ceil(routes.length / 2);
  const left = routes.slice(0, half);
  const right = routes.slice(half);

  const renderTab = (route: (typeof routes)[number]) => {
    const focused = state.routes[state.index].key === route.key;
    const onPress = () => {
      const event = navigation.emit({
        type: "tabPress",
        target: route.key,
        canPreventDefault: true,
      });
      if (!focused && !event.defaultPrevented) {
        navigation.navigate(route.name);
      }
    };
    return (
      <TabButton
        key={route.key}
        routeKey={route.key}
        name={route.name}
        focused={focused}
        onPress={onPress}
      />
    );
  };

  return (
    <View
      style={{ paddingBottom: insets.bottom }}
      className="relative flex-row items-center border-t border-border-default bg-bg-surface px-2 pt-2"
    >
      {/* lit top edge */}
      <View
        pointerEvents="none"
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          height: 1,
          backgroundColor: "rgba(255,255,255,0.06)",
        }}
      />
      {left.map(renderTab)}

      <View className="w-16 items-center">
        <Pressable
          onPress={() => router.push("/(modals)/copilot")}
          accessibilityRole="button"
          accessibilityLabel="Open AI Copilot"
          style={{
            shadowColor: colors.rocketTeal,
            shadowOpacity: 0.55,
            shadowRadius: 14,
            shadowOffset: { width: 0, height: 0 },
            elevation: 10,
          }}
          className="-mt-7 h-16 w-16 items-center justify-center overflow-hidden rounded-full active:opacity-90"
        >
          {/* gradient launch ring */}
          <GradientView colors={["#1426A8", "#10B7D6"]} direction="diagonal" />
          <View className="h-[58px] w-[58px] items-center justify-center rounded-full bg-bg-card">
            <AstroAvatar plan={plan} variant="orb" size={50} />
          </View>
        </Pressable>
      </View>

      {right.map(renderTab)}
    </View>
  );
}
