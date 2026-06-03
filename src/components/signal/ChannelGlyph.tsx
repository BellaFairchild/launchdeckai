import React from "react";
import Svg, { Circle, Line, Path, Rect, Text as SvgText } from "react-native-svg";

import { View } from "@/tw";

/**
 * Channel marks for the Signal Deck calendar. Default treatment is a tinted
 * "cosmic glyph": a simplified monochrome mark on a same-hue tile, so the grid
 * stays cohesive with the dark theme instead of becoming a wall of brand logos.
 * Where a monochrome mark doesn't reliably read as the platform (Product Hunt,
 * Reddit), it falls back to the real brand color — the recognizability is worth
 * the extra hue. Each glyph carries the platform name as its accessible label.
 */
type ChannelKey =
  | "x"
  | "instagram"
  | "tiktok"
  | "email"
  | "producthunt"
  | "linkedin"
  | "reddit"
  | "generic";

function keyFor(platform: string): ChannelKey {
  const p = platform.toLowerCase();
  if (p.includes("twitter") || p === "x" || p.includes("x/")) return "x";
  if (p.includes("instagram")) return "instagram";
  if (p.includes("tiktok")) return "tiktok";
  if (p.includes("email") || p.includes("mail")) return "email";
  if (p.includes("product hunt") || p.includes("producthunt")) return "producthunt";
  if (p.includes("linkedin")) return "linkedin";
  if (p.includes("reddit")) return "reddit";
  return "generic";
}

/** color = mark + tile hue. `brand` glyphs use a real brand color for legibility. */
const HUE: Record<ChannelKey, string> = {
  x: "#E7ECF3", // near-white: the X mark reads on dark while staying cosmic
  instagram: "#C879A8", // muted cosmic pink — shape carries recognition
  tiktok: "#3FD4E2", // cyan-teal, within the brand family
  email: "#60A5FA", // brand blue light — universal envelope
  linkedin: "#4D8DF0", // brand-blue, close to LinkedIn's own
  producthunt: "#DA552F", // brand fallback: circled P alone reads poorly
  reddit: "#FF4500", // brand fallback: snoo needs its color to land
  generic: "#4DC8C0",
};

/** Append ~14% alpha to a 6-digit hex for the tile background. */
function tile(hex: string): string {
  return `${hex}24`;
}

function mark(key: ChannelKey, color: string, s: number): React.ReactNode {
  const stroke = {
    stroke: color,
    strokeWidth: 2,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
    fill: "none" as const,
  };
  switch (key) {
    case "x":
      return (
        <>
          <Line x1={5} y1={5} x2={19} y2={19} {...stroke} strokeWidth={2.6} />
          <Line x1={19} y1={5} x2={5} y2={19} {...stroke} strokeWidth={2.6} />
        </>
      );
    case "instagram":
      return (
        <>
          <Rect x={4} y={4} width={16} height={16} rx={5} {...stroke} />
          <Circle cx={12} cy={12} r={4} {...stroke} />
          <Circle cx={16.8} cy={7.2} r={1.2} fill={color} />
        </>
      );
    case "tiktok":
      return (
        <>
          <Circle cx={9} cy={17.5} r={2.6} {...stroke} />
          <Path d="M11.6 17.5 V6.5" {...stroke} />
          <Path d="M11.6 6.5 c0 3 2.4 4.6 4.8 4.6" {...stroke} />
        </>
      );
    case "email":
      return (
        <>
          <Rect x={3} y={5.5} width={18} height={13} rx={2.2} {...stroke} />
          <Path d="M4 7 L12 12.6 L20 7" {...stroke} />
        </>
      );
    case "linkedin":
      return (
        <SvgText
          x={12}
          y={16.5}
          fill={color}
          fontSize={11}
          fontWeight="bold"
          textAnchor="middle"
        >
          in
        </SvgText>
      );
    case "producthunt":
      return (
        <>
          <Circle cx={12} cy={12} r={8.5} {...stroke} />
          <SvgText
            x={12}
            y={15.5}
            fill={color}
            fontSize={9}
            fontWeight="bold"
            textAnchor="middle"
          >
            P
          </SvgText>
        </>
      );
    case "reddit":
      return (
        <>
          <Circle cx={12} cy={14} r={6.4} {...stroke} />
          <Circle cx={9.6} cy={13.4} r={1} fill={color} />
          <Circle cx={14.4} cy={13.4} r={1} fill={color} />
          <Path d="M9.4 16.2 c1.6 1.2 3.6 1.2 5.2 0" {...stroke} />
          <Path d="M12 7.6 L14.6 4.2" {...stroke} />
          <Circle cx={15} cy={4} r={1.3} fill={color} />
        </>
      );
    default:
      return <Circle cx={12} cy={12} r={6} {...stroke} />;
  }
}

type Props = {
  platform: string;
  /** Tile edge length in px (default 28). */
  size?: number;
  /** Dim past/launched signals. */
  dimmed?: boolean;
};

export function ChannelGlyph({ platform, size = 28, dimmed }: Props) {
  const key = keyFor(platform);
  const color = HUE[key];
  const inner = Math.round(size * 0.86);
  return (
    <View
      accessibilityRole="image"
      accessibilityLabel={platform}
      style={{
        width: size,
        height: size,
        borderRadius: size * 0.32,
        backgroundColor: tile(color),
        opacity: dimmed ? 0.45 : 1,
      }}
      className="items-center justify-center"
    >
      <Svg width={inner} height={inner} viewBox="0 0 24 24" fill="none">
        {mark(key, color, inner)}
      </Svg>
    </View>
  );
}
