# Blueprints → PDF Export Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a "Download Blueprint" button at the bottom of the Blueprints tab that generates a branded, print-friendly PDF of every blueprint section (blanks marked) and opens the OS share sheet.

**Architecture:** Entirely client-side. A pure, unit-tested builder (`buildBlueprintHtml`) turns the mission store's blueprint data into an HTML document; a thin platform-aware wrapper (`exportHtmlAsPdf`) renders it to PDF via `expo-print` and shares it via `expo-sharing`. This mirrors the existing Cargo Bay pattern (`src/lib/cargoBundle.ts` builder + share action).

**Tech Stack:** Expo SDK ~56, React Native, TypeScript, Zustand (mission store), Jest, `expo-print`, `expo-sharing`.

**Design spec:** `Docs/superpowers/specs/2026-06-03-blueprints-pdf-export-design.md`

---

## File structure

- **Create** `src/lib/blueprintPdf.ts` — pure `buildBlueprintHtml(blueprints)` + `blueprintFileName(blueprints)`. No Expo/React imports.
- **Create** `src/lib/blueprintPdf.test.ts` — Jest unit tests for the builder.
- **Create** `src/lib/exportPdf.ts` — platform-aware `exportHtmlAsPdf(html, fileName)` wrapping `expo-print` + `expo-sharing`.
- **Modify** `src/app/(tabs)/blueprints.tsx` — add the "Download Blueprint" button + export handler at the end of the scroll list.

---

## Task 1: Install dependencies

**Files:**
- Modify: `package.json` (via expo install)

- [ ] **Step 1: Install expo-print and expo-sharing**

Run:
```bash
npx expo install expo-print expo-sharing
```
Expected: both packages added to `package.json` `dependencies` at SDK-56-compatible versions; no peer-dependency errors.

- [ ] **Step 2: Verify the install**

Run:
```bash
node -e "require('expo-print'); require('expo-sharing'); console.log('ok')"
```
Expected: prints `ok` (modules resolve).

- [ ] **Step 3: Commit**

```bash
git add package.json package-lock.json
git commit -m "chore(blueprints): add expo-print + expo-sharing for PDF export"
```

---

## Task 2: Pure HTML builder (`buildBlueprintHtml`) + filename helper

**Files:**
- Create: `src/lib/blueprintPdf.ts`
- Test: `src/lib/blueprintPdf.test.ts`

This is the heart of the feature. The builder reads `BLUEPRINT_SECTIONS` for structure and the store's `blueprints` record for values. All user values are HTML-escaped. Marketing's social links are parsed from JSON and rendered as readable handles. Blanks render as `— not filled yet`.

- [ ] **Step 1: Write the failing test**

Create `src/lib/blueprintPdf.test.ts`:

```ts
import { buildBlueprintHtml, blueprintFileName } from "./blueprintPdf";
import { BLUEPRINT_SECTIONS } from "@/constants/blueprintSections";
import { SOCIAL_LINKS_FIELD_KEY } from "@/constants/socialPlatforms";
import type { Blueprint, BlueprintSection } from "@/types";

/** Build a full blueprints record, then apply per-section overrides. */
function makeBlueprints(
  overrides: Partial<
    Record<BlueprintSection, { fields?: Record<string, string>; completionStatus?: number }>
  > = {},
): Record<BlueprintSection, Blueprint> {
  const out = {} as Record<BlueprintSection, Blueprint>;
  for (const section of BLUEPRINT_SECTIONS) {
    const o = overrides[section.id];
    out[section.id] = {
      section: section.id,
      fields: o?.fields ?? {},
      completionStatus: o?.completionStatus ?? 0,
    };
  }
  return out;
}

describe("buildBlueprintHtml", () => {
  it("includes every section title", () => {
    const html = buildBlueprintHtml(makeBlueprints());
    for (const section of BLUEPRINT_SECTIONS) {
      expect(html).toContain(section.title);
    }
  });

  it("renders a filled field's value", () => {
    const html = buildBlueprintHtml(
      makeBlueprints({ app_info: { fields: { appName: "FocusFlow" } } }),
    );
    expect(html).toContain("FocusFlow");
  });

  it("marks empty and whitespace-only fields as not filled", () => {
    const html = buildBlueprintHtml(
      makeBlueprints({ app_info: { fields: { oneLiner: "   " } } }),
    );
    expect(html).toContain("not filled yet");
  });

  it("renders marketing social links as handles, never raw JSON", () => {
    const social = JSON.stringify({
      twitter: { enabled: true, handle: "@focusflow" },
      instagram: { enabled: false, handle: "ignored" },
    });
    const html = buildBlueprintHtml(
      makeBlueprints({ marketing: { fields: { [SOCIAL_LINKS_FIELD_KEY]: social } } }),
    );
    expect(html).toContain("focusflow");
    expect(html).not.toContain("enabled");
    expect(html).not.toContain("ignored");
  });

  it("escapes HTML in user values", () => {
    const html = buildBlueprintHtml(
      makeBlueprints({ app_info: { fields: { appName: '<b>&"x' } } }),
    );
    expect(html).toContain("&lt;b&gt;&amp;&quot;x");
    expect(html).not.toContain("<b>&\"x");
  });

  it("shows the rounded average completion across sections", () => {
    const html = buildBlueprintHtml(
      makeBlueprints({
        app_info: { completionStatus: 100 },
        app_store: { completionStatus: 50 },
      }),
    );
    // (100 + 50 + 0*6) / 8 = 18.75 -> 19
    expect(html).toContain("19%");
  });
});

describe("blueprintFileName", () => {
  it("derives a safe filename from the app name", () => {
    const name = blueprintFileName(
      makeBlueprints({ app_info: { fields: { appName: "Focus Flow!" } } }),
    );
    expect(name).toBe("Focus-Flow-Launch-Blueprint.pdf");
  });

  it("falls back when no app name is set", () => {
    expect(blueprintFileName(makeBlueprints())).toBe("Launch-Blueprint.pdf");
  });
});
```

