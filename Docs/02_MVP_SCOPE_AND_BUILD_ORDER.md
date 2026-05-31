# LaunchDeckAI MVP Scope and Build Order

## v1 Build Philosophy

Do not build everything at once. Build the Mission engine first, then let the AI tools plug into it.

The product should feel simple even if the backend is powerful.

## v1 Must-Have Features

- Expo React Native mobile app
- Clerk authentication
- Convex backend
- Onboarding
- Mission creation
- Deck / Mission Control
- Missions and milestones
- Blueprints
- Foundry AI generation
- Cargo Bay asset storage
- Signal Deck
- Astro AI Copilot
- Refuel Station
- RevenueCat subscriptions
- Basic notifications
- Analytics and error tracking

## v1 Should-Have Features

- Launch Library
- Signal Pack ZIP export
- Cargo Bay approval statuses
- Haptics
- Micro-animations
- Streak reminders
- Empty states
- Error boundaries

## Later Features

- Web dashboard
- Public Launch Deck pages
- Custom Signal Deck slots
- Team missions
- Direct social scheduling integrations
- Advanced analytics
- PDF mission reports
- Full automation integrations with Zapier, Make, and n8n

## Recommended Build Order

### Phase 1: Foundation

Build:

- Expo app
- TypeScript
- Expo Router
- NativeWind
- Initial folder structure
- Environment variables
- Placeholder screens

### Phase 2: Design System

Build:

- Colors
- Typography
- Buttons
- Cards
- Badges
- FuelBadge
- ProgressRing
- SignalBars
- EmptyState
- ErrorState
- ScreenHeader

### Phase 3: Navigation

Build:

- Bottom tabs
- AI Copilot center orb
- Nav drawer
- Modal routes
- Protected route shell

### Phase 4: Auth and User Setup

Build:

- Clerk sign up
- Clerk sign in
- Clerk + Convex provider
- Convex user creation
- Protected app routes

### Phase 5: Onboarding and Mission Creation

Build:

- App name
- One-liner
- Target audience
- Platform
- Launch stage
- Launch date
- Mission creation mutation
- Default milestones

### Phase 6: Deck / Mission Control

Build:

- T-Minus countdown
- Mission Readiness
- Fuel balance
- Streak
- Today's Launch Action
- Signal Deck CTA
- Blueprint progress CTA
- Critical risk card

### Phase 7: Missions

Build:

- Milestone groups
- Milestone completion
- Fuel rewards
- Readiness recalculation
- Locked milestone behavior
- Refuel Station routing

### Phase 8: Blueprints

Build:

- Blueprint section list
- Blueprint detail forms
- Completion status
- AI assist entry points
- Foundry handoff

### Phase 9: Foundry

Build:

- AI generation tools
- Fuel checks
- Plan gates
- Convex Actions for AI calls
- Save output to Cargo Bay

### Phase 10: Cargo Bay

Build:

- Asset list
- Asset details
- Copy content
- Approval status
- Signal linkage
- File upload support

### Phase 11: Signal Deck

Build:

- 16 fixed signals
- 3 phases
- SignalBars
- Computed statuses from Cargo Bay
- Foundry deep links
- Transmit Sequence export
- Commander+ paywall

### Phase 12: Astro AI Copilot

Build:

- Copilot modal
- Chat UI
- Suggested prompts
- Mission-aware context
- Fuel costs
- Plan-based Astro suit visuals

### Phase 13: Refuel Station

Build:

- Cadet plan
- Commander plan
- Admiral plan
- RevenueCat purchases
- Restore purchases
- Paywall bottom sheets

### Phase 14: Polish and Testing

Build:

- Haptics
- Loading states
- Error states
- Empty states
- Sentry
- PostHog
- Notifications
- TestFlight prep
- Google Play internal testing prep

## Do Not Build First

Avoid building these too early:

- Full web app
- Custom Signal Deck slots
- Team collaboration
- Direct social posting
- Advanced public sharing
- Complex analytics dashboards

Those are tempting glitter-comets, but v1 needs a stable launch engine first.
