# LaunchDeckAI Feature Specifications

## 1. Onboarding

### Goal

Create the user's first Mission.

### Steps

1. App name
2. One-line app description
3. Target audience
4. Platform: iOS, Android, or Both
5. Current stage
6. Optional launch date
7. Confirmation

### Completion Behavior

When onboarding is complete:

- Create Mission
- Create default milestone instances
- Create starter Blueprint record
- Route user to Deck

## 2. Deck / Mission Control

### Goal

Show the user's current launch status and next best action.

### Main Components

- Active Mission card
- T-Minus countdown
- Mission Readiness ring
- Fuel and streak pill
- Today's Launch Action
- Critical Risk card
- Signal Deck CTA
- Blueprint progress card
- Recent Cargo card

### Main CTA

```text
Stage Your Launch Sequence →
```

## 3. Missions

### Goal

Help the user complete launch milestones.

### Milestone Sections

- Foundation
- Store Prep
- Assets
- Marketing
- Launch
- Post-Launch

### Milestone Row Data

- Title
- Description
- Status
- Fuel reward
- Required plan
- Lock state
- Linked Blueprint or Foundry action

### Completion Behavior

When a milestone is completed:

- Update status
- Award Fuel
- Write fuel history
- Recalculate readiness
- Update streak
- Animate success

## 4. Blueprints

### Goal

Collect structured launch details that power Foundry, Copilot, and Signal Deck.

### Blueprint Sections

- App Info
- App Store
- Legal & Compliance
- Marketing
- Beta Testing
- Pre-Launch
- Launch Day
- Post-Launch

### Blueprint Detail Requirements

Each section should include:

- Fill-in-the-blank fields
- Helper examples
- Save button
- Ask Astro button
- Generate in Foundry button where relevant
- Completion percentage

## 5. Foundry

### Goal

Generate launch assets using AI and Mission context.

### Tools

- App Store Copy
- Social Blast
- Email Sequence
- Press Kit
- Video Script
- Product Hunt Copy
- Signal Deck Asset Forge

### Requirements

- Show Fuel cost before generation
- Show required plan if locked
- Route AI calls through Convex Actions
- Save successful output to Cargo Bay
- Do not deduct Fuel if generation fails

## 6. Cargo Bay

### Goal

Store and manage launch assets.

### Asset Types

- App Store Copy
- Social Blast
- Email Sequence
- Press Kit
- Video Script
- Product Hunt Copy
- Image Upload
- Legal Document
- Signal Asset

### Asset Statuses

- not_loaded
- in_prep
- needs_clearance
- flight_ready
- exported

### Asset Detail Actions

- Copy content
- Edit content
- Mark flight-ready
- Regenerate
- Export/share
- View linked Signal

## 7. Astro AI Copilot

### Goal

Give Mission-aware guidance.

### Modes

- Standard
- Powerful

### Required Context

- App name
- One-liner
- App description
- Target audience
- Platform
- Launch date
- Readiness score
- Incomplete milestones
- Blueprint progress
- Signal Deck status
- Active risks

### Suggested Prompts

- What should I do next?
- Review my launch gaps.
- Help me finish this Blueprint.
- Improve this Foundry asset.
- Prepare my Signal Deck.
- Explain this milestone.

## 8. Launch Library

### Goal

Provide curated resources for app launch prep.

### Categories

- App Store Submission
- Google Play Submission
- Legal & Privacy
- Marketing
- Beta Testing
- Analytics
- Monetization
- Design Tools
- AI Tools
- Saved Resources

### Requirements

- Search
- Category filters
- Save resource
- Official link button
- Resource cards

## 9. Refuel Station

### Goal

Show plan options, unlocks, Fuel, and subscription controls.

### Plans

- Cadet
- Commander
- Admiral

### Requirements

- Plan cards
- Astro preview per plan
- RevenueCat purchase
- Restore purchases
- Upgrade confirmation
- Downgrade-safe locking

## 10. Profile

### Goal

Show user identity and launch progress.

### Include

- Astro full-body avatar
- Plan
- Fuel balance
- Current streak
- Level
- Service ribbons
- Active Mission count
