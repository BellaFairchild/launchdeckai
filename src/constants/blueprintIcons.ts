import type { ImageSourcePropType } from "react-native";

import type { BlueprintSection } from "@/types";

/**
 * 3D Blueprint section glyphs (assets/images/blueprints/). Self-contained
 * tiles — render to the left of each section card title.
 */
export const blueprintIcons: Record<BlueprintSection, ImageSourcePropType> = {
  app_info: require("../../assets/images/blueprints/app-info.png"),
  app_store: require("../../assets/images/blueprints/app-store.png"),
  legal_compliance: require("../../assets/images/blueprints/legal-compliance.png"),
  marketing: require("../../assets/images/blueprints/marketing.png"),
  beta_testing: require("../../assets/images/blueprints/beta-testing.png"),
  pre_launch: require("../../assets/images/blueprints/pre-launch.png"),
  launch_day: require("../../assets/images/blueprints/launch-day.png"),
  post_launch: require("../../assets/images/blueprints/post-launch.png"),
};
