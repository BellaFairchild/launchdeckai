# LaunchDeckAI — Master Asset Manifest

> Single source of truth for **every** bundled asset the app loads — images/icons,
> sound effects, and the audio ID→file mapping. Traced from `app.json`,
> `require()` calls, and `src/constants/*` / `src/lib/*`.
>
> **Replace files in place — keep the exact filename and folder.** Code maps by ID,
> so a finished asset overwrites a placeholder without any code change.
>
> Companions: [`icon-assets.md`](icon-assets.md) · [`sound-assets.md`](sound-assets.md) · [`AUDIO.md`](../AUDIO.md)
> **Status legend:** ✅ present on disk · ⬜ to design / missing

---

# Part A — Icons & Images

Traced from [`app.json`](../app.json) and `require()` calls.

## A1. App / store icons — `assets/images/`

| File | Used for | Recommended size | Status |
|------|----------|------------------|:------:|
| `icon.png` | iOS + main app icon | 1024×1024 | ✅ |
| `adaptive-icon.png` | Android adaptive foreground (bg `#0B0A0F`) | 1024×1024, centered safe zone | ✅ |
| `splash-icon.png` | Splash (renders 240 wide, `contain`) | 480–720 wide, transparent | ✅ |
| `favicon.png` | Web favicon | 48×48 / 64×64 | ✅ |

**Unused template leftovers** (in folder, not wired into `app.json`):
`android-icon-background.png`, `android-icon-foreground.png`, `android-icon-monochrome.png`.
Add `monochromeImage` to `android.adaptiveIcon` to enable a Material You themed icon.

## A2. Bottom-tab nav icons — `assets/images/nav/`

Mapped in [`src/constants/navIcons.ts`](../src/constants/navIcons.ts). 5 tabs × 2 states = **10 images**.

| Tab | Active | Inactive | Status |
|-----|--------|----------|:------:|
| Deck | `deck-active.png` | `deck-inactive.png` | ✅ |
| Missions | `missions-active.png` | `missions-inactive.png` | ✅ |
| Astro | `astro-active.png` | `astro-inactive.png` | ✅ |
| Blueprints | `blueprints-active.png` | `blueprints-inactive.png` | ✅ |
| Foundry | `foundry-active.png` | `foundry-inactive.png` | ✅ |

> ⚠️ Only base resolution exists. Add `@2x` / `@3x` density variants (Metro auto-resolves from the base name).

## A3. Astro character art — `assets/images/astro/`

Mapped in [`src/constants/astroAssets.ts`](../src/constants/astroAssets.ts).
3 tiers × 8 poses = **24 base images** (each with `@2x` / `@3x`).
**Tiers:** `cadet` · `commander` · `admiral` · Filename: `{tier}-{pose}-{size}.png`

| Pose | Size suffix | Status |
|------|-------------|:------:|
| avatar | `-avatar-xs` | ✅ |
| hello | `-hello-lg` | ✅ |
| thinking | `-thinking-lg` | ✅ |
| celebrating | `-celebrating-xl` | ✅ |
| thumbsup | `-thumbsup-md` | ✅ |
| pointing | `-pointing-md` | ✅ |
| confused | `-confused-md` | ✅ |
| crossedArms | `-crossed-arms-md` | ✅ |

## A4. Other raster assets — `assets/images/`

| File | Used by | Status |
|------|---------|:------:|
| `nebula-hero.jpg` | [`NebulaBackdrop.tsx`](../src/components/ui/NebulaBackdrop.tsx) | ✅ |
| `deck-hangar.png` | Deck screen art | ✅ |
| `logo-glow.png` | Brand mark / glow | ✅ |

## A5. Code-drawn glyphs — no image files needed

- **27 SVG UI glyphs** in [`src/components/ui/Icon.tsx`](../src/components/ui/Icon.tsx):
  `deck`, `missions`, `blueprints`, `foundry`, `menu`, `flame`, `lock`, `arrow-right`,
  `chevron-right`, `check`, `bolt`, `clock`, `download`, `chevron-down`, `plus`, `close`,
  `alert`, `user`, `box`, `signal`, `link`, `book`, `settings`, `help`, `logout`.
