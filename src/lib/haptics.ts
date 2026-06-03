import * as Haptics from "expo-haptics";
import { Platform } from "react-native";

import { getAudioPreferences } from "@/store/audioPreferences";

const native = Platform.OS === "ios" || Platform.OS === "android";

function hapticsOn() {
  return getAudioPreferences().hapticsEnabled;
}

/** Small haptic vocabulary for LaunchDeckAI's signature moments (no-op on web). */
export const haptics = {
  light: () => {
    if (!hapticsOn() || !native) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
  },
  medium: () => {
    if (!hapticsOn() || !native) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(() => {});
  },
  success: () => {
    if (!hapticsOn() || !native) return;
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(
      () => {},
    );
  },
  warning: () => {
    if (!hapticsOn() || !native) return;
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning).catch(
      () => {},
    );
  },
  selection: () => {
    if (!hapticsOn() || !native) return;
    Haptics.selectionAsync().catch(() => {});
  },
};
