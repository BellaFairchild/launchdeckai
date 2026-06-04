# Sound Effect Asset Spec Sheet

> Drop-in inventory of every audio file the LaunchDeckAI app loads,
> traced from [`src/lib/audioAssets.ts`](../src/lib/audioAssets.ts) `require()` calls.
> **Replace files in place — keep the exact filename and folder.** The app maps by
> ID, so a composer master overwrites a placeholder without any code change.
>
> Full sound-design brief: [`AUDIO.md`](../AUDIO.md) · folder notes: [`assets/audio/README.md`](../assets/audio/README.md)
> **Status legend:** ✅ present (synth placeholder) · ⬜ missing

---

## File tree (drop-in targets)

```
assets/audio/
├── ui/                         # 14 files — short telemetry, <120 ms
│   ├── ui_tap.wav
│   ├── ui_nav.wav
│   ├── ui_toggle.wav
│   ├── ui_back.wav
│   ├── ui_confirm.wav
│   ├── ui_error.wav
│   ├── ui_locked.wav
│   ├── ui_type.wav
│   ├── ui_sheet_open.wav
│   ├── ui_sheet_close.wav
│   ├── ui_fuel_tick.wav
│   ├── ui_countdown_tick.wav
│   ├── signal_transmit.wav
│   └── signal_receive.wav
├── signature/                  # 8 files — reward / completion moments
│   ├── sig_fuel_earned.wav
│   ├── sig_milestone.wav
│   ├── sig_signal_ready.wav
│   ├── sig_launch_day.wav
│   ├── sig_launch_chime.wav
│   ├── sig_blueprint_complete.wav
│   ├── sig_cargo_saved.wav
│   └── sig_plan_unlock.wav
├── brand/                      # 1 file — splash stinger
│   └── brand_stinger_launchdeck.wav
└── ambient/                    # 3 files — loop beds (.m4a is what ships)
    ├── ambient_deck_loop.m4a
    ├── ambient_foundry_loop.m4a
    └── ambient_launch_eve.m4a
```

> **Format note:** `ui/`, `signature/`, `brand/` load **`.wav`** masters at runtime.
> `ambient/` loads **`.m4a`**. Each folder may also contain the *other* format as a
> dev/export artifact — only the extension listed above is the one the app `require()`s.
> To replace, overwrite that exact file. (Convert with `node scripts/export-audio-aac.js`.)

---

## 1. UI sounds — `assets/audio/ui/` (14)

| File | Trigger | Character | Duration | Status |
|------|---------|-----------|---------:|:------:|
| `ui_tap.wav` | Button press | Triangle sweep 1.4k→300 Hz | 60–80 ms | ✅ |
| `ui_nav.wav` | Tab / drawer nav | Sine pop 2k→800 Hz | 35–45 ms | ✅ |
| `ui_toggle.wav` | Settings switches | Sliding chip up/down | 80–120 ms | ✅ |
| `ui_back.wav` | Modal dismiss | Reverse whoosh | 50 ms | ✅ |
| `ui_confirm.wav` | Non-signature confirm | Ascending fifth | 150 ms | ✅ |
| `ui_error.wav` | Validation fail | Low dull thud | 200 ms | ✅ |
| `ui_locked.wav` | Gated feature | Muted wooden knock | 100 ms | ✅ |
| `ui_type.wav` | Keyboard focus (off by default) | Single tick | 20 ms | ✅ |
| `ui_sheet_open.wav` | Modal present | Airy rise | 250 ms | ✅ |
| `ui_sheet_close.wav` | Modal dismiss | Airy fall | 200 ms | ✅ |
| `ui_fuel_tick.wav` | Fuel increment anim | Gold partial ping | 120 ms | ✅ |
| `ui_countdown_tick.wav` | Deck T-minus flip (optional) | Mono blip −32 LUFS | 30 ms | ✅ |
| `signal_transmit.wav` | Signal Deck "Transmit Sequence" | Up-whoosh 400→1.6k + 2 comm beeps | 0.5 s | ✅ |
| `signal_receive.wav` | Incoming Copilot reply | 2 descending beeps + settling ping | 0.7 s | ✅ |

---

## 2. Signature sounds — `assets/audio/signature/` (8)

| File | Moment | Character | Duration | Status |
|------|--------|-----------|---------:|:------:|
| `sig_fuel_earned.wav` | Fuel earned (Foundry save) | Gold detuned bell partials | ~0.6 s | ✅ |
| `sig_milestone.wav` | Milestone complete | Reward chime | ~1.0 s | ✅ |
| `sig_signal_ready.wav` | Asset → flight-ready | Reward chime | ~1.0 s | ✅ |
| `sig_launch_day.wav` | Calendar launch day (once) | Triumphant motif | ~2.0 s | ✅ |
| `sig_launch_chime.wav` | First Signal Deck entry / activation | C-pent arp + up-whoosh + stardust | 1.4 s | ✅ |
| `sig_blueprint_complete.wav` | Blueprint section hits 100% | Ascending fifth + gold bell triad | 1.8 s | ✅ |
| `sig_cargo_saved.wav` | Cargo Bay save / bundle export | Walnut transient + teal confirm | 0.8 s | ✅ |
| `sig_plan_unlock.wav` | Refuel plan upgrade | Gold bell bloom + 7-grain stardust | 0.9 s | ✅ |

---

## 3. Brand stinger — `assets/audio/brand/` (1)

| File | Use | Character | Duration | Status |
|------|-----|-----------|---------:|:------:|
| `brand_stinger_launchdeck.wav` | Cold start / splash (max once per session) | Sub swell → teal motif → gold bell → pad tail | 2.8–3.2 s | ✅ |

---

## 4. Ambient beds — `assets/audio/ambient/` (3, `.m4a`)

| File | Context | Character | Duration | Status |
|------|---------|-----------|---------:|:------:|
| `ambient_deck_loop.m4a` | Default browsing bed (Track A) | Low-pass pad, sub rumble, slow LFO | 90–120 s loop | ✅ |
| `ambient_foundry_loop.m4a` | Foundry screen (Track B) | Warmer alt bed | 90–120 s loop | ✅ |
| `ambient_launch_eve.m4a` | Deck when launch < 48h (Track C) | Contextual tension bed | 90–120 s loop | ✅ |

---

## Technical targets (per [AUDIO.md §7](../AUDIO.md))

| Asset type | Format | Sample rate | Channels | Master level |
|------------|--------|-------------|----------|--------------|
| UI SFX | WAV (→ AAC `.m4a` for bundle) | 48 kHz | Mono | peak −12 to −9 dBFS |
| Signature / brand | WAV (→ AAC) | 48 kHz | Stereo optional | −10 dBFS |
| Ambient | AAC `.m4a` | 48 kHz | Stereo | −24 LUFS pre-gain |

**HPF 80 Hz** on non-bass UI. **Bundle budget:** UI ~225 KB + signatures ~400 KB + ambient ~4.5 MB → **< 6 MB** total.

---

### Summary

| Folder | Count | Ext loaded | Status |
|--------|------:|:----------:|:------:|
| `ui/` | 14 | `.wav` | ✅ placeholders |
| `signature/` | 8 | `.wav` | ✅ placeholders |
| `brand/` | 1 | `.wav` | ✅ placeholder |
| `ambient/` | 3 | `.m4a` | ✅ placeholders |
| **Total** | **26** | | replace in place |