- [ ] **Step 2: Run the test to verify it fails**

Run:
```bash
npx jest src/lib/blueprintPdf.test.ts
```
Expected: FAIL — `Cannot find module './blueprintPdf'`.

- [ ] **Step 3: Write the implementation**

Create `src/lib/blueprintPdf.ts`:

```ts
import { BLUEPRINT_SECTIONS } from "@/constants/blueprintSections";
import {
  SOCIAL_LINKS_FIELD_KEY,
  SOCIAL_PLATFORMS,
} from "@/constants/socialPlatforms";
import { parseSocialLinks } from "@/lib/socialLinks";
import type { Blueprint, BlueprintSection } from "@/types";

const BLANK = "— not filled yet";

type Blueprints = Record<BlueprintSection, Blueprint>;

function esc(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function appName(blueprints: Blueprints): string {
  return (blueprints.app_info?.fields?.appName ?? "").trim();
}

function overallCompletion(blueprints: Blueprints): number {
  const total = BLUEPRINT_SECTIONS.reduce(
    (sum, s) => sum + (blueprints[s.id]?.completionStatus ?? 0),
    0,
  );
  return Math.round(total / BLUEPRINT_SECTIONS.length);
}

/** Marketing social links → list of "Platform: handle" rows, or [] if none. */
function socialRows(bp: Blueprint | undefined): string[] {
  const links = parseSocialLinks(bp?.fields?.[SOCIAL_LINKS_FIELD_KEY]);
  return SOCIAL_PLATFORMS.filter(
    (p) => links[p.id].enabled && links[p.id].handle.trim(),
  ).map((p) => `${esc(p.name)}: ${esc(links[p.id].handle.trim())}`);
}

function fieldRow(label: string, rawValue: string | undefined): string {
  const value = rawValue?.trim()
    ? esc(rawValue.trim())
    : `<span class="blank">${BLANK}</span>`;
  return `<div class="field"><div class="label">${esc(label)}</div><div class="value">${value}</div></div>`;
}

function sectionBlock(blueprints: Blueprints, sectionId: BlueprintSection): string {
  const meta = BLUEPRINT_SECTIONS.find((s) => s.id === sectionId)!;
  const bp = blueprints[sectionId];
  const completion = bp?.completionStatus ?? 0;

  const rows = meta.fields
    .map((f) => fieldRow(f.label, bp?.fields?.[f.key]))
    .join("");

  let socialBlock = "";
  if (sectionId === "marketing") {
    const social = socialRows(bp);
    const body = social.length
      ? social.map((r) => `<div class="value">${r}</div>`).join("")
      : `<div class="value"><span class="blank">${BLANK}</span></div>`;
    socialBlock = `<div class="field"><div class="label">Social links</div>${body}</div>`;
  }

  return `
    <section class="block">
      <div class="block-head">
        <h2>${esc(meta.title)}</h2>
        <span class="pct">${completion}%</span>
      </div>
      ${rows}
      ${socialBlock}
    </section>`;
}

export function buildBlueprintHtml(blueprints: Blueprints): string {
  const title = esc(appName(blueprints) || "Your App");
  const overall = overallCompletion(blueprints);
  const body = BLUEPRINT_SECTIONS.map((s) =>
    sectionBlock(blueprints, s.id),
  ).join("");

  return `<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<style>
  * { box-sizing: border-box; }
  body { font-family: -apple-system, Helvetica, Arial, sans-serif; color: #1a2230; margin: 0; padding: 32px; background: #ffffff; }
  .header { border-bottom: 4px solid #4DC8C0; padding-bottom: 16px; margin-bottom: 24px; }
  .header h1 { margin: 0; font-size: 28px; color: #0b1220; }
  .header .sub { color: #4DC8C0; font-weight: 600; letter-spacing: 0.06em; text-transform: uppercase; font-size: 12px; }
  .header .overall { margin-top: 8px; font-size: 13px; color: #5b6675; }
  .block { margin-bottom: 22px; page-break-inside: avoid; }
  .block-head { display: flex; align-items: baseline; justify-content: space-between; border-bottom: 1px solid #e2e6ec; padding-bottom: 4px; margin-bottom: 8px; }
  .block-head h2 { font-size: 17px; margin: 0; color: #0b1220; }
  .pct { font-size: 12px; color: #4DC8C0; font-weight: 600; }
  .field { margin-bottom: 8px; }
  .label { font-size: 11px; text-transform: uppercase; letter-spacing: 0.05em; color: #8a93a3; }
  .value { font-size: 14px; color: #1a2230; white-space: pre-wrap; }
  .blank { color: #aab2bf; font-style: italic; }
</style>
</head>
<body>
  <div class="header">
    <div class="sub">Launch Blueprint</div>
    <h1>${title}</h1>
    <div class="overall">Overall completion: ${overall}%</div>
  </div>
  ${body}
</body>
</html>`;
}

/** Filesystem-safe PDF filename derived from the app name. */
export function blueprintFileName(blueprints: Blueprints): string {
  const safe = appName(blueprints)
    .replace(/[^a-zA-Z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
  return safe ? `${safe}-Launch-Blueprint.pdf` : "Launch-Blueprint.pdf";
}
```

- [ ] **Step 4: Run the test to verify it passes**

Run:
```bash
npx jest src/lib/blueprintPdf.test.ts
```
Expected: PASS — all 8 tests green.

- [ ] **Step 5: Commit**

```bash
git add src/lib/blueprintPdf.ts src/lib/blueprintPdf.test.ts
git commit -m "feat(blueprints): pure HTML builder for blueprint PDF export"
```

---

## Task 3: PDF export wrapper (`exportHtmlAsPdf`)

**Files:**
- Create: `src/lib/exportPdf.ts`

A thin I/O wrapper — like the Cargo Bay's share action, it is verified manually rather than unit-tested (it only delegates to native modules). Native renders a file then shares it; web opens the browser print dialog.

- [ ] **Step 1: Write the implementation**

Create `src/lib/exportPdf.ts`:

```ts
import * as Print from "expo-print";
import * as Sharing from "expo-sharing";
import { Platform } from "react-native";

/**
 * Render an HTML string to PDF and let the user save/share it.
 * Native: print to a temp file, then open the OS share sheet.
 * Web: open the browser print dialog (user picks "Save as PDF").
 * Throws on failure; the caller is responsible for user-facing errors.
 */
export async function exportHtmlAsPdf(
  html: string,
  fileName: string,
): Promise<void> {
  if (Platform.OS === "web") {
    await Print.printAsync({ html });
    return;
  }

  const { uri } = await Print.printToFileAsync({ html });
  if (await Sharing.isAvailableAsync()) {
    await Sharing.shareAsync(uri, {
      mimeType: "application/pdf",
      dialogTitle: fileName,
      UTI: "com.adobe.pdf",
    });
  }
}
```

- [ ] **Step 2: Verify it type-checks**

Run:
```bash
npx tsc --noEmit
```
Expected: no errors from `src/lib/exportPdf.ts`.

- [ ] **Step 3: Commit**

```bash
git add src/lib/exportPdf.ts
git commit -m "feat(blueprints): platform-aware HTML->PDF export wrapper"
```

---

## Task 4: Wire the "Download Blueprint" button into the Blueprints screen

**Files:**
- Modify: `src/app/(tabs)/blueprints.tsx`

Add the button at the end of the scroll list with a loading state and error alert.

- [ ] **Step 1: Add the imports**

In `src/app/(tabs)/blueprints.tsx`, update the imports. Add `useState` from React, `Alert` from react-native, and the new modules. Current top of file:

```ts
import { useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";

import { TabScreen } from "@/components/layout/TabScreen";
import { Card } from "@/components/ui/Card";
import { Icon } from "@/components/ui/Icon";
import { ProgressRing } from "@/components/ui/ProgressRing";
import { colors } from "@/constants/colors";
import { BLUEPRINT_SECTIONS } from "@/constants/blueprintSections";
import { useMissionStore } from "@/store/mission";
import { Pressable, ScrollView, Text, View } from "@/tw";
```

Replace it with:

```ts
import { useRouter } from "expo-router";
import { useState } from "react";
import { Alert } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { TabScreen } from "@/components/layout/TabScreen";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Icon } from "@/components/ui/Icon";
import { ProgressRing } from "@/components/ui/ProgressRing";
import { colors } from "@/constants/colors";
import { BLUEPRINT_SECTIONS } from "@/constants/blueprintSections";
import { blueprintFileName, buildBlueprintHtml } from "@/lib/blueprintPdf";
import { exportHtmlAsPdf } from "@/lib/exportPdf";
import { useMissionStore } from "@/store/mission";
import { Pressable, ScrollView, Text, View } from "@/tw";
```

- [ ] **Step 2: Add the export handler**

In `BlueprintsScreen`, just after the existing `const blueprints = useMissionStore((s) => s.blueprints);` line, add:

```ts
  const [exporting, setExporting] = useState(false);

  const onDownload = async () => {
    if (exporting) return;
    setExporting(true);
    try {
      const html = buildBlueprintHtml(blueprints);
      await exportHtmlAsPdf(html, blueprintFileName(blueprints));
    } catch {
      Alert.alert(
        "Export failed",
        "Couldn't create the PDF. Please try again.",
      );
    } finally {
      setExporting(false);
    }
  };
```

- [ ] **Step 3: Add the button at the end of the list**

In the same file, find the end of the `.map(...)` over `BLUEPRINT_SECTIONS` — the `})}` that closes it, immediately before `</ScrollView>`. Insert the button between them. The region currently reads:

```tsx
            );
          })}
        </ScrollView>
```

Change it to:

```tsx
            );
          })}

          <View className="mt-2">
            <Button
              label="Download Blueprint"
              loading={exporting}
              onPress={onDownload}
            />
          </View>
        </ScrollView>
```

- [ ] **Step 4: Type-check**

Run:
```bash
npx tsc --noEmit
```
Expected: no errors.

- [ ] **Step 5: Run the full test + lint suite**

Run:
```bash
npx jest && npx eslint src/lib/blueprintPdf.ts src/lib/exportPdf.ts "src/app/(tabs)/blueprints.tsx"
```
Expected: all tests pass; no lint errors.

- [ ] **Step 6: Commit**

```bash
git add "src/app/(tabs)/blueprints.tsx"
git commit -m "feat(blueprints): add Download Blueprint PDF button to Blueprints screen"
```

---

## Task 5: Manual verification

**Files:** none (manual smoke test)

- [ ] **Step 1: Web demo**

Run:
```bash
npx expo start --web
```
Navigate to the Blueprints tab, scroll to the bottom, tap **Download Blueprint**. Expected: the browser print dialog opens showing a white, teal-accented document with the app name, an "Overall completion: N%" line, all 8 section headings, filled values, and `— not filled yet` for blanks. Marketing shows social handles (not raw JSON). Choosing "Save as PDF" produces a valid file.

- [ ] **Step 2: Native device (if available)**

Run on a device/simulator (`npx expo start`, open in Expo Go / dev client). Tap **Download Blueprint**. Expected: a brief spinner on the button, then the share sheet appears; "Save to Files" / share yields an openable PDF that matches the web layout.

- [ ] **Step 3: Error path**

(Optional) Temporarily throw inside `buildBlueprintHtml` and confirm the "Export failed" alert appears and the button returns to its idle state. Revert the change afterward.

---

## Notes / known limitations

- `expo-print`'s `printToFileAsync` writes to a temp file with a generated name; the chosen `fileName` is used as the share dialog title, not necessarily the saved file's exact name (renaming would require `expo-file-system`, out of scope for v1).
- On web there is no programmatic file download from `expo-print`; the print dialog's "Save as PDF" is the supported path.
