/**
 * Synthesizes placeholder LaunchDeck audio masters (48 kHz mono WAV).
 * Replace with composer-delivered masters; then run export-audio-aac.js for .m4a.
 *
 * Usage: node scripts/generate-audio-assets.js
 */

const fs = require("fs");
const path = require("path");

const ROOT = path.join(__dirname, "..", "assets", "audio");
const SAMPLE_RATE = 48000;

function clamp(v, lo, hi) {
  return Math.max(lo, Math.min(hi, v));
}

function writeWav(filePath, samples) {
  const numSamples = samples.length;
  const dataSize = numSamples * 2;
  const buffer = Buffer.alloc(44 + dataSize);
  buffer.write("RIFF", 0);
  buffer.writeUInt32LE(36 + dataSize, 4);
  buffer.write("WAVE", 8);
  buffer.write("fmt ", 12);
  buffer.writeUInt32LE(16, 16);
  buffer.writeUInt16LE(1, 20);
  buffer.writeUInt16LE(1, 22);
  buffer.writeUInt32LE(SAMPLE_RATE, 24);
  buffer.writeUInt32LE(SAMPLE_RATE * 2, 28);
  buffer.writeUInt16LE(2, 32);
  buffer.writeUInt16LE(16, 34);
  buffer.write("data", 36);
  buffer.writeUInt32LE(dataSize, 40);
  for (let i = 0; i < numSamples; i++) {
    const s = clamp(samples[i], -1, 1);
    buffer.writeInt16LE(Math.round(s * 32767 * 0.85), 44 + i * 2);
  }
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  fs.writeFileSync(filePath, buffer);
}

function render({ duration, fn }) {
  const n = Math.ceil(duration * SAMPLE_RATE);
  const out = new Float32Array(n);
  for (let i = 0; i < n; i++) {
    const t = i / SAMPLE_RATE;
    out[i] = fn(t, i / n);
  }
  return out;
}

function envAR(t, dur, attack = 0.008, release = 0.08) {
  if (t < attack) return t / attack;
  if (t > dur - release) return Math.max(0, (dur - t) / release);
  return 1;
}

function toneSweep(dur, f0, f1, type = "sine", gain = 0.35) {
  return render({
    duration: dur,
    fn: (t, p) => {
      const f = f0 * Math.pow(f1 / f0, p);
      const ph = 2 * Math.PI * f * t;
      let w =
        type === "triangle"
          ? (2 / Math.PI) * Math.asin(Math.sin(ph))
          : Math.sin(ph);
      return w * gain * envAR(t, dur);
    },
  });
}

function toneBurst(dur, freq, type = "sine", gain = 0.3) {
  return render({
    duration: dur,
    fn: (t) => {
      let w =
        type === "triangle"
          ? (2 / Math.PI) * Math.asin(Math.sin(2 * Math.PI * freq * t))
          : Math.sin(2 * Math.PI * freq * t);
      return w * gain * envAR(t, dur, 0.002, dur * 0.6);
    },
  });
}

function arpeggio(notes, step = 0.07, len = 0.22, gain = 0.28) {
  const dur = notes.length * step + len;
  return render({
    duration: dur,
    fn: (t) => {
      const idx = Math.min(notes.length - 1, Math.floor(t / step));
      const local = t - idx * step;
      if (local > len) return 0;
      const f = notes[idx];
      return (
        Math.sin(2 * Math.PI * f * local) *
        gain *
        envAR(local, len, 0.003, len * 0.7)
      );
    },
  });
}

function noiseBurst(dur, gain = 0.12, hp = 0.02) {
  let seed = 1;
  const rng = () => {
    seed = (seed * 16807) % 2147483647;
    return seed / 2147483647 - 0.5;
  };
  return render({
    duration: dur,
    fn: (t) => {
      if (t < hp) return 0;
      return rng() * gain * envAR(t - hp, dur - hp, 0.01, dur * 0.5);
    },
  });
}

function ambientPad(dur, baseFreq = 55) {
  return render({
    duration: dur,
    fn: (t, p) => {
      const lfo = 0.5 + 0.5 * Math.sin(2 * Math.PI * 0.08 * t);
      const a = Math.sin(2 * Math.PI * baseFreq * t) * 0.12;
      const b = Math.sin(2 * Math.PI * (baseFreq * 1.5) * t + 1) * 0.08;
      const c = Math.sin(2 * Math.PI * (baseFreq * 2) * t + 2) * 0.05 * lfo;
      const fade = p < 0.02 ? p / 0.02 : p > 0.98 ? (1 - p) / 0.02 : 1;
      return (a + b + c) * fade * 0.9;
    },
  });
}

// ── "Stardust" palette helpers (AUDIO.md §Stardust extension) ───────────────

/** Place a buffer at `startSec` within a `totalSec`-long silent buffer. */
function offset(buf, startSec, totalSec) {
  const n = Math.ceil(totalSec * SAMPLE_RATE);
  const out = new Float32Array(n);
  const start = Math.floor(startSec * SAMPLE_RATE);
  for (let i = 0; i < buf.length && start + i < n; i++) out[start + i] = buf[i];
  return out;
}

