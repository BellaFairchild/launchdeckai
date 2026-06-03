import React from "react";
import Svg, { Circle, Line, Path, Rect } from "react-native-svg";

import { colors } from "@/constants/colors";

/**
 * Bespoke cosmic icon set — hand-built vector glyphs keyed to LaunchDeckAI's
 * mission-control metaphor. These replace the Unicode/emoji text glyphs that
 * made the UI read as generic. All icons live on a 24×24 grid, 2px stroke,
 * round caps/joins, so they sit on a consistent optical baseline.
 */
export type IconName =
  | "deck" // radar scope — overview
  | "missions" // milestone flag
  | "blueprints" // gridded plan sheet
  | "foundry" // anvil — forge assets
  | "menu"
  | "flame" // fuel
  | "lock"
  | "arrow-right"
  | "chevron-right"
  | "check"
  | "bolt"
  | "clock"
  | "download"
  | "chevron-down"
  | "plus"
  | "close"
  | "alert" // warning triangle — risk / critical
  // Drawer / command menu
  | "user"
  | "box" // cargo
  | "signal"
  | "link" // chain link — destination URL
  | "book" // launch library
  | "settings"
  | "help" // support life-ring
  | "logout";

type Props = {
  name: IconName;
  size?: number;
  color?: string;
  /** Stroke weight for line glyphs. */
  strokeWidth?: number;
};

