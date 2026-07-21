# LaunchDeckAI

**Your AI-Powered Launch Deck**

LaunchDeckAI is a calm, structured mobile app that guides first-time app creators from launch confusion to launch readiness with AI coaching (Astro), guided Blueprints, launch Missions and milestones, AI asset generation (Foundry), an asset vault (Cargo Bay), and a 16-step promotional Signal Deck.

## Documentation

Start with **`Docs/00_README_START_HERE.md`** for the full build reading order.

| Document | Purpose |
| --- | --- |
| [Docs/00_README_START_HERE.md](Docs/00_README_START_HERE.md) | Build command center — read order, naming rules, nav |
| [Docs/01_PRODUCT_BRIEF.md](Docs/01_PRODUCT_BRIEF.md) | Product brief, target audience, core screens |
| [Docs/02_MVP_SCOPE_AND_BUILD_ORDER.md](Docs/02_MVP_SCOPE_AND_BUILD_ORDER.md) | v1 scope and phased build order |
| [Docs/03_TECH_ARCHITECTURE.md](Docs/03_TECH_ARCHITECTURE.md) | Stack, folder structure, env vars |
| [Docs/04_INFORMATION_ARCHITECTURE_NAVIGATION.md](Docs/04_INFORMATION_ARCHITECTURE_NAVIGATION.md) | Bottom tabs, drawer, routes |
| [Docs/05_DESIGN_SYSTEM.md](Docs/05_DESIGN_SYSTEM.md) | Colors, typography, components |
| [Docs/06_FEATURE_SPECS.md](Docs/06_FEATURE_SPECS.md) | Per-feature specifications |
| [Docs/07_SIGNAL_DECK_SPEC.md](Docs/07_SIGNAL_DECK_SPEC.md) | 16-step Signal Deck spec |
| [Docs/08_ASTRO_AND_MONETIZATION.md](Docs/08_ASTRO_AND_MONETIZATION.md) | Astro character, plans, paywalls |
| [Docs/09_DATA_SCHEMA_AND_BACKEND_RULES.md](Docs/09_DATA_SCHEMA_AND_BACKEND_RULES.md) | Schema (mirrors `convex/schema.ts`) |
| [Docs/10_CURSOR_VIBE_CODING_PROMPTS.md](Docs/10_CURSOR_VIBE_CODING_PROMPTS.md) | Cursor/AI coding prompts |
| [Docs/11_QA_TESTING_CHECKLIST.md](Docs/11_QA_TESTING_CHECKLIST.md) | Manual QA scenarios |
| [Docs/12_WEB_APP_COMPANION_PLAN.md](Docs/12_WEB_APP_COMPANION_PLAN.md) | Future web companion plan |
| [Docs/13_ENGINEERING_AND_TESTING.md](Docs/13_ENGINEERING_AND_TESTING.md) | Commands, CI, Definition of Done |

### Root-level design & agent files

| File | Purpose |
| --- | --- |
| [PRODUCT.md](PRODUCT.md) | Brand personality, design principles, accessibility |
| [DESIGN.md](DESIGN.md) | Visual system (canonical typography & tokens) |
| [AUDIO.md](AUDIO.md) | Sound design specification |
| [AGENTS.md](AGENTS.md) | Agent instructions (design + engineering context) |
| [CLAUDE.md](CLAUDE.md) | Claude agent instructions (mirrors AGENTS.md) |

### Web prototype (separate stack)

The [`web-prototype/`](web-prototype/) folder is a **React + Vite web simulator** for visual exploration — not the canonical Expo mobile app. See [web-prototype/README.md](web-prototype/README.md).

## Product language

Use LaunchDeckAI terminology consistently:

- Project = **Mission**
- Credits = **Fuel**
- Templates = **Blueprints**
- Asset hub = **Cargo Bay**
- AI tools = **The Foundry**
- Pricing = **Refuel Station**
- Marketing sequencer = **Signal Deck**
- AI character = **Astro**

## Subscription tiers

- **Cadet** (free)
- **Commander** ($19/mo)
- **Admiral** ($49/mo)

Do not use Launch Pass — it has been renamed to Admiral. Canonical plan specs live in `src/constants/plans.ts`.

## Stack

Expo · React Native · TypeScript · Expo Router · NativeWind · Convex · Clerk · RevenueCat · PostHog · Sentry
