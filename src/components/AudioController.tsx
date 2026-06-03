import { useSegments } from "expo-router";
import { useEffect, useRef } from "react";
import { AppState } from "react-native";
import { useReducedMotion } from "react-native-reanimated";

import {
    duckAmbient,
    playBrandStinger,
    restoreAmbient,
    setAmbient,
} from "@/lib/audio";
import { initNativeAudio } from "@/lib/audioNative";
import { isLaunchEve } from "@/lib/launch";
import {
    markBrandStingerPlayedThisSession,
    markLaunchDayPlayedToday,
    shouldPlayBrandStingerThisSession,
    shouldPlayLaunchDayToday,
    useAudioPreferences,
} from "@/store/audioPreferences";
import { useMissionStore } from "@/store/mission";

const IDLE_DUCK_MS = 90_000;
const IDLE_STOP_MS = 180_000;

/**
 * Global audio session: prefs hydration side-effect, ambient beds per tab,
 * brand stinger once per session, idle duck/stop, launch-day signature.
 */
export function AudioController() {
  const hydrated = useAudioPreferences((s) => s.hydrated);
  const soundEnabled = useAudioPreferences((s) => s.soundEnabled);
  const ambientEnabled = useAudioPreferences((s) => s.ambientEnabled);
  const playInSilentMode = useAudioPreferences((s) => s.playInSilentMode);
  const ambientVolume = useAudioPreferences((s) => s.ambientVolume);
  const launchDate = useMissionStore((s) => s.mission.launchDate);
  const segments = useSegments();
  const reducedMotion = useReducedMotion();

  const brandPlayed = useRef(false);
  const lastInteraction = useRef(Date.now());
  const idleDucked = useRef(false);

  useEffect(() => {
    void useAudioPreferences.getState().hydrate();
  }, []);

  useEffect(() => {
    void initNativeAudio();
  }, []);

  useEffect(() => {
    void import("@/lib/audio").then((m) => m.refreshAudioSessionMode());
  }, [playInSilentMode]);

  useEffect(() => {
    if (!hydrated || brandPlayed.current) return;
    let cancelled = false;
    (async () => {
      const ok = await shouldPlayBrandStingerThisSession();
      if (!ok || cancelled || !soundEnabled) return;
      brandPlayed.current = true;
      await markBrandStingerPlayedThisSession();
      if (!reducedMotion) playBrandStinger();
    })();
    return () => {
      cancelled = true;
    };
  }, [hydrated, soundEnabled, reducedMotion]);

  useEffect(() => {
    if (!hydrated || !ambientEnabled) {
      setAmbient(null);
      return;
    }

    const tab = segments.find((s) =>
      ["deck", "missions", "blueprints", "foundry"].includes(s),
    );
    const onDeck = tab === "deck";
    const onFoundry = tab === "foundry";
    const inAuth = segments.includes("(auth)");

    if (inAuth) {
      setAmbient(null);
      return;
    }

    let track: "deck" | "foundry" | "launch_eve" = "deck";
    if (onFoundry) track = "foundry";
    else if (onDeck && isLaunchEve(launchDate)) track = "launch_eve";

    setAmbient(track);
  }, [hydrated, ambientEnabled, ambientVolume, segments, launchDate]);

  useEffect(() => {
    lastInteraction.current = Date.now();
  }, [segments]);

  useEffect(() => {
    if (!hydrated || !launchDate) return;
    let cancelled = false;
    (async () => {
      const parts = await import("@/lib/launch").then((m) =>
        m.launchCountdownParts(launchDate),
      );
      if (cancelled || !parts.hasDate) return;
      const isLaunchCalendarDay =
        parts.days === 0 && !parts.launched && parts.hours < 24;
      if (!isLaunchCalendarDay) return;
      const should = await shouldPlayLaunchDayToday(launchDate);
      if (!should || !soundEnabled) return;
      const { playSignature } = await import("@/lib/audio");
      playSignature("launch_day");
      await markLaunchDayPlayedToday(launchDate);
    })();
    return () => {
      cancelled = true;
    };
  }, [hydrated, launchDate, soundEnabled]);

  useEffect(() => {
    const bump = () => {
      lastInteraction.current = Date.now();
      if (idleDucked.current) {
        idleDucked.current = false;
        restoreAmbient();
      }
    };
    const sub = AppState.addEventListener("change", (state) => {
      if (state === "active") bump();
    });
    const interval = setInterval(() => {
      if (!ambientEnabled) return;
      const idle = Date.now() - lastInteraction.current;
      if (idle >= IDLE_STOP_MS) {
        setAmbient(null);
        return;
      }
      if (idle >= IDLE_DUCK_MS && !idleDucked.current) {
        idleDucked.current = true;
        duckAmbient(0.35);
      }
    }, 5000);
    return () => {
      sub.remove();
      clearInterval(interval);
    };
  }, [ambientEnabled]);

  return null;
}
