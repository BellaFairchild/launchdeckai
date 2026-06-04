import { create } from "zustand";

import { getStorageItem, setStorageItem } from "@/lib/secureStorage";

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
  const raw = await getStorageItem(key);
  if (raw === null) return fallback;
  return raw === "true";
}

async function writeBool(key: string, value: boolean): Promise<void> {
  await setStorageItem(key, value ? "true" : "false");
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
        getStorageItem(KEYS.ambientVolume),
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
      await setStorageItem(KEYS.ambientVolume, String(clamped));
      set({ ambientVolume: clamped });
    },
  }),
);

export function getAudioPreferences() {
  return useAudioPreferences.getState();
}

export async function markBrandStingerPlayedThisSession(): Promise<void> {
  await setStorageItem(KEYS.brandStingerSession, String(Date.now()));
}

export async function shouldPlayBrandStingerThisSession(): Promise<boolean> {
  const raw = await getStorageItem(KEYS.brandStingerSession);
  if (!raw) return true;
  const ts = parseInt(raw, 10);
  if (Number.isNaN(ts)) return true;
  return Date.now() - ts > 4 * 60 * 60 * 1000;
}

export async function markLaunchDayPlayedToday(
  launchDate: number,
): Promise<void> {
  const day = new Date(launchDate).toDateString();
  await setStorageItem(KEYS.launchDayPlayed, day);
}

export async function shouldPlayLaunchDayToday(
  launchDate: number,
): Promise<boolean> {
  const day = new Date(launchDate).toDateString();
  const played = await getStorageItem(KEYS.launchDayPlayed);
  return played !== day;
}
