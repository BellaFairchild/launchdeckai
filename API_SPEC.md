# API_SPEC.md — API Specification

> The HTTP contract for LaunchDeck AI. The web app's route handlers (the BFF) and
> the public API both follow these conventions. **Any endpoint change updates
> this file in the same PR.** Entities referenced here are defined in
> `DATA_MODEL.md`.

---

## 1. Conventions

- **Base path**: `/api/v1`. The version is in the path; breaking changes bump it.
- **Format**: JSON only. `Content-Type: application/json`. UTF-8.
- **Case**: request/response bodies use `camelCase`.
- **IDs**: opaque strings (CUID/UUID). Never assume ordering or format.
- **Timestamps**: ISO-8601 UTC (`2026-06-09T12:00:00Z`).
- **Validation**: every request body/query is parsed with **Zod**. Invalid input
  → `422` with field-level detail.
- **Idempotency**: mutating endpoints that cause external/billable effects accept
  an `Idempotency-Key` header and de-duplicate within a 24h window.
- **Tenancy**: every request resolves to one organization; you can only access
  resources in orgs you are a member of. Cross-org access → `404` (not `403`,
  to avoid leaking existence).

---

## 2. Authentication

Two mechanisms, same authorization model:

1. **Session cookie** (browser) — issued by Auth.js after login. Used by the web
   app. CSRF-protected for state-changing requests.
2. **API key** (programmatic) — `Authorization: Bearer ldk_live_…`. Maps to an
   `ApiKey` row scoped to one organization. Keys are hashed at rest.

Unauthenticated → `401`. Authenticated but not permitted → `403` (or `404` for
cross-tenant). Roles (`OWNER`/`ADMIN`/`MEMBER`/`VIEWER`) gate write operations;
`VIEWER` is read-only. See `SECURITY.md`.

The active organization is selected via the `X-Org-Id` header (or inferred from
the API key). Requests must be scoped to a single org.

---

## 3. Standard response shapes

**Success (single):**
```json
{ "data": { "id": "prj_123", "name": "My App", ... } }
```

**Success (collection, cursor-paginated):**
```json
{
  "data": [ { ... }, { ... } ],
  "pagination": { "nextCursor": "eyJ...", "hasMore": true, "limit": 25 }
}
```

**Error (RFC-9457 problem+json style):**
```json
{
  "error": {
    "type": "validation_error",
    "title": "Request validation failed",
    "status": 422,
    "detail": "name is required",
    "fields": { "name": "Required" },
    "requestId": "req_abc123"
  }
}
```

`requestId` is always present and logged (correlate with Sentry).

---

## 4. Error codes

| HTTP | `type`                  | When                                            |
| ---- | ----------------------- | ----------------------------------------------- |
| 400  | `bad_request`           | Malformed JSON / missing header                 |
| 401  | `unauthorized`          | Missing/invalid credentials                     |
| 403  | `forbidden`             | Authenticated but lacks role/permission         |
| 404  | `not_found`             | Resource missing or cross-tenant (hidden)       |
| 409  | `conflict`              | Unique constraint / state conflict              |
| 422  | `validation_error`      | Body/query failed Zod validation                |
| 429  | `rate_limited`          | Rate/quota exceeded (`Retry-After` header)      |
| 5xx  | `internal_error`        | Unexpected; reported to Sentry, no detail leaked|

External-effect endpoints may also return `402 payment_required` (entitlement/
quota) and `424 dependency_failed` (vendor error, normalized).

---

## 5. Pagination, filtering, sorting

- **Cursor pagination**: `?limit=25&cursor=…`. `limit` max 100, default 25.
- **Filtering**: explicit query params per endpoint (e.g. `?stage=PRE_LAUNCH`).
- **Sorting**: `?sort=createdAt&order=desc` where supported.

---

## 6. Rate limiting

Per-org and per-key sliding windows. Responses include `X-RateLimit-Limit`,
`X-RateLimit-Remaining`, `X-RateLimit-Reset`. AI (Astro) endpoints have their own
tighter quotas tied to the org's Plan. Exceeding → `429` with `Retry-After`.

---

## 7. Endpoints

> Representative, not exhaustive. Shapes follow `DATA_MODEL.md`. All paths are
> under `/api/v1` and require auth unless marked public.

### Auth & session
| Method | Path                  | Notes                                  |
| ------ | --------------------- | -------------------------------------- |
| GET    | `/auth/session`       | Current user + memberships             |
| POST   | `/auth/signout`       | Invalidate session                     |

(Login/OAuth callbacks are handled by Auth.js routes under `/api/auth/*`.)

### Organizations & members
| Method | Path                                   | Role    | Notes                         |
| ------ | -------------------------------------- | ------- | ----------------------------- |
| GET    | `/orgs`                                | any     | Orgs the user belongs to      |
| POST   | `/orgs`                                | any     | Create org                    |
| GET    | `/orgs/{orgId}`                        | member  |                               |
| PATCH  | `/orgs/{orgId}`                        | admin   | Rename, settings              |
| GET    | `/orgs/{orgId}/members`                | member  | List members                  |
| POST   | `/orgs/{orgId}/members`                | admin   | Invite (email + role)         |
| PATCH  | `/orgs/{orgId}/members/{id}`           | admin   | Change role / suspend         |
| DELETE | `/orgs/{orgId}/members/{id}`           | admin   | Remove member                 |

