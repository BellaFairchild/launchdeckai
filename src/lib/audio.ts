/**
 * LaunchDeck audio — native bundled SFX + web procedural fallback.
 * See AUDIO.md for the full sound design spec.
 */

import { Platform } from "react-native";

import type { AmbientTrack, SignatureId, SoundId } from "@/lib/audioAssets";
import { SIGNATURE_SOUND } from "@/lib/audioAssets";
import {
    applyNativeAudioMode,
    initNativeAudio,
    nativeDuckAmbient,
    nativePlaySound,
    nativeRestoreAmbient,
    nativeSetAmbient,
    nativeStopAmbient,
} from "@/lib/audioNative";
import {
    resumeWebAudioContext,
    webPlayBack,
    webPlayBrandStinger,
    webPlayClick,
    webPlayConfirm,
    webPlayCountdownTick,
    webPlayError,
    webPlayFuelTick,
    webPlayLocked,
    webPlayNavigate,
    webPlayPopup,
    webPlaySignalReceive,
    webPlaySignalTransmit,
    webPlaySignature,
    webPlaySuccess,
    webPlayToggle,
} from "@/lib/audioWeb";
import { getAudioPreferences } from "@/store/audioPreferences";

export type { AmbientTrack, SignatureId } from "@/lib/audioAssets";

let lastNavAt = 0;
let lastSignatureAt = 0;
let userGestureUnlocked = false;

function isWeb() {
  return Platform.OS === "web";
}

function soundOn() {
  return getAudioPreferences().soundEnabled;
}

function playUi(id: SoundId) {
  if (!soundOn()) return;
  if (isWeb()) return;
  const now = Date.now();
  if (now - lastSignatureAt < 500) return;
  nativePlaySound(id);
}

/** Call on first user interaction (web AudioContext policy). */
export function notifyUserInteraction(): void {
  if (!userGestureUnlocked) {
    userGestureUnlocked = true;
    if (isWeb()) resumeWebAudioContext();
    else void initNativeAudio();
  }
}

export function isSoundEnabled(): boolean {
  return getAudioPreferences().soundEnabled;
}

export function playClick() {
  notifyUserInteraction();
  if (!soundOn()) return;
  if (isWeb()) webPlayClick();
  else playUi("ui_tap");
}

export function playNavigate() {
  notifyUserInteraction();
  if (!soundOn()) return;
  const now = Date.now();
  if (now - lastNavAt < 120) return;
  lastNavAt = now;
  if (isWeb()) webPlayNavigate();
  else playUi("ui_nav");
}

export function playToggle(state: boolean) {
  notifyUserInteraction();
  if (!soundOn()) return;
  if (isWeb()) webPlayToggle(state);
  else playUi("ui_toggle");
}

export function playSuccess() {
  notifyUserInteraction();
  if (!soundOn()) return;
  if (isWeb()) webPlaySuccess();
  else playUi("ui_confirm");
}

export function playPopup() {
  notifyUserInteraction();
  if (!soundOn()) return;
  if (isWeb()) webPlayPopup();
  else playUi("ui_sheet_open");
}

export function playBack() {
  notifyUserInteraction();
  if (!soundOn()) return;
  if (isWeb()) webPlayBack();
  else playUi("ui_back");
}

export function playConfirm() {
  notifyUserInteraction();
  if (!soundOn()) return;
  if (isWeb()) webPlayConfirm();
  else playUi("ui_confirm");
}

export function playError() {
  notifyUserInteraction();
  if (!soundOn()) return;
  if (isWeb()) webPlayError();
  else playUi("ui_error");
}

export function playLocked() {
  notifyUserInteraction();
  if (!soundOn()) return;
  if (isWeb()) webPlayLocked();
  else playUi("ui_locked");
}

export function playFuelTick() {
  notifyUserInteraction();
  if (!soundOn()) return;
  if (isWeb()) webPlayFuelTick();
  else playUi("ui_fuel_tick");
}

export function playCountdownTick() {
  notifyUserInteraction();
  if (!soundOn()) return;
  if (isWeb()) webPlayCountdownTick();
  else playUi("ui_countdown_tick");
}

export function playSignalTransmit() {
  notifyUserInteraction();
  if (!soundOn()) return;
  if (isWeb()) webPlaySignalTransmit();
  else playUi("signal_transmit");
}

export function playSignalReceive() {
  notifyUserInteraction();
  if (!soundOn()) return;
  if (isWeb()) webPlaySignalReceive();
  else playUi("signal_receive");
}

export function playSignature(id: SignatureId) {
  notifyUserInteraction();
  if (!soundOn()) return;
  const now = Date.now();
  if (now - lastSignatureAt < 500) return;
  lastSignatureAt = now;
  if (isWeb()) {
    webPlaySignature(id);
    return;
  }
  nativePlaySound(SIGNATURE_SOUND[id]);
}

export function playBrandStinger() {
  notifyUserInteraction();
  if (!soundOn()) return;
  lastSignatureAt = Date.now();
  if (isWeb()) webPlayBrandStinger();
  else nativePlaySound("brand_stinger_launchdeck");
}

export function setAmbient(track: AmbientTrack | null) {
  if (!getAudioPreferences().ambientEnabled) {
    if (!isWeb()) nativeStopAmbient();
    return;
  }
  if (isWeb()) return;
  nativeSetAmbient(track);
}

export function duckAmbient(factor = 0.5) {
  if (isWeb()) return;
  nativeDuckAmbient(factor);
}

export function restoreAmbient() {
  if (isWeb()) return;
  nativeRestoreAmbient();
}

export async function refreshAudioSessionMode(): Promise<void> {
  await applyNativeAudioMode();
}