/** A single high, fast-decaying sine micro-grain — the atom of "stardust". */
function grain(freq, dur = 0.012, gain = 0.07) {
  return render({
    duration: dur,
    fn: (t) => Math.sin(2 * Math.PI * freq * t) * gain * envAR(t, dur, 0.001, dur * 0.85),
  });
}

/** A shimmer cascade of detuned grains across `notes` (high pentatonic). */
function stardust(notes, step = 0.03, len = 0.05, gain = 0.08, detune = 0.005) {
  const dur = notes.length * step + len;
  return render({
    duration: dur,
    fn: (t) => {
      let s = 0;
      for (let idx = 0; idx < notes.length; idx++) {
        const local = t - idx * step;
        if (local < 0 || local > len) continue;
        const df = notes[idx] * (1 + (idx % 2 === 0 ? detune : -detune));
        s += Math.sin(2 * Math.PI * df * local) * gain * envAR(local, len, 0.002, len * 0.8);
      }
      return s;
    },
  });
}

/** Muted wooden transient — 1-pole low-passed noise (walnut warmth). */
function lowNoise(dur, gain = 0.6) {
  let seed = 7;
  let prev = 0;
  const rng = () => {
    seed = (seed * 16807) % 2147483647;
    return seed / 2147483647 - 0.5;
  };
  return render({
    duration: dur,
    fn: (t) => {
      prev = prev * 0.85 + rng() * 0.15; // 1-pole LP → soft, woody
      return prev * gain * envAR(t, dur, 0.001, dur * 0.7);
    },
  });
}

/** Two soft telemetry beeps at the given [timeSec, freq] hits over `dur`. */
function commBeeps(dur, hits, gain = 0.12) {
  return render({
    duration: dur,
    fn: (t) => {
      for (const [h, f] of hits) {
        if (t >= h && t < h + 0.03) {
          return Math.sin(2 * Math.PI * f * (t - h)) * gain * envAR(t - h, 0.03, 0.002, 0.025);
        }
      }
      return 0;
    },
  });
}

const UI = {
  ui_tap: () => toneSweep(0.075, 1400, 300, "triangle", 0.4),
  ui_nav: () => toneSweep(0.042, 2000, 800, "sine", 0.22),
  ui_toggle: (up = true) =>
    toneSweep(0.12, up ? 350 : 600, up ? 680 : 250, "triangle", 0.25),
  ui_back: () => toneSweep(0.05, 800, 1800, "sine", 0.18),
  ui_confirm: () => arpeggio([440, 554.37, 659.25], 0.05, 0.18, 0.22),
  ui_error: () => {
    const a = toneBurst(0.18, 120, "sine", 0.35);
    const b = noiseBurst(0.15, 0.08);
    return mix(a, b);
  },
  ui_locked: () => noiseBurst(0.1, 0.2),
  ui_type: () => toneBurst(0.02, 1200, "sine", 0.08),
  ui_sheet_open: () => toneSweep(0.25, 200, 800, "sine", 0.2),
  ui_sheet_close: () => toneSweep(0.2, 800, 200, "sine", 0.18),
  ui_fuel_tick: () => arpeggio([523.25, 659.25], 0.04, 0.14, 0.26),
  ui_countdown_tick: () => toneBurst(0.03, 880, "sine", 0.06),

  // Signal Deck transmission — soft muted-NASA comms (send / receive pair).
  signal_transmit: () =>
    mix(
      toneSweep(0.18, 400, 1600, "sine", 0.1),
      commBeeps(0.5, [[0.02, 1200], [0.12, 1500]]),
    ),
  signal_receive: () =>
    mix(
      commBeeps(0.5, [[0.02, 1500], [0.12, 1200]]),
      offset(toneBurst(0.18, 659.25, "sine", 0.16), 0.2, 0.7),
    ),
};

