import type { ImageSourcePropType } from "react-native";

import type { Platform as AppPlatform } from "@/types";

/** 3D store / cross-platform glyphs — assets/images/platforms/. */
export const platformIcons: Record<AppPlatform, ImageSourcePropType> = {
  ios: require("../../assets/images/platforms/app-store.png"),
  android: require("../../assets/images/platforms/play-store.png"),
  both: require("../../assets/images/platforms/both.png"),
};
