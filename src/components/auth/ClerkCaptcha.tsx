/**
 * Native no-op. Clerk's Smart CAPTCHA widget is a web-only DOM concern; on
 * native the SDK handles bot protection without a mount point. The web variant
 * (ClerkCaptcha.web.tsx) renders the required `#clerk-captcha` element.
 */
export function ClerkCaptcha(): null {
  return null;
}
