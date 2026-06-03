jest.mock("expo-notifications", () => ({
  setNotificationHandler: jest.fn(),
  getPermissionsAsync: jest.fn(async () => ({ status: "granted" })),
  requestPermissionsAsync: jest.fn(async () => ({ status: "granted" })),
  scheduleNotificationAsync: jest.fn(async () => undefined),
  cancelScheduledNotificationAsync: jest.fn(async () => undefined),
  getAllScheduledNotificationsAsync: jest.fn(async () => []),
  addNotificationResponseReceivedListener: jest.fn(() => ({ remove: jest.fn() })),
  SchedulableTriggerInputTypes: { DATE: "date", DAILY: "daily" },
}));

jest.mock("expo-linking", () => ({ openURL: jest.fn(async () => undefined) }));

import * as Notifications from "expo-notifications";
import * as Linking from "expo-linking";
import {
  scheduleBroadcastReminder,
  cancelBroadcastReminder,
  reconcileBroadcastReminders,
  handleBroadcastResponse,
} from "./notifications";

const FUTURE = Date.now() + 60 * 60 * 1000;
const PAST = Date.now() - 60 * 60 * 1000;

beforeEach(() => jest.clearAllMocks());

describe("scheduleBroadcastReminder", () => {
  it("schedules a dated reminder with a stable identifier and url payload", async () => {
    const ok = await scheduleBroadcastReminder({
      signalId: "pre_1",
      signalLabel: "Dev log thread",
      platform: "X/Twitter",
      destinationUrl: "https://x.com/compose",
      scheduledAt: FUTURE,
    });
    expect(ok).toBe(true);
    expect(Notifications.scheduleNotificationAsync).toHaveBeenCalledTimes(1);
    const arg = (Notifications.scheduleNotificationAsync as jest.Mock).mock.calls[0][0];
    expect(arg.identifier).toBe("broadcast:pre_1");
    expect(arg.content.data).toEqual({ url: "https://x.com/compose", signalId: "pre_1" });
  });

  it("does not schedule a reminder in the past", async () => {
    const ok = await scheduleBroadcastReminder({
      signalId: "pre_1",
      signalLabel: "x",
      platform: "X",
      destinationUrl: "https://x.com",
      scheduledAt: PAST,
    });
    expect(ok).toBe(false);
    expect(Notifications.scheduleNotificationAsync).not.toHaveBeenCalled();
  });
});

describe("cancelBroadcastReminder", () => {
  it("cancels by stable identifier", async () => {
    await cancelBroadcastReminder("pre_1");
    expect(Notifications.cancelScheduledNotificationAsync).toHaveBeenCalledWith("broadcast:pre_1");
  });
});

describe("reconcileBroadcastReminders", () => {
  it("reschedules future plans and cancels stale broadcast reminders", async () => {
    (Notifications.getAllScheduledNotificationsAsync as jest.Mock).mockResolvedValueOnce([
      { identifier: "broadcast:old" },
      { identifier: "launch:day" },
    ]);
    await reconcileBroadcastReminders(
      [{ signalId: "pre_1", destinationUrl: "https://x.com", scheduledAt: FUTURE }],
      (id) => (id === "pre_1" ? { label: "Dev log", platform: "X" } : undefined),
    );
    expect(Notifications.scheduleNotificationAsync).toHaveBeenCalledTimes(1);
    expect(Notifications.cancelScheduledNotificationAsync).toHaveBeenCalledWith("broadcast:old");
    expect(Notifications.cancelScheduledNotificationAsync).not.toHaveBeenCalledWith("launch:day");
  });
});

describe("handleBroadcastResponse", () => {
  it("opens the url from the notification data", () => {
    handleBroadcastResponse({
      notification: { request: { content: { data: { url: "https://x.com/post" } } } },
    } as any);
    expect(Linking.openURL).toHaveBeenCalledWith("https://x.com/post");
  });

  it("is a no-op when there is no url", () => {
    handleBroadcastResponse({
      notification: { request: { content: { data: {} } } },
    } as any);
    expect(Linking.openURL).not.toHaveBeenCalled();
  });
});
