import { Tabs, useRouter } from "expo-router";
import { type ComponentProps } from "react";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { GradientView } from "@/components/ui/GradientView";
import { colors } from "@/constants/colors";
import { navIconSource, type NavIconName } from "@/constants/navIcons";
import { playNavigate } from "@/lib/audio";
import { cn } from "@/lib/cn";
import { haptics } from "@/lib/haptics";
import { absoluteFillStyle, squareSize } from "@/lib/sizeStyle";
import { Pressable, Text, View } from "@/tw";
import { Image } from "react-native";

// Derive the tab-bar props type from the Tabs component (expo-router vendors
// react-navigation internally, so there's no @react-navigation/bottom-tabs to import).
type TabBarProps = Parameters<
  NonNullable<ComponentProps<typeof Tabs>["tabBar"]>
>[0];

const TAB_LABEL: Record<string, string> = {
  deck: "Deck",
  missions: "Missions",
  blueprints: "Blueprints",
  foundry: "Foundry",
};

const TAB_WOOD = "#130e08";

/** Dark walnut plank surface for the tab bar. */
function WalnutTabBarSurface() {
  const planks = [0.08, 0.22, 0.36, 0.5, 0.64, 0.78];
  return (
    <View style={absoluteFillStyle()} pointerEvents="none">
      <GradientView
        colors={[TAB_WOOD, "#1a1410", TAB_WOOD, "#0d0a06"]}
        locations={[0, 0.4, 0.75, 1]}
        direction="vertical"
      />
      {planks.map((left, i) => (
        <View
          key={i}
          className="absolute inset-y-0"
          style={{
            left: `${left * 100}%`,
            width: "10%",
            backgroundColor:
              i % 2 === 0 ? "rgba(255,255,255,0.04)" : "rgba(0,0,0,0.18)",
          }}
        />
      ))}
      <GradientView
        colors={["rgba(243,178,51,0.08)", "transparent"]}
        locations={[0, 0.35]}
        direction="vertical"
      />
    </View>
  );
}

const INACTIVE_LABEL = "text-text-primary/45";
/** Content height above the home-indicator safe area. */
const TAB_BAR_BODY_HEIGHT = 92;
const TAB_ICON_SIZE = 46;

function NavTabIcon({
  name,
  focused,
}: {
  name: NavIconName;
  focused: boolean;
}) {
  return (
    <View
      className="items-center justify-center"
      style={[
        squareSize(TAB_ICON_SIZE),
        focused
          ? {
              shadowColor: colors.rocketTeal,
              shadowOpacity: 0.65,
              shadowRadius: 10,
              shadowOffset: { width: 0, height: 0 },
            }
          : undefined,
      ]}
    >
      <Image
        source={navIconSource(name, focused)}
        style={{ width: TAB_ICON_SIZE, height: TAB_ICON_SIZE }}
        resizeMode="contain"
        accessibilityIgnoresInvertColors
      />
    </View>
  );
}

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
  const iconName = name as NavIconName;

  return (
    <Pressable
      key={routeKey}
      onPress={onPress}
      accessibilityRole="button"
      accessibilityState={{ selected: focused }}
      accessibilityLabel={TAB_LABEL[name] ?? name}
      className="flex-1 items-center justify-center gap-1.5 py-2.5"
    >
      <NavTabIcon name={iconName} focused={focused} />
      <Text
        className={cn(
          "text-[11px]",
          focused
            ? "font-body font-semibold text-rocket-teal"
            : `font-body ${INACTIVE_LABEL}`,
        )}
      >
        {TAB_LABEL[name] ?? name}
      </Text>
    </Pressable>
  );
}

/**
 * Custom bottom tab bar (Docs/04): Deck · Missions · [Astro Copilot Orb] ·
 * Blueprints · Foundry. Center orb opens Copilot modal.
 */
export function TabBar({ state, navigation }: TabBarProps) {
  const router = useRouter();
  const insets = useSafeAreaInsets();

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
        playNavigate();
        haptics.selection();
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
      style={{
        minHeight: TAB_BAR_BODY_HEIGHT + insets.bottom,
        paddingBottom: insets.bottom + 10,
      }}
      className="relative flex-row items-center overflow-hidden px-2 pt-3"
    >
      <WalnutTabBarSurface />
      {/* warm brass top edge */}
      <View
        pointerEvents="none"
        className="absolute inset-x-0 top-0 h-px"
        style={{ backgroundColor: "rgba(243, 178, 51, 0.28)" }}
      />
      {left.map(renderTab)}

      <View className="w-16 items-center">
        <Pressable
          onPress={() => {
            playNavigate();
            haptics.selection();
            router.push("/(modals)/copilot");
          }}
          accessibilityRole="button"
          accessibilityLabel="Open AI Copilot"
          className="-mt-7 items-center justify-center active:opacity-90"
          style={{
            shadowColor: colors.rocketTeal,
            shadowOpacity: 0.55,
            shadowRadius: 14,
            shadowOffset: { width: 0, height: 0 },
            elevation: 10,
          }}
        >
          <NavTabIcon name="astro" focused />
        </Pressable>
      </View>

      {right.map(renderTab)}
    </View>
  );
}
