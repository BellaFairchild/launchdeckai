# UX_GUIDELINES.md — UX & Design Guidelines

> How LaunchDeck AI should look, feel, and behave. The product promise is
> "launching your app feels guided, not overwhelming." Every UX decision should
> reduce the founder's anxiety and momentum-loss. Astro is a calm, competent
> copilot — the UI should feel the same.

---

## 1. Design principles

1. **Guided, not gated.** Always show the next best action. The user should never
   wonder "what now?" — Astro and the Launch Plan answer that.
2. **Progress is the product.** Make momentum visible: checklists, completion,
   milestones. Celebrate launches.
3. **Astro is a partner, not a wizard popup.** The copilot is present and
   helpful, never naggy or blocking. The user is always in control —
   especially before anything irreversible or billable.
4. **Clarity over cleverness.** Plain language, obvious affordances, no jargon.
   "Secure your domain", not "Provision DNS zone."
5. **Trust through transparency.** When Astro proposes an action (spend money,
   register a domain), show exactly what will happen and ask first.
6. **Fast and forgiving.** Optimistic UI where safe, easy undo, no dead ends.

---

## 2. Brand & tone

- **Voice**: encouraging, concise, expert-but-friendly. Like a seasoned founder
  friend. Celebrate wins; be honest about risks.
- **Astro's persona**: warm, confident, proactive, never condescending. Short
  messages by default; expandable detail on request. Uses the user's project
  context; never generic boilerplate.
- **Avoid**: hype, dark patterns, fake urgency, guilt ("you haven't launched
  yet!"). Motivate with progress, not pressure.

---

## 3. Design system & tokens

- Built on **Tailwind + shadcn/ui + Radix**. Components live in `packages/ui`.
- **Design tokens** (CSS variables) are the single source of truth for color,
  spacing, radius, typography, shadow. No hardcoded hex/px in components — use
  tokens/utilities.
- **Theming**: light and dark themes both first-class; respect
  `prefers-color-scheme`; user can override.
- **Spacing**: 4px base scale (4, 8, 12, 16, 24, 32, 48, 64).
- **Radius/elevation**: consistent, restrained. Depth signals interactivity, not
  decoration.
- **Typography**: a clear type scale; one display + one text family; never more
  than a few weights. Line length 60–75ch for reading.

---

## 4. Accessibility (WCAG 2.2 AA — required, not optional)

- **Contrast** ≥ 4.5:1 for text, ≥ 3:1 for large text/UI components.
- **Keyboard**: everything operable without a mouse; visible focus rings; logical
  tab order; no keyboard traps. Modals trap focus and restore it on close.
- **Semantics**: real semantic HTML and ARIA only where needed (lean on Radix,
  which handles most of it). Every input has a label; icons-only buttons have
  accessible names.
- **Screen readers**: announce async results, streaming Astro responses, and
  status changes via live regions.
- **Motion**: respect `prefers-reduced-motion`; no essential info conveyed by
  motion or color alone.
- **Targets**: min 44×44px touch targets.
- A11y is enforced in CI (axe in component/e2e tests) and in review.

---

## 5. Layout & responsiveness

- **Mobile-first, responsive web** (no native apps in v1). Layouts work from
  ~360px to wide desktop.
- Primary app shell: persistent nav (projects, current project, settings) +
  content area + Astro panel.
- **Astro placement**: a dockable side panel on desktop, full-screen sheet on
  mobile. Accessible from anywhere; never obscures the user's work.
- Content max-widths for readability; generous whitespace; avoid wall-of-form.

---

## 6. Core flows & patterns

### Onboarding
- Get to value fast: sign up → name the app you're launching → Astro drafts a
  Launch Plan within the first minute. Defer non-essential setup.
- Progressive disclosure: ask for integrations (domain, payments) only when a
  task needs them.

### The Launch Plan (hero surface)
- A clear checklist grouped by category (Domain, Branding, Landing, Payments,
  Marketing…). Show overall progress prominently.
- Each task: status, who/what can do it, and — if automatable — an "Ask Astro to
  do this" affordance.
- Dependencies are visible; blocked tasks explain why.

### Talking to Astro
- Conversational, **streaming** responses (tokens appear live). Show a typing/
  working indicator; allow stop.
- When Astro performs a tool action, show it inline as a step with status.
- **Confirmation gate UX**: for anything irreversible or billable, Astro presents
  a clear summary card — what, cost, consequences — with explicit **Confirm /
  Cancel**. Nothing happens until the user confirms. This must feel safe and
  unmissable, never a buried default.

### Assets & domains
- Generation is async: show `Generating…` states, then reveal results; never a
  frozen UI. Allow regenerate/iterate.
- Domain search feels instant: live availability + suggestions; purchase is
  always behind explicit confirmation.

---

## 7. State design (handle all of them)

Every view explicitly designs for:
- **Empty** — encouraging first-run state with a clear primary action (not a sad
  blank screen).
- **Loading** — skeletons for content, spinners only for short waits; optimistic
  where safe.
- **Partial/streaming** — for Astro and async generation.
- **Error** — human-readable, blame-free, with a recovery action and a way to
  retry; never a raw stack trace or error code alone.
- **Success** — confirm the outcome; advance to the next step.

---

## 8. Feedback, errors & forms

- **Immediate, specific feedback** on every action (toast/inline). No silent
  successes or failures.
- **Forms**: validate inline on blur and on submit; show field-level errors near
  the field; keep entered data on error; disable submit only while submitting,
  with a busy state.
- **Destructive actions** require confirmation and are reversible where possible
  (soft delete + undo).
- **Error copy** is plain and actionable: what happened, why (if useful), what to
  do next.

---

## 9. Performance as UX

- Perceived speed matters: server-render the shell, stream content, prefetch
  likely next routes.
- Targets: meaningful content < 1s on fast connections; interactions feel instant
  (< 100ms feedback); good Core Web Vitals (LCP, INP, CLS).
- Optimize images/assets; lazy-load below the fold; avoid layout shift.

---

## 10. Content & microcopy

- Buttons are verbs describing the outcome: "Generate launch plan", "Secure
  domain", "Confirm purchase".
- Sentence case for UI text. No ALL CAPS shouting.
- Numbers, dates, currency are localized and formatted consistently.
- Empty states and tooltips teach; they don't just decorate.

---

## 11. Definition of "good UX" here

A screen is done when it: has all five states designed, is keyboard- and
screen-reader-operable, passes contrast, is responsive 360px→desktop, gives clear
feedback on every action, never lets Astro act irreversibly without explicit
confirmation, and leaves the user knowing their next step.
