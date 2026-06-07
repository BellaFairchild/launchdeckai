# Astro Voice Dock (Onboarding Coach + Voice Dictation) — Design Spec

**Date:** 2026-06-06
**Status:** Approved for planning
**Product register:** relief-first launch companion (see `PRODUCT.md`)
**Builds on:** `Docs/superpowers/specs/2026-06-05-onboarding-screens-design.md` (the shipped relief-first onboarding flow)

## Problem

The shipped onboarding wizard ([`src/app/(auth)/onboarding.tsx`](../../../src/app/(auth)/onboarding.tsx)) is a calm step-by-step flow, but Astro — the AI copilot character — is absent from it. The web concept (`launchdeck-onboarding.html`) shows a persistent Astro coach that guides each step and a low-friction way to answer by voice. We want to bring Astro into the wizard as a floating presence that (a) coaches per step and (b) lets users **dictate** their answers by voice, while laying the groundwork for full conversational interaction with Astro later.

## Goals

1. **Astro presence in onboarding** — a persistent floating orb + speech bubble that coaches the user through each step.
2. **Voice dictation** — tapping the orb on a text step transcribes speech into that step's field (on-device, free, low latency).
3. **Future-proofing** — isolate the voice plumbing so a later "talk to Astro" conversational mode is additive, not a rewrite.

## Non-goals

- Conversational AI / LLM intent parsing / TTS replies (explicitly a **later** phase — see "Extensibility").
- App-wide Astro voice (Copilot, Foundry, etc.) — the dock is built to allow it, but this spec only mounts it in onboarding.
- Changing onboarding flow, steps, routing, draft persistence, or auth timing (all unchanged from the 2026-06-05 spec).
- Adding the richer-capture fields, priorities step, T-minus preview, readiness ring, or visual-atmosphere elements from the HTML concept (deferred / out of scope).

## Decisions (from brainstorming)

| Decision | Choice | Rationale |
|---|---|---|
| Astro placement | **Floating orb + bubble (placement B)** | It is the natural home for "interact with Astro"; one Astro surface carries both coaching and voice. |
| Voice engine | **On-device via `expo-speech-recognition`** | Free, fast, no network, one API across iOS/Android/web (Web Speech API). Live partial results. |
| Interaction depth | **Dictation now, conversational later** | Ship a small, useful feature; architect the hook + dock so conversation is additive. |
| Component structure | **Two focused units + copy map** | `onboarding.tsx` is already ~460 lines; isolation keeps it readable and the native module mockable in tests. |

## Architecture

```
src/app/(auth)/onboarding.tsx
 ├─ text fields (steps 0/1/2) → plain styled <TextInput> (mic is NOT in the field)
 └─ <AstroVoiceDock step={step} dictationTarget={…} />   ← floating overlay

src/components/onboarding/AstroVoiceDock.tsx
 ├─ renders AstroAvatar (orb, plan="cadet") + speech bubble (coaching line)
 ├─ shows a mic badge ONLY when a dictationTarget is provided (text steps)
 └─ uses useSpeechToText for the mic

src/lib/useSpeechToText.ts   ← the ONLY importer of expo-speech-recognition

src/constants/onboardingCoach.ts   ← per-step { pose, line } map
```

### Data flow

- `onboarding.tsx` already owns the field state (`appName`, `oneLiner`, `audience` via `useState`). It remains the single source of truth.
- For steps 0–2 it passes `dictationTarget = { value, onChange }` for the active field; for steps 3–6 it passes `undefined`.
- The dock looks up `{ pose, line }` from `onboardingCoach.ts` by `step` and renders the bubble.
- Tapping the mic calls `useSpeechToText.start()`. Partial transcripts render live; on each update the dock computes `base + transcript` (base = field value snapshot at start) and calls `dictationTarget.onChange(...)`. On stop/auto-end it commits the final transcript the same way.

### `useSpeechToText` hook (interface)

```ts
type UseSpeechToText = {
  isAvailable: boolean;          // feature/permission capable on this platform
  isListening: boolean;
  partialText: string;           // live interim transcript
  error: string | null;
  start: () => Promise<void>;    // requests permission if needed, then starts
  stop: () => void;
};
// options: { onResult?: (finalTranscript: string) => void; lang?: string }
```

Wraps `expo-speech-recognition`: permission request, `start({ interimResults: true, lang })`, and `result` / `end` / `error` listeners. All event-listener wiring and module imports live here so the rest of the app never imports the native module directly.

## Orb behavior, by step

- **Always:** Astro orb (cadet) pinned bottom-right with a speech bubble showing the current step's coaching line.
- **Text steps (0–2):** mic badge visible. Tap → dictate into that step's field. While listening: orb pulses, bubble shows "Listening…" + live partial. Append semantics: `base snapshot + ' ' + transcript` so typing and dictation coexist. Tap again or silence-timeout → stop & commit.
- **Non-text steps (3–6):** no mic badge; Astro is coach-only (nothing to dictate into).

