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

## Engineering Context

Start at **`README.md`** for the full documentation map.

The `Docs/` folder is the build command center (`Docs/00_README_START_HERE.md`).
Before backend or build work, read:

- **Docs/03_TECH_ARCHITECTURE.md** — stack (Expo + Convex + Clerk + RevenueCat),
  the AI generation pipeline, and the client-vs-backend ownership split.
- **Docs/09_DATA_SCHEMA_AND_BACKEND_RULES.md** — tables (mirrors
  `convex/schema.ts`) and the non-negotiable backend rules: identity from Clerk
  only, queries verify ownership, plan/Fuel enforced server-side, Fuel deducted
  only after success, downgrades lock (never delete).
- **Docs/13_ENGINEERING_AND_TESTING.md** — commands, tests (Jest + convex-test),
  CI, Definition of Done, branch strategy (`master` is the trunk), dev switches.

Convex DB calls in this version take the table name first
(`ctx.db.get("missions", id)`, `ctx.db.patch("users", id, {...})`) — see the
Convex guidelines linked above.
