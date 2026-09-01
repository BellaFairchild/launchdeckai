/**
 * Native Mixpanel sink. Autocapture and session replay need the browser SDK
 * (`mixpanel.web.ts`). Named product events still ingest via Mixpanel's HTTP API.
 */
import { Platform } from "react-native";

export const MIXPANEL_TOKEN =
  process.env.EXPO_PUBLIC_MIXPANEL_TOKEN ?? "4b05b8dd16260dc9ca804d827d52d19a";

export const mixpanelEnabled = MIXPANEL_TOKEN.length > 0;

let distinctId = "anonymous";

export function initMixpanel(): void {
  // Browser SDK is web-only.
}

export function identifyMixpanel(id: string): void {
  distinctId = id;
}

export function trackMixpanel(
  event: string,
  properties?: Record<string, unknown>,
): void {
  if (!mixpanelEnabled) return;
  fetch("https://api.mixpanel.com/track", {
    method: "POST",
    headers: {
      Accept: "text/plain",
      "Content-Type": "application/json",
    },
    body: JSON.stringify([
      {
        event,
        properties: {
          token: MIXPANEL_TOKEN,
          distinct_id: distinctId,
          time: Date.now() / 1000,
          $os: Platform.OS,
          $lib: "launchdeckai-native",
          ...(properties ?? {}),
        },
      },
    ]),
  }).catch(() => {});
}