### Per-step coaching copy (`onboardingCoach.ts`)

| Step | Pose | Line |
|---|---|---|
| 0 App name | `hello` | "First up — what's it called? You can rename it anytime." |
| 1 One-liner | `pointing` | "Nail the value in one sentence. Specific beats clever." |
| 2 Audience | `thinking` | "Picture one real person who needs this. That's your audience." |
| 3 Platform | `pointing` | "Where are you launching? This shapes your store checklist." |
| 4 Stage | `thinking` | "Be honest about where you are — I'll calibrate the plan." |
| 5 Date | `pointing` | "A target date powers your countdown. An estimate's fine." |
| 6 Confirm | `thumbsup` | "That's the brief. Let's build your launch deck." |

Copy is intentionally calm/relief-first per `PRODUCT.md` and editable in one file.

## Keyboard coexistence (key UX risk)

A floating orb can be hidden by the keyboard on text steps. **Mitigation:** anchor the dock **inside the existing `KeyboardAvoidingView`, just above the Continue CTA**, so the keyboard pushes it upward and it stays tappable on steps 0–2. This is explicitly verified in manual QA.

## Permissions & platform

- Add the `expo-speech-recognition` config plugin to `app.json` with:
  - iOS: `NSSpeechRecognitionUsageDescription`, `NSMicrophoneUsageDescription`
  - Android: `RECORD_AUDIO`
- **Requires a dev-client rebuild** (new native module + permissions).
- **Permission denied:** show a brief hint ("Mic's off — you can enable it in Settings"); the mic never blocks typing.
- **Unavailable** (unsupported browser, no recognizer): mic badge does not render; Astro remains a coach. Chrome web (demo-capture) works via the Web Speech API.

## Reduced motion & accessibility

- Coach orb is static by default (no float/bob). Under reduced motion the listening **pulse** is replaced by a static "Listening…" label.
- Mic badge: `accessibilityRole="button"`, label "Dictate" / "Stop dictating", `accessibilityState={{ busy: isListening }}`.
- Speech-bubble text is real text (screen-reader readable); orb keeps `AstroAvatar`'s existing `accessibilityLabel`.
- Light haptic (existing `haptics`) on mic start/stop.

## Extensibility — conversational later

- `useSpeechToText` already surfaces the **final transcript**, and `AstroVoiceDock` accepts an optional `onUtterance(transcript)` handler.
- Today `onUtterance` (or the internal default) appends to the field (dictation).
- Later, a `mode: "converse"` routes the transcript to the Copilot (`@anthropic-ai/sdk`) and adds a TTS reply — purely additive. The dock being self-contained also allows mounting it app-wide later.

## Analytics

- `onboarding_voice_used` with `{ field }` (app_name | one_liner | audience), fired when a dictation session produces a committed transcript. Uses existing `track()`.

## Success criteria

- Astro orb + coaching bubble appears on every onboarding step with the correct per-step line/pose.
- On steps 0–2, tapping the orb dictates speech into the field; the orb stays tappable with the keyboard open.
- Dictation appends to (does not clobber) typed text.
- Permission denial / unsupported platform degrades gracefully to typing; no crash.
- Existing onboarding flow, routing, draft, and tests are unaffected (hook mocked).

## Approaches considered

| Approach | Pros | Cons |
|---|---|---|
| **Floating orb dock + isolated hook (chosen)** | One Astro surface; voice-ready; future-proof; isolated/testable | Keyboard-coexistence detail to get right |
| Inline coach header + in-field mic | Simplest keyboard story | Two Astro surfaces; mic not a natural "talk to Astro" home; less future-proof |
| Cloud transcription (record → API) | Identical across platforms | Per-use cost, latency, API key + backend; overkill for short fields |

## Testing (TDD)

- `useSpeechToText.test.ts` — mock `expo-speech-recognition`: start/stop, partial → `onResult`, permission denied → `isAvailable`/error, unavailable platform.
- `AstroVoiceDock.test.tsx` — mic badge renders only with `dictationTarget`; final transcript appends via `onChange`; correct coach line/pose per `step`; reduced-motion label swap.
- `onboarding.test.tsx` — existing tests pass with `useSpeechToText` mocked; assert the coach bubble renders the step-0 line.

## Out of scope / deferred (tracked, not built here)

- Conversational Astro (STT + LLM + TTS).
- App-wide Astro voice mounting.
- HTML-concept extras: description/problem fields, priorities step, "Idea Phase" stage, T-minus preview, readiness ring, starfield/visual atmosphere, Fuel/Cadet welcome messaging.
