<!-- convex-ai-start -->

This project uses [Convex](https://convex.dev) as its backend.

When working on Convex code, **always read
`convex/_generated/ai/guidelines.md` first** for important guidelines on
how to correctly use Convex APIs and patterns. The file contains rules that
override what you may have learned about Convex from training data.

Convex agent skills for common tasks can be installed by running
`npx convex ai-files install`.

<!-- convex-ai-end -->

## Design Context

Two root files carry the design system; read them before any UI work:

- **PRODUCT.md** — strategic context. Register is `product`. Users are first-time
  app creators buying relief, not a checklist. Principles: relief over information,
  calm confidence (never cold), the launch-world metaphor earns its keep, earn the
  signature moments, progress you can feel. Anti-references: sterile checklist tool,
  corporate SaaS dashboard. Accessibility target: WCAG AA + honor reduced motion.
- **DESIGN.md** — visual system (+ `.impeccable/design.json` sidecar). North Star:
  "Calm Mission Control with Handcrafted Warmth". Indigo-tinted space, glow-as-elevation
  (never gray drop shadows), cool teal for structure + warm gold for reward (rare).
  Pill buttons, large-radius glass panels, JetBrains Mono for live telemetry numbers.
- **AUDIO.md** — sound design spec. Quiet UI telemetry, rare signature moments, optional
  ambient beds; implementation in `src/lib/audio.ts` and `assets/audio/`.

## Mixpanel Analytics

Mixpanel is the product analytics tool. Do not add a second analytics SDK (except the optional PostHog dual-write already in `src/lib/analytics.ts`).

- **Platform:** React Native (Expo) + web
- **SDK:** `mixpanel-react-native` 3.x in JavaScript mode (`useNative: false`) so Expo Go and RN web work without native modules
- **Tracking method:** client-side
- **CDP:** none
- **Consent:** not gated at setup (add a consent gate before EU/CA production traffic — Mixpanel `opt_out_tracking_by_default`)
- **Token:** `EXPO_PUBLIC_MIXPANEL_TOKEN` (see `.env.example`)
- **Initialization:** `initAnalytics()` in `src/lib/analytics.ts`, called from `src/app/_layout.tsx`
- **Identity:**
  - `identifyAnalyticsUser()` / `setAnalyticsUser()` after Clerk user creation in `src/app/(auth)/sign-up.tsx`, and on login/re-open in `src/components/DataSync.tsx` (Clerk id as `$user_id`, never email)
  - `resetAnalytics()` on logout via the `signOut` wrapper in `src/components/DataSync.tsx`
- **Super properties:** `platform` (`ios` | `android` | `web`), `app_version`
- **Naming:** `snake_case` `object_verb` events; `snake_case` properties; lowercase enum values; omit empty/`null` properties; never send PII, asset bodies, or copilot message text
- **Value Moment:** `mission_created` — user finishes onboarding and creates their launch Mission

### Tracking plan

| Event | Trigger | Properties |
| --- | --- | --- |
| `sign_up_completed` | Email verification completes and Clerk user is created | `sign_up_method` (`email`) |
| `mission_created` | Onboarding "Create my Mission" succeeds | `app_target_platform` (`ios`/`android`/`both`), `stage` |
| `onboarding_completed` | Same moment as mission creation | — |
| `milestone_completed` | User completes a milestone | `category` |
| `fuel_earned` | Fuel awarded for a milestone | `amount` (number), `reason` |
| `foundry_asset_generated` | Foundry generates an asset | `tool`, `viaAI` |
| `cargo_asset_saved` | Asset saved to Cargo Bay | `type` |
| `signal_deck_opened` | Signal Deck modal opens | — |
| `signal_asset_forged` | Asset forged for a signal | `signalId` |
| `signal_shared` | User shares a signal | `label` |
| `broadcast_scheduler_opened` | Broadcast scheduler opens | `editing` (optional boolean) |
| `broadcast_scheduled` | Broadcast is scheduled | `at` |
| `broadcast_cancelled` | Broadcast is cancelled | `signalId` |
| `broadcast_reminder_tapped` | User taps a broadcast reminder | — |
| `transmit_sequence_tapped` | Transmit sequence CTA | `canExport` |
| `copilot_message_sent` | User sends a message to Astro | `mode` |
| `plan_upgraded` | User upgrades plan | `plan`, `via` |

When adding events: reuse this table's property names, fire `track()` from `@/lib/analytics` next to the user action, and add a Lexicon description in Mixpanel.
