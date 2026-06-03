/**
 * Procedural Web Audio fallback (mirrors web-prototype vocabulary).
 */

import type { SignatureId } from "@/lib/audioAssets";
import { getAudioPreferences } from "@/store/audioPreferences";

let cachedCtx: AudioContext | null = null;

function getCtx(): AudioContext | null {
  if (typeof window === "undefined") return null;
  const Ctx =
    window.AudioContext ||
    (window as Window & { webkitAudioContext?: typeof AudioContext })
      .webkitAudioContext;
  if (!Ctx) return null;
  if (!cachedCtx) cachedCtx = new Ctx();
  if (cachedCtx.state === "suspended") {
    cachedCtx.resume().catch(() => {});
  }
  return cachedCtx;
}

export function resumeWebAudioContext(): void {
  getCtx();
}

function enabled(): boolean {
  return getAudioPreferences().soundEnabled;
}

const UI_GAIN = 0.35;
const SIG_GAIN = 0.55;
const BRAND_GAIN = 0.5;

function playSweep(
  dur: number,
  f0: number,
  f1: number,
  type: OscillatorType,
  peak: number,
) {
  const ctx = getCtx();
  if (!ctx || !enabled()) return;
  try {
    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(f0, now);
    osc.frequency.exponentialRampToValueAtTime(
      Math.max(20, f1),
      now + dur * 0.85,
    );
    gain.gain.setValueAtTime(peak * UI_GAIN, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + dur);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(now);
    osc.stop(now + dur);
  } catch {
    /* ignore */
  }
}

function playArpeggio(
  notes: number[],
  step = 0.07,
  noteLen = 0.25,
  peak = 0.04,
) {
  const ctx = getCtx();
  if (!ctx || !enabled()) return;
  try {
    const now = ctx.currentTime;
    notes.forEach((freq, idx) => {
      const start = now + idx * step;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "sine";
      osc.frequency.setValueAtTime(freq, start);
      gain.gain.setValueAtTime(peak * SIG_GAIN, start);
      gain.gain.exponentialRampToValueAtTime(0.001, start + noteLen);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(start);
      osc.stop(start + noteLen);
    });
  } catch {
    /* ignore */
  }
}

export function webPlayClick() {
  playSweep(0.08, 1400, 300, "triangle", 0.06);
}

export function webPlayNavigate() {
  playSweep(0.04, 2000, 800, "sine", 0.03);
}

export function webPlayToggle(state: boolean) {
  playSweep(0.12, state ? 350 : 600, state ? 680 : 250, "triangle", 0.04);
}

export function webPlaySuccess() {
  playArpeggio([440, 554.37, 659.25, 880], 0.07, 0.25, 0.04);
}

export function webPlayPopup() {
  playSweep(0.25, 220, 660, "sine", 0.04);
}

export function webPlayBack() {
  playSweep(0.05, 800, 1800, "sine", 0.03);
}

export function webPlayConfirm() {
  playArpeggio([440, 554.37, 659.25], 0.05, 0.18, 0.035);
}

export function webPlayError() {
  playSweep(0.18, 120, 80, "sine", 0.05);
}

export function webPlayLocked() {
  playSweep(0.1, 200, 150, "triangle", 0.04);
}

export function webPlayFuelTick() {
  playArpeggio([523.25, 659.25], 0.04, 0.14, 0.035);
}

export function webPlayCountdownTick() {
  playSweep(0.03, 880, 880, "sine", 0.02);
}

export function webPlaySignature(id: SignatureId) {
  if (!enabled()) return;
  switch (id) {
    case "fuel_earned":
      playArpeggio([392, 493.88, 587.33, 783.99], 0.09, 0.35, 0.045);
      break;
    case "milestone":
      playArpeggio([440, 554.37, 659.25, 880, 1108.73], 0.1, 0.3, 0.045);
      break;
    case "signal_ready":
      playArpeggio([523.25, 659.25, 783.99], 0.08, 0.25, 0.045);
      break;
    case "launch_day":
      playArpeggio([440, 554.37, 659.25, 880], 0.12, 0.35, 0.05);
      break;
  }
}

export function webPlayBrandStinger() {
  if (!enabled()) return;
  playArpeggio(
    [523.25, 622.25, 1046.5],
    0.18,
    0.4,
    0.04 * (BRAND_GAIN / SIG_GAIN),
  );
  setTimeout(() => playArpeggio([392, 493.88], 0.15, 0.5, 0.045), 400);
}
