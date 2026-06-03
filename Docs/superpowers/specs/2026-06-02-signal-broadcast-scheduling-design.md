# Signal Broadcast Scheduling — Design

**Date:** 2026-06-02
**Status:** Approved (design); pending implementation plan
**Area:** Signal Deck (`src/app/(modals)/signal-deck.tsx`, `src/components/signal/*`), Convex backend, notifications

## Summary

Give each Signal Deck signal a **Broadcast** action that lets a user attach a
**destination link** plus a **date and time**, persist that plan, and receive a
calm local notification when it is time to post — tapping the reminder deep-links
to the destination. Broadcast is a distinct action from **Forge** (content
generation): the two are independent and usable in any order. Plans are
Convex-synced (durable across devices and reinstall) and free for all plan tiers.

## Decisions (from brainstorming)

- **Purpose:** Plan + remind. Save link + date/time, schedule a local
  notification, tap-through to the destination. No auto-posting.
- **The link:** The **destination** — where the user will publish (compose page,
  Product Hunt draft, queue, etc.).
- **Sequencing:** **Forge** and **Broadcast** are two independent actions on
  every signal row, usable in any order.
- **Scope:** Convex-synced plan + local reminder (durable; matches the app's
  hybrid store architecture).
- **Gating:** Free for all tiers. The bulk "Transmit Sequence" export remains the
  Commander-gated premium moment.

## What exists today

- Signal Deck shows 16 fixed signal templates across 3 phases
  (`src/constants/signalTemplates.ts`). Each signal's status
  (`not_loaded` / `in_prep` / `flight_ready`) is derived from assets in Cargo Bay
  (`src/components/signal/status.ts`).
- `SignalActions` shows a **"Broadcast →"** button on `not_loaded` signals
  (`src/components/signal/SignalActions.tsx`).
- "Broadcast →" opens **`BroadcastScheduler`** — an on-brand modal with a calendar
  day-grid and an `hh:mm` time field (`src/components/signal/BroadcastScheduler.tsx`).
- **Gaps:** no link field; the chosen date/time is local `useState` only — not
  persisted, no reminder, no calendar record; on confirm it auto-routes to Foundry.
- `src/lib/notifications.ts` schedules launch reminders but calls
  `cancelAllScheduledNotificationsAsync()` — a blanket wipe that would delete any
  per-signal broadcast reminder.

## Architecture

Broadcast plans flow exactly like `assets` already do:
**Convex `broadcasts` table → `getLaunchData` query → DataSync hydrates →
mission store → screens read uniformly.** Demo mode mutates the store locally;
signed-in mode delegates to Convex through an injected adapter.

### 1. Data model & sync

**New Convex table** `broadcasts` (`convex/schema.ts`):

```ts
broadcasts: defineTable({
  missionId: v.id("missions"),
  userId: v.id("users"),
  signalId: v.string(),        // e.g. "pre_1" — the template it belongs to
  destinationUrl: v.string(),  // where to post
  scheduledAt: v.number(),     // epoch ms
}).index("by_missionId", ["missionId"])
  .index("by_mission_signal", ["missionId", "signalId"]),
```

- One broadcast per signal. `by_mission_signal` lets a re-schedule **upsert**
  rather than duplicate.
- The local `notificationId` is **device-local** and does NOT live in Convex; it
  is held in the local store keyed by `signalId` and re-derived on reconcile after
  a reinstall.

**New type** `Broadcast` in `src/types` and a `broadcasts: Broadcast[]` field on
the mission store, hydrated by `mapBroadcast()` in `DataSync` (mirrors `mapAsset`).

**New Convex functions** (`convex/broadcasts.ts`):

- `schedule({ signalId, destinationUrl, scheduledAt })` — `requireUser`, find the
  active mission, upsert by `(missionId, signalId)`. No fuel cost, no plan gate.
- `cancel({ signalId })` — delete the record for that signal.
- `getLaunchData` (`convex/missions.ts`) gains `broadcasts` in its `Promise.all`
  and return payload, so the one bundled subscription carries them.

**Mission store** gains an adapter pair `scheduleBroadcast` / `cancelBroadcast`
(hybrid: delegates to Convex when signed in, mutates local state in demo mode),
matching the existing `completeMilestone` / `updateAssetStatus` pattern in
`src/store/mission.ts` and the adapter injection in `src/components/DataSync.tsx`.

### 2. Notification mechanics

**Collision fix.** Stop blanket-cancelling in `src/lib/notifications.ts`. Give the
three launch reminders **stable identifiers** and cancel only those by id before
rescheduling, leaving broadcast reminders untouched.

