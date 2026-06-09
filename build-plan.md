# build-plan.md — Phased Build Plan

> The roadmap from empty repo to a launchable product. Each phase is a coherent,
> shippable increment with an explicit goal and exit criteria. Don't start a
> phase until the previous one's exit criteria are met. Phases reference the
> companion docs for the "how."

**Status legend:** `[ ]` not started · `[~]` in progress · `[x]` done

---

## Guiding sequencing rules

1. **Walking skeleton before features.** Get one thin slice running end-to-end
   (auth → project → DB → deploy) before building breadth.
2. **Astro early, but bounded.** The copilot is the differentiator; introduce it
   as soon as there's a project to reason about — but always behind the
   confirmation gate for real actions.
3. **Integrate behind adapters.** Stub vendors first; wire real APIs once the
   internal interface is stable.
4. **Security and tests are in every phase**, not a phase of their own.

---

## Phase 0 — Foundations & scaffold `[ ]`

**Goal:** a running, deployable, well-governed monorepo.

- [ ] Turborepo + pnpm workspace; `apps/web` (Next.js 15, TS strict), `packages/*`
      skeleton per `ARCHITECT.md`.
- [ ] Tooling: ESLint, Prettier, Vitest, Playwright, Husky + lint-staged.
- [ ] Tailwind + shadcn/ui base; design tokens; light/dark theme.
- [ ] Postgres + Prisma; initial migration with `User`/`Organization`/
      `Membership`; seed script. docker-compose for local Postgres/Redis.
- [ ] `.env.example` + Zod-validated env loader (fail fast).
- [ ] CI: lint + typecheck + test + build on every PR; preview deploys.
- [ ] Sentry wired (web + server).

**Exit:** `pnpm check` green in CI; app deploys to a preview URL; "hello, org"
renders from the DB.

---

## Phase 1 — Auth & tenancy `[ ]`

**Goal:** users can sign in and operate within an organization, securely.

- [ ] Auth.js (OAuth + email) with Prisma adapter; session handling.
- [ ] Organization creation + membership + roles (`OWNER/ADMIN/MEMBER/VIEWER`).
- [ ] Org-scoping enforced in the repository layer; authorization policy
      functions in `core` with unit tests.
- [ ] App shell: nav, org switcher, settings, account.
- [ ] Security headers, CSRF, rate limiting baseline (`SECURITY.md`).

**Exit:** a user can sign up, land in their org, invite a teammate; cross-tenant
access is provably blocked (tested).

---

## Phase 2 — Projects & Launch Plan (no AI yet) `[ ]`

**Goal:** the core domain objects and the hero surface, manually driven.

- [ ] `Project` CRUD; stages; project dashboard.
- [ ] `LaunchPlan` + `LaunchTask` model and UI: checklist grouped by category,
      progress indicator, dependencies, manual task editing.
- [ ] A built-in default plan template (deterministic) so the flow works before
      Astro generates plans.
- [ ] Empty/loading/error/success states per `UX_GUIDELINES.md`; a11y pass.

**Exit:** a user can create a project and work a launch checklist end-to-end,
fully manually.

---

## Phase 3 — Astro copilot (core) `[ ]`

**Goal:** the AI copilot generates plans and chats, safely.

- [ ] `packages/astro`: Claude integration, agent loop, prompt + context
      assembly, conversation persistence (`AstroConversation`/`AstroMessage`).
- [ ] Streaming chat UI (SSE), working/typing indicators, stop.
- [ ] First tools (read-only / low-risk): `generateLaunchPlan`,
      `suggestTasks`, `draftCopy` — Zod schemas, authz checks.
- [ ] **Confirmation gate** plumbing: `PROPOSED → CONFIRMED → EXECUTED` lifecycle
      + UI summary cards (even before billable tools exist).
- [ ] Astro security controls (`SECURITY.md` §6): untrusted-output handling,
      tool allow-list, prompt-injection defenses.
- [ ] Astro evals: golden-set in CI (`TESTING.md` §4).

**Exit:** Astro generates a tailored launch plan and converses about a project;
no tool can act irreversibly; evals pass.

---

## Phase 4 — Integrations: domains & assets `[ ]`

**Goal:** Astro can take real (confirmed) actions on launches.

- [ ] `packages/integrations` adapter pattern; encrypted credential storage;
      `Integration` connect/disconnect UI.
- [ ] **GoDaddy**: domain availability + suggestions (instant search), and
      registration **behind the confirmation gate** with idempotency.
- [ ] **Canva / Figma**: asset generation (logo, social card, landing assets) as
      async jobs; `Asset` lifecycle + UI.
- [ ] Background worker (queue) for long-running generation/registration.
- [ ] Astro tools for the above, each confirmation-gated where billable.

**Exit:** from a project, a user can (via Astro, with confirmation) check + secure
a domain and generate launch assets; all vendor calls go through adapters.

---

## Phase 5 — Billing & entitlements `[ ]`

**Goal:** monetize; gate features by plan.

- [ ] Stripe: `Plan`/`Subscription` models, Checkout, billing portal,
      signature-verified webhooks → entitlements.
- [ ] Quotas (projects, Astro messages, generations) enforced per plan; `402`/
      `429` handling and upgrade prompts.
- [ ] Billing UI; plan comparison; usage display.

**Exit:** a user can subscribe (test mode), entitlements/quotas are enforced,
webhooks drive plan state; no client-trusted entitlements.

---

## Phase 6 — Polish, hardening & launch-readiness `[ ]`

**Goal:** make it production-grade.

- [ ] Full accessibility audit (WCAG 2.2 AA) + fixes; performance pass (Core Web
      Vitals targets).
- [ ] API keys + public API surface (`API_SPEC.md`); OpenAPI doc generation.
- [ ] Observability: dashboards, alerts, audit-log coverage review.
- [ ] Security review / pen-test pass against `SECURITY.md` checklist; secret
      rotation runbook; incident-response runbook.
- [ ] Data export/deletion (privacy posture); backup/restore tested.
- [ ] Onboarding refinement; "launch celebration" moment; empty-state polish.

**Exit:** passes security + a11y + performance bars; runbooks exist; ready for
real users.

---

## Phase 7 (post-launch) — Iterate `[ ]`

Candidate directions, prioritized by usage data:

- Deeper marketing tooling (email campaigns, social scheduling, press kits).
- More Astro tools (analytics setup, legal/policy generation, waitlists).
- Team collaboration (comments, task assignment, notifications).
- Templates/playbooks for common launch types.
- Possible service extraction if scale demands (per `ARCHITECT.md` §2).

---

## Cross-cutting checklist (applies to every phase)

- [ ] Tests written with the code; `pnpm check` green (`TESTING.md`).
- [ ] Docs updated in the same PR (`API_SPEC.md`, `DATA_MODEL.md`, ADRs).
- [ ] Security non-negotiables satisfied (`SECURITY.md` §13).
- [ ] UX states + a11y handled (`UX_GUIDELINES.md`).
- [ ] No secrets, no scope creep, small reviewable PRs.

---

## Definition of "launch-ready" (v1)

A founder can: sign up → create a project → have Astro generate and help execute a
real launch plan → secure a domain and generate assets (with confirmation) →
subscribe to a paid plan — all behind solid auth, tenancy isolation, and the
AI confirmation gate, with tests, monitoring, and accessibility in place.
