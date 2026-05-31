/**
 * Lightweight error reporting. Logs to the console always; when EXPO_PUBLIC_SENTRY_DSN
 * is set, best-effort posts the event to Sentry's store endpoint (no native SDK).
 * Sentry DSNs are public values, so EXPO_PUBLIC_ exposure is expected.
 */
const DSN = process.env.EXPO_PUBLIC_SENTRY_DSN ?? "";
export const monitoringEnabled = DSN.length > 0;

function parseDsn(dsn: string): { host: string; projectId: string; key: string } | null {
  try {
    const u = new URL(dsn);
    const projectId = u.pathname.replace(/^\//, "");
    if (!projectId || !u.username) return null;
    return { host: u.host, projectId, key: u.username };
  } catch {
    return null;
  }
}

function eventId(): string {
  return (Date.now().toString(16) + Math.random().toString(16).slice(2))
    .replace(/[^0-9a-f]/g, "")
    .padEnd(32, "0")
    .slice(0, 32);
}

export function captureError(error: unknown, context?: Record<string, unknown>): void {
  const message = error instanceof Error ? error.message : String(error);
  // eslint-disable-next-line no-console
  console.error("[LaunchDeckAI]", message, context ?? "");
  if (!monitoringEnabled) return;
  const d = parseDsn(DSN);
  if (!d) return;
  const url = `https://${d.host}/api/${d.projectId}/store/?sentry_key=${d.key}&sentry_version=7`;
  fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      event_id: eventId(),
      timestamp: new Date().toISOString(),
      platform: "javascript",
      level: "error",
      exception: {
        values: [
          {
            type: error instanceof Error ? error.name : "Error",
            value: message,
          },
        ],
      },
      extra: context,
    }),
  }).catch(() => {});
}
