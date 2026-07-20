# Onboarding Screens — Design Spec

**Date:** 2026-06-05  
**Status:** Draft for review  
**Product register:** relief-first launch companion (see `PRODUCT.md`)

## Problem

The native app currently routes signed-out users straight to `sign-in.tsx` (`index.tsx` → AuthGate). There is no landing page, no welcome-back moment, and sign-in is asked **before** the user understands value or invests effort — opposite of PRODUCT.md (“relief over information”) and the web prototype’s proven flow (`WelcomeScreen` → intent questions → `AccountPromptScreen`).

## Goals

1. **Landing page** — calm first impression; explain what LaunchDeckAI does in one breath.
2. **Welcome back** — recognize returning pilots; resume where they left off without re-onboarding.
3. **Sign-in timing** — ask only after the user has invested (named app + intent) so “save your plan” feels natural.
4. **Upsell timing** — never interrupt onboarding; offer Commander at feature gates and one optional soft moment after first win.

## Non-goals

- Rebuilding all 7 onboarding steps (keep existing mission setup UI).
- Replacing RevenueCat / Refuel modal mechanics.
- Web prototype parity on every screen (native stays simpler).

## Recommended flow (value-first hybrid)

```text
App open
  │
  ├─ Demo mode (no Clerk key) ──────────────────────► Deck
  │
  └─ Auth enabled
        │
        ├─ Session loading ──► Splash
        │
        ├─ Signed in + mission exists ──► Welcome Back ──► Deck
        │
        ├─ Signed in + no mission ──► Mission onboarding (existing 7 steps)
        │
        └─ Signed out
              │
              ├─ First visit (no local draft) ──► Landing
              │       └─ Get Started ──► Intent capture (steps 0–2)
              │               └─ Save prompt ──► Sign-in / Sign-up
              │                       └─ Mission onboarding (steps 3–6)
              │
              └─ Has local draft (incomplete intent) ──► Resume intent OR Sign-in
```

### Sign-in placement (recommended)

**After mission intent steps 0–2** (app name, one-liner, audience) — mirrors web prototype step 6 (“Save your app plan”). Copy frame: persistence and relief, not account bureaucracy.

| Moment | Ask sign-in? | Rationale |
|--------|--------------|-----------|
| Landing | No | Brand + relief only |
| Intent steps 0–2 | No | Build investment |
| After step 2 | **Yes (soft prompt)** | “Save your plan” — natural save point |
| Mission steps 3–6 | Already signed in | Data persists to Convex |
| Welcome back | No | Already authenticated |

### Upsell placement (recommended)

Per `Docs/08_ASTRO_AND_MONETIZATION.md` — bottom sheets at gates, not dead-end screens.

| Moment | Upsell? | Surface |
|--------|---------|---------|
| Landing | No | — |
| Onboarding | **No** (optional text link only on final confirm) | Tertiary “See Commander benefits” → Refuel |
| First milestone complete | **Soft optional** | One-time Astro sheet: export + unlimited Copilot |
| Fuel wall / Foundry lock / Signal export / mission cap | **Yes (primary)** | Existing `/(modals)/refuel` |

Onboarding upsell rule: **never block “Create my Mission”** behind paywall. Cadet must complete first mission.

## Screen specs

### 1. Landing (`/(auth)/landing`)

**Audience:** Signed-out, first visit (or cold start without draft).

**Content:**
- LaunchDeckAI wordmark + “Builder companion” mono label
- Headline: relief-oriented (web prototype: “Plan your app launch with less overwhelm”)
- Subcopy: one guided workspace for tasks, store prep, marketing
- Benefit chips: App plan · Checklists · Writing help (3 max)
- Primary CTA: **Get Started**
- Secondary: **I already have an account** → sign-in

**Design:** `ScreenBackground`, glass card optional, Astro small bust (not dominant). Honor reduced motion.

### 2. Welcome back (`/(auth)/welcome-back`)

**Audience:** Signed in, `getLaunchData` has mission.

**Content:**
- “Welcome back, {firstName}” (fallback: “Commander” / “Pilot”)
- Mission name + readiness snippet (from `getLaunchData`)
- Primary: **Return to Deck**
- Secondary: **View Missions** (optional)

**Duration:** Single tap-through; no forced dwell. Auto-redirect to Deck after ~2s optional (skip if reduced motion — no auto skip).

### 3. Save prompt (`/(auth)/save-plan`)

**Audience:** Signed out, completed intent steps 0–2 (draft in SecureStore).

**Content:** Same structure as web `AccountPromptScreen` — Google, Apple, email path → existing sign-in/sign-up screens.

**Skip:** Not offered once draft exists (they must sign in to persist). Demo mode bypasses entirely.

## Routing changes (`index.tsx`)

Replace binary `!isAuthenticated → sign-in` with:

1. `isAuthenticated && mission` → welcome-back (or deck if user pref `skipWelcomeBack`)
2. `isAuthenticated && !mission` → onboarding
3. `!isAuthenticated && hasDraft` → save-plan or resume intent
4. `!isAuthenticated && !hasDraft` → landing

## Data

- **Local draft:** `onboardingDraft` in SecureStore (`src/lib/onboardingDraft.ts`) — `{ appName, oneLiner, audience, step }`.
- **Clear draft:** on successful `createMission`.
- **User pref:** `skipWelcomeBack` in SecureStore (set when user taps Return to Deck).

## Analytics events

- `landing_viewed`, `landing_get_started`, `landing_have_account`
- `onboarding_intent_completed` (step 2 done)
- `save_plan_viewed`, `save_plan_sign_in_started`
- `welcome_back_viewed`, `welcome_back_continue`
- `upsell_soft_shown` (post-milestone only)

## Success criteria

- New user sees landing before sign-in.
- Returning user with mission sees welcome back ≤1 tap from Deck.
- Sign-in prompt appears only after app name + one-liner + audience captured.
- No paywall blocks mission creation.
- Existing Refuel gates unchanged.

## Approaches considered

| Approach | Pros | Cons |
|----------|------|------|
| **A. Value-first hybrid (chosen)** | Matches PRODUCT + web prototype; higher sign-in intent | More routing state |
| B. Auth-first (current) | Simple | High bounce; violates relief principle |
| C. Full local demo then auth | Lowest friction | Convex sync complexity; duplicate mission merge |
