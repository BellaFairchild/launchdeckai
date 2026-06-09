# ARCHITECT.md — LaunchDeck AI System Architecture

> The "why it is shaped this way" document. Read this before making structural
> changes. Specific contracts live in `API_SPEC.md` and `DATA_MODEL.md`.

---

## 1. Product in one paragraph

LaunchDeck AI helps founders take an app **from idea to launch**. A user creates
a **Project** for the app they are launching; **Astro**, the AI copilot, builds a
tailored **Launch Plan** (a checklist of milestones), then helps execute each
step: securing a **domain** (GoDaddy), generating **landing pages** and
**marketing assets** (Canva / Figma), wiring up **payments** (Stripe), and
tracking go-to-market tasks. The product's value is the orchestration: Astro
turns a vague "I want to launch" into a concrete, executable, partly-automated
plan.

---

## 2. Architectural principles

1. **Modular monolith first.** One deployable Next.js app backed by clearly
   separated packages. Extract services only when scale or team boundaries
   demand it — not preemptively.
2. **Domain logic is framework-free.** Business rules live in `packages/core`,
   independent of Next.js, the DB driver, or HTTP. This keeps logic testable and
   portable.
3. **Integrations behind adapters.** Every third party (GoDaddy, Stripe, Canva,
   Figma, Anthropic, Sentry) is wrapped in an adapter with a stable internal
   interface. Vendors change; our core does not.
4. **The AI copilot is a bounded subsystem.** Astro is a discrete package with
   its own prompts, tools, guardrails, and evals. The rest of the app treats it
   as a service with a typed contract.
5. **Everything important is an event.** Launch milestones, integration actions,
   and Astro tool calls emit domain events for audit, analytics, and async work.
6. **Secure and multi-tenant by default.** Every row is scoped to an
   organization; every query is authorization-checked. See `SECURITY.md`.

---

## 3. High-level system diagram

```
                         ┌─────────────────────────────────────────┐
                         │                Browser (SPA)             │
                         │   Next.js App Router · React · Tailwind  │
                         └───────────────┬─────────────────────────┘
                                         │  HTTPS (RSC + JSON)
                         ┌───────────────▼─────────────────────────┐
                         │            apps/web  (Next.js)           │
                         │  ┌─────────────┐   ┌──────────────────┐  │
                         │  │ Route       │   │ Server Components │  │
                         │  │ Handlers    │   │ / Server Actions  │  │
                         │  │ (BFF / API) │   └──────────────────┘  │
                         │  └──────┬──────┘                          │
                         └─────────┼─────────────────────────────────┘
                                   │ calls
                         ┌─────────▼──────────┐     ┌───────────────────┐
                         │   packages/core    │────▶│   packages/db      │
                         │  services/use-cases│     │   Prisma · Postgres│
                         └───┬───────────┬────┘     └───────────────────┘
                             │           │
                ┌────────────▼──┐   ┌────▼────────────────┐
                │ packages/astro│   │ packages/integrations│
                │  Claude copilot│   │ GoDaddy · Stripe ·  │
                │  prompts/tools │   │ Canva · Figma·Sentry│
                └───────┬───────┘   └─────────┬───────────┘
                        │                     │
                ┌───────▼──────┐      ┌────────▼─────────┐
                │ Anthropic API│      │  Vendor APIs     │
                │  (Claude)    │      │                  │
                └──────────────┘      └──────────────────┘

  Async:  Queue (jobs) ──▶ Worker ──▶ long-running integration & AI tasks
  Cross-cutting:  Auth · Rate limiting · Audit log · Sentry · Analytics
```

---

## 4. Recommended technology stack

> Greenfield recommendation. Chosen for velocity, type-safety end-to-end, a
> single language across the stack, and a strong hosting story. Rationale and
> alternatives are captured in `DEPENDENCIES.md`.

