import { colors } from "@/constants/colors";
import { Text, View } from "@/tw";
import { Button } from "./Button";
import { Icon, type IconName } from "./Icon";

type Props = {
  /** Bespoke vector glyph shown above the title (see components/ui/Icon). */
  icon?: IconName;
  title: string;
  message?: string;
  ctaLabel?: string;
  onCtaPress?: () => void;
};

export function EmptyState({
  icon = "satellite",
  title,
  message,
  ctaLabel,
  onCtaPress,
}: Props) {
  return (
    <View className="items-center justify-center gap-3 px-8 py-12">
      <View
        className="h-16 w-16 items-center justify-center rounded-3xl"
        style={{
          backgroundColor: "rgba(77,200,192,0.10)",
          borderWidth: 1,
          borderColor: "rgba(77,200,192,0.26)",
          shadowColor: colors.brandTeal,
          shadowOpacity: 0.35,
          shadowRadius: 14,
          shadowOffset: { width: 0, height: 0 },
        }}
      >
        <Icon
          name={icon}
          size={30}
          color={colors.brandTeal}
          strokeWidth={1.8}
        />
      </View>
      <Text className="text-center font-display text-lg font-bold text-text-primary">
        {title}
      </Text>
      {message ? (
        <Text className="text-center font-body text-sm text-text-secondary">
          {message}
        </Text>
      ) : null}
      {ctaLabel && onCtaPress ? (
        <Button
          label={ctaLabel}
          onPress={onCtaPress}
          size="sm"
          className="mt-2"
        />
      ) : null}
    </View>
  );
}
