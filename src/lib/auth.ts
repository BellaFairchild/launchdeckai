/**
 * Auth is enabled only when a Clerk publishable key is present. Without it the
 * app runs in demo mode (mock stores, no sign-in) so it always works locally.
 */
export const CLERK_PUBLISHABLE_KEY =
  process.env.EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY ?? "";

export const authEnabled = CLERK_PUBLISHABLE_KEY.length > 0;