| Layer            | Choice                                        | Why                                              |
| ---------------- | --------------------------------------------- | ------------------------------------------------ |
| Language         | TypeScript (strict)                           | One language, end-to-end types                   |
| Frontend / app   | Next.js 15 (App Router), React 19             | RSC, server actions, great DX, Vercel-native     |
| Styling          | Tailwind CSS + shadcn/ui + Radix              | Fast, accessible, consistent design system       |
| State/data       | TanStack Query (client) + RSC (server)        | Cache + server-first fetching                    |
| API style        | Route handlers (REST/JSON) + server actions   | Simple BFF; typed with Zod                        |
| Validation       | Zod                                           | Runtime + static validation, shared schemas      |
| Database         | PostgreSQL                                    | Relational, transactional, mature                |
| ORM              | Prisma                                        | Type-safe queries + migrations                   |
| Auth             | Auth.js (NextAuth) + Postgres adapter         | Sessions, OAuth, email; self-hosted              |
| AI copilot       | Anthropic Claude (latest Opus/Sonnet)         | Strongest reasoning + tool use for Astro         |
| Background jobs  | Queue + worker (e.g. BullMQ/Redis or Inngest) | Long-running integration & AI tasks              |
| Payments/billing | Stripe                                        | Subscriptions + connected accounts               |
| Monitoring       | Sentry                                        | Errors + performance + tracing                   |
| Hosting          | Vercel (web) + managed Postgres + Redis       | Serverless edge/runtime, zero-ops                |
| Monorepo         | Turborepo + pnpm                              | Cached builds, workspace packages                |

---

## 5. Key subsystems

### 5.1 Astro — the AI copilot (`packages/astro`)
- **Pattern:** an agent loop over Claude with a curated, allow-listed **tool
  set** (create launch plan, register domain, generate asset, draft copy, create
  Stripe product, etc.). Each tool has a Zod-validated schema and an
  authorization check.
- **Memory:** conversation history persisted per project; relevant project
  context injected as structured system context, not raw dumps.
- **Guardrails:** model output is untrusted. Tool calls are validated, rate
  limited, and confirmed with the user for irreversible/external actions
  (domain purchase, payment changes). See `SECURITY.md` §AI.
- **Evals:** prompt + tool behavior covered by golden-set evals in `TESTING.md`.

### 5.2 Launch engine (`packages/core`)
- Generates and tracks the **Launch Plan**: a graph of milestones/tasks with
  dependencies, status, and owners. Astro proposes; the engine validates and
  persists. State transitions emit domain events.

### 5.3 Integrations (`packages/integrations`)
- One adapter per vendor implementing a narrow internal interface. Handles auth,
  retries, idempotency, error normalization, and webhook verification.
- **Webhooks** (Stripe, GoDaddy, etc.) land on dedicated route handlers, are
  signature-verified, then translated into domain events.

### 5.4 Data layer (`packages/db`)
- Prisma schema is the single source of truth (mirrored in `DATA_MODEL.md`).
- All access goes through repository/service functions in `core` — route
  handlers never touch Prisma directly.

---

## 6. Request lifecycle (example: "Astro, secure a domain")

1. User asks Astro in the project chat.
2. `apps/web` route handler authenticates the session + org scope.
3. Calls `packages/astro` agent with project context.
4. Claude decides to call the `domains.checkAvailability` tool.
5. Tool runs through `packages/integrations/godaddy` adapter.
6. For purchase, Astro **pauses for explicit user confirmation** (irreversible +
   billable). On confirm, the action runs, emits a `domain.registered` event,
   persists via `core`, and updates the Launch Plan task.
7. UI updates via revalidation / query invalidation; Sentry/analytics record it.

---

## 7. Environments & deployment

- **Local** → docker-compose Postgres + Redis; `.env.local`.
- **Preview** → per-PR Vercel deploys with ephemeral/branch DB.
- **Production** → Vercel + managed Postgres + Redis; migrations run in CI before
  promotion. Secrets in the platform secret store, never in the repo.

See `build-plan.md` for the phased rollout.

---

## 8. Non-goals (for v1)

- No native mobile apps (responsive web only).
- No self-serve plugin/marketplace for third-party Astro tools.
- No multi-region active-active; single primary region with backups.
- No on-prem deployment.

Revisit these once core launch flows are proven.

---

## 9. Architecture Decision Records

Significant decisions are recorded as ADRs in `docs/adr/NNNN-title.md`
(date, context, decision, consequences, alternatives). This file holds the
current synthesis; ADRs hold the history of how we got here.
