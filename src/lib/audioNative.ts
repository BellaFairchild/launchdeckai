import {
    createAudioPlayer,
    setAudioModeAsync,
    type AudioPlayer,
} from "expo-audio";
import { AppState, Platform } from "react-native";

import {
    AMBIENT_SOUND,
    SOUND_SOURCES,
    type AmbientTrack,
    type SoundId,
} from "@/lib/audioAssets";
import { getAudioPreferences } from "@/store/audioPreferences";

const UI_GAIN = 0.35;
const SIG_GAIN = 0.55;
const BRAND_GAIN = 0.5;
const AMBIENT_BASE = 0.25;

const POOL_SIZE = 4;
let pool: AudioPlayer[] = [];
let poolIndex = 0;
let ambientPlayer: AudioPlayer | null = null;
let currentAmbient: AmbientTrack | null = null;
let ambientDuck = 1;
let initialized = false;

export async function initNativeAudio(): Promise<void> {
  if (initialized || Platform.OS === "web") return;
  initialized = true;
  const prefs = getAudioPreferences();
  await setAudioModeAsync({
    playsInSilentMode: prefs.playInSilentMode,
    shouldPlayInBackground: false,
    interruptionMode: "mixWithOthers",
  });
  pool = Array.from({ length: POOL_SIZE }, () => createAudioPlayer(null));
  ambientPlayer = createAudioPlayer(null);
  ambientPlayer.loop = true;

  AppState.addEventListener("change", (state) => {
    if (state === "background") {
      fadeAmbientOut(1500);
    }
  });
}

export async function applyNativeAudioMode(): Promise<void> {
  if (Platform.OS === "web") return;
  const prefs = getAudioPreferences();
  await setAudioModeAsync({
    playsInSilentMode: prefs.playInSilentMode,
    shouldPlayInBackground: false,
    interruptionMode: "mixWithOthers",
  });
}

function busGain(id: SoundId): number {
  if (id.startsWith("sig_")) return SIG_GAIN;
  if (id.startsWith("brand_")) return BRAND_GAIN;
  if (id.startsWith("ambient_")) return AMBIENT_BASE;
  return UI_GAIN;
}

export function nativePlaySound(id: SoundId): void {
  if (Platform.OS === "web" || !getAudioPreferences().soundEnabled) return;
  if (!initialized) {
    void initNativeAudio().then(() => nativePlaySound(id));
    return;
  }
  const player = pool[poolIndex % POOL_SIZE];
  poolIndex += 1;
  const source = SOUND_SOURCES[id];
  player.volume = busGain(id);
  if (player.playing) player.pause();
  player.replace(source);
  void player.seekTo(0);
  player.play();
  duckAmbientBrief();
}

export function nativeSetAmbient(track: AmbientTrack | null): void {
  if (Platform.OS === "web") return;
  if (!getAudioPreferences().ambientEnabled) {
    nativeStopAmbient();
    return;
  }
  if (!initialized) {
    void initNativeAudio().then(() => nativeSetAmbient(track));
    return;
  }
  if (!ambientPlayer) return;
  if (track === null) {
    nativeStopAmbient();
    return;
  }
  if (currentAmbient === track && ambientPlayer.playing) return;
  currentAmbient = track;
  const source = SOUND_SOURCES[AMBIENT_SOUND[track]];
  ambientPlayer.replace(source);
  ambientPlayer.volume = ambientLevel();
  ambientPlayer.loop = true;
  ambientPlayer.play();
}

export function nativeStopAmbient(): void {
  if (!ambientPlayer) return;
  ambientPlayer.pause();
  void ambientPlayer.seekTo(0);
  currentAmbient = null;
}

function ambientLevel(): number {
  const { ambientVolume } = getAudioPreferences();
  return AMBIENT_BASE * ambientVolume * ambientDuck * 0.4;
}

function duckAmbientBrief(): void {
  if (!ambientPlayer?.playing) return;
  ambientDuck = 0.5;
  ambientPlayer.volume = ambientLevel();
  setTimeout(() => {
    ambientDuck = 1;
    if (ambientPlayer) ambientPlayer.volume = ambientLevel();
  }, 280);
}

export function nativeDuckAmbient(factor = 0.5): void {
  ambientDuck = factor;
  if (ambientPlayer?.playing) ambientPlayer.volume = ambientLevel();
}

export function nativeRestoreAmbient(): void {
  ambientDuck = 1;
  if (ambientPlayer?.playing) ambientPlayer.volume = ambientLevel();
}

function fadeAmbientOut(ms: number): void {
  if (!ambientPlayer?.playing) return;
  const steps = 8;
  const stepMs = ms / steps;
  let i = 0;
  const startVol = ambientPlayer.volume;
  const timer = setInterval(() => {
    i += 1;
    if (!ambientPlayer) {
      clearInterval(timer);
      return;
    }
    ambientPlayer.volume = startVol * (1 - i / steps);
    if (i >= steps) {
      clearInterval(timer);
      nativeStopAmbient();
    }
  }, stepMs);
}
