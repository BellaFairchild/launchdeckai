# DATA_MODEL.md — Data Model

> The canonical description of LaunchDeck AI's persistent data. The Prisma schema
> in `packages/db/prisma/schema.prisma` is the source of truth; this document
> mirrors and explains it. **Any schema change updates both, in the same PR.**

---

## 1. Conventions

- **Database**: PostgreSQL. **ORM**: Prisma.
- **Primary keys**: `id` — CUID/UUID string, never an exposed sequential int.
- **Timestamps**: every table has `createdAt` and `updatedAt` (UTC).
- **Soft delete**: user-visible entities use `deletedAt` (nullable) rather than
  hard deletes, so launches can be restored and audited.
- **Multi-tenancy**: every tenant-scoped row carries `organizationId`. **All
  queries filter by org**; this is enforced in the repository layer, not left to
  callers. See `SECURITY.md`.
- **Money**: stored as integer minor units (cents) + ISO currency code. Never
  floats.
- **Enums**: Postgres enums via Prisma; listed per field below.
- **Secrets/tokens** for integrations are encrypted at rest (app-level
  envelope encryption), never stored plaintext.

---

## 2. Entity overview

```
User ─┬─< Membership >─┬─ Organization ─┬─< Project ─┬─< LaunchPlan ─< LaunchTask
      │                │                │            ├─< Domain
      │                │                │            ├─< Asset
      │                │                │            ├─< AstroConversation ─< AstroMessage
      │                │                │            └─< Event (audit)
      │                │                ├─< Integration (Stripe/GoDaddy/Canva/…)
      │                │                ├─< Subscription ─ Plan
      │                │                └─< ApiKey
      └─< Session / Account (Auth.js)
```

Cardinalities: a User belongs to many Organizations via Membership; an
Organization owns many Projects; a Project has exactly one active LaunchPlan
(history retained), many Domains/Assets/Conversations.

---

## 3. Entities

### User
The human account. Authentication identity.

| Field          | Type      | Notes                                  |
| -------------- | --------- | -------------------------------------- |
| id             | string PK |                                        |
| email          | string    | unique, lowercased                     |
| name           | string?   |                                        |
| avatarUrl      | string?   |                                        |
| emailVerified  | datetime? | Auth.js                                |
| createdAt      | datetime  |                                        |
| updatedAt      | datetime  |                                        |

Related: `Account`, `Session` (Auth.js standard), `Membership`.

### Organization
The tenant boundary. A workspace/team. A solo user still has one org.

| Field        | Type      | Notes                              |
| ------------ | --------- | ---------------------------------- |
| id           | string PK |                                    |
| name         | string    |                                    |
| slug         | string    | unique, URL-safe                   |
| ownerUserId  | string FK | → User                             |
| planId       | string FK?| → Plan (current entitlement)       |
| createdAt    | datetime  |                                    |
| updatedAt    | datetime  |                                    |
| deletedAt    | datetime? |                                    |

### Membership
User ↔ Organization with a role.

| Field          | Type     | Notes                                       |
| -------------- | -------- | ------------------------------------------- |
| id             | string PK|                                             |
| userId         | string FK| → User                                      |
| organizationId | string FK| → Organization                              |
| role           | enum     | `OWNER` `ADMIN` `MEMBER` `VIEWER`           |
| invitedEmail   | string?  | for pending invites                         |
| status         | enum     | `ACTIVE` `INVITED` `SUSPENDED`              |

Unique on (`userId`, `organizationId`).

### Project
An app the user is launching. The central object.

| Field          | Type      | Notes                                          |
| -------------- | --------- | ---------------------------------------------- |
| id             | string PK |                                                |
| organizationId | string FK | tenant scope                                   |
| name           | string    | the app being launched                         |
| slug           | string    | unique within org                              |
| description    | string?   | what the app does (feeds Astro context)        |
| stage          | enum      | `IDEA` `BUILDING` `PRE_LAUNCH` `LAUNCHED`       |
| targetLaunchAt | datetime? | desired launch date                            |
| createdByUserId| string FK | → User                                         |
| createdAt/updatedAt/deletedAt | …  |                                        |

