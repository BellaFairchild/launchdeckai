# SECURITY.md — Security & Threat Model

> Security is a requirement, not a feature. This document is binding. If a change
> conflicts with it, the change is wrong until signed off by a maintainer. When
> something here is ambiguous for a task, ask before weakening a control.

---

## 1. Security principles

1. **Secure by default.** The safe path is the default path; insecurity must be
   an explicit, reviewed choice.
2. **Least privilege.** Every actor (user, API key, integration, Astro tool) gets
   the minimum access needed.
3. **Defense in depth.** No single control is trusted alone — auth + tenancy
   checks + validation + rate limiting + monitoring.
4. **Validate all input; encode all output.** Treat every external byte —
   including **AI model output** — as hostile until validated.
5. **Assume breach.** Limit blast radius, log everything important, make secrets
   rotatable.

---

## 2. Authentication

- Sessions via Auth.js: HTTP-only, `Secure`, `SameSite=Lax` cookies; short
  rotation; server-side session records revocable on logout/compromise.
- Passwords (if email/password is enabled) hashed with **argon2id** (or bcrypt
  cost ≥ 12). Never store or log plaintext.
- OAuth providers preferred; verify `state`/PKCE.
- **API keys**: format `ldk_live_…`, shown once at creation, stored only as a
  hash; verified in constant time; revocable; scoped to one org; `lastUsedAt`
  tracked.
- MFA/TOTP supported for sensitive accounts (roadmap: enforce for `OWNER`).

---

## 3. Authorization & multi-tenancy

- **Every tenant-scoped query filters by `organizationId`** in the repository
  layer — never trusted to the caller. This is the most important control in the
  app; cross-tenant data leakage is a Sev-1.
- Role checks (`OWNER` > `ADMIN` > `MEMBER` > `VIEWER`) gate every mutation. See
  `API_SPEC.md` for per-endpoint roles. `VIEWER` is strictly read-only.
- Cross-tenant access returns `404`, not `403`, to avoid leaking existence.
- Object-level authorization on every resource fetch (no "IDOR by id guessing").
- Authorization is centralized in `packages/core` policy functions and unit
  tested (see `TESTING.md`).

---

## 4. Input validation & output safety

- All HTTP bodies, query params, headers used in logic, webhook payloads, and env
  vars are validated with **Zod** at the boundary.
- SQL: only via Prisma parameterized queries — no string-built SQL.
- XSS: React escapes by default; never use `dangerouslySetInnerHTML` with
  unsanitized content. Sanitize any user/AI-authored HTML/Markdown before render.
- SSRF: outbound requests (including AI-tool-driven fetches) go through an
  allow-list / egress proxy; block internal/metadata IP ranges.
- File uploads (assets): validate type/size, store outside the web root / in
  object storage, serve via signed URLs, never execute.

---

## 5. Secrets management

- Secrets come **only** from environment variables / the platform secret store.
  Documented in `.env.example` with placeholders.
- **Never** commit secrets, never log them, never return them in API responses,
  never put them in error messages or Sentry breadcrumbs.
- Integration credentials/tokens are **encrypted at rest** (envelope encryption
  with a KMS-managed key), decrypted only in memory at point of use.
- Keys are rotatable; rotation does not require a code change.
- A secret-scanning check runs in CI and pre-commit; a committed secret is
  treated as compromised and rotated immediately.

---

## 6. The AI copilot (Astro) — AI-specific security

Astro is powered by Claude and can take real actions. It is the highest-risk
subsystem and gets dedicated controls:

- **Model output is untrusted input.** Every tool call the model emits is
  validated against a Zod schema and an allow-list of tools. Unknown or malformed
  tool calls are rejected, never executed.
- **Confirmation gate for consequential actions.** Any irreversible, billable, or
  externally-visible action — registering/buying a domain, creating Stripe
  products/prices, sending emails, publishing a page — is returned as a
  `PROPOSED` tool call and requires an **explicit human confirm** (`/astro/
  tool-calls/{id}/confirm`) before execution. Astro can never spend money or make
  irreversible changes autonomously.
