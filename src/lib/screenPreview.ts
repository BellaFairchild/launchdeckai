import { Platform } from "react-native";

/**
 * Local web can open tab and modal screens without a Clerk session, so every
 * route is reachable from the browser. Native and production still require auth.
 */
export function allowUnauthedScreenPreview(
  os: typeof Platform.OS = Platform.OS,
  isDev: boolean = typeof __DEV__ !== "undefined" && __DEV__,
): boolean {
  return isDev && os === "web";
}
