import type { ImageSourcePropType } from "react-native";

import type { MissionStage } from "@/types";

/** 3D stage glyphs — assets/images/onboarding/stages/. */
export const stageIcons: Record<MissionStage, ImageSourcePropType> = {
  building: require("../../assets/images/onboarding/stages/building.png"),
  testing: require("../../assets/images/onboarding/stages/testing.png"),
  store_prep: require("../../assets/images/onboarding/stages/store_prep.png"),
  ready_to_submit: require("../../assets/images/onboarding/stages/ready_to_submit.png"),
};
