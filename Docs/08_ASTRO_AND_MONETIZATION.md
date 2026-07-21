# Astro and Monetization Specification

## Astro Summary

Astro is the LaunchDeckAI AI Copilot character.

Astro should feel:

- Friendly
- Calm
- Capable
- Softly futuristic
- Helpful without being childish
- Premium without being cold

## Astro Plan Visuals

Astro's suit changes based on subscription level.

| Plan | Suit Detail | Meaning |
|---|---|---|
| Cadet | Black belt | Starter launch crew |
| Commander | Silver belt | Serious builder / upgraded command access |
| Admiral | Gold belt | Highest command tier |

Important: Cadet Astro should still look polished and capable. Do not make the free tier feel low-quality.

## Where Astro Appears

### AI Copilot Orb

Use Astro helmet or face as the center bottom-nav orb.

Plan ring accents:

- Cadet: dark/black accent
- Commander: silver accent
- Admiral: gold accent

### Copilot Modal

Show Astro bust/avatar with:

- Current plan
- Greeting
- Fuel cost
- Suggested prompts
- Mode selector

### Profile Screen

Show full-body Astro with:

- Plan belt
- Fuel balance
- Level
- Streak
- Service ribbons

### Refuel Station

Show Astro previews for each plan:

- Cadet Astro: black belt
- Commander Astro: silver belt
- Admiral Astro: gold belt

### Paywall Bottom Sheets

Use Astro as a friendly guide when explaining upgrades.

## Plan Names

Use only:

```ts
type Plan = 'cadet' | 'commander' | 'admiral';
```

Do not use:

- Launch Pass
- Expert
- Pro
- Premium

Launch Pass has been renamed to Admiral.

## Plan Specs

> **Source of truth for numeric plan values:** `src/constants/plans.ts`. The
> summaries below mirror that file — when the two disagree, the code wins.

### Cadet

Best for: first-time builders getting organized.

Includes:

- 1 Active Mission
- 25 Fuel cap · 5/day drip
- Standard Copilot (daily limit)
- Basic Foundry access
- Cargo Bay view
- Signal Deck viewing and preparation

Price: Free

### Commander

Best for: serious builders preparing for launch.

Includes:

- 3 Active Missions
- 1,500 Fuel / mo
- All core Foundry tools
- Unlimited Copilot
- Signal Pack ZIP export
- Streak Shield

Price: $19/mo · $152/yr

### Admiral

Best for: advanced creators and power launchers.

Includes:

- Unlimited Active Missions
- 5,000 Fuel / mo
- Powerful AI mode
- Public Launch Decks (later)
- Priority support
- Premium Astro gold belt

Price: $49/mo · $390/yr

## Main Conversion Moments

### Fuel Wall

Triggered when the user lacks enough Fuel for Foundry or Copilot.

### Signal Pack Export

Triggered when Cadet taps Transmit Sequence.

### Mission Count Cap

Triggered when user tries to exceed plan limit.

### Copilot Cap

Triggered when user hits daily Copilot usage limit.

### Powerful Mode

Triggered when a user attempts Admiral-level AI mode.

## Paywall UX Rules

- Use bottom sheets instead of dead-end screens.
- Explain the value in plain language.
- Keep the user in context.
- If upgrade succeeds, continue the action automatically.
- Never delete data after downgrade. Lock access instead.

## Refuel Station Screen Requirements

Each plan card should include:

- Plan name
- Price
- Best-for label
- Astro suit preview
- Fuel amount
- Active Mission limit
- AI access
- Export access
- CTA button

## Example Upgrade Copy

### Commander Signal Export

```text
Export needs Commander.

Bundle your full Signal Deck into one launch-ready ZIP with schedules, platform timing, and ready-to-post content.
```

### Admiral Powerful AI

```text
Admiral unlocks Astro's most powerful command mode for deeper launch strategy, stronger copy, and advanced reviews.
```
