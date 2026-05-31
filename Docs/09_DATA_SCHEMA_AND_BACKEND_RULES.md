# LaunchDeckAI Data Schema and Backend Rules

## Plan Type

```ts
export type Plan = 'cadet' | 'commander' | 'admiral';
```

## User

```ts
interface User {
  clerkId: string;
  email: string;
  displayName: string;
  plan: Plan;
  fuelBalance: number;
  currentStreak: number;
  level: number;
  createdAt: number;
  updatedAt: number;
}
```

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
  createdAt: number;
  updatedAt: number;
}
```

## Milestone Template

```ts
interface MilestoneTemplate {
  title: string;
  description: string;
  category: 'foundation' | 'assets' | 'store' | 'marketing' | 'launch' | 'post_launch';
  fuelReward: number;
  requiredPlan: Plan;
  order: number;
}
```

## Milestone

```ts
interface Milestone {
  missionId: Id<'missions'>;
  templateId: Id<'milestoneTemplates'>;
  title: string;
  description: string;
  category: string;
  completed: boolean;
  completedAt?: number;
  requiredPlan: Plan;
  isLocked: boolean;
  status?: 'cleared' | 'in_prep' | 'scheduled';
}
```

## Blueprint

```ts
interface Blueprint {
  missionId: Id<'missions'>;
  section: 'app_info' | 'app_store' | 'legal_compliance' | 'marketing' | 'beta_testing' | 'pre_launch' | 'launch_day' | 'post_launch';
  fields: Record<string, string>;
  completionStatus: number;
  updatedAt: number;
}
```

## Asset

```ts
interface Asset {
  missionId: Id<'missions'>;
  userId: Id<'users'>;
  type: 'app_store_copy' | 'social_blast' | 'email_sequence' | 'video_script' | 'press_kit' | 'product_hunt_copy' | 'image' | 'legal' | 'signal_asset';
  title: string;
  content?: string;
  status: 'not_loaded' | 'in_prep' | 'needs_clearance' | 'flight_ready' | 'exported';
  category: 'app_store' | 'social' | 'media' | 'pr' | 'legal' | 'files';
  tone?: string;
  signalId?: string;
  signalLabel?: string;
  signalPhase?: 'pre_launch' | 'launch_day' | 'post_launch';
  createdAt: number;
  updatedAt: number;
}
```

## Signal Template

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
  createdAt: number;
}
```

## Copilot Message

```ts
interface CopilotMessage {
  userId: Id<'users'>;
  missionId: Id<'missions'>;
  role: 'user' | 'assistant' | 'system';
  content: string;
  mode: 'standard' | 'powerful';
  fuelCost: number;
  createdAt: number;
}
```

## Subscription

```ts
interface Subscription {
  userId: Id<'users'>;
  plan: Plan;
  status: 'active' | 'trialing' | 'expired' | 'cancelled' | 'grace_period';
  revenueCatCustomerId?: string;
  productId?: string;
  updatedAt: number;
}
```

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
