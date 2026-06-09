# TESTING.md — Testing Strategy

> Tests are how we ship fast without fear. Untested behavior is, by definition,
> unsupported. This document defines what to test, how, and to what bar.

---

## 1. Philosophy

- **Test behavior, not implementation.** Assert on outcomes a user or caller
  cares about, not private internals. Refactors shouldn't break good tests.
- **The testing trophy, not pyramid.** Lots of fast unit + integration tests, a
  focused layer of e2e for critical journeys, plus static analysis (types +
  lint) as the wide base.
- **Every bug fix gets a regression test.** Reproduce first, then fix.
- **Tests are first-class code.** Readable, DRY where it helps clarity, no flaky
  sleeps. A flaky test is a broken test — fix or delete it.

---

## 2. The test layers

| Layer            | Tool                     | Scope                                                | Speed   |
| ---------------- | ------------------------ | ---------------------------------------------------- | ------- |
| Static           | tsc, eslint              | Types, lint rules                                    | instant |
| Unit             | Vitest                   | Pure functions, domain logic in `core`, utils        | ms      |
| Component        | Vitest + Testing Library | React components in isolation                        | ms      |
| Integration      | Vitest + test DB         | Services + repositories + real Postgres (txn-rolled) | s       |
| Contract         | Vitest + Zod schemas     | API request/response & webhook payload shapes        | ms      |
| E2E              | Playwright               | Critical user journeys through the real app          | s–min   |
| AI evals         | Eval runner (Vitest)     | Astro prompts/tools against a golden set             | varies  |

---

## 3. What must be tested

**Always:**
- All domain logic in `packages/core` (launch plan generation, state machines,
  authorization rules).
- Every API route handler: happy path, validation failure, authz failure.
- Webhook handlers: signature verification (valid + tampered), idempotency.
- Integration adapters: mapped against recorded/mocked vendor responses,
  including error and retry paths.
- Any code touching money (Stripe) or irreversible actions (domain purchase) —
  including the confirmation gate.

**Critical e2e journeys (must stay green):**
1. Sign up → create org → create first Project.
2. Astro generates a Launch Plan; user edits/accepts tasks.
3. Domain availability check → confirmation → (mocked) registration.
4. Asset generation request → asset appears on the project.
5. Subscribe to a paid plan via Stripe (test mode) and gain entitlements.

---

## 4. Testing the AI copilot (Astro)

Astro is non-deterministic, so we test it on three levels:

1. **Deterministic unit tests** for everything around the model: tool schema
   validation, the agent loop's control flow, the confirmation gate, context
   assembly, and persistence. The model itself is **mocked** here — assert that
   given a tool-call response, the right adapter runs with the right args.
2. **Tool execution tests**: each Astro tool is a plain function tested directly
   with valid/invalid/malicious inputs (treat model output as untrusted).
3. **Evals** (`packages/astro/evals`): a golden set of representative user
   prompts run against the real model in CI nightly / on Astro changes. We
   assert on **properties** (did it pick a sane plan? did it refuse to purchase
   without confirmation? did it stay on-task and on-policy?), graded by rules or
   an LLM judge — not exact-string matching. Track pass-rate over time; a
   regression blocks merging Astro changes.

Never let a test make a real billed call (real domain purchase, real charge).
External effects are mocked or run against vendor sandboxes/test modes.

---

## 5. Conventions

- **Co-locate** unit/component tests next to source: `foo.ts` + `foo.test.ts`.
  E2E specs live in `apps/web/e2e/`. Evals in `packages/astro/evals/`.
- **Arrange-Act-Assert.** One behavior per test; descriptive names:
  `it("rejects domain purchase without explicit confirmation")`.
- **Factories over fixtures.** Build test data with typed factory helpers so
  tests state only what matters.
- **Integration tests use a real Postgres** (docker), each test wrapped in a
  transaction that rolls back — no shared mutable state, no order dependence.
- **No network in unit/component tests.** Mock at the adapter boundary.
- **Deterministic time/ids**: inject clocks and id generators; no `Date.now()`
  or `Math.random()` sprinkled in logic.

---

## 6. Coverage & quality bar

- Target **≥ 85%** line/branch coverage in `packages/core` and `packages/astro`
  (tool/control code). Coverage is a smoke alarm, not a goal — 100% of trivial
  getters proves nothing.
- CI fails on: type errors, lint errors, any failing test, coverage drop below
  threshold on changed packages.
- New PRs may not decrease coverage in the packages they touch.

---

## 7. Running tests

```bash
pnpm test            # all unit/component/integration (Vitest)
pnpm test:watch      # watch mode
pnpm test:e2e        # Playwright e2e (starts the app)
pnpm test:evals      # Astro evals (needs ANTHROPIC_API_KEY)
pnpm lint            # eslint
pnpm typecheck       # tsc --noEmit
pnpm check           # lint + typecheck + test (the pre-push gate)
```

CI runs `pnpm check` plus e2e on every PR; evals run on Astro-touching PRs and
nightly. **Do not mark a task done until `pnpm check` is green locally.**

---

## 8. When tests are hard to write

Difficulty is usually a design smell: too many responsibilities, hidden side
effects, or tight coupling to a vendor. Refactor for testability (inject
dependencies, extract pure logic) rather than reaching for elaborate mocks.
