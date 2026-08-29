/** Lightweight destination-URL validation for the Broadcast scheduler. */

const MAX_DESTINATION_URL = 2048;

function parseUrl(value: string): URL | null {
  const v = value.trim();
  if (!v || v.length > MAX_DESTINATION_URL || /\s/.test(v)) return null;
  const candidate = /^https?:\/\//i.test(v) ? v : `https://${v}`;
  try {
    return new URL(candidate);
  } catch {
    return null;
  }
}

/** True if the value looks like a URL or a bare domain (e.g. "x.com/x"). */
export function isValidDestinationUrl(value: string): boolean {
  const u = parseUrl(value);
  if (!u) return false;
  if (u.protocol !== "http:" && u.protocol !== "https:") return false;
  if (u.username || u.password) return false;
  if (!u.hostname.includes(".")) return false;
  return true;
}

/** Ensure a protocol so the reminder can open it; assumes the value is valid. */
export function normalizeDestinationUrl(value: string): string {
  const v = value.trim();
  return /^https?:\/\//i.test(v) ? v : `https://${v}`;
}