**New helpers** in `notifications.ts`:

- `scheduleBroadcastReminder({ signalId, signalLabel, platform, destinationUrl, scheduledAt }) → notificationId | null`
  - No-op on web, returns `null` (matches existing web guards).
  - Ensures permission via existing `requestNotificationPermission()`.
  - Content: title `"Time to broadcast 📡"`, body
    `"Post your {signalLabel} on {platform} now."`,
    `data: { url: destinationUrl, signalId }`.
  - `DATE` trigger at `scheduledAt`. Returns the notification id for local storage.
- `cancelBroadcastReminder(notificationId)` — selective cancel.

**Tap-through (deep-link).** A notification-response listener registered once in
`src/app/_layout.tsx` reads `response.notification.request.content.data.url` and
opens it via `Linking.openURL(url)`. The app comes forward first, then opens the
destination — no jarring instant context switch.

**Reconcile on app open.** `reconcileBroadcastReminders(broadcasts)` runs after
hydration: for each future broadcast lacking a live local notification id,
(re)schedule one; drop ids for past/cancelled ones. This restores reminders from
synced Convex data after a reinstall.

**Edge cases:**
- Past `scheduledAt` → skip scheduling; show the plan as elapsed/sent.
- Permission denied → save the plan anyway; surface a gentle "reminders off —
  enable in Settings" hint.
- Web → plan saves and shows; no notification.

### 3. UI / UX

**Signal row — two independent actions** (`SignalActions.tsx`): decouple Forge
from Broadcast so both show regardless of content status.

- **Forge / View in Cargo** — unchanged content action; label depends on
  `not_loaded` / `in_prep` / `flight_ready`.
- **Broadcast** — always available. Label reflects broadcast state:
  `"Broadcast →"` when unscheduled, `"Scheduled · Jun 14 · 09:00"` when set.
  Tapping a scheduled one re-opens the scheduler pre-filled to edit/cancel.
- The "✓ Broadcast set for…" line becomes a persistent **chip** driven by the
  stored plan (not local `useState`) with a small **Cancel** affordance.
- On confirm, no longer auto-route to Foundry — Forge and Broadcast are separate.

**Enhanced `BroadcastScheduler`:** add a **Destination** field at the top of the
existing popup, above the month/year picker.

- Labelled `TextInput` ("Destination — where you'll post"), `keyboardType="url"`,
  autocapitalize off, on-brand `link` icon.
- Lightweight validation: require a URL-ish string (`http(s)://…` or a domain).
  `canConfirm = urlValid && day !== null && timeValid`.
- Opens pre-filled when editing; gains a **Remove broadcast** text button in edit
  mode.
- Everything else (calendar grid, `hh:mm`, gradient bar, haptics,
  `playClick` / `playSignature`) is unchanged.

**Calendar view** (`SignalCalendar.tsx`): a signal with a broadcast plan gets a
small **scheduled marker** (teal dot or `radio`/`broadcast` glyph) on its
`DayCell`, `DayDetail`, and `TimelineRow` — distinct from the content-readiness
`SignalBars`, so "content ready" and "send scheduled" never conflate. Marker pairs
icon + label, never color alone.

### Accessibility & brand

- 44px minimum tap targets on the new field and buttons.
- Accessible labels on the destination input and the cancel/remove controls.
- Reduced-motion respected (no new motion introduced).
- Copy stays calm: "Time to broadcast", not "POST NOW!".
- Free for all tiers — no lock state on scheduling.

### Analytics

Keep `broadcast_scheduler_opened` and `broadcast_scheduled`; add
`broadcast_cancelled` and `broadcast_reminder_tapped`.

## Testing

- **Pure units:** URL validation; `reconcileBroadcastReminders` across future /
  past / cancelled cases. (`signalTimestamp` is already covered.)
- **Component (RNTL):** `BroadcastScheduler` enables "Schedule" only when
  URL + day + time are valid; editing pre-fills fields; "Remove" fires cancel.
  `SignalActions` renders both actions and reflects scheduled state.
- **Mocks:** mock `expo-notifications` and `Linking`; assert schedule/cancel calls
  and tap-through `openURL`.

## Out of scope (possible later phases)

- Auto-posting via Buffer/Zapier/native APIs.
- A dedicated "Transmission Queue" hub aggregating all scheduled sends (Approach C);
  the Calendar view already covers most of this.
- Including the real broadcast schedule in the "Transmit Sequence" export payload.