- **Social platform icons** (SVG) in [`SocialPlatformIcon.tsx`](../src/components/blueprint/SocialPlatformIcon.tsx):
  Facebook, Instagram, LinkedIn, X/Twitter, YouTube, TikTok.

## A6. ⬜ Candidates for new icon images — `assets/images/foundry/`

Currently emoji in [`src/constants/foundryTools.ts`](../src/constants/foundryTools.ts). Replace for a polished look:

| Tool | Current glyph | Suggested asset |
|------|:------:|-----------------|
| App Store Copy | 🏪 | `app-store-copy.png` ⬜ |
| Social Blast | 📣 | `social-blast.png` ⬜ |
| Email Sequence | ✉️ | `email-sequence.png` ⬜ |
| Press Kit | 🗞️ | `press-kit.png` ⬜ |
| Video Script | 🎬 | `video-script.png` ⬜ |
| Product Hunt Copy | 🐱 | `product-hunt-copy.png` ⬜ |
| Signal Deck Asset Forge | 📡 | `signal-asset.png` ⬜ |

---

# Part B — Sound Effects

Traced from [`src/lib/audioAssets.ts`](../src/lib/audioAssets.ts). Full brief: [`AUDIO.md`](../AUDIO.md).

## File tree (drop-in targets)

```
assets/audio/
├── ui/                         # 14 — short telemetry, <120 ms (.wav)
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
├── signature/                  # 8 — reward / completion (.wav)
│   ├── sig_fuel_earned.wav
│   ├── sig_milestone.wav
│   ├── sig_signal_ready.wav
│   ├── sig_launch_day.wav
│   ├── sig_launch_chime.wav
│   ├── sig_blueprint_complete.wav
│   ├── sig_cargo_saved.wav
│   └── sig_plan_unlock.wav
├── brand/                      # 1 — splash stinger (.wav)
│   └── brand_stinger_launchdeck.wav
└── ambient/                    # 3 — loop beds (.m4a is what ships)
    ├── ambient_deck_loop.m4a
    ├── ambient_foundry_loop.m4a
    └── ambient_launch_eve.m4a
```

> **Format:** `ui/`, `signature/`, `brand/` load **`.wav`** at runtime; `ambient/` loads **`.m4a`**.
> Folders may also hold the other format as a dev/export artifact — overwrite the exact file above.
> Convert with `node scripts/export-audio-aac.js` (needs ffmpeg).

## B1. UI sounds — `assets/audio/ui/` (14)

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

## B2. Signature sounds — `assets/audio/signature/` (8)

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

## B3. Brand stinger — `assets/audio/brand/` (1)

| File | Use | Character | Duration | Status |
|------|-----|-----------|---------:|:------:|
| `brand_stinger_launchdeck.wav` | Cold start / splash (max once per session) | Sub swell → teal motif → gold bell → pad tail | 2.8–3.2 s | ✅ |

## B4. Ambient beds — `assets/audio/ambient/` (3, `.m4a`)

| File | Context | Character | Duration | Status |
|------|---------|-----------|---------:|:------:|
| `ambient_deck_loop.m4a` | Default browsing bed (Track A) | Low-pass pad, sub rumble, slow LFO | 90–120 s loop | ✅ |
| `ambient_foundry_loop.m4a` | Foundry screen (Track B) | Warmer alt bed | 90–120 s loop | ✅ |
| `ambient_launch_eve.m4a` | Deck when launch < 48h (Track C) | Contextual tension bed | 90–120 s loop | ✅ |

## Audio technical targets (per [AUDIO.md §7](../AUDIO.md))

| Asset type | Format | Sample rate | Channels | Master level |
|------------|--------|-------------|----------|--------------|
| UI SFX | WAV (→ AAC `.m4a` for bundle) | 48 kHz | Mono | peak −12 to −9 dBFS |
| Signature / brand | WAV (→ AAC) | 48 kHz | Stereo optional | −10 dBFS |
| Ambient | AAC `.m4a` | 48 kHz | Stereo | −24 LUFS pre-gain |

**HPF 80 Hz** on non-bass UI. **Bundle budget:** UI ~225 KB + signatures ~400 KB + ambient ~4.5 MB → **< 6 MB** total.

---

# Part C — Audio ID → file mapping

