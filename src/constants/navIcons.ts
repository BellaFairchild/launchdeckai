import type { ImageSourcePropType } from "react-native";

/** 3D tab glyphs — assets/images/nav/ (sliced from assets/branding/nav-icons.png). */
export type NavIconName =
  | "deck"
  | "missions"
  | "astro"
  | "blueprints"
  | "foundry";

export const navIcons: Record<
  NavIconName,
  { active: ImageSourcePropType; inactive: ImageSourcePropType }
> = {
  deck: {
    active: require("../../assets/images/nav/deck-active.png"),
    inactive: require("../../assets/images/nav/deck-inactive.png"),
  },
  missions: {
    active: require("../../assets/images/nav/missions-active.png"),
    inactive: require("../../assets/images/nav/missions-inactive.png"),
  },
  astro: {
    active: require("../../assets/images/nav/astro-active.png"),
    inactive: require("../../assets/images/nav/astro-inactive.png"),
  },
  blueprints: {
    active: require("../../assets/images/nav/blueprints-active.png"),
    inactive: require("../../assets/images/nav/blueprints-inactive.png"),
  },
  foundry: {
    active: require("../../assets/images/nav/foundry-active.png"),
    inactive: require("../../assets/images/nav/foundry-inactive.png"),
  },
};

export function navIconSource(
  name: NavIconName,
  focused: boolean,
): ImageSourcePropType {
  return focused ? navIcons[name].active : navIcons[name].inactive;
}