function glyph(name: IconName, c: string, sw: number): React.ReactNode {
  const stroke = {
    stroke: c,
    strokeWidth: sw,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
    fill: "none" as const,
  };
  switch (name) {
    case "deck":
      return (
        <>
          <Circle cx={12} cy={12} r={8.5} {...stroke} opacity={0.45} />
          <Circle cx={12} cy={12} r={4.4} {...stroke} />
          <Line x1={12} y1={12} x2={18} y2={6.8} {...stroke} />
          <Circle cx={12} cy={12} r={1.5} fill={c} />
          <Circle cx={16.4} cy={9} r={1.2} fill={c} />
        </>
      );
    case "missions":
      return (
        <>
          <Line x1={6} y1={3.5} x2={6} y2={20.5} {...stroke} />
          <Path d="M6 4.6 H16.6 L13.8 7.6 L16.6 10.6 H6 Z" {...stroke} />
        </>
      );
    case "blueprints":
      return (
        <>
          <Rect x={4} y={3.5} width={16} height={17} rx={2.2} {...stroke} />
          <Line x1={4.5} y1={9} x2={19.5} y2={9} {...stroke} opacity={0.5} />
          <Line x1={4.5} y1={15} x2={19.5} y2={15} {...stroke} opacity={0.5} />
          <Line x1={9.6} y1={4.2} x2={9.6} y2={19.8} {...stroke} opacity={0.5} />
          <Line x1={15} y1={4.2} x2={15} y2={19.8} {...stroke} opacity={0.5} />
          <Circle cx={9.6} cy={9} r={1.5} fill={c} />
        </>
      );
    case "foundry":
      // Anvil silhouette: working surface + horn, flared stem, base.
      return (
        <>
          <Path
            d="M3.5 8 H16 C18.5 8 19.6 7.6 20.6 9 C21.1 9.7 20.2 10.7 19 10.7 H16 V11.2 H3.5 Z"
            fill={c}
          />
          <Path d="M9.6 11.2 L8.7 14.6 H15.3 L14.4 11.2 Z" fill={c} />
          <Rect x={6} y={14.6} width={12} height={2.7} rx={1.1} fill={c} />
        </>
      );
    case "menu":
      return (
        <>
          <Line x1={4} y1={7} x2={20} y2={7} {...stroke} />
          <Line x1={4} y1={12} x2={20} y2={12} {...stroke} />
          <Line x1={4} y1={17} x2={20} y2={17} {...stroke} />
        </>
      );
    case "flame":
      return (
        <Path
          d="M12 2.4 C13.1 6 16.6 7.6 16.6 12.6 A4.6 4.6 0 0 1 7.4 12.6 C7.4 9.6 9 8.4 9.6 6.9 C10.6 8 11.1 8 11.3 8 C11.6 6 11 4 12 2.4 Z"
          fill={c}
        />
      );
    case "lock":
      return (
        <>
          <Rect x={5} y={10.5} width={14} height={9.5} rx={2.4} {...stroke} />
          <Path d="M8 10.5 V8 a4 4 0 0 1 8 0 V10.5" {...stroke} />
          <Circle cx={12} cy={15} r={1.4} fill={c} />
        </>
      );
    case "arrow-right":
      return (
        <>
          <Line x1={4.5} y1={12} x2={18.5} y2={12} {...stroke} />
          <Path d="M12.5 6 L18.5 12 L12.5 18" {...stroke} />
        </>
      );
    case "chevron-right":
      return <Path d="M9 5 L16 12 L9 19" {...stroke} />;
    case "chevron-down":
      return <Path d="M5 9 L12 16 L19 9" {...stroke} />;
    case "clock":
      return (
        <>
          <Circle cx={12} cy={12} r={8.5} {...stroke} />
          <Path d="M12 7 V12 L15.5 14" {...stroke} />
        </>
      );
    case "check":
      return <Path d="M5 12.5 L10 17.5 L19 6.5" {...stroke} />;
    case "bolt":
      return <Path d="M13 2 L5 13 H11 L10 22 L19 10 H12.6 L13 2 Z" fill={c} />;
    case "download":
      return (
        <>
          <Line x1={12} y1={3.5} x2={12} y2={14.5} {...stroke} />
          <Path d="M7.5 10 L12 14.5 L16.5 10" {...stroke} />
          <Path d="M4.5 16.5 V18.5 a1.6 1.6 0 0 0 1.6 1.6 H17.9 A1.6 1.6 0 0 0 19.5 18.5 V16.5" {...stroke} />
        </>
      );
    case "plus":
      return (
        <>
          <Line x1={12} y1={5} x2={12} y2={19} {...stroke} />
          <Line x1={5} y1={12} x2={19} y2={12} {...stroke} />
        </>
      );
    case "close":
      return (
        <>
          <Line x1={6} y1={6} x2={18} y2={18} {...stroke} />
          <Line x1={18} y1={6} x2={6} y2={18} {...stroke} />
        </>
      );
    case "alert":
      // Rounded warning triangle with an exclamation mark.
      return (
        <>
          <Path
            d="M12 3.6 L21 19 A1.4 1.4 0 0 1 19.8 21 H4.2 A1.4 1.4 0 0 1 3 19 Z"
            {...stroke}
          />
          <Line x1={12} y1={9.5} x2={12} y2={14} {...stroke} />
          <Circle cx={12} cy={17} r={1.1} fill={c} />
        </>
      );
    case "user":
      return (
        <>
          <Circle cx={12} cy={8} r={3.4} {...stroke} />
          <Path
            d="M5.5 19 C5.5 15.4 8.4 13.6 12 13.6 C15.6 13.6 18.5 15.4 18.5 19"
            {...stroke}
          />
        </>
      );
    case "box":
      return (
        <>
          <Path d="M12 3 L20 7 V17 L12 21 L4 17 V7 Z" {...stroke} />
          <Path d="M4 7 L12 11 L20 7" {...stroke} />
          <Line x1={12} y1={11} x2={12} y2={21} {...stroke} />
        </>
      );
    case "signal":
      return (
        <>
          <Circle cx={12} cy={12} r={2} fill={c} />
          <Path d="M8.6 8.6 a5 5 0 0 0 0 6.8" {...stroke} />
          <Path d="M15.4 8.6 a5 5 0 0 1 0 6.8" {...stroke} />
          <Path d="M6 6 a8.5 8.5 0 0 0 0 12" {...stroke} opacity={0.45} />
          <Path d="M18 6 a8.5 8.5 0 0 1 0 12" {...stroke} opacity={0.45} />
        </>
      );
    case "link":
      return (
        <>
          <Path d="M10.5 13.5 a3.5 3.5 0 0 1 0 -5 L13 6 a3.5 3.5 0 0 1 5 5 L16.6 12.4" {...stroke} />
          <Path d="M13.5 10.5 a3.5 3.5 0 0 1 0 5 L11 18 a3.5 3.5 0 0 1 -5 -5 L7.4 11.6" {...stroke} />
        </>
      );
    case "book":
      return (
        <>
          <Path
            d="M4 5 C4 4.2 4.8 3.6 6.4 3.6 C9 3.6 11 4.6 12 5.6 C13 4.6 15 3.6 17.6 3.6 C19.2 3.6 20 4.2 20 5 V18 C20 18 19.2 17.6 17.6 17.6 C15 17.6 13 18.6 12 19.6 C11 18.6 9 17.6 6.4 17.6 C4.8 17.6 4 18 4 18 Z"
            {...stroke}
          />
          <Line x1={12} y1={5.6} x2={12} y2={19.6} {...stroke} />
        </>
      );
    case "settings":
      return (
        <>
          <Line x1={4} y1={8.5} x2={20} y2={8.5} {...stroke} />
          <Line x1={4} y1={15.5} x2={20} y2={15.5} {...stroke} />
          <Circle cx={9} cy={8.5} r={2.4} fill={c} />
          <Circle cx={15} cy={15.5} r={2.4} fill={c} />
        </>
      );
    case "help":
      return (
        <>
          <Circle cx={12} cy={12} r={8.5} {...stroke} />
          <Circle cx={12} cy={12} r={3.4} {...stroke} />
          <Line x1={12} y1={3.5} x2={12} y2={8.6} {...stroke} />
          <Line x1={12} y1={15.4} x2={12} y2={20.5} {...stroke} />
          <Line x1={3.5} y1={12} x2={8.6} y2={12} {...stroke} />
          <Line x1={15.4} y1={12} x2={20.5} y2={12} {...stroke} />
        </>
      );
    case "logout":
      return (
        <>
          <Path
            d="M14 7 V5.4 a1.6 1.6 0 0 0 -1.6 -1.6 H6 A1.6 1.6 0 0 0 4.4 5.4 V18.6 A1.6 1.6 0 0 0 6 20.2 H12.4 A1.6 1.6 0 0 0 14 18.6 V17"
            {...stroke}
          />
          <Line x1={10} y1={12} x2={20.5} y2={12} {...stroke} />
          <Path d="M17 8.5 L20.5 12 L17 15.5" {...stroke} />
        </>
      );
    default:
      return null;
  }
}

export function Icon({
  name,
  size = 24,
  color = colors.textSecondary,
  strokeWidth = 2,
}: Props) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      {glyph(name, color, strokeWidth)}
    </Svg>
  );
}
