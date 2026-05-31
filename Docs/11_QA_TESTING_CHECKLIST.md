# LaunchDeckAI QA and Testing Checklist

## Testing Principle

Every feature should be tested for:

- Happy path
- Empty state
- Error state
- Loading state
- Locked state
- Small phone layout
- Large phone layout
- Accessibility
- Backend safety

## Auth Tests

- User can sign up with email.
- User can sign in with email.
- User can sign in with Google.
- User can sign in with Apple.
- New user creates Convex user record.
- Logged-out user cannot access protected routes.
- User can log out.

## Onboarding Tests

- User can complete all onboarding steps.
- User can skip optional launch date.
- Mission is created after onboarding.
- Default milestones are created.
- Starter Blueprints are created.
- User lands on Deck after onboarding.

## Deck Tests

- Active Mission appears.
- T-Minus countdown displays correctly.
- No launch date fallback displays gracefully.
- Readiness score displays.
- Fuel balance displays.
- Today's Launch Action appears.
- Signal Deck CTA opens Signal Deck.
- Critical Risk card appears only when needed.

## Missions Tests

- Milestones appear in groups.
- User can complete a milestone.
- Fuel is awarded.
- Fuel history is written.
- Readiness recalculates.
- Locked milestones remain visible.
- Locked milestone routes to Refuel Station.

## Blueprints Tests

- Blueprint sections appear.
- Detail screen opens.
- User can save fields.
- Completion percentage updates.
- Empty fields show helper examples.
- Ask Astro button opens Copilot with context.
- Generate in Foundry button opens the correct Foundry tool.

## Foundry Tests

- Foundry tool cards appear.
- Fuel cost appears before generation.
- Locked tools show plan requirement.
- AI call goes through Convex Action.
- Successful generation saves to Cargo Bay.
- Failed generation does not deduct Fuel.
- User sees Saved to Cargo Bay confirmation.

## Cargo Bay Tests

- Assets appear after generation.
- Assets are grouped by type.
- Asset detail opens.
- Copy content works.
- Mark flight-ready works.
- Linked Signal appears when asset has signalId.
- Empty state guides user to Foundry.

## Signal Deck Tests

- Signal Deck opens from Deck CTA.
- Signal Deck opens from drawer.
- 16 signals appear.
- Three phases appear.
- T-Minus and X/16 ready display.
- not-loaded signal shows 0/3 bars.
- in-prep signal shows 2/3 bars.
- flight-ready signal shows 3/3 bars.
- Forge action opens Foundry with correct tool.
- Generated signal asset saves to Cargo Bay.
- Signal status updates from Cargo Bay asset status.
- Cadet cannot export ZIP.
- Cadet sees Commander paywall bottom sheet.
- Commander can export signal-pack.zip.

## Astro Copilot Tests

- Copilot orb opens modal.
- Astro belt matches user plan.
- Suggested prompts appear.
- Standard mode checks Fuel.
- Powerful mode checks plan.
- Copilot receives Mission context.
- Copilot does not provide generic-only advice.
- Copilot cap displays reset time if applicable.

## Refuel Station Tests

- Cadet card displays.
- Commander card displays.
- Admiral card displays.
- Astro preview matches each tier.
- RevenueCat purchase opens.
- Restore purchases works.
- Plan updates in Convex after webhook.
- Downgrade locks features without deleting data.

## Notifications Tests

- User can enable reminders.
- User can disable reminders.
- Daily Launch Action notification schedules.
- Launch Day alert schedules.
- Streak reminder schedules.

## Analytics Tests

Track these events without storing private content:

- user_signed_up
- onboarding_completed
- mission_created
- milestone_completed
- fuel_earned
- foundry_asset_generated
- cargo_asset_saved
- signal_deck_opened
- signal_asset_forged
- transmit_sequence_tapped
- copilot_message_sent
- plan_upgraded

## Accessibility Tests

- Tap targets are at least 44px.
- Text contrast is readable.
- Icon-only buttons have labels.
- Color is not the only status indicator.
- Forms have clear labels.
- Error copy is understandable.

## Store Prep Tests

- App icon installed correctly.
- Splash screen appears.
- App works on iOS simulator.
- App works on Android emulator.
- TestFlight build created.
- Google Play internal testing build created.
- Privacy policy link works.
- Terms link works.
- Support link works.
