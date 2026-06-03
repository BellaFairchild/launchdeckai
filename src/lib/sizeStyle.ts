import { Platform, StyleSheet, type ViewStyle } from "react-native";

const isWeb = Platform.OS === "web";

/** Square width/height for inline styles — styleq on web requires string dimensions. */
export function squareSize(size: number): Pick<ViewStyle, "width" | "height"> {
  return isWeb
    ? { width: `${size}px`, height: `${size}px` }
    : { width: size, height: size };
}

/** Absolute fill — styleq on web rejects numeric inset zeros from StyleSheet.absoluteFill. */
export function absoluteFillStyle(): ViewStyle {
  return isWeb
    ? {
        position: "absolute",
        top: "0",
        left: "0",
        right: "0",
        bottom: "0",
      }
    : StyleSheet.absoluteFill;
}
