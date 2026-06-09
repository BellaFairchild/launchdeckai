# DEPENDENCIES.md — Dependencies & Tooling

> What we depend on, why we chose it, and the rules for adding more. A
> dependency is a long-term liability, not a free win. Add deliberately.

---

## 1. Policy for adding a dependency

Before adding a package, confirm:

1. **It earns its weight.** Could a small amount of our own code do it? Prefer
   the platform/standard library for trivial needs (no left-pad incidents).
2. **It is healthy.** Maintained, widely used, sane release cadence, permissive
   license (MIT/Apache-2.0/BSD). Avoid abandoned or single-maintainer-critical
   packages for core paths.
3. **It is secure.** No known critical CVEs; reasonable transitive footprint.
4. **It fits the stack.** TypeScript-first, works with our runtime (Node + edge
   where relevant).
5. **It is approved.** New runtime deps in core paths get a line in the PR
   description justifying them. Significant ones get an ADR.

Lockfile (`pnpm-lock.yaml`) is committed and authoritative. Renovate/Dependabot
keeps deps current; security patches are merged promptly.

---

## 2. Runtime stack (the load-bearing choices)

| Package / Tool        | Role                       | Why this one                                                  |
| --------------------- | -------------------------- | ------------------------------------------------------------ |
| **typescript**        | Language                   | End-to-end types; strict mode catches whole bug classes.     |
| **next**              | App framework (App Router) | RSC + server actions + great Vercel story; one app for UI+API.|
| **react** / react-dom | UI library                 | Industry standard; RSC support.                              |
| **tailwindcss**       | Styling                    | Utility-first, fast, consistent; pairs with shadcn/ui.       |
| **shadcn/ui** + radix | Component primitives       | Accessible, unstyled-then-styled, we own the code.           |
| **zod**               | Validation                 | Runtime + static validation; shared client/server schemas.   |
| **@tanstack/react-query** | Client data cache      | Robust caching/mutations for interactive client state.       |
| **prisma** / @prisma/client | ORM + migrations     | Type-safe queries, first-class migrations.                   |
| **postgresql** (db)   | Database                   | Relational, transactional, battle-tested.                    |
| **next-auth (Auth.js)** | Authentication           | Sessions/OAuth/email, self-hosted, Prisma adapter.           |
| **@anthropic-ai/sdk** | Claude API client (Astro)  | Official SDK for the AI copilot's reasoning + tool use.      |
| **stripe**            | Payments/billing           | Subscriptions + connected accounts; mature SDK + webhooks.   |
| **@sentry/nextjs**    | Monitoring                 | Errors, performance, tracing in one.                         |
| **bullmq** + ioredis  | Background jobs (or Inngest) | Reliable queues for long AI/integration tasks.             |

> Integration SDKs (GoDaddy, Canva, Figma) are wrapped in `packages/integrations`
> adapters. Where an official SDK is thin or absent, we call the REST API
> directly behind the adapter. The rest of the app never imports a vendor SDK.

---

## 3. The AI copilot (Astro) dependencies

- **Anthropic Claude** via `@anthropic-ai/sdk` is the reasoning engine. Default
  to the latest, most capable Claude models; use a faster/cheaper Claude tier for
  lightweight calls. Model IDs are configured via env, not hardcoded across the
  codebase — set them in one place (`packages/astro/config`).
- Tool schemas are defined with **Zod** and adapted to the model's tool-use
  format. Treat all model output as untrusted (see `SECURITY.md`).
- Optional: a lightweight eval runner for golden-set prompt tests (`TESTING.md`).

> When working on anything LLM-related, consult the current Claude API reference
> (models, pricing, tool use, prompt caching) rather than relying on memory.

---

## 4. Developer tooling

| Tool                       | Role                                   |
| -------------------------- | -------------------------------------- |
| **pnpm**                   | Package manager (workspaces).          |
| **turborepo**              | Monorepo task orchestration + caching. |
| **eslint** + **prettier**  | Linting + formatting (authoritative).  |
| **vitest**                 | Unit/integration test runner.          |
| **@playwright/test**       | End-to-end browser tests.              |
| **@testing-library/react** | Component testing.                     |
| **husky** + lint-staged    | Pre-commit lint/format/typecheck.      |
| **tsx**                    | Run TS scripts (seeds, tooling).       |
| **docker / docker-compose**| Local Postgres + Redis.                |

---

## 5. Version & maintenance policy

- **Node**: maintained LTS only; pinned via `.nvmrc` / `engines`.
- **Pinning**: exact versions in the lockfile; caret ranges in `package.json`
  for libraries we trust to follow semver.
- **Upgrades**: Renovate opens grouped PRs; minor/patch auto-merge on green CI;
  majors are reviewed and may get an ADR.
- **Security**: `pnpm audit` runs in CI; critical/high advisories block merge
  until resolved or explicitly risk-accepted with sign-off.
- **Removing deps** is a feature. Periodically prune unused packages.

---

## 6. Licensing

Only permissive licenses (MIT, Apache-2.0, BSD, ISC) in production
dependencies. Copyleft (GPL/AGPL) requires explicit legal sign-off and an ADR.
A license check runs in CI.

---

## 7. The `.env.example` contract

Every required environment variable is documented in `.env.example` with a
description and a safe placeholder. Categories:

- **Core**: `DATABASE_URL`, `NEXTAUTH_SECRET`, `NEXTAUTH_URL`, `REDIS_URL`
- **AI**: `ANTHROPIC_API_KEY`, `ASTRO_MODEL_*`
- **Payments**: `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`
- **Domains**: `GODADDY_API_KEY`, `GODADDY_API_SECRET`
- **Design**: `CANVA_*`, `FIGMA_*`
- **Monitoring**: `SENTRY_DSN`

Adding a dependency that needs config means updating `.env.example` in the same
PR. The app should fail fast at boot if a required var is missing (validated with
Zod).
