# AGENTS.md

> Operating manual for AI coding agents (Claude Code, and any other LLM-based
> contributor) working in the **LaunchDeck AI** repository. Humans should read
> it too — it is the single source of truth for "how we work here."

LaunchDeck AI is a platform that helps founders and makers **launch their apps**
with the help of an AI copilot named **Astro**. Astro guides users through the
launch journey — domains, landing pages, marketing assets, payments, and
go-to-market checklists — orchestrating integrations like GoDaddy, Canva, Figma,
and Stripe.

This file is intentionally short and operational. For depth, follow the links to
the companion documents.

---

## 0. Start here

| If you need…                         | Read…              |
| ------------------------------------ | ------------------ |
| The big picture / system design      | `ARCHITECT.md`     |
| Coding style & conventions           | `GUIDELINES.md`    |
| What libraries we use and why        | `DEPENDENCIES.md`  |
| How to write & run tests             | `TESTING.md`       |
| HTTP / API contract                  | `API_SPEC.md`      |
| Database schema & entities           | `DATA_MODEL.md`    |
| Security rules & threat model        | `SECURITY.md`      |
| Design system & UX rules             | `UX_GUIDELINES.md` |
| The phased delivery plan             | `build-plan.md`    |

---

## 1. Prime directives

1. **Leave the codebase healthier than you found it.** Small, reviewable diffs.
2. **Follow existing patterns.** Match the surrounding code's style, naming, and
   structure before introducing anything new. When unsure, grep for prior art.
3. **Tests are not optional.** Any behavior change ships with tests. See
   `TESTING.md`.
4. **Never break the build.** Run lint, typecheck, and tests before declaring a
   task done.
5. **Security is everyone's job.** Read `SECURITY.md`. Never log secrets, never
   commit credentials, never weaken auth without explicit sign-off.
6. **Ask when the requirements are ambiguous** and the answer changes the
   design. Otherwise pick the conventional default, state it, and proceed.

---

## 2. The golden workflow

```
1. Understand   → read the relevant doc(s) + nearby code before editing.
2. Plan         → for non-trivial work, outline the change first.
3. Implement    → smallest coherent change that satisfies the requirement.
4. Verify       → pnpm lint && pnpm typecheck && pnpm test (+ e2e if UI).
5. Commit       → conventional commit, focused scope (see §4).
6. PR           → open a draft PR; fill the template; link the issue.
```

Do **not** mark a task complete until step 4 passes locally. If tests fail,
report the failure and the output — never claim green when it is red.

---

## 3. Repository map (target layout)

```
launchdeckai/
├─ apps/
│  └─ web/                # Next.js 15 (App Router) — UI + route handlers (BFF)
├─ packages/
│  ├─ db/                 # Prisma schema, client, migrations, seed
│  ├─ core/               # Domain logic, services, use-cases (framework-free)
│  ├─ astro/              # Astro AI copilot: prompts, tools, orchestration
│  ├─ integrations/       # GoDaddy, Canva, Figma, Stripe, Sentry adapters
│  └─ ui/                 # Shared React component library (design system)
├─ docs/                  # ADRs and deep-dive docs
├─ AGENTS.md … build-plan.md   # the foundational docs (this set)
└─ turbo.json             # Turborepo pipeline
```

> Until the scaffold exists, treat this as the agreed destination and create
> files in their correct home. Do not invent a parallel structure.

---

## 4. Commits & pull requests

- **Conventional Commits**: `feat:`, `fix:`, `chore:`, `docs:`, `refactor:`,
  `test:`, `perf:`, `build:`, `ci:`. Scope optional: `feat(astro): …`.
- One logical change per commit. Keep messages imperative and specific.
- **PRs are drafts by default**, small, and reference an issue. Fill the PR
  template: what, why, how tested, screenshots for UI.
- Never push directly to `main`. Feature branches only.
- Do not include model identifiers, internal tooling names, or secrets in
  commits, PR bodies, or code comments.

---

## 5. Guardrails for AI agents specifically

- **Do not fabricate APIs.** If you reference a function, type, env var, or
  table, it must exist or be created in the same change. Grep first.
- **Do not delete or overwrite files you did not inspect.** If reality
  contradicts the task description, surface it instead of forcing the change.
- **Respect the data model.** Schema changes go through a Prisma migration and a
  matching update to `DATA_MODEL.md`. No silent drift.
- **Respect the API contract.** Endpoint changes update `API_SPEC.md` in the
  same PR.
- **Secrets** come from environment variables only (see `.env.example`). Never
  hardcode, never echo to logs, never commit `.env`.
- **External calls** (GoDaddy, Stripe, Canva, Figma, Anthropic) always go
  through the `packages/integrations` adapters — never call vendor SDKs directly
  from UI or route handlers.
- **Astro (the AI copilot)** is powered by Claude. All model calls go through
  `packages/astro`. Tool execution must be allow-listed and validated — treat
  model output as untrusted input.

---

## 6. Definition of Done

A change is done when **all** of the following hold:

- [ ] Meets the stated requirement; no scope creep.
- [ ] `pnpm lint`, `pnpm typecheck`, `pnpm test` pass; e2e green for UI changes.
- [ ] New/changed behavior is covered by tests.
- [ ] Relevant docs updated (`API_SPEC.md`, `DATA_MODEL.md`, etc.).
- [ ] No secrets, no `console.log` debris, no commented-out dead code.
- [ ] Accessible and responsive if it touches the UI (`UX_GUIDELINES.md`).
- [ ] Draft PR opened with a filled-in description.

---

## 7. When in doubt

Prefer the boring, well-trodden solution. Optimize for the next engineer (or
agent) reading the code six months from now. If a decision is architecturally
significant, write a short ADR in `docs/adr/` and link it from your PR.
