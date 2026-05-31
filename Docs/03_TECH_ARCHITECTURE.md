# LaunchDeckAI Technical Architecture

## Recommended Stack

### Mobile App

- Expo
- React Native
- TypeScript
- Expo Router
- NativeWind
- Zustand for lightweight local UI state

### Backend

- Convex
- Convex Queries
- Convex Mutations
- Convex Actions
- Convex File Storage
- Convex HTTP Actions for webhooks

### Authentication

- Clerk
- Email sign in
- Google sign in
- Apple sign in
- Clerk JWT identity inside Convex

### Payments

- RevenueCat
- App Store subscriptions
- Google Play subscriptions
- RevenueCat webhooks to Convex

### AI

- AI calls through Convex Actions only
- No AI API keys in the mobile app
- Mission context injected server-side
- Fuel charged only after successful generation

### Analytics and Monitoring

- PostHog for product analytics
- Sentry for error tracking

### Notifications

- Expo Notifications

## Core Rule

The React Native app should render UI and collect user intent. Convex should own important product truth.

## Backend-Owned State

Convex should own:

- User account record
- Current plan
- Fuel balance
- Fuel history
- Mission records
- Milestone completion
- Readiness score
- Cargo Bay assets
- Signal Deck computed status
- Subscription entitlement
- AI generation results

## Client-Owned State

The mobile app can own:

- Selected tab
- Modal open/closed state
- Unsaved form drafts
- Expanded rows
- Filters
- Temporary onboarding form steps

## AI Generation Pipeline

All Foundry and Copilot AI features should use one shared backend pattern:

1. Validate user identity from Clerk.
2. Load user plan and Fuel balance.
3. Load active Mission.
4. Validate feature access.
5. Validate Fuel cost.
6. Build prompt with Mission context.
7. Call AI provider through Convex Action.
8. Save successful output.
9. Deduct Fuel.
10. Write fuel history.
11. Return result to client.

## Recommended Folder Structure

```text
/app
  /(auth)
  /(tabs)
    deck.tsx
    missions.tsx
    blueprints.tsx
    foundry.tsx
  /(modals)
    copilot.tsx
    refuel.tsx
    cargo.tsx
    signal-deck.tsx
    launch-library.tsx
    profile.tsx
    settings.tsx
/components
  /ui
  /deck
  /missions
  /blueprints
  /foundry
  /cargo
  /signals
  /copilot
  /astro
  /refuel
  /library
/constants
  colors.ts
  typography.ts
  spacing.ts
  plans.ts
  signalTemplates.ts
/hooks
/lib
/store
/convex
  schema.ts
  users.ts
  missions.ts
  milestones.ts
  blueprints.ts
  assets.ts
  signals.ts
  fuel.ts
  subscriptions.ts
  ai.ts
  http.ts
/assets
```

## Environment Variables

Mobile:

```text
EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY=
EXPO_PUBLIC_CONVEX_URL=
EXPO_PUBLIC_REVENUECAT_IOS_API_KEY=
EXPO_PUBLIC_REVENUECAT_ANDROID_API_KEY=
EXPO_PUBLIC_POSTHOG_KEY=
EXPO_PUBLIC_POSTHOG_HOST=
SENTRY_DSN=
```

Convex:

```text
CLERK_JWT_ISSUER_DOMAIN=
ANTHROPIC_API_KEY=
REVENUECAT_WEBHOOK_SECRET=
POSTHOG_PROJECT_API_KEY=
```

## Security Rules

- Never pass userId from the client and trust it.
- Always derive identity from Clerk auth context.
- Never expose AI provider API keys to React Native.
- Never deduct Fuel if AI generation fails.
- Never delete user content because of downgrade. Lock access instead.
- Use backend validation for plan gates.

## Recommended Feature Flags

```ts
export const featureFlags = {
  enableSignalDeck: true,
  enableCopilotPowerMode: true,
  enableLaunchLibrary: true,
  enableTransmitExport: true,
  enableWebCompanion: false,
};
```
