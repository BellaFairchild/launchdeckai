# LaunchDeckAI Web Prototype

> **Scope:** This folder is a **React + Vite web simulator** for visual exploration
> and agentic iteration — **not** the canonical Expo mobile app. For the real product
> spec, start at [`../Docs/00_README_START_HERE.md`](../Docs/00_README_START_HERE.md).
>
> Differences from the mobile v1 spec:
> - **Stack:** React + Vite + Tailwind (not Expo / React Native)
> - **Nav:** Signal Deck and Cargo Bay are bottom tabs here; on mobile they live in the drawer
> - **Fonts:** Syne / Instrument Sans / DM Mono (mobile uses Space Grotesk / Inter / JetBrains Mono)

## Run locally

**Prerequisites:** Node.js

1. Install dependencies: `npm install`
2. Copy `.env.example` → `.env.local` and set `GEMINI_API_KEY`
3. Run: `npm run dev`

## Prototype docs

| File | Purpose |
| --- | --- |
| [ANTIGRAVITY_APP_GUIDE.md](ANTIGRAVITY_APP_GUIDE.md) | Component playbook and data models |
| [ANTIGRAVITY_WORKFLOW.md](ANTIGRAVITY_WORKFLOW.md) | Dev standards and verification loops |
| [design.md](design.md) | Web prototype design system (fonts differ from mobile) |
| [screens.md](screens.md) | Screen architecture map |

## Shared product language

Same as the mobile app — see [`../Docs/00_README_START_HERE.md`](../Docs/00_README_START_HERE.md):

- Mission, Fuel, Blueprints, Cargo Bay, Foundry, Refuel Station, Signal Deck, Astro
- Plans: Cadet, Commander, Admiral (never "Launch Pass")
