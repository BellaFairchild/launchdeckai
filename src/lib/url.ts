/** Lightweight destination-URL validation for the Broadcast scheduler. */

/** True if the value looks like a URL or a bare domain (e.g. "x.com/x"). */
export function isValidDestinationUrl(value: string): boolean {
  const v = value.trim();
  if (!v) return false;
  if (/^https?:\/\/\S+\.\S+/i.test(v)) return true;
  if (/^[\w-]+(\.[\w-]+)+(\/\S*)?$/i.test(v)) return true;
  return false;
}

/** Ensure a protocol so the reminder can open it; assumes the value is valid. */
export function normalizeDestinationUrl(value: string): string {
  const v = value.trim();
  return /^https?:\/\//i.test(v) ? v : `https://${v}`;
}
