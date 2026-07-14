import type { ImageSourcePropType } from "react-native";

/**
 * 3D command-drawer glyphs (assets/images/drawer/). Self-contained rounded
 * tiles in the app's handcrafted style — render directly, no extra frame.
 */
export type DrawerIconName =
  | "profile"
  | "cargo"
  | "signal"
  | "launchLibrary"
  | "refuel"
  | "settings"
  | "support"
  | "logout"
  | "menu";

export const drawerIcons: Record<DrawerIconName, ImageSourcePropType> = {
  profile: require("../../assets/images/drawer/profile.png"),
  cargo: require("../../assets/images/drawer/cargo.png"),
  signal: require("../../assets/images/drawer/signal.png"),
  launchLibrary: require("../../assets/images/drawer/launch-library.png"),
  refuel: require("../../assets/images/drawer/refuel.png"),
  settings: require("../../assets/images/drawer/settings.png"),
  support: require("../../assets/images/drawer/support.png"),
  logout: require("../../assets/images/drawer/logout.png"),
  menu: require("../../assets/images/drawer/menu.png"),
};
