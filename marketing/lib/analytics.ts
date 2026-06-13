type WaitlistEvent = {
  source: string;
  status: "joined" | "already_joined";
};

/** Fire-and-forget analytics when PostHog is configured. */
export function trackWaitlistSignup(event: WaitlistEvent) {
  const key = process.env.NEXT_PUBLIC_POSTHOG_KEY;
  const host = process.env.NEXT_PUBLIC_POSTHOG_HOST ?? "https://us.i.posthog.com";
  if (!key || typeof window === "undefined") return;

  void fetch(`${host}/capture/`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      api_key: key,
      event: "waitlist_signup",
      properties: {
        source: event.source,
        status: event.status,
        $lib: "marketing-site",
      },
    }),
    keepalive: true,
  }).catch(() => {
    /* analytics must not block signup UX */
  });
}
