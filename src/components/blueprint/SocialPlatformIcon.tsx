import React from "react";
import Svg, { Circle, Path, Rect } from "react-native-svg";

import type { SocialPlatformId } from "@/constants/socialPlatforms";
import { SOCIAL_PLATFORMS } from "@/constants/socialPlatforms";

type Props = {
  platform: SocialPlatformId;
  size?: number;
  /** When false, icon renders muted. */
  active?: boolean;
};

function glyph(platform: SocialPlatformId, active: boolean): React.ReactNode {
  const fg = active ? "#FFFFFF" : "rgba(255,255,255,0.55)";
  switch (platform) {
    case "facebook":
      return (
        <Path
          d="M10.2 8.2 H12 V6.4 C12 5.6 12.1 4.9 12.4 4.4 C12.8 3.7 13.6 3.2 14.8 3.2 C15.8 3.2 16.6 3.3 17.2 3.4 V6.2 H15.7 C14.8 6.2 14.4 6.6 14.4 7.4 V8.2 H17.1 L16.8 10.6 H14.4 V18.8 H12 V10.6 H10.2 Z"
          fill={fg}
        />
      );
    case "instagram":
      return (
        <>
          <Rect
            x={5.2}
            y={5.2}
            width={13.6}
            height={13.6}
            rx={4.2}
            stroke={fg}
            strokeWidth={1.6}
            fill="none"
          />
          <Circle
            cx={12}
            cy={12}
            r={3.2}
            stroke={fg}
            strokeWidth={1.6}
            fill="none"
          />
          <Circle cx={16.2} cy={7.8} r={1.1} fill={fg} />
        </>
      );
    case "linkedin":
      return (
        <>
          <Rect x={5} y={5} width={3.2} height={13} rx={0.6} fill={fg} />
          <Path
            d="M10.2 10.2 C10.8 9.4 11.8 9 13 9 C15.6 9 17 10.6 17 13.4 V18 H14.2 V13.8 C14.2 12.6 13.8 11.8 12.7 11.8 C11.9 11.8 11.4 12.3 11.2 12.8 C11.1 13.1 11.1 13.5 11.1 13.9 V18 H8.3 V10.2 H11.1 V11.4 C11.4 10.8 11.9 10.2 10.2 10.2 Z"
            fill={fg}
          />
          <Circle cx={6.6} cy={7.4} r={1.8} fill={fg} />
        </>
      );
    case "twitter":
      return (
        <Path
          d="M16.8 7.2 C16.2 7.5 15.5 7.7 14.8 7.8 C15.5 7.3 16.1 6.5 16.3 5.6 C15.7 6.1 14.9 6.4 14.1 6.6 C13.5 6 12.6 5.6 11.6 5.6 C9.7 5.6 8.2 7.1 8.2 9 C8.2 9.3 8.2 9.6 8.3 9.8 C5.7 9.7 3.4 8.5 1.9 6.6 C1.6 7.1 1.4 7.7 1.4 8.3 C1.4 9.5 2 10.6 2.9 11.2 C2.4 11.2 1.9 11 1.5 10.8 V10.8 C1.5 12.4 2.6 13.8 4.1 14.1 C3.8 14.2 3.5 14.2 3.2 14.2 C3 14.2 2.8 14.2 2.6 14.1 C3 15.5 4.3 16.5 5.8 16.5 C4.6 17.4 3.1 18 1.4 18 C1.1 18 0.8 18 0.5 17.9 C2 18.9 3.8 19.5 5.7 19.5 C11.6 19.5 14.8 14.6 14.8 10.3 V9.8 C15.5 9.3 16.1 8.7 16.8 7.2 Z"
          fill={fg}
          transform="translate(4, 2) scale(0.78)"
        />
      );
    case "youtube":
      return (
        <>
          <Rect x={4} y={7.2} width={16} height={9.6} rx={3.2} fill={fg} />
          <Path
            d="M11.2 10.4 L16.2 12.8 L11.2 15.2 Z"
            fill={active ? "#FF0000" : "rgba(255,0,0,0.45)"}
          />
        </>
      );
    case "tiktok":
      return (
        <>
          <Path
            d="M14.8 6.2 C15.8 7.4 17.2 8.2 18.8 8.4 V11.2 C16.8 11.1 15 10.4 13.6 9.2 V14.8 C13.6 17.4 11.5 19.5 8.9 19.5 C6.3 19.5 4.2 17.4 4.2 14.8 C4.2 12.2 6.3 10.1 8.9 10.1 C9.3 10.1 9.7 10.2 10.1 10.3 V13.1 C9.7 13 9.3 12.9 8.9 12.9 C7.8 12.9 6.9 13.8 6.9 14.9 C6.9 16 7.8 16.9 8.9 16.9 C10 16.9 10.9 16 10.9 14.9 V6.2 H13.6 C13.8 6.8 14.2 7.4 14.8 6.2 Z"
            fill={fg}
          />
          {active ? (
            <>
              <Path
                d="M15.6 6.8 L16.4 7.2 L15.8 8.1 Z"
                fill="#25F4EE"
                opacity={0.9}
              />
              <Path
                d="M14.2 7.6 L15 8 L14.4 8.9 Z"
                fill="#FE2C55"
                opacity={0.9}
              />
            </>
          ) : null}
        </>
      );
    default:
      return null;
  }
}

export function SocialPlatformIcon({
  platform,
  size = 28,
  active = true,
}: Props) {
  const meta = SOCIAL_PLATFORMS.find((p) => p.id === platform);
  const bg = active ? (meta?.brandColor ?? "#64748B") : "#1E2D45";

  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      <Circle cx={12} cy={12} r={12} fill={bg} />
      {glyph(platform, active)}
    </Svg>
  );
}
