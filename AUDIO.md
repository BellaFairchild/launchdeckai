# LaunchDeckAI — Sound Design Specification

Companion to [PRODUCT.md](PRODUCT.md) and [DESIGN.md](DESIGN.md). North star: **Calm Mission Control with Handcrafted Warmth** — audio should feel like a well-run mission control at night: precise, warm, reassuring—not a game arcade or sci-fi trailer.

**Golden rule:** If it does not serve relief, preparedness, or a signature moment, it does not play.

---

## 1. Mood and tone guidelines

| Dimension         | Target                                                             | Avoid                                                       |
| ----------------- | ------------------------------------------------------------------ | ----------------------------------------------------------- |
| Emotional palette | Calm, capable, companionable; lowers heart rate                    | Alarmist errors, casino wins, meme boops                    |
| Space theme       | Deep space **instrument panel**—telemetry, comms, orbital motion   | Laser guns, explosions, Hans Zimmer crescendos on every tap |
| Warmth            | Walnut/gold = **reward timbre** (soft chimes, brassy partials)     | Cartoon squeaks, chipmunk pitch                             |
| Structure         | Teal/blue = **navigation & progress** (filtered sine, soft whoosh) | Harsh square waves, piercing 2–4 kHz peaks                  |
| Density           | **One ambient bed max**; UI sounds &lt;120 ms; signature &lt;2.5 s | Layered music + SFX on every interaction                    |

**Reference listening (direction, not copy):** _Monument Valley_ menus, _No Man's Sky_ idle UI, muted NASA comm beeps, iOS system sounds, gentle modular ambient (Biosphere, quiet Jon Hopkins).

---

## 2. Sonic identity pillars

| Brand element                   | Sonic character                                                         |
| ------------------------------- | ----------------------------------------------------------------------- |
| Cosmic field (bg-deep / indigo) | Low-pass pads, sub-harmonic rumble (felt, not heard), slow LFO          |
| Rocket teal `#10B7D6`           | UI & navigation—short sine/triangle blips, BP ~800–2.5 kHz              |
| Brand gold `#F3B233`            | Fuel earned, premium, milestone—detuned bell partials, 400–800 ms decay |
| Walnut `#8B5327`                | Tab bar warmth—optional muted wooden transient under teal               |
| Success green / warning orange  | Only on **signal ready** and **low fuel**—always with haptic + visual   |

---

## 3. Ambient background music

- **Default: OFF** at first launch. Separate **Ambient music** toggle from **Sound effects** in Settings.
- **One primary loop** for browsing (`ambient_deck_loop`); **alternate** for Foundry (`ambient_foundry_loop`); **contextual** when launch &lt;48h (`ambient_launch_eve`).
- No vocals. No dominant melody in 300 Hz–3 kHz (reading band).
- **Level:** −28 to −32 LUFS integrated under UI; 60–72 BPM feel; no obvious downbeat.
- Deliver royalty-free with mobile app rights; stems optional for adaptive mix later.

---

## 4. UI sound effects library

| ID                  | Trigger                         | Character                      | Duration  | Haptic    |
| ------------------- | ------------------------------- | ------------------------------ | --------- | --------- |
| `ui_tap`            | Button press                    | Triangle sweep 1.4k→300 Hz, BP | 60–80 ms  | light     |
| `ui_nav`            | Tab / drawer nav                | Sine pop 2k→800 Hz             | 35–45 ms  | selection |
| `ui_toggle`         | Settings switches               | Sliding chip up/down           | 80–120 ms | selection |
| `ui_back`           | Modal dismiss                   | Reverse whoosh                 | 50 ms     | light     |
| `ui_confirm`        | Non-signature confirm           | Ascending fifth                | 150 ms    | light     |
| `ui_error`          | Validation fail                 | Low dull thud                  | 200 ms    | warning   |
| `ui_locked`         | Gated feature                   | Muted wooden knock             | 100 ms    | warning   |
| `ui_type`           | Keyboard focus (off by default) | Single tick                    | 20 ms     | none      |
| `ui_sheet_open`     | Modal present                   | Airy rise                      | 250 ms    | light     |
| `ui_sheet_close`    | Modal dismiss                   | Airy fall                      | 200 ms    | light     |
| `ui_fuel_tick`      | Fuel increment anim             | Gold partial ping              | 120 ms    | light     |
| `ui_countdown_tick` | Deck T-minus flip (optional)    | Mono blip −32 LUFS             | 30 ms     | none      |

