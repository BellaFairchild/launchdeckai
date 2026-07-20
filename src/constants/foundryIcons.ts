import type { ImageSourcePropType } from "react-native";

/**
 * 3D Foundry tool glyphs (assets/images/foundry/). Self-contained tiles —
 * render directly on the tool cards, no extra vector frame.
 */
export type FoundryIconName =
  | "app_store_copy"
  | "social_blast"
  | "email_sequence"
  | "press_kit"
  | "video_script"
  | "product_hunt_copy"
  | "signal_asset";

export const foundryIcons: Record<FoundryIconName, ImageSourcePropType> = {
  app_store_copy: require("../../assets/images/foundry/app-store-copy.png"),
  social_blast: require("../../assets/images/foundry/social-blast.png"),
  email_sequence: require("../../assets/images/foundry/email-sequence.png"),
  press_kit: require("../../assets/images/foundry/press-kit.png"),
  video_script: require("../../assets/images/foundry/video-script.png"),
  product_hunt_copy: require("../../assets/images/foundry/product-hunt.png"),
  signal_asset: require("../../assets/images/foundry/signal-asset.png"),
};