From [`src/lib/audioAssets.ts`](../src/lib/audioAssets.ts) — the IDs code calls, and the file each resolves to. **Do not rename IDs**; replace the underlying file only.

## C1. `SOUND_SOURCES` (26 IDs)

| Sound ID | Resolves to |
|----------|-------------|
| `ui_tap` | `assets/audio/ui/ui_tap.wav` |
| `ui_nav` | `assets/audio/ui/ui_nav.wav` |
| `ui_toggle` | `assets/audio/ui/ui_toggle.wav` |
| `ui_back` | `assets/audio/ui/ui_back.wav` |
| `ui_confirm` | `assets/audio/ui/ui_confirm.wav` |
| `ui_error` | `assets/audio/ui/ui_error.wav` |
| `ui_locked` | `assets/audio/ui/ui_locked.wav` |
| `ui_type` | `assets/audio/ui/ui_type.wav` |
| `ui_sheet_open` | `assets/audio/ui/ui_sheet_open.wav` |
| `ui_sheet_close` | `assets/audio/ui/ui_sheet_close.wav` |
| `ui_fuel_tick` | `assets/audio/ui/ui_fuel_tick.wav` |
| `ui_countdown_tick` | `assets/audio/ui/ui_countdown_tick.wav` |
| `signal_transmit` | `assets/audio/ui/signal_transmit.wav` |
| `signal_receive` | `assets/audio/ui/signal_receive.wav` |
| `sig_fuel_earned` | `assets/audio/signature/sig_fuel_earned.wav` |
| `sig_milestone` | `assets/audio/signature/sig_milestone.wav` |
| `sig_signal_ready` | `assets/audio/signature/sig_signal_ready.wav` |
| `sig_launch_day` | `assets/audio/signature/sig_launch_day.wav` |
| `sig_launch_chime` | `assets/audio/signature/sig_launch_chime.wav` |
| `sig_blueprint_complete` | `assets/audio/signature/sig_blueprint_complete.wav` |
| `sig_cargo_saved` | `assets/audio/signature/sig_cargo_saved.wav` |
| `sig_plan_unlock` | `assets/audio/signature/sig_plan_unlock.wav` |
| `brand_stinger_launchdeck` | `assets/audio/brand/brand_stinger_launchdeck.wav` |
| `ambient_deck_loop` | `assets/audio/ambient/ambient_deck_loop.m4a` |
| `ambient_foundry_loop` | `assets/audio/ambient/ambient_foundry_loop.m4a` |
| `ambient_launch_eve` | `assets/audio/ambient/ambient_launch_eve.m4a` |

## C2. `SIGNATURE_SOUND` (`playSignature(id)`)

| Signature ID | Sound ID |
|--------------|----------|
| `fuel_earned` | `sig_fuel_earned` |
| `milestone` | `sig_milestone` |
| `signal_ready` | `sig_signal_ready` |
| `launch_day` | `sig_launch_day` |
| `launch_chime` | `sig_launch_chime` |
| `blueprint_complete` | `sig_blueprint_complete` |
| `cargo_saved` | `sig_cargo_saved` |
| `plan_unlock` | `sig_plan_unlock` |

## C3. `AMBIENT_SOUND` (`setAmbient(track)`)

| Ambient track | Sound ID |
|---------------|----------|
| `deck` | `ambient_deck_loop` |
| `foundry` | `ambient_foundry_loop` |
| `launch_eve` | `ambient_launch_eve` |

---

# Grand summary

| Domain | Category | Count | Status |
|--------|----------|------:|:------:|
| Images | App/store icons | 4 | ✅ all present |
| Images | Nav tab icons | 10 (× density) | ✅ base only |
| Images | Astro art | 24 (× density) | ✅ all present |
| Images | Other raster | 3 | ✅ all present |
| Images | Code-drawn glyphs | 33 | n/a (SVG/text) |
| Images | Foundry tool icons | 7 | ⬜ emoji placeholders |
| Audio | UI SFX | 14 | ✅ placeholders |
| Audio | Signature | 8 | ✅ placeholders |
| Audio | Brand stinger | 1 | ✅ placeholder |
| Audio | Ambient beds | 3 | ✅ placeholders |
