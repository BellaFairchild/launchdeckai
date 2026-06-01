import { Platform, type ViewStyle } from "react-native";

/** Square width/height for inline styles — styleq on web requires string dimensions. */
export function squareSize(size: number): Pick<ViewStyle, "width" | "height"> {
  return Platform.OS === "web"
    ? { width: `${size}px`, height: `${size}px` }
    : { width: size, height: size };
}
