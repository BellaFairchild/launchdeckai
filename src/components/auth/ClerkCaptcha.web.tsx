import React from "react";

/**
 * Clerk's Smart CAPTCHA (bot sign-up protection) mounts its widget into an
 * element with id `clerk-captcha`. In a custom sign-up flow this element must
 * exist in the DOM before `signUp.create()` runs, otherwise Clerk logs an error
 * and silently falls back to the less-robust Invisible CAPTCHA.
 *
 * Rendered via `React.createElement` so it stays a real DOM node under
 * react-native-web without relying on JSX intrinsic element typings.
 */
export function ClerkCaptcha(): React.ReactElement {
  return React.createElement("div", { id: "clerk-captcha" });
}
