# Signal Deck Specification

## Feature Summary

The Signal Deck is a 16-step promotional sequencer built into LaunchDeckAI.

Tagline:

```text
Stop scrambling before launch. Know exactly what to post, when, and where.
```

## Access

Signal Deck is not a main bottom tab.

It is accessed through:

1. Deck CTA: `Stage Your Launch Sequence →`
2. Nav Drawer item: `Signal Deck`
3. Contextual links from Foundry and Cargo Bay

## Layout

### Context Strip

At the top, show:

- Mission name
- Launch date
- T-Minus countdown
- `{X}/16 ready`
- Transmit Sequence button

### Phases

Signal Deck is broken into 3 color-coded phases.

## Phase 01: Pre-Launch

Color: `#3B82F6`

Timing: T-14 to T-1 days

Signals:

1. Dev log thread
2. App reveal teaser
3. TikTok behind-the-scenes
4. Waitlist email teaser
5. Product Hunt pre-registration
6. Final countdown post

## Phase 02: Launch Day

Color: `#4DC8C0`

Timing: Hour-by-hour from 06:00 to 18:00 device timezone

Signals:

1. Product Hunt submission at 06:00
2. Launch email blast at 09:00
3. X/Twitter launch thread at 10:00
4. LinkedIn post at 12:00
5. TikTok launch video at 15:00
6. Reddit / Indie Hackers post at 18:00

## Phase 03: Post-Launch

Color: `#4ADE80`

Timing: +1d to +30d

Signals:

1. Thank you email
2. Social proof post
3. First-week results thread
4. Day-30 review request email

## Status System

Signal statuses are computed automatically from linked Cargo Bay assets.

Users do not manually check off Signal Deck rows.

### Status: not-loaded

Meaning: No linked asset exists.

Visual: 0/3 grey SignalBars

Expanded action:

```text
No asset linked. Forge a [Asset Type] →
```

### Status: in-prep

Meaning: Asset exists but needs review or editing.

Visual: 2/3 orange SignalBars

Expanded actions:

```text
Needs finishing
View in Cargo Bay →
```

### Status: flight-ready

Meaning: Asset is approved and ready.

Visual: 3/3 green SignalBars

Expanded actions:

```text
View in Cargo Bay
Copy content
```

## SignalBars Component

Props:

```ts
type SignalStatus = 'not_loaded' | 'in_prep' | 'flight_ready';

interface SignalBarsProps {
  status: SignalStatus;
  size?: 'sm' | 'md';
}
```

## Foundry Loop

When a user taps Forge from a missing signal:

1. Route to Foundry.
2. Auto-select the correct tool.
3. Inject Mission context.
4. Attach `signalId`.
5. Show Fuel cost.
6. Generate content through Convex Action.
7. Save asset to Cargo Bay.
8. Return to Signal Deck.
9. Signal status updates automatically.

## Cargo Bay Integration

Cargo Bay assets should support:

```ts
signalId?: string;
signalLabel?: string;
signalPhase?: 'pre_launch' | 'launch_day' | 'post_launch';
assetType: string;
approvalStatus: 'draft' | 'needs_review' | 'flight_ready';
```

## Transmit Sequence Export

Commander+ users can export:

```text
signal-pack.zip
```

The ZIP contains:

1. `signal-schedule.csv`
2. `signal-schedule.json`
3. `{signal-label}.txt` files for flight-ready assets
4. `README.md` with import instructions for Buffer, Later, Zapier, Make, and n8n

## Cadet Paywall

Cadet users can:

- View all 16 signals
- Expand rows
- Forge assets using available Fuel
- Prepare the full sequence

Cadet users cannot:

- Export the full ZIP pack

Locked button label:

```text
🔒 Transmit Sequence
```

## Paywall Bottom Sheet

Headline:

```text
Export needs Commander.
```

Copy:

```text
Package your full launch sequence into one clean ZIP file with your schedule, platform timing, and ready-to-post content.

No scrambling. No copy-paste maze. Just your launch signals packed and ready.
```

Buttons:

```text
Upgrade to Commander
Maybe later
```

If the user upgrades successfully, continue directly to export.

## v1 Guardrails

Do not build:

- Direct auto-posting
- Social account OAuth
- Custom Signal slots
- Complex scheduler UI
- Calendar drag/drop

Keep v1 focused on readiness and export.
