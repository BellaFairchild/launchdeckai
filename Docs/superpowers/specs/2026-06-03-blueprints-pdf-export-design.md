# Blueprints → PDF Export — Design

**Date:** 2026-06-03
**Status:** Approved (pending spec review)
**Topic:** Let users download all their Blueprints data as a single branded PDF from the Blueprints screen.

## Goal

Add a "Download Blueprint" button to the bottom of the Blueprints tab that
generates a PDF containing every blueprint section the user has filled in (all
sections shown; blanks explicitly marked) and opens the OS share sheet so the
user can save or send it.

## Context

- Blueprint data lives **client-side** in the mission store
  (`src/store/mission.ts`) as `blueprints: Record<BlueprintSection, Blueprint>`,
  where `Blueprint = { section, fields: Record<string,string>, completionStatus: number }`.
- Section structure (titles, field labels, field order, which fields are
  multiline) is defined in `src/constants/blueprintSections.ts` as
  `BLUEPRINT_SECTIONS` (8 sections: `app_info`, `app_store`,
  `legal_compliance`, `marketing`, `beta_testing`, `pre_launch`, `launch_day`,
  `post_launch`).
- The **Marketing** section stores social links specially: a single field keyed
  `SOCIAL_LINKS_FIELD_KEY` (`"socialLinks"`, from `src/constants/socialPlatforms.ts`)
  holding JSON. It is parsed via `parseSocialLinks(raw)` →
  `SocialLinksMap` and URLs built via `buildSocialUrl(platformId, handle)`
  (both in `src/lib/socialLinks.ts`).
- The Cargo Bay established the pattern we follow: a **pure, unit-tested builder
  function** (`buildCargoBundle` in `src/lib/cargoBundle.ts`) plus a **thin
  screen action** that shares the result (`src/app/(modals)/cargo.tsx` uses
  React Native `Share`).
- Project is on **Expo SDK ~56**. No PDF library is installed yet.

## Approach (chosen: A)

Generate the PDF on-device from an HTML string using **`expo-print`**, then
share it with **`expo-sharing`**. HTML/CSS gives full control over the
"branded, print-friendly" look, works on native and web, and keeps the builder
pure and testable. (Rejected: B — programmatic `pdf-lib`/`react-pdf`, far more
code and weaker RN support; C — server-side Convex generation, needless
round-trip for data the client already holds.)

## File structure

- **Create** `src/lib/blueprintPdf.ts` — pure `buildBlueprintHtml(blueprints, opts?)`
  returning a complete HTML document string. No Expo/React imports.
- **Create** `src/lib/blueprintPdf.test.ts` — Jest unit tests for the builder.
- **Create** `src/lib/exportPdf.ts` — platform-aware `exportHtmlAsPdf(html, fileName)`
  wrapping `expo-print` + `expo-sharing`.
- **Modify** `src/app/(tabs)/blueprints.tsx` — add the "Download Blueprint"
  button at the end of the scroll list, wired to build HTML + export, with a
  loading state.
- **Add deps** via `npx expo install expo-print expo-sharing` (SDK-56-correct
  versions).

## Component design

### `buildBlueprintHtml(blueprints, opts?)` — `src/lib/blueprintPdf.ts`

Pure function. Input: `blueprints: Record<BlueprintSection, Blueprint>`
(reads `BLUEPRINT_SECTIONS` for structure). Output: one HTML document string.

Behavior:

- **Branded title header** (print-friendly): white page background, a teal accent
  bar/heading, the **app name** from `blueprints.app_info.fields.appName`
  (fallback `"Your App"`) as the document title, subtitle `"Launch Blueprint"`,
  and an **overall completion %** = rounded average of every section's
  `completionStatus`.
- **One block per section**, iterating `BLUEPRINT_SECTIONS` in order (so all 8
  always appear): section `title` + that section's `completionStatus`%, then each
  field rendered as a **label / value** pair using the field `label` from
  `BLUEPRINT_SECTIONS`.
- **Blank values** (missing, empty, or whitespace-only) render as muted
  `— not filled yet`.
- **Marketing social links**: skip the raw `socialLinks` field in the normal
  field loop; instead parse it with `parseSocialLinks` and render each *enabled*
  platform with a non-empty handle as `Platform: @handle` (URL via
  `buildSocialUrl`). If none enabled, render the muted `— not filled yet`.
- **HTML-escape** all user-supplied values (and the app name) to avoid broken
  markup / injection from user input.

Optional `opts` reserved for future (e.g., date stamp); not required for v1.

### `exportHtmlAsPdf(html, fileName)` — `src/lib/exportPdf.ts`

Platform-aware async wrapper:

- **Native**: `Print.printToFileAsync({ html })` → returns a file `uri`; then
  `Sharing.isAvailableAsync()` and `Sharing.shareAsync(uri, { mimeType: "application/pdf", dialogTitle: fileName })`.
- **Web**: `Print.printAsync({ html })` (opens the browser print dialog →
  user picks "Save as PDF"; `expo-print` has no file API on web).
- Throws on failure; the caller handles UX.

### Screen integration — `src/app/(tabs)/blueprints.tsx`

- Add a `Button label="Download Blueprint"` at the **end of the `ScrollView`**
  (after the last section card, inside the existing content container).
- `onPress` handler:
  1. Read `blueprints` (screen already subscribes via `useMissionStore`).
  2. `const html = buildBlueprintHtml(blueprints)`.
  3. Derive `fileName` from app name, sanitized to filesystem-safe characters,
     e.g. `FocusFlow-Launch-Blueprint.pdf`; fallback `Launch-Blueprint.pdf`.
  4. `await exportHtmlAsPdf(html, fileName)`.
- Local `loading` state disables the button and shows `"Exporting…"` while the
  PDF is generated.

## Data flow

```
mission store (blueprints)
  → buildBlueprintHtml(blueprints)        [pure, src/lib/blueprintPdf.ts]
  → exportHtmlAsPdf(html, fileName)       [src/lib/exportPdf.ts]
      → native: Print.printToFileAsync → Sharing.shareAsync(uri)
      → web:    Print.printAsync(html)  → browser Save-as-PDF
```

## Error handling

- Wrap the `onPress` body in try/catch. On any failure (generation error or
  sharing unavailable), show an `Alert`: `"Couldn't create the PDF. Please try
  again."` and reset `loading`.
- A user **dismissing** the share sheet is not an error — it resolves quietly;
  there is no state to flip (unlike Cargo Bay's "shipped" tracking).
- No "empty data" guard: the PDF intentionally includes all sections with blanks
  marked, so an export is always meaningful.

## Testing

**Unit — `src/lib/blueprintPdf.test.ts` (Jest, already configured):**

- Output contains every section title from `BLUEPRINT_SECTIONS`.
- A filled field renders its value.
- An empty / whitespace-only field renders `not filled yet`.
- Marketing social links render as `@handle` text, never raw JSON.
- HTML-escaping: a value containing `<` / `&` / `"` is escaped in output.
- Overall completion % equals the rounded average of section `completionStatus`.
- App-name fallback (`"Your App"`) used when `app_info.appName` is blank.

**Manual smoke:**

- Web demo: tapping the button opens the browser print dialog showing the
  branded document.
- Native device: the share sheet appears; "Save to Files" yields a valid,
  openable PDF.

## Out of scope (YAGNI)

- Server-side / cloud PDF storage.
- Per-section selective export (always exports all sections).
- Custom theming options or multiple templates.
- Tracking "exported" state on blueprints.