### Projects
| Method | Path                         | Role   | Notes                              |
| ------ | ---------------------------- | ------ | ---------------------------------- |
| GET    | `/projects`                  | member | List org projects (paginated)      |
| POST   | `/projects`                  | member | Create a project to launch         |
| GET    | `/projects/{id}`             | member |                                    |
| PATCH  | `/projects/{id}`             | member | Update name/stage/target date      |
| DELETE | `/projects/{id}`             | admin  | Soft delete                        |

### Launch plan & tasks
| Method | Path                                          | Notes                                   |
| ------ | --------------------------------------------- | --------------------------------------- |
| GET    | `/projects/{id}/launch-plan`                  | Active plan + tasks                     |
| POST   | `/projects/{id}/launch-plan/generate`         | Astro generates/regenerates a plan (async) |
| PATCH  | `/projects/{id}/launch-plan/tasks/{taskId}`   | Update status/order/details             |
| POST   | `/projects/{id}/launch-plan/tasks`            | Add a manual task                       |
| DELETE | `/projects/{id}/launch-plan/tasks/{taskId}`   | Remove a task                           |

### Astro (AI copilot)
| Method | Path                                              | Notes                                                  |
| ------ | ------------------------------------------------- | ------------------------------------------------------ |
| GET    | `/projects/{id}/astro/conversations`              | List conversations                                     |
| POST   | `/projects/{id}/astro/conversations`              | Start a conversation                                   |
| GET    | `/astro/conversations/{cid}/messages`             | Message history                                        |
| POST   | `/astro/conversations/{cid}/messages`             | Send a message; **streams** assistant tokens (SSE)     |
| POST   | `/astro/tool-calls/{toolCallId}/confirm`          | Confirm a `PROPOSED` irreversible/billable tool call   |
| POST   | `/astro/tool-calls/{toolCallId}/reject`           | Reject a proposed tool call                            |

> Streaming: `POST …/messages` returns `text/event-stream`. Tool calls that are
> irreversible or billable are returned as `PROPOSED` and **require** an explicit
> `confirm` call before execution (see `SECURITY.md`). Non-streaming clients can
> poll the message history.

### Domains (via GoDaddy)
| Method | Path                                  | Notes                                            |
| ------ | ------------------------------------- | ------------------------------------------------ |
| GET    | `/projects/{id}/domains`              | Domains for project                              |
| POST   | `/domains/check`                      | Body `{ query }` → availability + suggestions    |
| POST   | `/projects/{id}/domains/register`     | **Billable.** Requires `Idempotency-Key` + confirmed intent |
| POST   | `/projects/{id}/domains/{did}/connect`| Configure DNS for an existing domain             |

### Assets (Canva / Figma / Astro)
| Method | Path                              | Notes                                       |
| ------ | --------------------------------- | ------------------------------------------- |
| GET    | `/projects/{id}/assets`           | List assets                                 |
| POST   | `/projects/{id}/assets/generate`  | Request generation (async) → `status: GENERATING` |
| GET    | `/assets/{aid}`                   | Asset detail/status                         |
| DELETE | `/assets/{aid}`                   | Remove                                      |

### Integrations
| Method | Path                                      | Role  | Notes                          |
| ------ | ----------------------------------------- | ----- | ------------------------------ |
| GET    | `/orgs/{orgId}/integrations`              | admin | Connected providers + status   |
| POST   | `/orgs/{orgId}/integrations/{provider}/connect` | admin | Start OAuth / store credentials |
| DELETE | `/orgs/{orgId}/integrations/{provider}`   | admin | Disconnect                     |

### Billing (Stripe)
| Method | Path                              | Role  | Notes                                |
| ------ | --------------------------------- | ----- | ------------------------------------ |
| GET    | `/orgs/{orgId}/billing`           | admin | Current plan + subscription status   |
| GET    | `/plans`                          | any   | Available plans (public-ish)         |
| POST   | `/orgs/{orgId}/billing/checkout`  | admin | Create Stripe Checkout session       |
| POST   | `/orgs/{orgId}/billing/portal`    | admin | Stripe billing portal link           |

### API keys
| Method | Path                              | Role  | Notes                                   |
| ------ | --------------------------------- | ----- | --------------------------------------- |
| GET    | `/orgs/{orgId}/api-keys`          | admin | List (prefix only, never the raw key)   |
| POST   | `/orgs/{orgId}/api-keys`          | admin | Create — raw key returned **once**      |
| DELETE | `/orgs/{orgId}/api-keys/{id}`     | admin | Revoke                                  |

---

## 8. Webhooks (inbound, public, signature-verified)

| Path                       | Source  | Notes                                              |
| -------------------------- | ------- | -------------------------------------------------- |
| `/webhooks/stripe`         | Stripe  | Verify `Stripe-Signature`; updates Subscription    |
| `/webhooks/godaddy`        | GoDaddy | Domain registration/DNS status updates             |
| `/webhooks/{provider}`     | various | Verify provider signature before processing        |

Rules: verify signature first (reject `400` on failure), respond `2xx` fast, do
work async/idempotently keyed on the event id, and **never** trust payload
contents without verification. Each webhook maps to a domain `Event`.

---

## 9. Versioning & deprecation

- Backward-compatible additions (new fields/endpoints) don't bump the version.
- Breaking changes ship under `/api/v2` with `v1` supported through a published
  deprecation window. Deprecated endpoints return a `Deprecation` header.

---

## 10. OpenAPI

The contract is also published as an OpenAPI 3.1 document generated from the Zod
schemas (`/api/v1/openapi.json`). Generated docs and this file must agree; CI
checks they don't drift.
