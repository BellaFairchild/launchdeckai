# LaunchDeckAI Information Architecture and Navigation

## Navigation Goal

The user should always know:

- Where am I in my launch?
- What should I do next?
- What can AI help me create?
- Where did my launch content go?
- What is ready to transmit?

## Recommended v1 Bottom Navigation

```text
Deck | Missions | AI Copilot Orb | Blueprints | Foundry
```

## Why This Works

This nav supports the v1 user journey:

1. Deck shows status.
2. Missions show tasks.
3. Astro helps the user think.
4. Blueprints collect structured launch info.
5. Foundry creates launch assets.

Cargo Bay is still important, but in v1 it works better as a drawer item and contextual destination after generated content is saved.

## Bottom Nav Details

### Deck

Main command center.

Shows:

- Active Mission
- T-Minus countdown
- Mission Readiness
- Today's Launch Action
- Fuel and streak
- Signal Deck CTA
- Blueprint progress
- Recent Cargo

### Missions

Launch roadmap.

Shows:

- Milestone groups
- Completion status
- Locked milestones
- Fuel rewards
- Readiness impact

### AI Copilot Orb

Center action button.

Behavior:

- Opens Astro Copilot modal
- Does not navigate to a normal tab screen
- Visually reflects the user's plan through Astro's belt/ring accent

### Blueprints

Structured launch worksheets.

Shows:

- App Info
- App Store
- Legal & Compliance
- Marketing
- Beta Testing
- Pre-Launch
- Launch Day
- Post-Launch

### Foundry

AI generation hub.

Shows:

- App Store Copy
- Social Blast
- Email Sequence
- Press Kit
- Video Script
- Product Hunt Copy
- Signal Deck asset tools

## Drawer Navigation

Recommended drawer order:

```text
Profile
Cargo Bay
Signal Deck
Launch Library
Refuel Station
Settings
Support
Log Out
```

## Contextual Entry Points

### Cargo Bay

Access from:

- Drawer
- Foundry success screen
- Signal Deck expanded rows
- Deck Recent Cargo card
- Blueprint generated content areas

### Signal Deck

Access from:

- Deck CTA: `Stage Your Launch Sequence →`
- Drawer item: `Signal Deck`
- Cargo Bay linked signal assets
- Foundry after signal asset creation

### Launch Library

Access from:

- Drawer
- Mission milestone helper links
- Blueprint resource links
- Deck quick card

## Deck CTA Priority

The Deck should not become crowded.

Priority above the fold:

1. T-Minus countdown
2. Mission Readiness
3. Today's Launch Action

Secondary cards:

- Stage Your Launch Sequence →
- Complete Your Blueprint →
- Open Recent Cargo →
- Visit Launch Library →

## Route Naming Suggestions

```text
/(tabs)/deck
/(tabs)/missions
/(tabs)/blueprints
/(tabs)/foundry
/(modals)/copilot
/(drawer)/cargo-bay
/(drawer)/signal-deck
/(drawer)/launch-library
/(drawer)/refuel-station
/(drawer)/settings
/(drawer)/profile
```

## Rule

Do not put Signal Deck in the bottom tabs for v1. It should feel like a powerful drill-down feature, promoted from Deck and accessible from the drawer.
