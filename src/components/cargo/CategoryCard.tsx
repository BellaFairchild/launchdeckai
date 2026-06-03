import type { ReactNode } from "react";

import { GradientView } from "@/components/ui/GradientView";
import { Icon } from "@/components/ui/Icon";
import { CATEGORY_META, withAlpha } from "@/constants/assetCategories";
import { colors } from "@/constants/colors";
import { Pressable, Text, View } from "@/tw";
import type { AssetCategory } from "@/types";

type Props = {
  category: AssetCategory;
  count: number;
  expanded: boolean;
  onToggle: () => void;
  /** The asset rows, rendered inline when expanded. */
  children?: ReactNode;
};

/**
 * A Cargo Bay category. Collapsed: a compact grid cell with a category-colored
 * ring + ambient wash, glyph, label, and count. Expanded: spans full width and
 * renders its asset rows inline.
 */
export function CategoryCard({
  category,
  count,
  expanded,
  onToggle,
  children,
}: Props) {
  const meta = CATEGORY_META[category];
  return (
    <View
      className="overflow-hidden rounded-2xl border bg-bg-card/60"
      style={{ borderColor: withAlpha(meta.hex, expanded ? 0.5 : 0.3) }}
    >
      <Pressable
        onPress={onToggle}
        accessibilityRole="button"
        accessibilityState={{ expanded }}
        accessibilityLabel={`${meta.label}, ${count} asset${count === 1 ? "" : "s"}`}
        className="relative p-3 active:opacity-90"
      >
        <View className="absolute inset-0" pointerEvents="none">
          <GradientView
            colors={[withAlpha(meta.hex, 0.14), "transparent"]}
            direction="diagonal"
          />
        </View>
        <View className="flex-row items-center gap-3">
          <View
            className="h-10 w-10 items-center justify-center rounded-full"
            style={{ backgroundColor: withAlpha(meta.hex, 0.16) }}
          >
            <Text className="text-lg">{meta.glyph}</Text>
          </View>
          <View className="flex-1">
            <Text className="font-display text-base font-bold text-text-primary">
              {meta.label}
            </Text>
            <Text className="font-mono text-[11px] uppercase tracking-wider text-text-tertiary">
              {count} asset{count === 1 ? "" : "s"}
            </Text>
          </View>
          <Icon
            name={expanded ? "chevron-down" : "chevron-right"}
            size={18}
            color={colors.textSecondary}
          />
        </View>
      </Pressable>
      {expanded ? <View className="gap-2 p-3 pt-0">{children}</View> : null}
    </View>
  );
}