**Discipline:** Play `ui_tap` only on deliberate `Pressable` press—not scroll or passive re-render. Debounce `ui_nav` 120 ms on rapid tab changes.

---

## 5. Signature audio branding

### Brand stinger — `brand_stinger_launchdeck`

- **Length:** 2.8–3.2 s.
- **Structure:** Sub swell → three-note teal motif → gold bell → pad tail + telemetry beep triplet.
- **Use:** Cold start / splash (max **once per session**), rare welcome-back after 7+ days idle.
- **Avoid:** Every foreground.

### Four signature moments (DESIGN-aligned)

| Moment             | Sound ID           | Max frequency                  |
| ------------------ | ------------------ | ------------------------------ |
| Fuel earned        | `sig_fuel_earned`  | Once per earn                  |
| Milestone complete | `sig_milestone`    | Once per milestone             |
| Signal ready       | `sig_signal_ready` | Per transition to flight-ready |
| Launch day         | `sig_launch_day`   | Once per calendar launch day   |

Pair with `haptics.success()` at call sites. Never stack two signatures within 500 ms (signature wins over UI).

---

## 6. Contextual audio layers

| App state           | Ambient                               | UI                      | Signature                          |
| ------------------- | ------------------------------------- | ----------------------- | ---------------------------------- |
| Cold start / splash | Fade in deck loop 2 s (if ambient on) | —                       | Brand stinger (if SFX on)          |
| Onboarding          | Off or very low                       | `ui_confirm` on step    | `sig_milestone` on mission created |
| Deck (default)      | Track A                               | `ui_nav`                | Optional countdown tick            |
| Deck (T−48h)        | Track C crossfade                     | —                       | —                                  |
| Missions            | Track A                               | `ui_tap` on complete    | `sig_milestone`                    |
| Foundry             | Track B                               | —                       | `sig_fuel_earned` on save          |
| Signal Deck / Cargo | Track A                               | `ui_nav` / `ui_confirm` | `sig_signal_ready`                 |
| Refuel              | Duck ambient −6 dB                    | `ui_confirm`            | Short gold ping                    |
| Background          | Fade out 1.5 s                        | —                       | —                                  |

**Idle:** After 90 s no interaction, fade ambient −12 dB; after 3 min, stop (resume on touch).

---

## 7. Technical specifications

| Asset type        | Format                  | Sample rate | Notes                         |
| ----------------- | ----------------------- | ----------- | ----------------------------- |
| UI SFX            | AAC `.m4a` (WAV in dev) | 48 kHz      | Mono; HE-AAC ~64–96 kbps      |
| Signature / brand | AAC                     | 48 kHz      | Stereo optional for stinger   |
| Ambient           | AAC                     | 48 kHz      | 90–120 s loops; &lt;2 MB each |
| Web fallback      | Procedural Web Audio    | 48 kHz      | Until gesture unlocks context |

**Mastering:** UI peak −12 to −9 dBFS; signature −10 dBFS; ambient −24 LUFS pre-gain. HPF 80 Hz on non-bass UI.

**Bundle budget:** UI ~225 KB + signatures ~400 KB + ambient ~4.5 MB → **&lt;6 MB** total.

**Runtime:** `expo-audio` on native; [`src/lib/audio.ts`](src/lib/audio.ts) API mirrors web prototype (`playClick`, `playNavigate`, `playToggle`, `playSuccess`, `playPopup`, `playSignature`, `setAmbient`).

**Session:** `playsInSilentMode: false` by default; optional **Play in silent mode** sub-toggle.

**Accessibility:** Sound ≠ haptics (independent). Reduced motion: no ambient pulse sync, no countdown ticks.

### In-app gain buses

| Bus           | Gain                          |
| ------------- | ----------------------------- |
| UI            | 0.35                          |
| Signature     | 0.55                          |
| Brand stinger | 0.50                          |
| Ambient       | 0.25 (user slider maps 0–0.4) |

### Naming convention

`{category}_{name}.wav` → export to `{category}_{name}.m4a` via `node scripts/export-audio-aac.js` (requires ffmpeg).

---

## 8. Implementation strategy

### Phase 1 — Foundation (shipped in app)

1. `assets/audio/` tree: `ui/`, `signature/`, `brand/`, `ambient/`.
2. `src/lib/audio.ts` + SecureStore prefs (`sound`, `haptics`, `ambient`, `playInSilent`).
3. Settings toggles wired to store.
4. UI hooks: `Button`, `TabBar`, `Segmented`.
5. Signatures at `haptics.success()` sites.

