import { AstroAvatar } from "@/components/astro/AstroAvatar";
import type { AstroPose } from "@/constants/astroAssets";
import { colors } from "@/constants/colors";
import type { Plan } from "@/constants/plans";
import { Text, View } from "@/tw";
import { Button } from "./Button";
import { Icon } from "./Icon";

type Props = {
  title?: string;
  message?: string;
  onRetry?: () => void;
  /** Astro bust pose — when set, replaces the alert vector icon. */
  astroPose?: AstroPose;
  plan?: Plan;
};

export function ErrorState({
  title = "Something drifted off course",
  message = "We hit a snag loading this. Try again in a moment.",
  onRetry,
  astroPose = "confused",
  plan = "cadet",
}: Props) {
  return (
    <View className="items-center justify-center gap-3 px-8 py-12">
      {astroPose ? (
        <AstroAvatar plan={plan} variant="bust" pose={astroPose} size={96} />
      ) : (
        <View
          className="h-16 w-16 items-center justify-center rounded-3xl"
          style={{
            backgroundColor: "rgba(255,155,66,0.10)",
            borderWidth: 1,
            borderColor: "rgba(255,155,66,0.28)",
            shadowColor: colors.statusWarning,
            shadowOpacity: 0.35,
            shadowRadius: 14,
            shadowOffset: { width: 0, height: 0 },
          }}
        >
          <Icon
            name="alert"
            size={30}
            color={colors.statusWarning}
            strokeWidth={1.8}
          />
        </View>
      )}
      <Text className="text-center font-display text-lg font-bold text-text-primary">
        {title}
      </Text>
      <Text className="text-center font-body text-sm text-text-secondary">
        {message}
      </Text>
      {onRetry ? (
        <Button
          label="Try again"
          onPress={onRetry}
          variant="secondary"
          size="sm"
          className="mt-2"
        />
      ) : null}
    </View>
  );
}
