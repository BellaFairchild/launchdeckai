<!-- convex-ai-start -->

This project uses [Convex](https://convex.dev) as its backend.

When working on Convex code, **always read
`convex/_generated/ai/guidelines.md` first** for important guidelines on
how to correctly use Convex APIs and patterns. The file contains rules that
override what you may have learned about Convex from training data.

Convex agent skills for common tasks can be installed by running
`npx convex ai-files install`.

<!-- convex-ai-end -->

## Design Context

Two root files carry the design system; read them before any UI work:

- **PRODUCT.md** — strategic context. Register is `product`. Users are first-time
  app creators buying relief, not a checklist. Principles: relief over information,
  calm confidence (never cold), the launch-world metaphor earns its keep, earn the
  signature moments, progress you can feel. Anti-references: sterile checklist tool,
  corporate SaaS dashboard. Accessibility target: WCAG AA + honor reduced motion.
- **DESIGN.md** — visual system (+ `.impeccable/design.json` sidecar). North Star:
  "Calm Mission Control with Handcrafted Warmth". Indigo-tinted space, glow-as-elevation
  (never gray drop shadows), cool teal for structure + warm gold for reward (rare).
  Pill buttons, large-radius glass panels, JetBrains Mono for live telemetry numbers.
- **AUDIO.md** — sound design spec. Quiet UI telemetry, rare signature moments, optional
  ambient beds; implementation in `src/lib/audio.ts` and `assets/audio/`.

## Cursor Cloud specific instructions

Stack: Expo (~56) React Native app + Convex backend. Package manager is npm (`package-lock.json`); Node 22 works. Standard scripts live in `package.json` (`start`, `web`, `lint`, `test`).

- The active application code lives on the `master` branch. The `main` branch is a stub containing only `README.md`, so base branches/PRs for real work off `master`.
- Fastest way to run and manually test in a headless VM is Expo Web: `npm run web` (Metro dev server on `http://localhost:8081`). First bundle takes ~15s; the server prints `Web Bundled` when ready.
- Demo mode: when `EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY` is unset the app runs fully offline with mock Zustand data (`src/store/mission.ts`) and routes straight to the Deck — no Clerk/Convex/Anthropic credentials needed to load and interact with the UI. This is the recommended path for quick verification.
- Full auth + persistence + live AI need external accounts: Convex (`CONVEX_AGENT_MODE=anonymous npx convex dev`, writes `EXPO_PUBLIC_CONVEX_URL` to `.env.local`), Clerk (`EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY` + Convex `CLERK_JWT_ISSUER_DOMAIN`), and Anthropic (`ANTHROPIC_API_KEY`, else Foundry/Copilot return demo drafts). See `.env.example`.
- Tests: `npm test` (Jest + jest-expo, no services required). Lint: `npm run lint` (`expo lint`) — on a fresh checkout this self-installs ESLint + `eslint-config-expo` and generates `eslint.config.js` on first run (the repo ships without them), so expect that one-time churn. It also currently reports pre-existing errors/warnings in app code; that is expected, not an environment problem.
- No Docker / local Postgres/Redis — Convex is hosted.