### Phase 2 — Ambient + brand

1. Brand stinger on splash (`AudioController`, once per session).
2. Ambient opt-in + tab-based track in `(tabs)/_layout`.
3. Launch-eve bed when `launchDate` within 48 h on Deck.

### Phase 3 — Polish

Adaptive ducking, idle fade, Copilot cues, PostHog sound analytics, optional Deck countdown tick A/B.

---

## 9. Stardust extension — Cargo / Blueprint / Signal / Plan / Launch chime

Six cues added on top of §4–5, in the same palette and synthesis vocabulary
(`scripts/generate-audio-assets.js`). Shared thread: a **"stardust" texture** —
high C-pentatonic sine micro-grains (`grain()` / `stardust()`), scaled from one
grain in a tap to a 7-grain cascade in the plan sparkle. Teal = motion/comms,
gold = reward/completion, walnut = the cargo "stow". All ≤ −9 dBFS UI / −10 dBFS
signature, HPF 80 Hz, C-major pentatonic.

| Sound | Asset ID | Dur | Synthesis | Pitch | Mood |
| ----- | -------- | --- | --------- | ----- | ---- |
| Launch chime (feature activation) | `signature/sig_launch_chime` | 1.4 s | ascending C-pent arp C5–C6 + sine up-whoosh 200→1.2k + 5-grain stardust tail + soft pad | 200 Hz–2.6 kHz | uplifting, calm liftoff |
| Blueprint completion | `signature/sig_blueprint_complete` | 1.8 s | teal ascending-fifth D5→A5 + gold bell triad (G4+B4+D5, 600 ms) + 3 drafting "ruled-line" ticks + 110 Hz pad tail | 110 Hz–1.2 kHz | composed pride, "locked in" |
| Cargo Bay save | `signature/sig_cargo_saved` | 0.8 s | walnut wooden transient (1-pole LP noise) + teal confirm E5→A5 + 2 settling grains A6→E6 | <2 kHz, 659–880 Hz | secure, "safely stowed" |
| Signal transmit (send) | `ui/signal_transmit` | 0.5 s | sine up-whoosh 400→1.6k + 2 ascending comm beeps 1200→1500 | 400 Hz–1.6 kHz | precise, "message away" |
| Signal receive | `ui/signal_receive` | 0.7 s | 2 descending beeps 1500→1200 + settling E5 ping | 659 Hz–1.5 kHz | "signal acquired" |
| Plan-tier sparkle | `signature/sig_plan_unlock` | 0.9 s | gold bell bloom (C5+E5+G5, 700 ms) + 7-grain ascending stardust C6–E7 + reveal sweep | 523 Hz–2.6 kHz | magical, aspirational |

**API (`src/lib/audio.ts` / `audioAssets.ts`):**
`playSignature("launch_chime" | "blueprint_complete" | "cargo_saved" | "plan_unlock")`;
`playSignalTransmit()` / `playSignalReceive()`. Native plays the bundled WAV
(`SIGNATURE_SOUND` map); web mirrors procedurally in `audioWeb.ts`.

**Recommended trigger sites** (pair each with `haptics.success()`; signature wins
over UI, never < 500 ms apart):

| Cue | Where to fire | Status |
| --- | ------------- | ------ |
| `cargo_saved` | asset → flight-ready (`CategoryGrid` mark-ready) + bundle export | ✅ wired |
| `signal_transmit` | Signal Deck "Transmit Sequence" (`signal-deck` onTransmit) | ✅ wired |
| `plan_unlock` | Refuel plan upgrade — demo + RevenueCat paths (`refuel` onCta) | ✅ wired |
| `signal_receive` | incoming Copilot reply (`copilot`) | ✅ wired |
| `blueprint_complete` | a Blueprint section reaches 100% (`blueprints/[section]` onSave) | ⏳ pending — save site is in concurrent WIP; wire when settled |
| `launch_chime` | first entry to a newly-unlocked feature; **not** every foreground (cold start = brand stinger) | ⏳ pending — needs a product call on which activation moment (onboarding's "enter deck" already fires `milestone`) |

## Deliverables checklist (sound designer)

- [ ] Master spec signed off (this document)
- [ ] 12–16 UI WAV masters → AAC
- [ ] 4 signature + 1 brand stinger → AAC
- [ ] 2–3 ambient loops (loop-ready) → AAC
- [ ] LUFS/peak report per file
- [ ] Optional silent-mode-safe mix (less sub)
