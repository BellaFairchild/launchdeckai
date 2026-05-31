# LaunchDeckAI Cursor Vibe Coding Prompts

## Master Setup Prompt

```text
You are building LaunchDeckAI, a React Native Expo mobile app for first-time app creators preparing to launch.

Follow these product language rules:
- Project = Mission
- Credits = Fuel
- Templates = Blueprints
- Asset hub = Cargo Bay
- AI tools = The Foundry
- Pricing = Refuel Station
- Marketing sequencer = Signal Deck
- AI Copilot character = Astro

Use this stack:
- Expo React Native
- TypeScript
- Expo Router
- NativeWind
- Convex
- Clerk
- RevenueCat
- PostHog
- Sentry

Plan names are:
- Cadet
- Commander
- Admiral

Do not use Launch Pass. It has been renamed to Admiral.

Do not code yet. First summarize the rules you will follow and list the files you expect to create or modify.
```

## Safe Build Prompt

```text
We are building only one feature right now.

Do not change unrelated files.
Do not redesign other screens.
Explain what files you will create or edit first.
Then build only this feature.
After coding, summarize what changed and explain how I can test it in simple steps.
```

## Foundation Prompt

```text
Create the LaunchDeckAI Expo React Native project foundation.

Requirements:
- Expo managed workflow
- TypeScript strict mode
- Expo Router
- NativeWind configured
- Initial folder structure
- Placeholder screens for Deck, Missions, Blueprints, Foundry, Cargo Bay, Signal Deck, Launch Library, Refuel Station, Settings, Profile
- AI Copilot opens as a modal from the center orb
- Add ErrorBoundary support

Do not add business logic yet.
```

## Design System Prompt

```text
Build the LaunchDeckAI design system.

Create:
- colors.ts
- typography.ts
- spacing.ts
- Button
- Card
- Badge
- FuelBadge
- ProgressRing
- SignalBars
- ScreenHeader
- EmptyState
- ErrorState
- AstroAvatar

Use a dark cosmic interface with teal, indigo, walnut, gold, flame, and glass cards.
Keep the UI calm, premium, and beginner-friendly.
```

## Navigation Prompt

```text
Build LaunchDeckAI navigation.

Bottom tabs:
- Deck
- Missions
- AI Copilot Orb
- Blueprints
- Foundry

Drawer:
- Profile
- Cargo Bay
- Signal Deck
- Launch Library
- Refuel Station
- Settings
- Support
- Log Out

Signal Deck must also be accessible from Deck through the CTA:
Stage Your Launch Sequence →

The AI Copilot Orb opens a modal and visually reflects the user's plan through Astro's belt/ring accent.
```

## Auth Prompt

```text
Implement Clerk + Convex authentication.

Requirements:
- Clerk sign up
- Clerk sign in
- Clerk Google login
- Clerk Apple login
- Protected routes
- ConvexProviderWithClerk
- Create Convex user record after signup

User defaults:
- plan: cadet
- fuelBalance: 0
- currentStreak: 0
- level: 1

Never trust userId from the client. Use Clerk identity in Convex.
```

## Onboarding Prompt

```text
Build the LaunchDeckAI onboarding flow.

Steps:
1. App name
2. One-line app description
3. Target audience
4. Platform: iOS, Android, or Both
5. Current stage
6. Optional launch date
7. Confirmation

On completion:
- Create Mission in Convex
- Create default milestones
- Create starter Blueprint sections
- Route user to Deck

Use calm, beginner-friendly copy.
```

## Deck Prompt

```text
Build the Deck / Mission Control screen.

Show:
- Active Mission card
- T-Minus countdown
- Mission Readiness ring
- Fuel and streak pill
- Today's Launch Action
- Critical Risk card when needed
- Blueprint progress card
- Signal Deck CTA: Stage Your Launch Sequence →
- Recent Cargo card

Keep above the fold simple: one big status, one primary action, three cards max.
```

## Missions Prompt

```text
Build the Missions screen.

Show grouped milestones with:
- title
- description
- Fuel reward
- status
- required plan
- locked state
- related action

When completing a milestone:
- update milestone in Convex
- award Fuel
- write fuelHistory
- update streak
- recalculate readiness
- animate FuelBadge

Locked milestones remain visible and route to Refuel Station.
```

## Blueprints Prompt

```text
Build the Blueprints screen.

Sections:
- App Info
- App Store
- Legal & Compliance
- Marketing
- Beta Testing
- Pre-Launch
- Launch Day
- Post-Launch

Each section card shows:
- title
- description
- completion percentage
- number of completed fields
- open button

Detail screens include:
- fill-in-the-blank fields
- helper examples
- save button
- Ask Astro button
- Generate in Foundry button when relevant
```

## Foundry Prompt

```text
Build The Foundry AI generation hub.

Tools:
- App Store Copy
- Social Blast
- Email Sequence
- Press Kit
- Video Script
- Product Hunt Copy
- Signal Deck Asset Forge

Rules:
- AI calls go through Convex Actions only
- Show Fuel cost before generation
- Check plan gate
- Check Fuel balance
- Inject Mission and Blueprint context
- Save successful output to Cargo Bay
- Do not deduct Fuel if generation fails
```

## Cargo Bay Prompt

```text
Build Cargo Bay.

Show saved assets grouped by type:
- App Store Copy
- Social Blast
- Email Sequence
- Press Kit
- Video Script
- Product Hunt Copy
- Images
- Signal Assets

Asset detail actions:
- copy content
- edit
- mark flight-ready
- regenerate
- view linked Signal

After Foundry generation, always show:
Saved to Cargo Bay
View in Cargo Bay →
```

## Signal Deck Prompt

```text
Build Signal Deck.

Access:
- Deck CTA: Stage Your Launch Sequence →
- Drawer item: Signal Deck

Do not add Signal Deck to the bottom tab bar.

Create:
- Context Strip with Mission, T-Minus, launch date, X/16 ready
- Phase 01 Pre-Launch, blue #3B82F6, 6 signals
- Phase 02 Launch Day, teal #4DC8C0, 6 signals
- Phase 03 Post-Launch, green #4ADE80, 4 signals
- SignalBars component
- Expanded row actions
- Foundry deep links
- Cargo Bay linked assets
- Transmit Sequence export
- Commander+ paywall bottom sheet

Signal statuses are computed from Cargo Bay assets, not manually checked.
```

## Astro Prompt

```text
Build Astro AI Copilot system.

Astro is the AI Copilot character.

Plan visuals:
- Cadet: black belt
- Commander: silver belt
- Admiral: gold belt

Apply Astro visuals in:
- AI Copilot Orb
- Copilot modal
- Profile screen
- Refuel Station plan cards
- Upgrade/paywall moments

Cadet Astro should still look friendly, capable, and premium.
```

## Refuel Station Prompt

```text
Build Refuel Station.

Plans:
- Cadet
- Commander
- Admiral

Do not use Launch Pass, Expert, Pro, or Premium.

Each plan card shows:
- plan name
- price
- Astro preview
- Fuel amount
- Active Mission limit
- Foundry access
- Copilot access
- Signal export access
- CTA button

Use RevenueCat for purchases and Convex webhooks for plan updates.
```

## Testing Prompt

```text
Create a test checklist for the current feature.

Include:
- happy path
- empty state
- loading state
- error state
- locked state
- small screen behavior
- large screen behavior
- accessibility checks
- backend validation checks

Explain how I can test it manually in simple steps.
```
