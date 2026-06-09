# GUIDELINES.md — Engineering Guidelines

> How we write code in LaunchDeck AI. Conventions exist to make the codebase
> predictable. Predictable code is fast to read, review, and change.

---

## 1. Language & general style

- **TypeScript, `strict: true`.** No implicit `any`. Prefer `unknown` + narrowing
  over `any`. No `// @ts-ignore` without a justifying comment and a ticket.
- **Prettier + ESLint are authoritative.** Do not hand-format; run the
  formatter. CI fails on lint errors. Fix warnings, don't suppress them.
- **Functional and immutable by default.** Prefer pure functions and `const`.
  Avoid shared mutable state; avoid classes unless they earn their keep
  (adapters, long-lived stateful services).
- **Name things for the reader.** `registerDomainForProject`, not `doDomain`.
  Booleans read as predicates: `isActive`, `hasDomain`, `canPublish`.
- **Small units.** Functions do one thing. If you need a comment to separate
  "sections" of a function, it should be two functions.
- **Comments explain _why_, not _what_.** The code says what. Comment intent,
  trade-offs, and gotchas. Delete commented-out code.

---

## 2. Project structure rules

- Domain logic → `packages/core`. It must not import Next.js, Prisma client
  directly (use repository interfaces), or any vendor SDK.
- DB access → `packages/db` + repositories surfaced through `core`.
- Vendor calls → `packages/integrations` only.
- AI/Claude calls → `packages/astro` only.
- Shared UI → `packages/ui`. App-specific UI → `apps/web`.
- **No circular dependencies between packages.** Dependencies flow:
  `web → core → {db, integrations, astro}`; `ui` is a leaf.

---

## 3. Imports & modules

- Use the workspace path aliases (`@launchdeck/core`, `@/…`). No deep relative
  `../../../` chains across package boundaries.
- One public entrypoint per package (`index.ts` barrel). Keep internals private.
- Order imports: node/builtin → external → internal packages → local. The linter
  enforces this; don't fight it.

---

## 4. Types & validation

- **Validate at the boundary.** Every external input (HTTP body, query params,
  webhook payload, env vars, model tool output) is parsed with a **Zod** schema
  before use. Inside the validated boundary, trust the types.
- Derive types from schemas (`z.infer`) instead of duplicating shapes.
- Share request/response schemas between client and server where practical.
- Avoid enums of magic strings; use `as const` objects or Zod enums.
- Model nullability honestly. No `value!` to silence the compiler — prove it.

---

## 5. Error handling

- **Fail loudly at boundaries, gracefully in the UI.** Throw typed domain errors
  in `core`; map them to HTTP problem responses in route handlers (see
  `API_SPEC.md` §Errors).
- Never swallow errors silently. No empty `catch {}`. If you catch, you log,
  re-throw, or handle — explicitly.
- Use a `Result`-style return or thrown domain errors consistently within a
  module; don't mix the two in the same layer.
- Report unexpected errors to Sentry with context (org/project ids — **never**
  PII or secrets).

---

## 6. Async, data fetching & performance

- **Server-first.** Fetch in React Server Components / server actions; only use
  client fetching (TanStack Query) for genuinely interactive/client state.
- No N+1 queries — use Prisma `include`/`select` deliberately; select only
  needed columns.
- All external network calls have timeouts, retries with backoff, and
  idempotency where the operation is non-idempotent (payments, domain purchase).
- Long-running work (AI generation, bulk integration calls) goes to the
  background worker, not the request path.

---

## 7. React & UI conventions

- Function components + hooks only. Server Components by default; add
  `"use client"` only when you need interactivity.
- Co-locate component, its tests, and styles. One component per file.
- Keep components presentational; push data/logic to server actions or hooks.
- Use the design system (`packages/ui`, shadcn/ui). Don't reinvent buttons.
- Accessibility is a requirement, not a nicety. See `UX_GUIDELINES.md`.

---

## 8. State management

- Server state → TanStack Query / RSC. Don't mirror server data into global
  client stores.
- Local UI state → `useState`/`useReducer`. Global client state (rare) → a small
  store (Zustand) with a documented reason.
- URL is state: filters, tabs, and selections belong in search params when
  shareable.

---

## 9. Naming conventions (cheat sheet)

| Thing                | Convention            | Example                      |
| -------------------- | --------------------- | ---------------------------- |
| Files (TS modules)   | kebab-case            | `launch-plan-service.ts`     |
| React components     | PascalCase file+name  | `LaunchPlanCard.tsx`         |
| Variables/functions  | camelCase             | `createLaunchPlan`           |
| Types/interfaces     | PascalCase            | `LaunchPlan`, `AstroTool`    |
| Constants            | UPPER_SNAKE_CASE      | `MAX_TASKS_PER_PLAN`         |
| DB tables (Prisma)   | PascalCase model      | `Project`, `LaunchTask`      |
| Env vars             | UPPER_SNAKE_CASE      | `ANTHROPIC_API_KEY`          |
| Branches             | `type/short-desc`     | `feat/astro-domain-tool`     |

---

## 10. Git hygiene

- Conventional Commits (`feat:`, `fix:`, …). Imperative, specific.
- Small, focused commits and PRs. Rebase to keep history clean; no merge
  commits into feature branches.
- Never commit secrets, `.env`, build artifacts, or `node_modules`.
- PRs are drafts until ready; fill the template; link the issue; attach
  screenshots for UI.

---

## 11. Definition of "good code" here

- A new engineer can read it top-to-bottom and understand intent.
- It fails safely and observably.
- It is covered by tests proportional to its risk.
- It doesn't leak vendor details or secrets across boundaries.
- It would not embarrass us in a security or accessibility audit.

When a guideline conflicts with clarity, choose clarity — and propose updating
the guideline.
