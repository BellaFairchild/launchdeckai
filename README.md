# SubDeck

Stop surprise renewals. Cut wasted tools. Keep only what earns its place.

SubDeck is a mobile-first subscription tracker for freelancers, creators, indie developers, solo founders, and small business owners. It gives decision support, not just passive tracking: track renewal dates, trial endings, monthly and annual spend, and run a monthly **Stack Sweep** to decide what to keep, downgrade, or cancel.

## Tech Stack

- **Framework:** React Native + Expo (SDK 57), Expo Router (file-based navigation)
- **Styling:** NativeWind (Tailwind for React Native), dark theme first
- **State:** Zustand, persisted to `@react-native-async-storage/async-storage`
- **Dates:** date-fns
- **Date picker:** `@react-native-community/datetimepicker`

### On the data layer

The MVP ships with a **local-first data layer** (`store/useAppStore.ts`) instead of Convex + Clerk. The data
shapes in `types/models.ts` mirror the Convex schema described in the project brief, so swapping the local
store for real Convex queries/mutations and Clerk auth later is a drop-in change — screens read from
`useAppStore()` selectors, not directly from storage. This choice was made because provisioning Convex/Clerk
projects requires accounts and API keys that aren't part of this repo's scaffold.

## Getting Started

```bash
npm install
npm run start      # Expo dev server (scan QR with Expo Go, or press i/a for simulator)
npm run web        # Run in a browser
npm run typecheck  # tsc --noEmit
```

## Project Structure

```
app/                     Expo Router routes
  (tabs)/                 Deck, Stack, Alerts, Insights + custom tab bar with FAB
  subscription/[id].tsx   Subscription detail (decision zone, cancellation tracker)
  settings/                Profile, notifications, currency, export, help, about
  add-subscription.tsx    Add/Edit subscription form
  onboarding.tsx           Welcome + "Build Your First Stack" quick add
  sweep.tsx                Stack Sweep Lite guided review flow
  menu.tsx                 Drawer-style secondary navigation
components/               Shared UI (Card, Button, StatusChip, SubscriptionCard, BarList, ...)
constants/                Category/billing/status labels, theme colors, popular tools
lib/                      Cost calculations, alert derivation, id helpers
store/                    Zustand store (subscriptions, alerts, sweeps, profile)
types/                    Data model types shared across the app
```

## MVP Scope Implemented

- Deck dashboard (spend, forecast, renewals, trials, savings, urgent alerts, Start Sweep CTA)
- Stack list with search, category/status filters, sort, pull-to-refresh
- Add / Edit subscription with all fields from the brief (billing types, seats, variable cost, etc.)
- Subscription detail with Decision Zone and Cancellation Tracker
- Alerts grouped by timeframe (Due Today, This Week, Next 14/30 Days, Trials Ending, Cancel Soon, Snoozed, Reviewed)
- Insights with spend-by-category, top costs, monthly vs. annual, potential savings, billing breakdown
- Stack Sweep Lite guided review with savings summary and next sweep date
- Quick Add onboarding ("Build Your First Stack") across AI, Design, Coding, Business, Marketing
- Cost calculations matching brief section 11 (monthly/annual normalization, exclusions, savings)
- Drawer with Profile, Settings, Notification Preferences, Currency Preferences, Export Data (CSV/JSON), Help, About

## Not Yet Wired Up (documented follow-ups)

- Real authentication (Clerk) — profile is stored locally for now
- Convex backend — local persistence layer is structured to swap in cleanly
- Push notifications (`expo-notifications`) — alert state exists, scheduling not implemented
- Charts use lightweight custom bar visualizations rather than a charting library, per the "avoid heavy blur/animations, use lightweight charts" non-functional requirement
