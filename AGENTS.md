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