- **Tool authorization.** Each tool re-checks the acting user's org and role
  before doing anything — the model deciding to call a tool does not grant
  permission.
- **Prompt-injection defense.** Content fetched from external sources (web pages,
  uploaded docs, vendor responses) is treated as data, not instructions. System
  policy is reasserted; the model is instructed to ignore embedded instructions
  in untrusted content; high-impact tools always require confirmation regardless.
- **Output filtering.** Astro must not reveal secrets, system prompts, or another
  tenant's data. Responses are scoped to the current org's context only.
- **Rate & quota limits** on AI calls per org/plan to bound abuse and cost.
- **No training on customer data** beyond what's needed to serve the request;
  follow the model provider's data-use settings.
- **Auditability.** Every tool call (proposed/confirmed/executed/rejected) is
  recorded as an `Event` with actor `ASTRO`.

---

## 7. Payments & money

- Stripe is the system of record for charges; we store references, not card data
  (PCI scope minimized — Stripe Checkout / Elements only).
- Webhooks are **signature-verified** before processing; entitlement changes flow
  only from verified Stripe events, never from client claims.
- Domain purchases and any spend require the confirmation gate (§6) and an
  `Idempotency-Key`.

---

## 8. Transport & headers

- HTTPS everywhere; HSTS enabled. No mixed content.
- Security headers: `Content-Security-Policy` (strict, nonce-based),
  `X-Content-Type-Options: nosniff`, `Referrer-Policy`, `X-Frame-Options:
  DENY`/frame-ancestors, `Permissions-Policy`.
- CSRF protection for cookie-authenticated state-changing requests.
- Strict CORS: only trusted origins; API-key endpoints don't rely on cookies.

---

## 9. Rate limiting & abuse

- Global and per-endpoint limits (see `API_SPEC.md` §6), tighter on auth, AI, and
  billing endpoints. Account lockout / backoff on repeated auth failures.
- Bot/abuse protection on signup and public endpoints.

---

## 10. Logging, monitoring & incident response

- Sentry for errors/performance; structured logs with `requestId`, org/project
  ids — **never** PII, secrets, tokens, or full request bodies with sensitive
  fields.
- Audit log (`Event`) for security-relevant actions (auth, role changes,
  integration connect/disconnect, AI tool execution, billing changes).
- Alerts on anomalies (auth failure spikes, authz denials, webhook signature
  failures).
- **Incident response**: documented runbook — contain, rotate affected secrets,
  assess blast radius, notify per legal obligations, post-mortem. Disclose
  vulnerabilities responsibly via `SECURITY` contact.

---

## 11. Data protection & privacy

- Data minimization: collect only what the product needs.
- Encryption in transit (TLS) and at rest (DB + secrets).
- Soft-deleted data purged on a schedule; honor data export/deletion requests
  (GDPR/CCPA posture).
- Backups encrypted; restore tested periodically.
- Tenant data isolation is logical (org-scoped) and enforced everywhere.

---

## 12. Dependencies & supply chain

- `pnpm audit` + Renovate/Dependabot in CI; critical/high CVEs block merge.
- Lockfile committed; only permissive licenses (see `DEPENDENCIES.md`).
- Pin CI actions; least-privilege CI tokens; no secrets exposed to fork PRs.

---

## 13. The non-negotiables checklist (for every PR)

- [ ] No secret added to code, logs, or responses.
- [ ] Every new query is org-scoped; every new mutation is role-checked.
- [ ] Every new external input is Zod-validated.
- [ ] Any new Astro tool with side effects is allow-listed, authz-checked, and
      (if irreversible/billable) behind the confirmation gate.
- [ ] No new endpoint bypasses auth without an explicit, reviewed reason.
- [ ] Security-relevant action emits an audit `Event`.
