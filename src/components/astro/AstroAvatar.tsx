import { astroAssets, type AstroPose } from "@/constants/astroAssets";
import type { Plan } from "@/constants/plans";
import { cn } from "@/lib/cn";
import { squareSize } from "@/lib/sizeStyle";
import { View } from "@/tw";
import { Image } from "@/tw/image";

export type AstroVariant = "orb" | "bust" | "fullBody";

type Props = {
  plan?: Plan;
  variant?: AstroVariant;
  pose?: AstroPose;
  /** Render size in px (square). Defaults per variant. */
  size?: number;
  className?: string;
};

const PLAN_RING: Record<Plan, string> = {
  cadet: "border-border-med",
  commander: "border-gray-400",
  admiral: "border-brand-gold",
};

const DEFAULT_POSE: Record<AstroVariant, AstroPose> = {
  orb: "avatar",
  bust: "hello",
  fullBody: "celebrating",
};

const DEFAULT_SIZE: Record<AstroVariant, number> = {
  orb: 48,
  bust: 96,
  fullBody: 200,
};

/**
 * Astro — the AI Copilot character. Suit/belt reflects plan
 * (Cadet black · Commander silver · Admiral gold). Cadet still looks capable.
 */
export function AstroAvatar({
  plan = "cadet",
  variant = "bust",
  pose,
  size,
  className,
}: Props) {
  const resolvedPose = pose ?? DEFAULT_POSE[variant];
  const resolvedSize = size ?? DEFAULT_SIZE[variant];
  const source = astroAssets[plan][resolvedPose];

  if (variant === "orb") {
    return (
      <View
        className={cn(
          "items-center justify-center overflow-hidden rounded-full border-2 bg-bg-surface",
          PLAN_RING[plan],
          className,
        )}
        style={squareSize(resolvedSize)}
      >
        <Image
          source={source}
          style={squareSize(resolvedSize)}
          contentFit="contain"
        />
      </View>
    );
  }

  return (
    <Image
      accessibilityLabel={`Astro (${plan})`}
      source={source}
      style={squareSize(resolvedSize)}
      contentFit="contain"
      className={className}
    />
  );
}
