import { ActivityIndicator } from "react-native";
import {
    interpolateColor,
    useAnimatedStyle,
    useSharedValue,
    withTiming,
} from "react-native-reanimated";

import { Badge } from "@/components/ui/Badge";
import { FuelBadge } from "@/components/ui/FuelBadge";
import { GradientView } from "@/components/ui/GradientView";
import { colors } from "@/constants/colors";
import { foundryIcons } from "@/constants/foundryIcons";
import { PLATFORM_BRAND, type FoundryTool } from "@/constants/foundryTools";
import { PLANS } from "@/constants/plans";
import { Pressable, Text, View } from "@/tw";
import { Animated } from "@/tw/animated";
import { Image } from "@/tw/image";

/** #RGB / #RRGGBB → an rgba() string at the given alpha. */
function withAlpha(hex: string, alpha: number): string {
  let h = hex.replace("#", "");
  if (h.length === 3)
    h = h
      .split("")
      .map((c) => c + c)
      .join("");
  const r = parseInt(h.slice(0, 2), 16);
  const g = parseInt(h.slice(2, 4), 16);
  const b = parseInt(h.slice(4, 6), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

const BORDER_DEFAULT = "#1E2D45"; // --color-border-default
const FORGE_CTA_GRADIENT = ["#7ce9e1", colors.rocketTeal] as const;

type Props = {
  tool: FoundryTool;
  /** Plan-gated (below the required tier). */
  locked: boolean;
  /** Enough Fuel in the tank to forge this tool. */
  affordable: boolean;
  /** This tool is the one currently forging (shows the spinner). */
  busy: boolean;
  /** Any tool is forging — disables taps + dims the non-active cards. */
  anyBusy: boolean;
  onForge: () => void;
};

/**
 * A Foundry tool card whose hover (web) / press (native) state is driven by a
 * single shared value, lighting up in the tool's destination-platform brand
 * color. Three synchronized transitions, per the design:
 *   1. Border  — an always-on platform-tinted gradient ring that intensifies.
 *   2. Surface — the card scales up slightly + a faint ambient brand wash.
 *   3. Icon    — the glyph container gains a brand glow + illuminated border.
 * The SVG GradientView renders the tint on every platform, so the card reads
 * as platform-branded even at rest (no cursor needed for screenshots).
 */
export function FoundryToolCard({
  tool,
  locked,
  affordable,
  busy,
  anyBusy,
  onForge,
}: Props) {
  const brand = PLATFORM_BRAND[tool.platform];
  const dimmed = anyBusy && !busy;

  // 0 = at rest, 1 = hovered/pressed. Drives all three transitions in sync.
  const active = useSharedValue(0);
  const set = (to: number) => {
    active.value = withTiming(to, { duration: 200 });
  };

  // 1 — Wrapper: subtle scale + a brand-colored drop glow.
  const wrapStyle = useAnimatedStyle(() => ({
    transform: [{ scale: 1 + active.value * 0.02 }],
    shadowColor: brand.hex,
    shadowOpacity: active.value * 0.5,
    shadowRadius: active.value * 20,
    shadowOffset: { width: 0, height: active.value * 6 },
    elevation: active.value * 14,
  }));
  // 1 — Intensified border ring fades in over the resting tint.
  const borderStyle = useAnimatedStyle(() => ({ opacity: active.value }));
  // 2 — Faint ambient brand wash inside the card.
  const tintStyle = useAnimatedStyle(() => ({ opacity: active.value }));
  // 3 — Icon container: brand glow + border illuminates to the brand color.
  const iconStyle = useAnimatedStyle(() => ({
    shadowColor: brand.hex,
    shadowOpacity: active.value * 0.85,
    shadowRadius: active.value * 14,
    shadowOffset: { width: 0, height: 0 },
    borderColor: interpolateColor(
      active.value,
      [0, 1],
      [BORDER_DEFAULT, withAlpha(brand.hex, 0.6)],
    ),
  }));

  const ctaLabel = locked
    ? `🔒 Unlock with ${PLANS[tool.requiredPlan].name}`
    : affordable
      ? "Forge Content"
      : `Need ${tool.fuelCost} Fuel — Refuel`;

  // Only an in-flight forge truly disables a card. A plan-locked card stays
  // pressable on purpose: its tap routes to the upgrade modal via onForge.
  const inactive = anyBusy;

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ disabled: inactive }}
      accessibilityLabel={`${tool.name} — ${ctaLabel}`}
      onPress={inactive ? undefined : onForge}
      onHoverIn={() => {
        if (!inactive) set(1);
      }}
      onHoverOut={() => {
        if (!inactive) set(0);
      }}
      onPressIn={() => {
        if (!inactive) set(1);
      }}
      onPressOut={() => {
        if (!inactive) set(0);
      }}
      className={dimmed ? "opacity-60" : undefined}
    >
      <Animated.View
        style={wrapStyle}
        className="overflow-hidden rounded-[26px] p-[1.5px]"
      >
        {/* 1 — resting platform-tinted border */}
        <GradientView
          colors={[withAlpha(brand.hex, 0.5), withAlpha(brand.hex, 0.12)]}
          direction="diagonal"
        />
        {/* 1 — intensified border, fades in on hover/press */}
        <Animated.View style={borderStyle} className="absolute inset-0">
          <GradientView
            colors={[withAlpha(brand.hex, 0.95), withAlpha(brand.hex, 0.4)]}
            direction="diagonal"
          />
        </Animated.View>

        {/* Inner card surface */}
        <View className="overflow-hidden rounded-[24px]">
          <GradientView colors={["#141F33", "#0A1322"]} />
          {/* lit top edge */}
          <View
            pointerEvents="none"
            className="absolute inset-x-0 top-0 h-px bg-white/[0.06]"
          />
          {/* 2 — ambient brand wash */}
          <Animated.View
            pointerEvents="none"
            style={[tintStyle, { backgroundColor: withAlpha(brand.hex, 0.05) }]}
            className="absolute inset-0"
          />

          <View className="p-4">
            <View className="flex-row items-start gap-3">
              {/* 3 — glyph container with brand glow */}
              <Animated.View
                style={iconStyle}
                className="h-11 w-11 items-center justify-center overflow-hidden rounded-2xl border bg-bg-surface"
              >
                <Image
                  source={foundryIcons[tool.icon]}
                  style={{ width: 40, height: 40, borderRadius: 12 }}
                  contentFit="cover"
                  accessibilityIgnoresInvertColors
                />
              </Animated.View>

              <View className="flex-1">
                <Text className="font-display text-base font-bold text-text-primary">
                  {tool.name}
                </Text>
                <Text className="mt-0.5 font-body text-sm text-text-secondary">
                  {tool.description}
                </Text>
                <View className="mt-2 flex-row items-center gap-2">
                  <FuelBadge
                    amount={tool.fuelCost}
                    size="sm"
                    warning={!affordable}
                  />
                  {locked ? (
                    <Badge
                      label={`Needs ${PLANS[tool.requiredPlan].name}`}
                      variant="locked"
                    />
                  ) : null}
                </View>
              </View>
            </View>

            {/* CTA — the whole card is the tap target; this reads as the action */}
            <View
              className={
                "relative mt-3 min-h-[44px] flex-row items-center justify-center gap-2 overflow-hidden rounded-full px-4 py-2.5 " +
                (locked ? "border border-border-default bg-bg-depleted" : "")
              }
            >
              {!locked ? (
                <GradientView
                  colors={FORGE_CTA_GRADIENT}
                  direction="diagonal"
                />
              ) : null}
              {busy ? (
                <ActivityIndicator size="small" color="#060B14" />
              ) : (
                <Text
                  className={
                    locked
                      ? "font-body font-semibold text-text-tertiary"
                      : "font-body font-semibold text-bg-deep"
                  }
                >
                  {ctaLabel}
                </Text>
              )}
            </View>
          </View>
        </View>
      </Animated.View>
    </Pressable>
  );
}
