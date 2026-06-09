import { Platform, StyleSheet, type ViewStyle } from "react-native";

const isWeb = Platform.OS === "web";

/** Square width/height for inline styles — styleq on web requires string dimensions. */
export function squareSize(size: number): Pick<ViewStyle, "width" | "height"> {
  return isWeb
    ? // react-native-web's styleq accepts px strings; RN's DimensionValue type does not.
      ({ width: `${size}px`, height: `${size}px` } as unknown as Pick<
        ViewStyle,
        "width" | "height"
      >)
    : { width: size, height: size };
}

/** Absolute fill — styleq on web rejects numeric inset zeros from StyleSheet.absoluteFill. */
export function absoluteFillStyle(): ViewStyle {
  return isWeb
    ? // String insets are intentional for web styleq; cast past RN's stricter types.
      ({
        position: "absolute",
        top: "0",
        left: "0",
        right: "0",
        bottom: "0",
      } as unknown as ViewStyle)
    : StyleSheet.absoluteFill;
}
