import mixpanel from "mixpanel-browser";

export const MIXPANEL_TOKEN =
  process.env.EXPO_PUBLIC_MIXPANEL_TOKEN ?? "4b05b8dd16260dc9ca804d827d52d19a";

export const mixpanelEnabled = MIXPANEL_TOKEN.length > 0;

let started = false;

export function initMixpanel(): void {
  if (started || !mixpanelEnabled || typeof window === "undefined") return;
  mixpanel.init(MIXPANEL_TOKEN, {
    autocapture: true,
    record_sessions_percent: 100,
  });
  started = true;
}

export function identifyMixpanel(id: string): void {
  if (!started) initMixpanel();
  if (!started) return;
  mixpanel.identify(id);
}

export function trackMixpanel(
  event: string,
  properties?: Record<string, unknown>,
): void {
  if (!started) initMixpanel();
  if (!started) return;
  mixpanel.track(event, properties);
}
