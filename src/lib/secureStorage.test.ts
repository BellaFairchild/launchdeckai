import { Platform } from "react-native";

// Mirror the real web failure: expo-secure-store's native methods are undefined
// on web, so calling them throws. The shim must never reach these on web.
jest.mock("expo-secure-store", () => ({
  getItemAsync: jest.fn(async () => {
    throw new Error("ExpoSecureStore.default.getValueWithKeyAsync is not a function");
  }),
  setItemAsync: jest.fn(async () => {
    throw new Error("ExpoSecureStore.default.setValueWithKeyAsync is not a function");
  }),
}));

import * as SecureStore from "expo-secure-store";
import { getStorageItem, setStorageItem } from "./secureStorage";

const origOS = Platform.OS;

describe("secureStorage on web", () => {
  beforeAll(() => {
    (Platform as { OS: string }).OS = "web";
    const store = new Map<string, string>();
    (globalThis as { localStorage?: unknown }).localStorage = {
      getItem: (k: string) => (store.has(k) ? store.get(k)! : null),
      setItem: (k: string, v: string) => store.set(k, String(v)),
      clear: () => store.clear(),
    };
  });
  afterAll(() => {
    (Platform as { OS: string }).OS = origOS;
    delete (globalThis as { localStorage?: unknown }).localStorage;
  });
  beforeEach(() => jest.clearAllMocks());

  it("reads and writes via localStorage and never touches SecureStore", async () => {
    await setStorageItem("k", "v");
    expect(await getStorageItem("k")).toBe("v");
    // The whole point: on web we must not call the throwing native methods.
    expect(SecureStore.getItemAsync).not.toHaveBeenCalled();
    expect(SecureStore.setItemAsync).not.toHaveBeenCalled();
  });

  it("returns null for a missing key without throwing", async () => {
    await expect(getStorageItem("missing")).resolves.toBeNull();
  });
});

describe("secureStorage on native", () => {
  beforeAll(() => {
    (Platform as { OS: string }).OS = "ios";
  });
  afterAll(() => {
    (Platform as { OS: string }).OS = origOS;
  });

  it("swallows SecureStore failures and resolves to null instead of throwing", async () => {
    // Native path hits SecureStore (mocked to throw) but must not propagate.
    await expect(getStorageItem("k")).resolves.toBeNull();
    await expect(setStorageItem("k", "v")).resolves.toBeUndefined();
    expect(SecureStore.getItemAsync).toHaveBeenCalled();
  });
});