### LaunchPlan
The AI-generated, user-editable roadmap for a Project.

| Field      | Type      | Notes                                          |
| ---------- | --------- | ---------------------------------------------- |
| id         | string PK |                                                |
| projectId  | string FK | → Project                                      |
| version    | int       | incremented on regeneration; history kept      |
| status     | enum      | `DRAFT` `ACTIVE` `ARCHIVED`                     |
| generatedBy| enum      | `ASTRO` `USER`                                  |
| summary    | string?   | Astro's narrative of the plan                  |
| createdAt/updatedAt | …    |                                                |

One `ACTIVE` plan per project at a time.

### LaunchTask
A milestone/task within a LaunchPlan. May map to an automatable action.

| Field        | Type      | Notes                                                   |
| ------------ | --------- | ------------------------------------------------------- |
| id           | string PK |                                                         |
| launchPlanId | string FK | → LaunchPlan                                            |
| title        | string    |                                                         |
| description  | string?   |                                                         |
| category     | enum      | `DOMAIN` `BRANDING` `LANDING_PAGE` `PAYMENTS` `MARKETING` `LEGAL` `ANALYTICS` `OTHER` |
| status       | enum      | `TODO` `IN_PROGRESS` `BLOCKED` `DONE` `SKIPPED`         |
| dependsOnIds | string[]  | task dependencies (DAG)                                 |
| automatable  | boolean   | can Astro execute it via a tool?                        |
| dueAt        | datetime? |                                                         |
| orderIndex   | int       | display ordering                                        |
| createdAt/updatedAt | …    |                                                         |

### Domain
A domain associated with a project (checked or registered via GoDaddy).

| Field        | Type      | Notes                                            |
| ------------ | --------- | ------------------------------------------------ |
| id           | string PK |                                                  |
| projectId    | string FK | → Project                                        |
| name         | string    | e.g. `myapp.com`                                 |
| status       | enum      | `AVAILABLE` `CHECKING` `REGISTERED` `CONNECTED` `FAILED` |
| provider     | enum      | `GODADDY` `EXTERNAL`                             |
| registeredAt | datetime? |                                                  |
| expiresAt    | datetime? |                                                  |
| dnsConfigured| boolean   | default false                                    |

### Asset
A generated/uploaded launch asset (logo, social card, landing copy, Figma/Canva).

| Field      | Type      | Notes                                                     |
| ---------- | --------- | --------------------------------------------------------- |
| id         | string PK |                                                           |
| projectId  | string FK | → Project                                                 |
| kind       | enum      | `LOGO` `SOCIAL_CARD` `LANDING_COPY` `EMAIL` `PRESS_KIT` `OTHER` |
| source     | enum      | `CANVA` `FIGMA` `ASTRO` `UPLOAD`                          |
| title      | string    |                                                           |
| url        | string?   | storage / vendor URL                                      |
| metadata   | json      | vendor ids, dimensions, prompt used, etc.                |
| status     | enum      | `GENERATING` `READY` `FAILED`                            |
| createdAt/updatedAt | …    |                                                           |

### AstroConversation / AstroMessage
The copilot chat, scoped per project.

**AstroConversation**

| Field      | Type      | Notes                |
| ---------- | --------- | -------------------- |
| id         | string PK |                      |
| projectId  | string FK | → Project            |
| title      | string?   | auto-summarized      |
| createdAt/updatedAt | …    |              |

**AstroMessage**

| Field          | Type      | Notes                                                |
| -------------- | --------- | ---------------------------------------------------- |
| id             | string PK |                                                      |
| conversationId | string FK | → AstroConversation                                  |
| role           | enum      | `USER` `ASSISTANT` `TOOL` `SYSTEM`                   |
| content        | json      | text + structured parts                              |
| toolName       | string?   | when role=TOOL                                       |
| toolCallId     | string?   | correlates a call/result                             |
| toolStatus     | enum?     | `PROPOSED` `CONFIRMED` `EXECUTED` `REJECTED` `FAILED`|
| createdAt      | datetime  |                                                      |

