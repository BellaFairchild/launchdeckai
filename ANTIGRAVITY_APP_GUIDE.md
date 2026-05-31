# LaunchDeckAI — App & Architecture Reference Guide

Welcome, Commander. This document serves as the primary technical specification and component playbook for **LaunchDeckAI Simulator**, compiled specifically to guide future agentic iterations, maintenance, and expansions of this workspace.

---

## 1. System Architecture & Routing

The application is built as a highly responsive, single-page full-fidelity simulation using **React (v18+)** and **Vite**, styled entirely via the **Tailwind CSS** system.

### Dynamic Navigation Deck
The application container (`src/App.tsx`) manages navigation, sub-screens, side drawers, global modal relays, and notifications:

*   **Primary Screen Tabs (`currentTab` State)**:
    *   `deck`: Launch Seq Timeline & Chronometer Roadmap (`src/components/DeckScreen.tsx`)
    *   `mission`: Current Active milestones & readiness tracking (`src/components/MissionScreen.tsx`)
    *   `signals`: Chronological marketing & community broadcast steps (`src/components/SignalsScreen.tsx`)
    *   `cargo`: Real-time launch asset locker tracker (`src/components/CargoScreen.tsx`)
    *   `foundry`: Production station for copy, threads, press kits, and scripts (`src/components/FoundryScreen.tsx`)
    *   `settings`: Direct simulator configuration (`src/components/SettingsScreen.tsx`)
*   **System Side Modal Overlays**:
    *   `CopilotModal`: AI Launch Advisor / Companion panel
    *   `Drawer`: Navigation extension containing settings, profile, blueprints, support, and refuel links
    *   `RefuelModal`: Clearances upgrade UI (Cadet, Commander, Admiral) and IAP fuel top-ups
    *   `BlueprintsModal`: App-specific boilerplate models
    *   `ProfileModal`: User summary, current streak info, levels, and service ribbons/badges
    *   `SupportModal`: Virtual triage diagnostic agent for simulating issue logs

---

## 2. Core Data Models (`src/types.ts`)

Any modification to parameters MUST remain consistent with the interfaces established within `src/types.ts`:

```typescript
export type Plan = "cadet" | "commander" | "admiral";

export interface User {
  clerkId: string;
  email: string;
  displayName: string;
  plan: Plan;
  fuelBalance: number;
  currentStreak: number;
  level: number;
}

export interface Mission {
  id: string;
  appName: string;
  appDescription: string;
  oneLiner: string;
  targetAudience: string;
  platform: "ios" | "android" | "both";
  launchDate: number;
  stage: "building" | "testing" | "store_prep" | "ready_to_submit";
  status: "active" | "launched" | "archived";
  readinessScore: number;
}

export interface Milestone {
  id: string;
  title: string;
  category: "foundation" | "assets" | "store" | "marketing" | "launch";
  completed: boolean;
  requiredPlan: Plan;
  status?: "cleared" | "in_prep" | "scheduled";
  date?: string;
  isLocked?: boolean;
  description?: string;
}

export interface Asset {
  id: string;
  type: string;
  title: string;
  status: "not_loaded" | "in_prep" | "needs_clearance" | "flight_ready" | "cleared";
  category: "app_store" | "social" | "media" | "pr" | "legal" | "files";
}
```

---

## 3. Visual Language & Style Design Tokens

LaunchDeckAI implements a **Warm-Contrast Cosmic UI theme**. Custom styling parameters are defined inside `src/index.css` under the `@theme` tailwind extension:

### Display & Font Systems
*   **Primary Display Header**: `"Syne", sans-serif` (extremely bold, block tracking for futuristic command indicators)
*   **Body Content**: `"Instrument Sans", sans-serif` (elegant, sharp, humanist geometric grotesque shape)
*   **Console & Stats**: `"DM Mono", monospace` (highly readable developer-oriented clean alignment)

### Cosmic Palette (Custom Variable Colors)
*   **Deep Canvas Space**: `--color-bg-deep (#060B14)`
*   **Surface Sheets**: `--color-bg-surface (#0A1220)`
*   **Deck Cards**: `--color-bg-card (#0E1520)`
*   **Depleted States**: `--color-bg-depleted (#0D1630)`
*   **Borders**: `--color-border-default (#1E2D45)` | `--color-border-med (#2A4060)`
*   **Teal Primary**: `--color-brand-teal (#4DC8C0)` | `--color-brand-teal-light (#7DDBD6)`
*   **Blue Accent**: `--color-brand-blue (#3B82F6)` | `--color-brand-blue-light (#60A5FA)`
*   **Gold Highlight**: `--color-brand-gold (#F3B233)`
*   **Hot Flame / Fuel**: `--color-brand-flame (#FFD65A)` || CSS `text-status-warning` / `text-brand-gold`

---

## 4. Monetization Mechanics & Feature Gates

LaunchDeckAI simulates a premium subscription flow managed by RevenueCat tiers. Feature access constraints are enforced symmetrically:

### Tier Specs
1.  **Cadet (Free)**: `1 Active Mission`, `25 Fuel Max Capacity` (5/day automatic solar drip), standard AI Copilot (5 query limits daily), standard Cargo Bay view.
2.  **Commander ($19/mo or $152/yr)**: `3 Active Missions`, `1,500 Fuel Reserve / mo`, access to all Foundry generator options, ZIP assets packet exports, unlimited copilot questions, and one `Streak Shield` save.
3.  **Admiral ($49/mo or $390/yr)**: `Unlimited Active Missions`, `5,000 Fuel Reserve / mo`, advanced "Powerful Claude-Opus AI" modes, custom public Launch Decks, immediate Priority Command priority support line.

### System Conversion Moments
Code blocks handling gated actions MUST trigger the appropriate paywall triggers or upsell prompts for the following scenarios:
*   **Fuel Wall**: Cadet fuel pool exhausted while attempting active tasks in the Foundry.
*   **Signal Pack Export**: Triggered immediately when Cadet attempts to save complete sequences.
*   **Mission Count Cap**: Triggered when a Commander user attempts to add a 4th slot mission.
*   **Copilot Cap**: Display remaining hours/minutes until next daily cycle resets when capped.

---

## 5. UI Layout Regulations

*   **Profile Cards Section**: The User Profile modal houses dynamic level progression along with specific "Service Ribbons" or badges:
    *   `Rocket` badge: Denotes high-tier launches.
    *   `Hammer` badge: Production levels completed.
    *   `Radio` badge: Comms sequencing initialized.
    *   `Lock` status: Represents locked parameters.
*   **Refuel Icon Sync**: Side drawers and menu interactions use the standard `Fuel` icon rather than high-frequency lightning bolts (`Zap`) to emphasize fuel density.
*   **Clean Interactive Signals**: Keeps a clean minimal structure free from unnecessary noise or redundant search filter overlays inside the Signals panel layout.
