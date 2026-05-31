# LaunchDeckAI Web App Companion Plan

## Recommendation

Build the mobile app first. Build the web app second.

The mobile app should be the primary LaunchDeckAI experience because the core product relies on daily guidance, reminders, AI help, readiness tracking, and quick check-ins.

The web app should become a larger workspace companion after the mobile MVP is validated.

## Mobile First Role

Mobile is the launch cockpit in the user's pocket.

Best mobile features:

- Deck
- Missions
- Astro Copilot
- Foundry quick generation
- Signal Deck review
- Notifications
- Fuel/streaks
- Daily launch actions

## Web Companion Role

Web is the larger command desk.

Best web features:

- Blueprint editing
- Long-form App Store copy editing
- Cargo Bay asset management
- Press kit editing
- Signal Pack export
- Launch Library browsing
- Account and billing management
- Printing and PDF export later

## Web App v1 Scope

Do not build a full web clone first.

Start with:

- Marketing landing page
- Pricing page
- Waitlist/signup
- Privacy policy
- Terms
- Support page

## Web Dashboard v1 Scope Later

After mobile validation, build:

- Web login with Clerk
- Mission overview
- Blueprint editor
- Cargo Bay viewer/editor
- Foundry generation screen
- Signal Deck export screen
- Account settings

## Recommended Web Stack

- Next.js
- TypeScript
- Tailwind
- Clerk
- Convex
- Stripe or RevenueCat web billing strategy

## Shared Systems

Mobile and web should share:

- Convex backend
- User accounts
- Missions
- Blueprints
- Assets
- Fuel history
- Signal Deck templates
- Plan entitlements
- Design tokens

## Development Order

1. Mobile app MVP
2. Shared backend hardened for future web access
3. Marketing website
4. Simple web dashboard
5. Full LaunchDeckAI cross-platform ecosystem

## Important Rule

Do not build two full apps at the same time.

That splits focus and slows launch. Build the mobile launch engine first, then give it a bigger web command desk later.
