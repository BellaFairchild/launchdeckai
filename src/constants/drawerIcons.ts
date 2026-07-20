import type { ImageSourcePropType } from "react-native";

export type DrawerIconName =
  | "profile"
  | "cargo"
  | "signal"
  | "launch-library"
  | "refuel"
  | "settings"
  | "support"
  | "logout";

/** 3D drawer glyphs — assets/images/drawer/. */
export const drawerIcons: Record<DrawerIconName, ImageSourcePropType> = {
  profile: require("../../assets/images/drawer/profile.png"),
  cargo: require("../../assets/images/drawer/cargo.png"),
  signal: require("../../assets/images/drawer/signal.png"),
  "launch-library": require("../../assets/images/drawer/launch-library.png"),
  refuel: require("../../assets/images/drawer/refuel.png"),
  settings: require("../../assets/images/drawer/settings.png"),
  support: require("../../assets/images/drawer/support.png"),
  logout: require("../../assets/images/drawer/logout.png"),
};