const SIGNATURE = {
  sig_fuel_earned: () => {
    const chime = arpeggio([392, 493.88, 587.33, 783.99], 0.09, 0.35, 0.3);
    const flutter = noiseBurst(0.25, 0.06);
    return mix(chime, flutter);
  },
  sig_milestone: () =>
    arpeggio([440, 554.37, 659.25, 880, 1108.73], 0.1, 0.3, 0.32),
  sig_signal_ready: () => arpeggio([523.25, 659.25, 783.99], 0.08, 0.25, 0.3),
  sig_launch_day: () => {
    const a = toneSweep(0.4, 80, 120, "sine", 0.25);
    const b = arpeggio([440, 554.37, 659.25, 880], 0.12, 0.35, 0.35);
    const tail = ambientPad(1.2, 65);
    return mix(a, mix(b, tail));
  },

  // ── Stardust extension (AUDIO.md §Stardust) ──────────────────────────────

  // Launch chime — uplifting feature-activation liftoff.
  sig_launch_chime: () => {
    const arp = arpeggio([523.25, 659.25, 783.99, 880, 1046.5], 0.08, 0.5, 0.28);
    const whoosh = toneSweep(0.6, 200, 1200, "sine", 0.12);
    const dust = offset(
      stardust([1046.5, 1318.5, 1568, 2093, 2637], 0.05, 0.1, 0.07),
      0.4,
      1.4,
    );
    const tail = offset(ambientPad(0.7, 130), 0.7, 1.4);
    return mix(arp, mix(whoosh, mix(dust, tail)));
  },

  // Blueprint completion — teal ascending-fifth resolve + gold bell cap.
  sig_blueprint_complete: () => {
    const fifth = arpeggio([587.33, 880], 0.1, 0.28, 0.26); // D5 → A5
    const bell = offset(
      mix(
        toneBurst(0.6, 392, "sine", 0.14),
        mix(toneBurst(0.6, 493.88, "sine", 0.1), toneBurst(0.6, 587.33, "sine", 0.08)),
      ),
      0.3,
      1.8,
    );
    const ticks = render({
      duration: 1.8,
      fn: (t) => {
        for (const h of [0.05, 0.13, 0.21]) {
          if (t >= h && t < h + 0.02) return Math.sin(2 * Math.PI * 1200 * (t - h)) * 0.04;
        }
        return 0;
      },
    });
    const tail = offset(ambientPad(0.8, 110), 0.6, 1.8);
    return mix(fifth, mix(bell, mix(ticks, tail)));
  },

  // Cargo Bay save — woody "stow" transient + teal confirm + settling dust.
  sig_cargo_saved: () => {
    const stow = lowNoise(0.05, 0.6);
    const ping = offset(arpeggio([659.25, 880], 0.08, 0.16, 0.24), 0.08, 0.8); // E5 → A5
    const settle = offset(stardust([1760, 1318.5], 0.04, 0.06, 0.06), 0.32, 0.8); // A6 → E6
    return mix(stow, mix(ping, settle));
  },

  // Plan-tier sparkle — gold bell bloom + ascending stardust cascade.
  sig_plan_unlock: () => {
    const bell = mix(
      toneBurst(0.7, 523.25, "sine", 0.13),
      mix(toneBurst(0.7, 659.25, "sine", 0.1), toneBurst(0.7, 783.99, "sine", 0.08)),
    );
    const cascade = offset(
      stardust([1046.5, 1174.66, 1318.5, 1568, 1760, 2093, 2637], 0.03, 0.05, 0.09),
      0.1,
      0.9,
    );
    const reveal = toneSweep(0.4, 300, 900, "sine", 0.06);
    return mix(bell, mix(cascade, reveal));
  },
};

const BRAND = {
  brand_stinger_launchdeck: () => {
    const sub = toneSweep(0.35, 40, 90, "sine", 0.35);
    const motif = arpeggio([523.25, 622.25, 1046.5], 0.18, 0.4, 0.28);
    const gold = arpeggio([392, 493.88], 0.15, 0.5, 0.32);
    const tail = ambientPad(0.9, 55);
    const beeps = render({
      duration: 0.5,
      fn: (t) => {
        const hits = [0, 0.12, 0.28];
        for (const h of hits) {
          if (t >= h && t < h + 0.04) {
            return Math.sin(2 * Math.PI * 1200 * (t - h)) * 0.15;
          }
        }
        return 0;
      },
    });
    return mix(sub, mix(motif, mix(gold, mix(tail, beeps))));
  },
};

const AMBIENT = {
  ambient_deck_loop: () => ambientPad(8, 52),
  ambient_foundry_loop: () => ambientPad(8, 58),
  ambient_launch_eve: () => {
    const pad = ambientPad(8, 50);
    const tick = render({
      duration: 8,
      fn: (t) =>
        Math.sin(2 * Math.PI * 2 * t) > 0.95
          ? Math.sin(2 * Math.PI * 600 * t) * 0.04
          : 0,
    });
    return mix(pad, tick);
  },
};

function mix(...bufs) {
  const len = Math.max(...bufs.map((b) => b.length));
  const out = new Float32Array(len);
  for (const b of bufs) {
    for (let i = 0; i < b.length; i++) out[i] += b[i];
  }
  return out;
}

function writeCategory(dir, map) {
  for (const [name, factory] of Object.entries(map)) {
    const samples =
      name === "ui_toggle"
        ? UI.ui_toggle(true)
        : typeof factory === "function"
          ? factory()
          : factory;
    const out = path.join(ROOT, dir, `${name}.wav`);
    writeWav(out, samples);
    console.log("wrote", path.relative(path.join(__dirname, ".."), out));
  }
}

writeCategory("ui", UI);
writeCategory("signature", SIGNATURE);
writeCategory("brand", BRAND);
writeCategory("ambient", AMBIENT);

console.log("\nDone. Optional AAC: node scripts/export-audio-aac.js");
