
import { colors } from "@/constants/colors";
import { playNavigate } from "@/lib/audio";
import { cn } from "@/lib/cn";
import { haptics } from "@/lib/haptics";
import { Pressable, Text, View } from "@/tw";

export type SegmentOption<T extends string> = {
  value: T;
  label: string;
};

type Props<T extends string> = {
  options: SegmentOption<T>[];
  value: T;
  onChange: (value: T) => void;
  /** Fill color for the active pill (defaults to brand teal). */
  activeColor?: string;
  /** Text color on the active pill (defaults to deep bg for contrast). */
  activeTextColor?: string;
  className?: string;
};

/**
 * Pill segmented control — the project's tab/toggle affordance (Deck-grade pill
 * language, never a boxy tab bar). One active pill carries a solid fill; the rest
 * are quiet text. Fires a selection haptic on change.
 */
export function Segmented<T extends string>({
  options,
  value,
  onChange,
  activeColor = colors.brandTeal,
  activeTextColor = colors.bgDeep,
  className,
}: Props<T>) {
  return (
    <View
      accessibilityRole="tablist"
      className={cn(
        "flex-row gap-1 self-start rounded-full border border-border-default bg-bg-surface p-1",
        className,
      )}
    >
      {options.map((opt) => {
        const active = opt.value === value;
        return (
          <Pressable
            key={opt.value}
            accessibilityRole="tab"
            accessibilityState={{ selected: active }}
            onPress={() => {
              if (active) return;
              playNavigate();
              haptics.selection();
              onChange(opt.value);
            }}
            style={active ? { backgroundColor: activeColor } : undefined}
            className={cn(
              "min-h-[36px] items-center justify-center rounded-full px-4 py-1.5",
              !active && "active:opacity-70",
            )}
          >
            <Text
              style={active ? { color: activeTextColor } : undefined}
              className={cn(
                "font-mono text-xs uppercase tracking-[1.5px]",
                active ? "font-bold" : "font-semibold text-text-secondary",
              )}
            >
              {opt.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}
