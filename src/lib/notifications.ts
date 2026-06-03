import * as Notifications from "expo-notifications";
import * as Linking from "expo-linking";
import { Platform } from "react-native";

import { track } from "@/lib/analytics";

/** Launch reminders + per-signal broadcast reminders (Docs/02). No-op on web. */

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

/** Stable identifiers so we can cancel selectively (never blanket-wipe). */
const LAUNCH_IDS = ["launch:daily-action", "launch:streak", "launch:day"];
const broadcastId = (signalId: string) => `broadcast:${signalId}`;

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
    // Cancel ONLY the launch reminders — leave broadcast reminders intact.
    await Promise.all(
      LAUNCH_IDS.map((id) =>
        Notifications.cancelScheduledNotificationAsync(id).catch(() => {}),
      ),
    );

    await Notifications.scheduleNotificationAsync({
      identifier: "launch:daily-action",
      content: {
        title: "Today's Launch Action",
        body: "Make one move toward launch in LaunchDeckAI.",
      },
      trigger: { type: Notifications.SchedulableTriggerInputTypes.DAILY, hour: 9, minute: 0 },
    });

    await Notifications.scheduleNotificationAsync({
      identifier: "launch:streak",
      content: {
        title: "Keep your streak alive 🔥",
        body: "Pop into LaunchDeckAI before midnight.",
      },
      trigger: { type: Notifications.SchedulableTriggerInputTypes.DAILY, hour: 20, minute: 0 },
    });

    if (launchDate && launchDate > Date.now()) {
      await Notifications.scheduleNotificationAsync({
        identifier: "launch:day",
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
    await Promise.all(
      LAUNCH_IDS.map((id) =>
        Notifications.cancelScheduledNotificationAsync(id).catch(() => {}),
      ),
    );
  } catch {
    // ignore
  }
}

export type BroadcastReminder = {
  signalId: string;
  signalLabel: string;
  platform: string;
  destinationUrl: string;
  scheduledAt: number;
};

/** Schedule (or replace) a signal's broadcast reminder. Returns false if it
 *  couldn't be scheduled (web, past time, or permission denied). */
export async function scheduleBroadcastReminder(r: BroadcastReminder): Promise<boolean> {
  if (Platform.OS === "web") return false;
  if (r.scheduledAt <= Date.now()) return false;
  const granted = await requestNotificationPermission();
  if (!granted) return false;
  try {
    await Notifications.cancelScheduledNotificationAsync(broadcastId(r.signalId)).catch(
      () => {},
    );
    await Notifications.scheduleNotificationAsync({
      identifier: broadcastId(r.signalId),
      content: {
        title: "Time to broadcast 📡",
        body: `Post your ${r.signalLabel} on ${r.platform} now.`,
        data: { url: r.destinationUrl, signalId: r.signalId },
      },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.DATE,
        date: new Date(r.scheduledAt),
      },
    });
    return true;
  } catch {
    return false;
  }
}

export async function cancelBroadcastReminder(signalId: string): Promise<void> {
  if (Platform.OS === "web") return;
  try {
    await Notifications.cancelScheduledNotificationAsync(broadcastId(signalId));
  } catch {
    // ignore
  }
}

export type BroadcastLike = {
  signalId: string;
  destinationUrl: string;
  scheduledAt: number;
};

/** Reconcile device reminders against the synced plans: (re)schedule future
 *  plans and cancel any broadcast reminders that no longer have a future plan. */
export async function reconcileBroadcastReminders(
  broadcasts: BroadcastLike[],
  lookup: (signalId: string) => { label: string; platform: string } | undefined,
): Promise<void> {
  if (Platform.OS === "web") return;
  try {
    const wanted = new Set(
      broadcasts.filter((b) => b.scheduledAt > Date.now()).map((b) => broadcastId(b.signalId)),
    );

    const scheduled = await Notifications.getAllScheduledNotificationsAsync();
    for (const n of scheduled) {
      const id = (n as { identifier?: string }).identifier;
      if (id && id.startsWith("broadcast:") && !wanted.has(id)) {
        await Notifications.cancelScheduledNotificationAsync(id).catch(() => {});
      }
    }

    for (const b of broadcasts) {
      if (b.scheduledAt <= Date.now()) continue;
      const meta = lookup(b.signalId);
      if (!meta) continue;
      await scheduleBroadcastReminder({
        signalId: b.signalId,
        signalLabel: meta.label,
        platform: meta.platform,
        destinationUrl: b.destinationUrl,
        scheduledAt: b.scheduledAt,
      });
    }
  } catch {
    // ignore reconcile failures
  }
}

/** Open the destination URL carried by a tapped broadcast notification. */
export function handleBroadcastResponse(
  response: Notifications.NotificationResponse,
): void {
  const url = response?.notification?.request?.content?.data?.url;
  if (typeof url === "string" && url.length > 0) {
    track("broadcast_reminder_tapped");
    void Linking.openURL(url).catch(() => {});
  }
}

/** Register the tap listener; returns a subscription with `.remove()`. */
export function registerBroadcastResponseListener(): { remove: () => void } {
  if (Platform.OS === "web") return { remove() {} };
  return Notifications.addNotificationResponseReceivedListener(handleBroadcastResponse);
}
