import type { ImageSourcePropType } from "react-native";

export type LaunchDateKey =
  | "two_weeks"
  | "one_month"
  | "three_months"
  | "not_sure";

/** 3D calendar glyphs — assets/images/onboarding/launch-dates/. */
export const launchDateIcons: Record<LaunchDateKey, ImageSourcePropType> = {
  two_weeks: require("../../assets/images/onboarding/launch-dates/two_weeks.png"),
  one_month: require("../../assets/images/onboarding/launch-dates/one_month.png"),
  three_months: require("../../assets/images/onboarding/launch-dates/three_months.png"),
  not_sure: require("../../assets/images/onboarding/launch-dates/not_sure.png"),
};