> The `toolStatus` lifecycle encodes the **confirmation gate**: irreversible/
> billable tool calls sit in `PROPOSED` until the user confirms. See `SECURITY.md`.

### Integration
A connected third-party account for an org.

| Field           | Type      | Notes                                                   |
| --------------- | --------- | ------------------------------------------------------- |
| id              | string PK |                                                         |
| organizationId  | string FK | → Organization                                          |
| provider        | enum      | `STRIPE` `GODADDY` `CANVA` `FIGMA` `SENTRY`             |
| status          | enum      | `CONNECTED` `DISCONNECTED` `ERROR`                      |
| credentials     | encrypted | tokens/keys — envelope-encrypted, never plaintext       |
| externalAccountId | string? | vendor-side id                                          |
| connectedAt     | datetime? |                                                         |

Unique on (`organizationId`, `provider`).

### Plan & Subscription (billing)
**Plan** — product tiers (Free, Pro, Team) and entitlements.

| Field        | Type     | Notes                                |
| ------------ | -------- | ------------------------------------ |
| id           | string PK|                                      |
| key          | string   | `free` `pro` `team` (unique)         |
| name         | string   |                                      |
| priceCents   | int      | monthly, minor units                 |
| currency     | string   | ISO 4217                             |
| limitsJson   | json     | quotas (projects, astro msgs, etc.)  |

**Subscription** — an org's Stripe subscription.

| Field                | Type      | Notes                                          |
| -------------------- | --------- | ---------------------------------------------- |
| id                   | string PK |                                                |
| organizationId       | string FK | → Organization                                 |
| planId               | string FK | → Plan                                          |
| stripeCustomerId     | string    |                                                |
| stripeSubscriptionId | string?   |                                                |
| status               | enum      | `TRIALING` `ACTIVE` `PAST_DUE` `CANCELED`       |
| currentPeriodEnd     | datetime? |                                                |

### ApiKey
Programmatic access for an org (hashed; prefix shown for identification).

| Field          | Type      | Notes                              |
| -------------- | --------- | ---------------------------------- |
| id             | string PK |                                    |
| organizationId | string FK | → Organization                     |
| name           | string    |                                    |
| hashedKey      | string    | argon2/bcrypt hash — never raw     |
| prefix         | string    | first chars, for UI display        |
| lastUsedAt     | datetime? |                                    |
| revokedAt      | datetime? |                                    |

### Event (audit log)
Append-only record of significant actions for audit, analytics, and Astro
context.

| Field          | Type      | Notes                                                  |
| -------------- | --------- | ------------------------------------------------------ |
| id             | string PK |                                                        |
| organizationId | string FK | tenant scope                                           |
| projectId      | string FK?| optional                                               |
| actorType      | enum      | `USER` `ASTRO` `SYSTEM` `WEBHOOK`                      |
| actorId        | string?   | user id / null                                         |
| type           | string    | e.g. `domain.registered`, `launchplan.generated`      |
| payload        | json      | non-sensitive details                                  |
| createdAt      | datetime  | (no updates — append only)                            |

---

## 4. Integrity & indexing rules

- Foreign keys enforced at the DB level with sensible `onDelete` (cascade for
  child rows like `LaunchTask`; restrict for billing).
- Indexes on every `organizationId` and FK, plus the common query paths
  (`Project.slug`, `Domain.name`, `AstroMessage.conversationId, createdAt`).
- Unique constraints as noted (org slug, membership pair, integration pair).
- Use transactions for any multi-row invariant (e.g. swapping the `ACTIVE`
  LaunchPlan, creating subscription + updating org plan).

---

## 5. Migrations

- All schema changes go through `prisma migrate` — no manual SQL drift.
- Migrations are reviewed, run in CI before deploy, and are
  backward-compatible (expand/contract pattern) so deploys are zero-downtime.
- Destructive migrations (drop column/table) ship in a later release after the
  code no longer reads the field.
- Seed data for local/dev lives in `packages/db/seed.ts`.
