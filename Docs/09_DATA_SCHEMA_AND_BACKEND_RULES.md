# LaunchDeckAI Data Schema and Backend Rules

> **Source of truth:** `convex/schema.ts`. The interfaces below mirror it for
> reading convenience — when the two disagree, the schema wins, and this doc
> should be updated in the same change. Always read
> `convex/_generated/ai/guidelines.md` before writing Convex code (it documents
> the correct API, e.g. `ctx.db.get("table", id)` / `ctx.db.patch("table", id, {...})`).
>
> **Convex system fields:** every table automatically has `_id: Id<'table'>` and
> `_creationTime: number`. The interfaces below omit them and do **not** define
> manual `createdAt`/`updatedAt` fields — use `_creationTime` for creation time
> and store an explicit `updatedAt` only where a table actually needs it.

## Plan Type

```ts
export type Plan = 'cadet' | 'commander' | 'admiral';
```

## User

```ts
interface User {
  clerkId: string; // Clerk identity.subject — the only trusted user key
  email: string;
  displayName: string;
  plan: Plan;
  fuelBalance: number;
  currentStreak: number;
  level: number;
}
```

Indexed `by_clerkId`.

## Mission

```ts
interface Mission {
  userId: Id<'users'>;
  appName: string;
  appDescription: string;
  oneLiner: string;
  targetAudience: string;
  platform: 'ios' | 'android' | 'both';
  launchDate?: number;
  stage: 'building' | 'testing' | 'store_prep' | 'ready_to_submit';
  status: 'active' | 'launched' | 'archived';
  readinessScore: number;
}
```

Indexed `by_userId` and `by_userId_status`.

## Milestone Template

Milestone templates are **code constants, not a database table** — they live in
`convex/templates.ts` as `MILESTONE_TEMPLATES` (the server-owned source of truth
for fuel costs and plan gates), mirrored to the client in
`src/constants/milestoneTemplates.ts`. A `Milestone.templateId` is the template's
string `id` (e.g. `"ms_name"`).

```ts
interface MilestoneTemplate {
  id: string; // e.g. "ms_name" — referenced by Milestone.templateId
  title: string;
  description: string;
  category: string; // 'foundation' | 'store' | 'assets' | 'marketing' | 'launch' | 'post_launch'
  fuelReward: number;
  requiredPlan: Plan;
}
```

## Milestone

```ts
interface Milestone {
  missionId: Id<'missions'>;
  templateId: string; // the MilestoneTemplate id, e.g. "ms_name"
  title: string;
  description: string;
  category: string;
  completed: boolean;
  completedAt?: number;
  fuelReward: number;
  requiredPlan: Plan;
  isLocked: boolean;
}
```

Indexed `by_missionId`.

## Blueprint

```ts
interface Blueprint {
  missionId: Id<'missions'>;
  section: 'app_info' | 'app_store' | 'legal_compliance' | 'marketing' | 'beta_testing' | 'pre_launch' | 'launch_day' | 'post_launch';
  fields: Record<string, string>;
  completionStatus: number;
}
```

Indexed `by_missionId`. `section` is stored as a string; valid values are the
`BLUEPRINT_SECTIONS` in `convex/templates.ts`.

## Asset

`type` and `category` are stored as `v.string()` (validated app-side against the
values below); `status` and `signalPhase` are enforced unions in the schema.

```ts
interface Asset {
  missionId: Id<'missions'>;
  userId: Id<'users'>;
  type: string; // app_store_copy | social_blast | email_sequence | video_script | press_kit | product_hunt_copy | image | legal | signal_asset
  title: string;
  content?: string;
  status: 'not_loaded' | 'in_prep' | 'needs_clearance' | 'flight_ready' | 'exported';
  category: string; // app_store | social | media | pr | legal | files
  tone?: string;
  signalId?: string;
  signalLabel?: string;
  signalPhase?: 'pre_launch' | 'launch_day' | 'post_launch';
}
```

Indexed `by_missionId` and `by_userId`.

## Signal Template

Like milestone templates, the 16 signals are **code constants, not a table** —
`SIGNAL_TEMPLATES` in `src/constants/signalTemplates.ts`. An asset links to one
via `Asset.signalId`.

```ts
interface SignalTemplate {
  id: string;
  phase: 'pre_launch' | 'launch_day' | 'post_launch';
  label: string;
  platform: string;
  assetType: string;
  relativeTiming: string;
  order: number;
}
```

## Fuel History

```ts
interface FuelHistory {
  userId: Id<'users'>;
  missionId?: Id<'missions'>;
  amount: number;
  reason: 'milestone_completed' | 'foundry_generation' | 'copilot_message' | 'monthly_plan_grant' | 'daily_drip' | 'admin_adjustment';
}
```

Indexed `by_userId`. Use `_creationTime` for ordering.

## Copilot Message

```ts
interface CopilotMessage {
  userId: Id<'users'>;
  missionId: Id<'missions'>;
  role: 'user' | 'assistant' | 'system';
  content: string;
  mode: 'standard' | 'powerful';
  fuelCost: number;
}
```

Indexed `by_missionId`.

## Subscription

```ts
interface Subscription {
  userId: Id<'users'>;
  plan: Plan;
  status: 'active' | 'trialing' | 'expired' | 'cancelled' | 'grace_period';
  revenueCatCustomerId?: string;
  productId?: string;
}
```

Indexed `by_userId`. Written by the RevenueCat webhook via the
`subscriptions.applyEntitlement` internal mutation (never by the client).

## Broadcast

A scheduled Signal Deck broadcast reminder.

```ts
interface Broadcast {
  missionId: Id<'missions'>;
  userId: Id<'users'>;
  signalId: string; // the SignalTemplate id
  destinationUrl: string;
  scheduledAt: number; // epoch ms; must be in the future
}
```

Indexed `by_missionId`, `by_missionId_and_signalId`, and `by_userId_and_signalId`.

## Backend Rules

### Identity

- Always derive user identity from Clerk.
- Never trust a client-provided userId.
- All user-specific queries must verify ownership.

### Readiness Score

- Calculate Mission Readiness on the backend.
- Do not manually change readiness from the UI.
- Recalculate after milestone completion, Blueprint save, asset status change, and Signal Deck readiness change.

### Fuel

- Every Fuel change must write a fuelHistory record.
- Fuel cannot go below zero.
- Fuel should only be deducted after successful AI output.
- Fuel awards should not be hardcoded in UI components.

### Plan Gates

- Validate plan on the backend.
- Locked UI is helpful, but backend checks are required.
- Downgrades lock access without deleting data.

### Signal Deck

- Signal status is computed from Cargo Bay linked assets.
- Users do not manually mark signals complete.
- Transmit export requires Commander or Admiral.

### AI

- All AI calls must go through Convex Actions.
- AI provider keys live only in Convex environment variables.
- Foundry, Copilot, and Signal Deck should share a consistent AI generation pipeline.
