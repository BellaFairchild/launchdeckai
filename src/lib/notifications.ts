import * as Notifications from "expo-notifications";
import { Platform } from "react-native";

/** Launch reminders (Docs/02 should-have). No-op on web. */

if (Platform.OS !== "web") {
  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowBanner: true,
      shouldShowList: true,
      shouldPlaySound: false,
      shouldSetBadge: false,
    }),
  });
}

export async function requestNotificationPermission(): Promise<boolean> {
  if (Platform.OS === "web") return false;
  try {
    const { status } = await Notifications.getPermissionsAsync();
    if (status === "granted") return true;
    const req = await Notifications.requestPermissionsAsync();
    return req.status === "granted";
  } catch {
    return false;
  }
}

export async function scheduleLaunchReminders(launchDate?: number): Promise<void> {
  if (Platform.OS === "web") return;
  try {
    await Notifications.cancelAllScheduledNotificationsAsync();

    // Daily "Today's Launch Action" at 09:00.
    await Notifications.scheduleNotificationAsync({
      content: {
        title: "Today's Launch Action",
        body: "Make one move toward launch in LaunchDeckAI.",
      },
      trigger: { type: Notifications.SchedulableTriggerInputTypes.DAILY, hour: 9, minute: 0 },
    });

    // Daily streak reminder at 20:00.
    await Notifications.scheduleNotificationAsync({
      content: {
        title: "Keep your streak alive 🔥",
        body: "Pop into LaunchDeckAI before midnight.",
      },
      trigger: { type: Notifications.SchedulableTriggerInputTypes.DAILY, hour: 20, minute: 0 },
    });

    // Launch-day alert.
    if (launchDate && launchDate > Date.now()) {
      await Notifications.scheduleNotificationAsync({
        content: {
          title: "Launch day! 🚀",
          body: "It's go time — transmit your Signal Deck.",
        },
        trigger: {
          type: Notifications.SchedulableTriggerInputTypes.DATE,
          date: new Date(launchDate),
        },
      });
    }
  } catch {
    // ignore scheduling failures (e.g. no permission)
  }
}

export async function cancelReminders(): Promise<void> {
  if (Platform.OS === "web") return;
  try {
    await Notifications.cancelAllScheduledNotificationsAsync();
  } catch {
    // ignore
  }
}
