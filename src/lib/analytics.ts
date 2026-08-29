/**
 * Product analytics via Mixpanel (primary) with optional PostHog dual-write.
 *
 * Mixpanel uses the official React Native SDK in JavaScript mode so the same
 * code path works on Expo Go, iOS, Android, and web — no native modules.
 *
 * Per Docs/11, NEVER send private content (asset bodies, messages, emails) —
 * only event names + non-PII properties. Omit empty values; never send null.
 */
import Constants from "expo-constants";
import { Platform } from "react-native";
import { Mixpanel } from "mixpanel-react-native";

function mixpanelToken(): string {
  return process.env.EXPO_PUBLIC_MIXPANEL_TOKEN ?? "";
}

function posthogKey(): string {
  return process.env.EXPO_PUBLIC_POSTHOG_KEY ?? "";
}

const POSTHOG_HOST =
  process.env.EXPO_PUBLIC_POSTHOG_HOST ?? "https://us.i.posthog.com";

export function analyticsEnabled(): boolean {
  return mixpanelToken().length > 0 || posthogKey().length > 0;
}

/** Canonical Mixpanel event names (`object_verb` snake_case). */
export type AnalyticsEvent =
  | "sign_up_completed"
  | "onboarding_completed"
  | "mission_created"
  | "milestone_completed"
  | "fuel_earned"
  | "foundry_asset_generated"
  | "cargo_asset_saved"
  | "signal_deck_opened"
  | "signal_asset_forged"
  | "signal_shared"
  | "broadcast_scheduler_opened"
  | "broadcast_scheduled"
  | "broadcast_cancelled"
  | "broadcast_reminder_tapped"
  | "transmit_sequence_tapped"
  | "copilot_message_sent"
  | "plan_upgraded";

export type AnalyticsProperties = Record<string, string | number | boolean>;

let mixpanel: Mixpanel | null = null;
let initPromise: Promise<void> | null = null;
let distinctId = "anonymous";

function clientPlatform(): "ios" | "android" | "web" {
  if (Platform.OS === "ios" || Platform.OS === "android") return Platform.OS;
  return "web";
}

/** Drop null/empty values so Mixpanel never receives `null` or `""`. */
export function compactProperties(
  properties?: Record<string, unknown>,
): AnalyticsProperties {
  if (!properties) return {};
  const out: AnalyticsProperties = {};
  for (const [key, value] of Object.entries(properties)) {
    if (value === null || value === undefined || value === "") continue;
    if (
      typeof value === "string" ||
      typeof value === "number" ||
      typeof value === "boolean"
    ) {
      out[key] = value;
    }
  }
  return out;
}

async function createMixpanel(): Promise<Mixpanel | null> {
  const token = mixpanelToken();
  if (token.length === 0) return null;
  // JavaScript mode (useNative: false) is required for Expo Go + RN web.
  const client = new Mixpanel(token, false, false);
  if (__DEV__) client.setLoggingEnabled(true);
  await client.init(false, {
    platform: clientPlatform(),
    app_version: Constants.expoConfig?.version ?? "1.0.0",
  });
  return client;
}

/** Initialize Mixpanel once at app start. Safe to call repeatedly. */
export function initAnalytics(): Promise<void> {
  if (!initPromise) {
    initPromise = createMixpanel()
      .then((client) => {
        mixpanel = client;
      })
      .catch(() => {
        mixpanel = null;
      });
  }
  return initPromise;
}

function withMixpanel(run: (client: Mixpanel) => void): void {
  void initAnalytics().then(() => {
    if (mixpanel) run(mixpanel);
  });
}

/**
 * Bind Mixpanel to the authenticated user. Await this before tracking
 * `sign_up_completed` so the event is attributed to `$user_id`.
 */
export async function identifyAnalyticsUser(
  id: string,
  profile?: AnalyticsProperties,
): Promise<void> {
  distinctId = id;
  await initAnalytics();
  if (!mixpanel) return;
  await mixpanel.identify(id);
  const attrs = compactProperties(profile);
  if (Object.keys(attrs).length > 0) {
    mixpanel.getPeople().set(attrs);
  }
  mixpanel.flush();
}

/**
 * Bind Mixpanel (and PostHog) to the authenticated user.
 * Call after the user exists in Clerk/Convex — on signup, login, and re-open.
 */
export function setAnalyticsUser(
  id: string,
  profile?: AnalyticsProperties,
): void {
  void identifyAnalyticsUser(id, profile);
}

/** Call on logout so the next session is not merged into this user. */
export function resetAnalytics(): void {
  distinctId = "anonymous";
  withMixpanel((client) => {
    client.reset();
    client.flush();
  });
}

export function track(
  event: AnalyticsEvent,
  properties?: Record<string, unknown>,
): void {
  if (!analyticsEnabled()) return;
  const props = compactProperties(properties);

  withMixpanel((client) => {
    client.track(event, props);
    client.flush();
  });

  const key = posthogKey();
  if (key.length === 0) return;
  fetch(`${POSTHOG_HOST.replace(/\/$/, "")}/capture/`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      api_key: key,
      event,
      distinct_id: distinctId,
      properties: props,
    }),
  }).catch(() => {});
}
