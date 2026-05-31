import type { ImageSourcePropType } from "react-native";
import type { Plan } from "./plans";

/**
 * Static require() map for the Astro character art (ported from the web
 * prototype into assets/images/astro). Metro auto-resolves @2x/@3x density
 * variants from the base file. Requires MUST be literal strings.
 */
export type AstroPose =
  | "avatar"
  | "hello"
  | "thinking"
  | "celebrating"
  | "thumbsup"
  | "pointing"
  | "confused"
  | "crossedArms";

export const astroAssets: Record<Plan, Record<AstroPose, ImageSourcePropType>> = {
  cadet: {
    avatar: require("../../assets/images/astro/cadet-avatar-xs.png"),
    hello: require("../../assets/images/astro/cadet-hello-lg.png"),
    thinking: require("../../assets/images/astro/cadet-thinking-lg.png"),
    celebrating: require("../../assets/images/astro/cadet-celebrating-xl.png"),
    thumbsup: require("../../assets/images/astro/cadet-thumbsup-md.png"),
    pointing: require("../../assets/images/astro/cadet-pointing-md.png"),
    confused: require("../../assets/images/astro/cadet-confused-md.png"),
    crossedArms: require("../../assets/images/astro/cadet-crossed-arms-md.png"),
  },
  commander: {
    avatar: require("../../assets/images/astro/commander-avatar-xs.png"),
    hello: require("../../assets/images/astro/commander-hello-lg.png"),
    thinking: require("../../assets/images/astro/commander-thinking-lg.png"),
    celebrating: require("../../assets/images/astro/commander-celebrating-xl.png"),
    thumbsup: require("../../assets/images/astro/commander-thumbsup-md.png"),
    pointing: require("../../assets/images/astro/commander-pointing-md.png"),
    confused: require("../../assets/images/astro/commander-confused-md.png"),
    crossedArms: require("../../assets/images/astro/commander-crossed-arms-md.png"),
  },
  admiral: {
    avatar: require("../../assets/images/astro/admiral-avatar-xs.png"),
    hello: require("../../assets/images/astro/admiral-hello-lg.png"),
    thinking: require("../../assets/images/astro/admiral-thinking-lg.png"),
    celebrating: require("../../assets/images/astro/admiral-celebrating-xl.png"),
    thumbsup: require("../../assets/images/astro/admiral-thumbsup-md.png"),
    pointing: require("../../assets/images/astro/admiral-pointing-md.png"),
    confused: require("../../assets/images/astro/admiral-confused-md.png"),
    crossedArms: require("../../assets/images/astro/admiral-crossed-arms-md.png"),
  },
};
