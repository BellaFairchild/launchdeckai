import { Platform } from "react-native";
import * as SecureStore from "expo-secure-store";

/**
 * Cross-platform key/value storage.
 *
 * `expo-secure-store` is native-only — on web its native methods are undefined,
 * so calling them throws `ExpoSecureStore.default.getValueWithKeyAsync is not a
 * function`. An unhandled rejection from that surfaces Expo's full-screen
 * `#error-overlay`, which intercepts every pointer event and makes the whole app
 * feel dead (taps do nothing). So on web we fall back to `localStorage`; on
 * native we use the Keychain/Keystore-backed SecureStore.
 *
 * Storage here is best-effort and must never throw — callers treat a miss as the
 * default. Web persistence is not secure (localStorage); only non-sensitive
 * preferences should rely on it.
 */
export async function getStorageItem(key: string): Promise<string | null> {
  if (Platform.OS === "web") {
    try {
      return globalThis.localStorage?.getItem(key) ?? null;
    } catch {
      return null;
    }
  }
  try {
    return await SecureStore.getItemAsync(key);
  } catch {
    return null;
  }
}

export async function setStorageItem(key: string, value: string): Promise<void> {
  if (Platform.OS === "web") {
    try {
      globalThis.localStorage?.setItem(key, value);
    } catch {
      // ignore — private mode / storage disabled
    }
    return;
  }
  try {
    await SecureStore.setItemAsync(key, value);
  } catch {
    // ignore — never let a write surface the error overlay
  }
}
