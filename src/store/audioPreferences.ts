import * as SecureStore from "expo-secure-store";
import { Platform } from "react-native";
import { create } from "zustand";

/**
 * Web has no SecureStore (native module). Fall back to localStorage on web so
 * preference hydration doesn't crash the app; SecureStore on native.
 */
async function getItem(key: string): Promise<string | null> {
  if (Platform.OS === "web") {
    try {
      return globalThis.localStorage?.getItem(key) ?? null;
    } catch {
      return null;
    }
  }
  return SecureStore.getItemAsync(key);
}

async function setItem(key: string, value: string): Promise<void> {
  if (Platform.OS === "web") {
    try {
      globalThis.localStorage?.setItem(key, value);
    } catch {
      // ignore quota / private-mode failures
    }
    return;
  }
  await SecureStore.setItemAsync(key, value);
}

const KEYS = {
  sound: "ld_sound_enabled",
  haptics: "ld_haptics_enabled",
  ambient: "ld_ambient_enabled",
  playInSilent: "ld_play_in_silent",
  ambientVolume: "ld_ambient_volume",
  brandStingerSession: "ld_brand_stinger_session",
  launchDayPlayed: "ld_launch_day_played",
} as const;

async function readBool(key: string, fallback: boolean): Promise<boolean> {
  const raw = await getItem(key);
  if (raw === null) return fallback;
  return raw === "true";
}

async function writeBool(key: string, value: boolean): Promise<void> {
  await setItem(key, value ? "true" : "false");
}

type AudioPreferencesState = {
  hydrated: boolean;
  soundEnabled: boolean;
  hapticsEnabled: boolean;
  ambientEnabled: boolean;
  playInSilentMode: boolean;
  /** 0–1 slider value */
  ambientVolume: number;
  hydrate: () => Promise<void>;
  setSoundEnabled: (value: boolean) => Promise<void>;
  setHapticsEnabled: (value: boolean) => Promise<void>;
  setAmbientEnabled: (value: boolean) => Promise<void>;
  setPlayInSilentMode: (value: boolean) => Promise<void>;
  setAmbientVolume: (value: number) => Promise<void>;
};

export const useAudioPreferences = create<AudioPreferencesState>(
  (set, get) => ({
    hydrated: false,
    soundEnabled: true,
    hapticsEnabled: true,
    ambientEnabled: false,
    playInSilentMode: false,
    ambientVolume: 1,

    hydrate: async () => {
      const [
        soundEnabled,
        hapticsEnabled,
        ambientEnabled,
        playInSilentMode,
        volRaw,
      ] = await Promise.all([
        readBool(KEYS.sound, true),
        readBool(KEYS.haptics, true),
        readBool(KEYS.ambient, false),
        readBool(KEYS.playInSilent, false),
        getItem(KEYS.ambientVolume),
      ]);
      const ambientVolume =
        volRaw !== null ? Math.min(1, Math.max(0, parseFloat(volRaw) || 1)) : 1;
      set({
        hydrated: true,
        soundEnabled,
        hapticsEnabled,
        ambientEnabled,
        playInSilentMode,
        ambientVolume,
      });
    },

    setSoundEnabled: async (value) => {
      await writeBool(KEYS.sound, value);
      set({ soundEnabled: value });
    },

    setHapticsEnabled: async (value) => {
      await writeBool(KEYS.haptics, value);
      set({ hapticsEnabled: value });
    },

    setAmbientEnabled: async (value) => {
      await writeBool(KEYS.ambient, value);
      set({ ambientEnabled: value });
    },

    setPlayInSilentMode: async (value) => {
      await writeBool(KEYS.playInSilent, value);
      set({ playInSilentMode: value });
    },

    setAmbientVolume: async (value) => {
      const clamped = Math.min(1, Math.max(0, value));
      await setItem(KEYS.ambientVolume, String(clamped));
      set({ ambientVolume: clamped });
    },
  }),
);

export function getAudioPreferences() {
  return useAudioPreferences.getState();
}

export async function markBrandStingerPlayedThisSession(): Promise<void> {
  await setItem(KEYS.brandStingerSession, String(Date.now()));
}

export async function shouldPlayBrandStingerThisSession(): Promise<boolean> {
  const raw = await getItem(KEYS.brandStingerSession);
  if (!raw) return true;
  const ts = parseInt(raw, 10);
  if (Number.isNaN(ts)) return true;
  return Date.now() - ts > 4 * 60 * 60 * 1000;
}

export async function markLaunchDayPlayedToday(
  launchDate: number,
): Promise<void> {
  const day = new Date(launchDate).toDateString();
  await setItem(KEYS.launchDayPlayed, day);
}

export async function shouldPlayLaunchDayToday(
  launchDate: number,
): Promise<boolean> {
  const day = new Date(launchDate).toDateString();
  const played = await getItem(KEYS.launchDayPlayed);
  return played !== day;
}
