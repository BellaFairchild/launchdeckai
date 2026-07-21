# LaunchDeckAI Engineering & Testing

How we build, test, and ship the LaunchDeckAI mobile app. Read alongside
`03_TECH_ARCHITECTURE.md` (stack) and `09_DATA_SCHEMA_AND_BACKEND_RULES.md`
(backend rules).

## Stack at a glance

Expo (SDK 56) · React Native 0.85 · React 19 · expo-router (typed routes, React
Compiler) · NativeWind 4 · Zustand · Convex backend · Clerk auth · RevenueCat ·
Anthropic Claude (Astro) · PostHog · Sentry. TypeScript `strict` throughout.

## Prerequisites

- Node 20 LTS and npm.
- A Convex dev deployment (`npx convex dev`) and a Clerk dev instance.
- Copy `.env.example` → `.env.local` and fill the `EXPO_PUBLIC_*` values.
  Server-only secrets are set on Convex with `npx convex env set …`, never in the
  app bundle.

## Common commands

```bash
npm install            # install deps
npx convex dev         # run the Convex backend (codegen + live functions)
npm run start          # Expo dev server (then i / a / w, or scan the QR)
npm run ios            # open iOS simulator
npm run android        # open Android emulator
npm run web            # run in the browser

npm run lint           # expo lint (ESLint)
npm run typecheck      # tsc --noEmit  (app/src; convex typechecks via convex dev)
npm test               # jest (React Native unit/component tests)
npm run test:watch     # jest in watch mode
```

> Speech-to-text (`expo-speech-recognition`) and other native modules require a
> **dev client rebuild** — Expo Go is not enough. See `app.json` plugins.

## Testing

**React Native (Jest + Testing Library).** Unit, component, store, and lib tests
live next to their source as `*.test.ts(x)` under `src/` and run on `jest-expo`.
Test behavior a user/caller cares about, not internals. Every bug fix ships with
a regression test.

**Convex backend (`convex-test` + Vitest).** Backend functions are tested in
isolation with an in-memory Convex via `convex-test`, seeding through
`t.run(...)` and asserting on the resulting documents. Authorization paths
(ownership checks, plan gates) and Fuel accounting are the highest-value cases.
Never let a test make a real billed call (no real Anthropic/RevenueCat calls) —
the AI action falls back to `aiMock.ts` when `ANTHROPIC_API_KEY` is unset.

Manual QA scenarios live in `11_QA_TESTING_CHECKLIST.md`.

## Continuous integration

`.github/workflows/ci.yml` runs on every PR and on pushes to `master`/`main`:
`npm ci` → `npm run typecheck` → `npm test`. Keep it green; do not merge red.
`expo lint` is run locally for now (no committed ESLint config to run headless in
CI yet — add one and wire it in when ready).

## Definition of Done

- [ ] Meets the spec; no scope creep.
- [ ] `npm run typecheck` and `npm test` pass locally.
- [ ] New/changed behavior is covered by a test.
- [ ] Backend rules upheld: identity from Clerk only, queries verify ownership,
      plan/Fuel enforced server-side, Fuel deducted only after success
      (`09_DATA_SCHEMA_AND_BACKEND_RULES.md`).
- [ ] Schema change? Update `convex/schema.ts` **and**
      `09_DATA_SCHEMA_AND_BACKEND_RULES.md` together.
- [ ] UI honors the design system, WCAG AA contrast, reduced motion, and 44px
      targets (`PRODUCT.md` / `DESIGN.md`).
- [ ] No secrets committed; no AI keys in the app bundle.

## Convex API — read this first

Before writing Convex code, **always read `convex/_generated/ai/guidelines.md`**.
It overrides training-data assumptions. In particular, this version's database
calls take the **table name first**:

```ts
await ctx.db.get("missions", missionId);
await ctx.db.patch("users", userId, { plan });
await ctx.db.replace("tasks", taskId, { ... });
await ctx.db.insert("assets", { ... });
```

`_generated/` is committed Convex codegen — never edit it by hand; it updates
when `npx convex dev` runs.

## Branch & PR strategy

- **`master` is the trunk.** All feature branches and PRs target `master`.
- Branch names: `feat/…`, `fix/…`, `ci/…`, `docs/…`.
- Conventional Commits; small, focused PRs; open as draft until ready.
- `_generated/` and lockfile changes are committed with the change that caused
  them.

## Dev-only switches

- `ALLOW_DEV_PLAN_SWITCH=true` (Convex env) enables `users.setPlan`, which lets a
  user set their **own** plan. It is a paywall bypass and must stay **unset in
  production**; real plan changes flow from the RevenueCat entitlement webhook
  (`subscriptions.applyEntitlement`).
- AI runs against `aiMock.ts` whenever `ANTHROPIC_API_KEY` is unset, so the
  Foundry and Copilot work offline with demo drafts.
