/**
 * Product analytics via PostHog's HTTP capture endpoint — no native SDK, works
 * on every platform, and a no-op without a key. Per Docs/11, NEVER send private
 * content (asset bodies, messages) — only event names + non-PII properties.
 */
const KEY = process.env.EXPO_PUBLIC_POSTHOG_KEY ?? "";
const HOST = process.env.EXPO_PUBLIC_POSTHOG_HOST ?? "https://us.i.posthog.com";

export const analyticsEnabled = KEY.length > 0;

/** Canonical event names (Docs/11). */
export type AnalyticsEvent =
  | "user_signed_up"
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

let distinctId = "anonymous";

export function setAnalyticsUser(id: string): void {
  distinctId = id;
}

export function track(event: AnalyticsEvent, properties?: Record<string, unknown>): void {
  if (!analyticsEnabled) return;
  fetch(`${HOST.replace(/\/$/, "")}/capture/`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      api_key: KEY,
      event,
      distinct_id: distinctId,
      properties: properties ?? {},
    }),
  }).catch(() => {});
}
