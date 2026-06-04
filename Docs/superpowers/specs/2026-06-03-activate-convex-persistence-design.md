# Activate Live Convex Persistence — Design

**Date:** 2026-06-03
**Status:** Approved (design) — ready for implementation plan
**Scope:** Workstream A only. Wiring `LaunchFlightPath` to live mission progress is
explicitly deferred to a later spec.

## Problem

The new Foundry / Blueprint / Social-Links UI is fully coded against the backend,
but in the running app **nothing persists to Convex** — every write lands in
in-memory Zustand state and is lost on reload.

### Verified current state

The component → store → Convex chain is complete and correct:

- Foundry forge → `convex.createFoundryAsset` → `api.assets.createFoundryAsset`
- Blueprint / social save → `convex.saveBlueprint` → `api.blueprints.save`
- Milestones / broadcasts → equivalent adapter mutations

It is gated behind `authEnabled`:

- `authEnabled = CLERK_PUBLISHABLE_KEY.length > 0` (`src/lib/auth.ts:8`)
- `.env.local` has `EXPO_PUBLIC_CONVEX_URL` (`outgoing-tiger-365…`) but **no
  `EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY`**
- → `authEnabled === false` → `DataSync` returns `null` (`src/components/DataSync.tsx:188`)
  → `setConvex` never runs → adapter stays `null`
  → every write takes the local-only fallback (`src/store/mission.ts:179-188`)

**This is a configuration gate, not a code defect.** The backend
(`convex/auth.config.ts`, `ConvexProviderWithClerk` in `src/lib/convex.tsx`, all
mutations, deployed functions) is already in place.

## Goal

Flip the app from demo/local-only into live, authenticated persistence — while
preserving the existing **demo capture workflow** (unauthenticated web mode used
for screenshots) via an explicit toggle.

## Design

### 1. Demo-mode toggle (the only code change)

Today auth turns on implicitly whenever a Clerk key is present. That makes the
screenshot-capture workflow impossible once the key lives in `.env.local`. We add
an explicit override so both workflows coexist.

`src/lib/auth.ts`:

```ts
// Force demo mode (no auth, local mock stores) even when a Clerk key is present.
// Used by the web screenshot-capture workflow.
export const demoMode =
  process.env.EXPO_PUBLIC_DEMO_MODE === "1" ||
  process.env.EXPO_PUBLIC_DEMO_MODE === "true";

export const authEnabled = CLERK_PUBLISHABLE_KEY.length > 0 && !demoMode;
```

Behavior matrix:

| Clerk key | `EXPO_PUBLIC_DEMO_MODE` | Result |
| --- | --- | --- |
| absent | (any) | Demo mode — local-only (unchanged from today) |
| present | unset / `0` | **Auth on — live persistence** |
| present | `1` | Demo mode forced — capture workflow keeps working |

Add `EXPO_PUBLIC_DEMO_MODE=` to `.env.example` with a one-line comment.

No other app code changes. The adapter, providers, and mutations are untouched.

### 2. Clerk configuration (external — app already exists)

- Confirm the existing Clerk app's **Publishable Key** (`pk_test_…` / `pk_live_…`).
- Create a JWT template named exactly **`convex`** (must match `applicationID`
  in `convex/auth.config.ts:11`).
- Note the **Frontend API URL** (the JWT issuer domain), e.g.
  `https://<slug>.clerk.accounts.dev`.

### 3. Client env (`.env.local`)

```
EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_…   # publishable, safe to commit to local env
EXPO_PUBLIC_CONVEX_URL=https://outgoing-tiger-365… # already set
```

### 4. Convex deployment env (`npx convex env set`)

- `CLERK_JWT_ISSUER_DOMAIN` = Frontend API URL from step 2. **Required** — without
  it `ctx.auth.getUserIdentity()` is always null and every mutation rejects.
- *(Optional)* `ANTHROPIC_API_KEY` — without it Foundry still **persists**; it just
  returns mock drafts instead of live AI output.

### 5. Deploy / confirm functions are live

- Ensure the `outgoing-tiger-365` deployment is current: `npx convex dev` running
  during development, or `npx convex deploy`.

## Verification (evidence required, not assumed)

1. Launch with the Clerk key set and `EXPO_PUBLIC_DEMO_MODE` unset.
2. Sign up / sign in via Clerk → confirm a `users` row is created
   (`api.users.getOrCreateUser`) in the Convex dashboard.
3. Forge an asset, save a blueprint, complete a milestone.
4. **Reload the app** → confirm all three survive (live query re-hydrates from
   Convex), and cross-check the rows in the Convex data dashboard.
5. Set `EXPO_PUBLIC_DEMO_MODE=1` → confirm the app returns to unauthenticated demo
   mode and the capture workflow still works.

## Out of scope

- Wiring `LaunchFlightPath` to live mission progress (phase state + live counts +
  animated rocket) — deferred to its own spec.
- Changing the Foundry upload-failure UX (currently routes to Refuel on mutation
  error).
- RevenueCat / PostHog / Sentry env wiring (separate phases).

## Risks / notes

- The Clerk JWT template **must** be named `convex`, or token `aud` validation
  fails silently and identity stays null.
- Enabling auth changes the whole app's runtime surface (sign-in gating, live
  data). The demo toggle is what keeps the screenshot workflow intact.
- `EXPO_PUBLIC_*` vars are bundled into the client; the Clerk publishable key is
  designed to be public, but `CLERK_JWT_ISSUER_DOMAIN` / `ANTHROPIC_API_KEY` are
  Convex-side and must be set via `npx convex env set`, never in `.env.local`.
