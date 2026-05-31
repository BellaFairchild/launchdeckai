import * as Haptics from "expo-haptics";
import { Platform } from "react-native";

const native = Platform.OS === "ios" || Platform.OS === "android";

/** Small haptic vocabulary for LaunchDeckAI's signature moments (no-op on web). */
export const haptics = {
  light: () => {
    if (native) Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
  },
  medium: () => {
    if (native) Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(() => {});
  },
  success: () => {
    if (native) Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
  },
  warning: () => {
    if (native) Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning).catch(() => {});
  },
  selection: () => {
    if (native) Haptics.selectionAsync().catch(() => {});
  },
};
