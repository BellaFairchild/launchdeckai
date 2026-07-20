# LaunchDeckAI — Feature-Complete + Polish + Full QA Coverage Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Take the LaunchDeckAI mobile app from ~80–85% functional MVP to feature-complete + polished, with the should-have features finished and the full `Docs/11_QA_TESTING_CHECKLIST.md` covered by automated tests (plus a structured manual checklist for device/3rd-party cases).

**Architecture:** The app is an Expo Router + NativeWind RN app backed by Convex, with Clerk auth, RevenueCat payments, and Anthropic AI through Convex Actions. Client state lives in Zustand stores (`mission`, `ui`, `audioPreferences`) that delegate to a Convex adapter when signed in and run on local mock data in demo mode. This plan keeps that dual-mode pattern: every new feature works in demo mode (pure/local) and persists to Convex when `serverOwned`.

**Tech Stack:** Expo SDK 56, React Native 0.85, Expo Router, NativeWind v5 (`@/tw` wrappers), Zustand, Convex, Clerk, RevenueCat, Anthropic SDK (server-side), Jest 29 + jest-expo + RNTL v13, `convex-test` (added in Part C), `jszip` + `expo-file-system` (added in Part A).

**How to read this plan:** Three Parts, each independently shippable.

- **Part A — Feature completion** (Signal Pack ZIP export + Cadet paywall sheet; Launch Library saved resources). These are the only real missing should-have features.
- **Part B — Polish & accessibility** (testID/label forwarding, empty/loading/error coverage, dynamic service ribbons, tap-target + status-not-color-only a11y, one success micro-animation).
- **Part C — Full QA-checklist coverage** (one automated test suite per `Docs/11` domain + a manual QA checklist task for device/store/OAuth/RevenueCat cases that cannot be unit-tested).

**Conventions every task follows:** DRY, YAGNI, TDD (failing test first), frequent commits. Tests run with `npx jest <path>`. The repo aliases: `@/` → `src/`, `@cvx/` → `convex/`, `@/assets/` → `assets/`. `@/tw` re-exports NativeWind-wrapped `View`, `Text`, `Pressable`, `ScrollView`, `TextInput`. `Date.now()` is fine in app code; in tests, pass explicit timestamps or mock with `jest.useFakeTimers`.

**Baseline before starting:** `npx jest` is green (14 suites, 51 tests). Keep it green after every task.

---

## File Structure (new + modified)

**Part A creates:**

- `src/lib/signalPack.ts` — pure builders for the signal-pack file set (CSV/JSON/README/txt). No native deps → fully unit-testable.
- `src/lib/signalPack.test.ts` — unit tests.
- `src/lib/exportSignalPack.ts` — native glue: zip the file set, write to cache, share. Thin; mocked in tests.
- `src/lib/exportSignalPack.test.ts` — verifies the file set is zipped and shared, and which asset ids flip to `exported`.
- `src/components/signal/TransmitPaywallSheet.tsx` — Cadet paywall bottom sheet (exact `Docs/07` copy).
- `src/components/signal/TransmitPaywallSheet.test.tsx`
- `convex/resources.ts` — `toggleSaved` mutation + `listSaved` query for the Launch Library.
- `src/store/savedResources.ts` — local-first persisted store, delegates to Convex when signed in.
- `src/store/savedResources.test.ts`

**Part A modifies:**

- `package.json` — add `jszip`, `expo-file-system`.
- `convex/schema.ts` — add `savedResources` table.
- `src/app/(modals)/signal-deck.tsx` — wire real export + paywall sheet, flip assets to `exported`.
- `src/app/(modals)/launch-library.tsx` — add save toggle + "Saved" category.
- `src/constants/launchResources.ts` — add `"Saved"` to `RESOURCE_CATEGORIES`.
- `src/components/DataSync.tsx` — inject saved-resources Convex adapter (mirror mission adapter).

**Part B creates:**

- `src/lib/ribbons.ts` + `src/lib/ribbons.test.ts` — derive service ribbons from progress.
- `src/components/ui/SuccessBurst.tsx` — reusable one-shot success animation.

**Part B modifies:**

- `src/components/ui/Button.tsx`, `src/components/ui/Card.tsx` — forward `testID` + `accessibilityLabel`.
- `src/app/(modals)/profile.tsx` — dynamic ribbons.
- Screen files as needed for empty/loading/error + 44px tap targets.

**Part C creates:** one `*.test.tsx`/`*.test.ts` per QA domain (paths in each task) + `Docs/11_QA_MANUAL_RESULTS.md`.

**Part C modifies:** `package.json`, `jest.config.js` (add `convex-test` + `@edge-runtime/vm`); adds `convex/*.test.ts` backend tests.

---

# PART A — Feature Completion

## Task A1: Signal Pack file builders (pure)

The `Transmit Sequence` button currently shows `signal-pack.zip exported (mock)` and builds nothing (`src/app/(modals)/signal-deck.tsx:149-154`). `Docs/07` requires a real ZIP containing `signal-schedule.csv`, `signal-schedule.json`, `{label}.txt` for flight-ready assets, and a `README.md`. Build the pure file set first (no native deps).

**Files:**

- Create: `src/lib/signalPack.ts`
- Test: `src/lib/signalPack.test.ts`

- [ ] **Step 1: Write the failing test**

```typescript
// src/lib/signalPack.test.ts
import {
  buildSignalPackRows,
  buildSignalScheduleCsv,
  buildSignalScheduleJson,
  buildSignalPackFiles,
  slugifyLabel,
} from "./signalPack";
import { SIGNAL_TEMPLATES } from "@/constants/signalTemplates";
import type { Asset } from "@/types";

const LAUNCH = new Date("2026-07-01T00:00:00").getTime();

function asset(over: Partial<Asset>): Asset {
  return {
    id: "a1",
    type: "signal_asset",
    title: "Dev log thread",
    content: "Hello world",
    status: "flight_ready",
    category: "social",
    updatedAt: 0,
    ...over,
  };
}

it("builds one row per signal in template order", () => {
  const rows = buildSignalPackRows([], LAUNCH);
  expect(rows).toHaveLength(SIGNAL_TEMPLATES.length);
  expect(rows[0].order).toBe(1);
  expect(rows.every((r) => r.status === "not_loaded")).toBe(true);
});

it("reflects linked asset status and content in a row", () => {
  const signal = SIGNAL_TEMPLATES[0];
  const rows = buildSignalPackRows([asset({ signalId: signal.id })], LAUNCH);
  const row = rows.find((r) => r.label === signal.label)!;
  expect(row.status).toBe("flight_ready");
  expect(row.content).toBe("Hello world");
  expect(row.scheduledAt).not.toBe("");
});

it("CSV has a header row and escapes commas/quotes", () => {
  const rows = buildSignalPackRows(
    [asset({ signalId: SIGNAL_TEMPLATES[0].id, title: 'A, "B"' })],
    LAUNCH,
  );
  const csv = buildSignalScheduleCsv(rows);
  const lines = csv.split("\n");
  expect(lines[0]).toBe(
    "order,phase,label,platform,assetType,scheduledAt,status",
  );
  expect(lines).toHaveLength(rows.length + 1);
});

it("JSON omits raw content (metadata only) and is valid", () => {
  const rows = buildSignalPackRows([], LAUNCH);
  const parsed = JSON.parse(buildSignalScheduleJson(rows));
  expect(parsed).toHaveLength(rows.length);
  expect(parsed[0]).not.toHaveProperty("content");
  expect(parsed[0]).toHaveProperty("label");
});

it("file set includes csv/json/readme always, and a txt only for flight-ready content", () => {
  const ready = asset({ id: "a1", signalId: SIGNAL_TEMPLATES[0].id });
  const draft = asset({
    id: "a2",
    signalId: SIGNAL_TEMPLATES[1].id,
    status: "in_prep",
  });
  const files = buildSignalPackFiles([ready, draft], LAUNCH);
  const names = files.map((f) => f.name);
  expect(names).toContain("signal-schedule.csv");
  expect(names).toContain("signal-schedule.json");
  expect(names).toContain("README.md");
  expect(names.filter((n) => n.endsWith(".txt"))).toHaveLength(1);
});

it("slugifyLabel makes filesystem-safe names", () => {
  expect(slugifyLabel("TikTok behind-the-scenes!")).toBe(
    "tiktok-behind-the-scenes",
  );
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx jest src/lib/signalPack.test.ts`
Expected: FAIL — `Cannot find module './signalPack'`.

- [ ] **Step 3: Write the implementation**

```typescript
// src/lib/signalPack.ts
import { signalStatus } from "@/components/signal/status";
import { SIGNAL_TEMPLATES } from "@/constants/signalTemplates";
import { signalTimestamp } from "@/lib/signalCalendar";
import type { Asset } from "@/types";

export interface SignalPackRow {
  order: number;
  phase: string;
  label: string;
  platform: string;
  assetType: string;
  /** ISO 8601, or "" when the mission has no launch date. */
  scheduledAt: string;
  status: "not_loaded" | "in_prep" | "flight_ready";
  /** Linked asset body; empty unless flight-ready content exists. */
  content: string;
}

export interface SignalPackFile {
  name: string;
  content: string;
}

export const SIGNAL_PACK_README = `# LaunchDeckAI — Signal Pack

This pack contains your full launch promotion sequence.

## Files
- \`signal-schedule.csv\` — every signal with platform, timing, and status. Import into Buffer or Later as a posting schedule.
- \`signal-schedule.json\` — the same schedule as structured data for Zapier, Make, or n8n.
- \`content/*.txt\` — ready-to-post copy for each flight-ready signal.

## Import tips
- **Buffer / Later:** create posts from each row in the CSV; paste the matching \`content/*.txt\` body.
- **Zapier / Make / n8n:** trigger on \`scheduledAt\`, read \`label\`/\`platform\`, and post the content file.

Generated by LaunchDeckAI.`;

export function buildSignalPackRows(
  assets: Asset[],
  launchDate?: number,
): SignalPackRow[] {
  return [...SIGNAL_TEMPLATES]
    .sort((a, b) => a.order - b.order)
    .map((s) => {
      const ts = signalTimestamp(s.relativeTiming, launchDate);
      const linked = assets.find((a) => a.signalId === s.id);
      const status = signalStatus(s.id, assets);
      return {
        order: s.order,
        phase: s.phase,
        label: s.label,
        platform: s.platform,
        assetType: s.assetType,
        scheduledAt: ts ? new Date(ts).toISOString() : "",
        status,
        content:
          status === "flight_ready" ? (linked?.content?.trim() ?? "") : "",
      };
    });
}

function csvCell(value: string): string {
  return /[",\n]/.test(value) ? `"${value.replace(/"/g, '""')}"` : value;
}

export function buildSignalScheduleCsv(rows: SignalPackRow[]): string {
  const header = [
    "order",
    "phase",
    "label",
    "platform",
    "assetType",
    "scheduledAt",
    "status",
  ];
  const body = rows.map((r) =>
    [
      r.order,
      r.phase,
      r.label,
      r.platform,
      r.assetType,
      r.scheduledAt,
      r.status,
    ]
      .map((c) => csvCell(String(c)))
      .join(","),
  );
  return [header.join(","), ...body].join("\n");
}

export function buildSignalScheduleJson(rows: SignalPackRow[]): string {
  const meta = rows.map(({ content, ...rest }) => rest);
  return JSON.stringify(meta, null, 2);
}

export function slugifyLabel(label: string): string {
  return label
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function buildSignalPackFiles(
  assets: Asset[],
  launchDate?: number,
): SignalPackFile[] {
  const rows = buildSignalPackRows(assets, launchDate);
  const files: SignalPackFile[] = [
    { name: "signal-schedule.csv", content: buildSignalScheduleCsv(rows) },
    { name: "signal-schedule.json", content: buildSignalScheduleJson(rows) },
    { name: "README.md", content: SIGNAL_PACK_README },
  ];
  for (const r of rows) {
    if (r.status === "flight_ready" && r.content) {
      const num = String(r.order).padStart(2, "0");
      files.push({
        name: `content/${num}-${slugifyLabel(r.label)}.txt`,
        content: r.content,
      });
    }
  }
  return files;
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx jest src/lib/signalPack.test.ts`
Expected: PASS (6 tests).

- [ ] **Step 5: Commit**

```bash
git add src/lib/signalPack.ts src/lib/signalPack.test.ts
git commit -m "feat(signal): pure signal-pack file builders (csv/json/readme/txt)"
```

---

## Task A2: Zip + share the signal pack (native glue)

**Files:**

- Modify: `package.json` (add deps)
- Create: `src/lib/exportSignalPack.ts`
- Test: `src/lib/exportSignalPack.test.ts`

- [ ] **Step 1: Add dependencies**

Run:

```bash
npx expo install expo-file-system
npm install jszip
npm install --save-dev @types/jszip
```

Expected: `jszip` and `expo-file-system` appear in `package.json` dependencies.

- [ ] **Step 2: Write the failing test**

```typescript
// src/lib/exportSignalPack.test.ts
import type { Asset } from "@/types";

const fileMock = jest.fn();
const generateAsync = jest.fn(async () => "BASE64ZIP");
jest.mock("jszip", () =>
  jest.fn().mockImplementation(() => ({ file: fileMock, generateAsync })),
);
jest.mock("expo-file-system/legacy", () => ({
  cacheDirectory: "file:///cache/",
  EncodingType: { Base64: "base64" },
  writeAsStringAsync: jest.fn(async () => undefined),
}));
const shareAsync = jest.fn(async () => undefined);
jest.mock("expo-sharing", () => ({
  isAvailableAsync: jest.fn(async () => true),
  shareAsync: (...a: unknown[]) => shareAsync(...a),
}));
jest.mock("react-native", () => ({ Platform: { OS: "ios" } }));

import { exportSignalPack } from "./exportSignalPack";
import { SIGNAL_TEMPLATES } from "@/constants/signalTemplates";

function asset(over: Partial<Asset>): Asset {
  return {
    id: "a1",
    type: "signal_asset",
    title: "t",
    content: "body",
    status: "flight_ready",
    category: "social",
    updatedAt: 0,
    ...over,
  };
}

beforeEach(() => jest.clearAllMocks());

it("zips every pack file and shares the archive", async () => {
  await exportSignalPack(
    [asset({ signalId: SIGNAL_TEMPLATES[0].id })],
    Date.now(),
    "FocusFlow",
  );
  // csv + json + readme + 1 flight-ready txt = 4 entries
  expect(fileMock).toHaveBeenCalledTimes(4);
  expect(generateAsync).toHaveBeenCalledWith({ type: "base64" });
  expect(shareAsync).toHaveBeenCalledTimes(1);
});

it("returns the ids of flight-ready assets to flip to exported", async () => {
  const ids = await exportSignalPack(
    [
      asset({ id: "x", signalId: SIGNAL_TEMPLATES[0].id }),
      asset({ id: "y", status: "in_prep" }),
    ],
    Date.now(),
    "App",
  );
  expect(ids).toEqual(["x"]);
});
```

- [ ] **Step 3: Run test to verify it fails**

Run: `npx jest src/lib/exportSignalPack.test.ts`
Expected: FAIL — `Cannot find module './exportSignalPack'`.

- [ ] **Step 4: Write the implementation**

> Note: SDK 56 splits `expo-file-system` into a new API and a `/legacy` API. We use `/legacy` for `cacheDirectory` + `writeAsStringAsync`, mirroring how the rest of the app shares files. Web uses an anchor download (matches `exportPdf.ts` web branch using the browser).

```typescript
// src/lib/exportSignalPack.ts
import * as FileSystem from "expo-file-system/legacy";
import * as Sharing from "expo-sharing";
import JSZip from "jszip";
import { Platform } from "react-native";

import { buildSignalPackFiles } from "@/lib/signalPack";
import type { Asset } from "@/types";

/**
 * Build the signal-pack file set, zip it, and hand it to the OS share sheet.
 * Returns the ids of the flight-ready assets that were packaged, so the caller
 * can flip them to `exported` after a successful share (Docs/07).
 */
export async function exportSignalPack(
  assets: Asset[],
  launchDate: number | undefined,
  appName = "Launch",
): Promise<string[]> {
  const files = buildSignalPackFiles(assets, launchDate);
  const zip = new JSZip();
  for (const f of files) zip.file(f.name, f.content);
  const base64 = await zip.generateAsync({ type: "base64" });

  const fileName = `${appName.replace(/[^a-z0-9]+/gi, "-")}-signal-pack.zip`;

  if (Platform.OS === "web") {
    const link = document.createElement("a");
    link.href = `data:application/zip;base64,${base64}`;
    link.download = fileName;
    link.click();
  } else {
    const uri = `${FileSystem.cacheDirectory}${fileName}`;
    await FileSystem.writeAsStringAsync(uri, base64, {
      encoding: FileSystem.EncodingType.Base64,
    });
    if (await Sharing.isAvailableAsync()) {
      await Sharing.shareAsync(uri, {
        mimeType: "application/zip",
        dialogTitle: "Signal Pack",
        UTI: "public.zip-archive",
      });
    }
  }

  return assets.filter((a) => a.status === "flight_ready").map((a) => a.id);
}
```

- [ ] **Step 5: Run test to verify it passes**

Run: `npx jest src/lib/exportSignalPack.test.ts`
Expected: PASS (2 tests).

- [ ] **Step 6: Commit**

```bash
git add package.json package-lock.json src/lib/exportSignalPack.ts src/lib/exportSignalPack.test.ts
git commit -m "feat(signal): real signal-pack.zip export via jszip + expo-file-system"
```

---

## Task A3: Cadet paywall sheet + wire real export into Signal Deck

`Docs/07` requires a paywall bottom sheet (not a silent redirect) for Cadet, and on Commander+ the export must actually run and flip flight-ready assets to `exported`.

**Files:**

- Create: `src/components/signal/TransmitPaywallSheet.tsx`
- Test: `src/components/signal/TransmitPaywallSheet.test.tsx`
- Modify: `src/app/(modals)/signal-deck.tsx`

- [ ] **Step 1: Write the failing test for the sheet**

```tsx
// src/components/signal/TransmitPaywallSheet.test.tsx
import { render, screen, fireEvent } from "@testing-library/react-native";
import { TransmitPaywallSheet } from "./TransmitPaywallSheet";

jest.mock("@/components/ui/GradientView", () => ({ GradientView: () => null }));

it("renders the exact paywall copy and both buttons", () => {
  render(
    <TransmitPaywallSheet
      visible
      onUpgrade={jest.fn()}
      onDismiss={jest.fn()}
    />,
  );
  expect(screen.getByText("Export needs Commander.")).toBeTruthy();
  expect(screen.getByText("Upgrade to Commander")).toBeTruthy();
  expect(screen.getByText("Maybe later")).toBeTruthy();
});

it("fires onUpgrade and onDismiss from the buttons", () => {
  const onUpgrade = jest.fn();
  const onDismiss = jest.fn();
  render(
    <TransmitPaywallSheet
      visible
      onUpgrade={onUpgrade}
      onDismiss={onDismiss}
    />,
  );
  fireEvent.press(screen.getByText("Upgrade to Commander"));
  expect(onUpgrade).toHaveBeenCalled();
  fireEvent.press(screen.getByText("Maybe later"));
  expect(onDismiss).toHaveBeenCalled();
});

it("renders nothing when not visible", () => {
  render(
    <TransmitPaywallSheet
      visible={false}
      onUpgrade={jest.fn()}
      onDismiss={jest.fn()}
    />,
  );
  expect(screen.queryByText("Export needs Commander.")).toBeNull();
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx jest src/components/signal/TransmitPaywallSheet.test.tsx`
Expected: FAIL — `Cannot find module './TransmitPaywallSheet'`.

- [ ] **Step 3: Implement the sheet (exact Docs/07 copy)**

```tsx
// src/components/signal/TransmitPaywallSheet.tsx
import { Modal } from "react-native";

import { Button } from "@/components/ui/Button";
import { Pressable, Text, View } from "@/tw";

export function TransmitPaywallSheet({
  visible,
  onUpgrade,
  onDismiss,
}: {
  visible: boolean;
  onUpgrade: () => void;
  onDismiss: () => void;
}) {
  if (!visible) return null;
  return (
    <Modal visible transparent animationType="slide" onRequestClose={onDismiss}>
      <Pressable
        className="flex-1 justify-end bg-black/60"
        accessibilityLabel="Dismiss paywall"
        onPress={onDismiss}
      >
        <Pressable className="gap-3 rounded-t-3xl bg-bg-card px-6 pb-10 pt-6">
          <Text className="font-display text-2xl font-bold text-text-primary">
            Export needs Commander.
          </Text>
          <Text className="font-body text-base text-text-secondary">
            Package your full launch sequence into one clean ZIP file with your
            schedule, platform timing, and ready-to-post content.
          </Text>
          <Text className="font-body text-base text-text-secondary">
            No scrambling. No copy-paste maze. Just your launch signals packed
            and ready.
          </Text>
          <Button
            label="Upgrade to Commander"
            variant="premium"
            className="mt-2"
            onPress={onUpgrade}
          />
          <Button label="Maybe later" variant="ghost" onPress={onDismiss} />
        </Pressable>
      </Pressable>
    </Modal>
  );
}
```

- [ ] **Step 4: Run sheet test to verify it passes**

Run: `npx jest src/components/signal/TransmitPaywallSheet.test.tsx`
Expected: PASS (3 tests).

- [ ] **Step 5: Wire export + sheet into the Signal Deck**

In `src/app/(modals)/signal-deck.tsx`, replace the mock transmit logic. Add imports near the existing imports:

```tsx
import { exportSignalPack } from "@/lib/exportSignalPack";
import { TransmitPaywallSheet } from "@/components/signal/TransmitPaywallSheet";
```

Replace the component's state + `onTransmit` (currently `signal-deck.tsx:84-111`) with:

```tsx
const router = useRouter();
const { mission, assets, updateAssetStatus } = useMissionStore();
const plan = useUIStore((s) => s.plan);
const [exported, setExported] = useState(false);
const [paywall, setPaywall] = useState(false);
const [view, setView] = useState<DeckView>("list");

// ...existing useEffect + t + readyCount + canExport unchanged...

const runExport = async () => {
  const ids = await exportSignalPack(
    assets,
    mission.launchDate,
    mission.appName,
  );
  ids.forEach((id) => updateAssetStatus(id, "exported"));
  setExported(true);
  haptics.success();
  playSignalTransmit();
};

const onTransmit = () => {
  track("transmit_sequence_tapped", { canExport });
  if (!canExport) {
    setPaywall(true);
    return;
  }
  void runExport();
};
```

Update the export confirmation text (currently `signal-deck.tsx:149-159`) to drop "(mock)":

```tsx
{
  exported ? (
    <Text className="mt-2 font-body text-sm text-status-success">
      ✓ signal-pack.zip exported — schedule, JSON, and flight-ready content.
    </Text>
  ) : null;
}
```

Add the sheet just before the closing `</View>` of the component's return (after the `</ScrollView>`):

```tsx
      <TransmitPaywallSheet
        visible={paywall}
        onUpgrade={() => {
          setPaywall(false);
          router.push("/(modals)/refuel");
        }}
        onDismiss={() => setPaywall(false)}
      />
    </View>
```

- [ ] **Step 6: Verify the suite still passes**

Run: `npx jest src/components/signal src/lib/signalPack.test.ts src/lib/exportSignalPack.test.ts`
Expected: PASS.

- [ ] **Step 7: Commit**

```bash
git add src/components/signal/TransmitPaywallSheet.tsx src/components/signal/TransmitPaywallSheet.test.tsx "src/app/(modals)/signal-deck.tsx"
git commit -m "feat(signal): Cadet transmit paywall sheet + real export wired into Signal Deck"
```

---

## Task A4: Launch Library — save resources

`Docs/06 §8` lists "Save resource" + a "Saved Resources" category. Today `launch-library.tsx` only filters + opens links. Add a local-first persisted saved set that delegates to Convex when signed in (mirrors the `mission` store's adapter pattern).

**Files:**

- Modify: `convex/schema.ts`
- Create: `convex/resources.ts`
- Create: `src/store/savedResources.ts`
- Test: `src/store/savedResources.test.ts`
- Modify: `src/constants/launchResources.ts`, `src/app/(modals)/launch-library.tsx`, `src/components/DataSync.tsx`

- [ ] **Step 1: Add the Convex table**

In `convex/schema.ts`, add to the `defineSchema({...})` object (alongside the other tables):

```typescript
  savedResources: defineTable({
    userId: v.id("users"),
    resourceId: v.string(),
  })
    .index("by_userId", ["userId"])
    .index("by_user_resource", ["userId", "resourceId"]),
```

- [ ] **Step 2: Add Convex query + mutation**

```typescript
// convex/resources.ts
import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { requireUser } from "./helpers";

/** Resource ids the signed-in user has saved (Docs/06 §8 Launch Library). */
export const listSaved = query({
  args: {},
  handler: async (ctx) => {
    const user = await requireUser(ctx);
    if (!user) return [];
    const rows = await ctx.db
      .query("savedResources")
      .withIndex("by_userId", (q) => q.eq("userId", user._id))
      .collect();
    return rows.map((r) => r.resourceId);
  },
});

/** Toggle a resource saved/unsaved. Returns the new saved state. */
export const toggleSaved = mutation({
  args: { resourceId: v.string() },
  handler: async (ctx, { resourceId }) => {
    const user = await requireUser(ctx);
    if (!user) return false;
    const existing = await ctx.db
      .query("savedResources")
      .withIndex("by_user_resource", (q) =>
        q.eq("userId", user._id).eq("resourceId", resourceId),
      )
      .unique();
    if (existing) {
      await ctx.db.delete(existing._id);
      return false;
    }
    await ctx.db.insert("savedResources", { userId: user._id, resourceId });
    return true;
  },
});
```

> Confirm `requireUser` is exported from `convex/helpers.ts` (it is, per the audit). If it returns a throwing variant, use the non-throwing `getCurrentUser`-style lookup instead and keep the `if (!user) return` guards.

- [ ] **Step 3: Write the failing store test**

```typescript
// src/store/savedResources.test.ts
import { useSavedResourcesStore } from "./savedResources";

beforeEach(() => {
  useSavedResourcesStore.setState({ saved: [], convexToggle: null });
});

it("toggles a resource id on and off locally", () => {
  const { toggle } = useSavedResourcesStore.getState();
  toggle("r1");
  expect(useSavedResourcesStore.getState().isSaved("r1")).toBe(true);
  toggle("r1");
  expect(useSavedResourcesStore.getState().isSaved("r1")).toBe(false);
});

it("delegates to the Convex adapter when signed in", () => {
  const convexToggle = jest.fn();
  useSavedResourcesStore.setState({ convexToggle });
  useSavedResourcesStore.getState().toggle("r2");
  expect(convexToggle).toHaveBeenCalledWith("r2");
  // optimistic local update still applies for instant UI feedback
  expect(useSavedResourcesStore.getState().isSaved("r2")).toBe(true);
});

it("hydrate replaces the saved set from the server", () => {
  useSavedResourcesStore.getState().hydrate(["r5", "r6"]);
  expect(useSavedResourcesStore.getState().saved).toEqual(["r5", "r6"]);
});
```

- [ ] **Step 4: Run test to verify it fails**

Run: `npx jest src/store/savedResources.test.ts`
Expected: FAIL — `Cannot find module './savedResources'`.

- [ ] **Step 5: Implement the store**

```typescript
// src/store/savedResources.ts
import { create } from "zustand";

type SavedState = {
  saved: string[];
  convexToggle: ((resourceId: string) => void) | null;
  isSaved: (id: string) => boolean;
  toggle: (id: string) => void;
  hydrate: (ids: string[]) => void;
  setConvexToggle: (fn: ((resourceId: string) => void) | null) => void;
};

export const useSavedResourcesStore = create<SavedState>((set, get) => ({
  saved: [],
  convexToggle: null,
  isSaved: (id) => get().saved.includes(id),
  toggle: (id) => {
    const { saved, convexToggle } = get();
    const next = saved.includes(id)
      ? saved.filter((x) => x !== id)
      : [...saved, id];
    set({ saved: next });
    convexToggle?.(id);
  },
  hydrate: (ids) => set({ saved: ids }),
  setConvexToggle: (fn) => set({ convexToggle: fn }),
}));
```

- [ ] **Step 6: Run test to verify it passes**

Run: `npx jest src/store/savedResources.test.ts`
Expected: PASS (3 tests).

- [ ] **Step 7: Add the "Saved" category + save toggle to the screen**

In `src/constants/launchResources.ts`, append `"Saved"` to `RESOURCE_CATEGORIES`:

```typescript
export const RESOURCE_CATEGORIES = [
  "All",
  "App Store",
  "Google Play",
  "Legal & Privacy",
  "Marketing",
  "Beta Testing",
  "Analytics",
  "Monetization",
  "Design",
  "AI Tools",
  "Saved",
] as const;
```

In `src/app/(modals)/launch-library.tsx`, import the store and apply the saved filter + a heart toggle. Replace the `filtered` computation and the resource card's action row:

```tsx
import { useSavedResourcesStore } from "@/store/savedResources";

// inside the component:
const isSaved = useSavedResourcesStore((s) => s.isSaved);
const toggleSaved = useSavedResourcesStore((s) => s.toggle);
const savedIds = useSavedResourcesStore((s) => s.saved);

const filtered = LAUNCH_RESOURCES.filter((r) => {
  const matchesCat =
    category === "All" ||
    (category === "Saved" ? savedIds.includes(r.id) : r.category === category);
  const q = query.trim().toLowerCase();
  const matchesQuery =
    !q ||
    r.title.toLowerCase().includes(q) ||
    r.description.toLowerCase().includes(q);
  return matchesCat && matchesQuery;
});
```

Replace the card action row (currently `launch-library.tsx:60-65`):

```tsx
<View className="mt-2 flex-row items-center justify-between">
  <Text className="font-mono text-[11px] uppercase tracking-wider text-text-tertiary">
    {r.category}
  </Text>
  <View className="flex-row items-center gap-2">
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={
        isSaved(r.id) ? `Unsave ${r.title}` : `Save ${r.title}`
      }
      hitSlop={8}
      onPress={() => toggleSaved(r.id)}
      className="px-2 py-1"
    >
      <Text className="text-lg">{isSaved(r.id) ? "★" : "☆"}</Text>
    </Pressable>
    <Button
      label="Open →"
      size="sm"
      variant="ghost"
      onPress={() => Linking.openURL(r.url)}
    />
  </View>
</View>
```

Add an empty state for the "Saved" tab with nothing saved (the existing `EmptyState` already covers `filtered.length === 0`; update its copy to be contextual):

```tsx
        {filtered.length === 0 ? (
          <EmptyState
            icon="🔭"
            title={category === "Saved" ? "No saved resources yet" : "No resources found"}
            message={
              category === "Saved"
                ? "Tap the ☆ on any resource to save it here."
                : "Try a different search or category."
            }
          />
        ) : (
```

- [ ] **Step 8: Inject the Convex adapter in DataSync**

In `src/components/DataSync.tsx`, where the mission/UI adapters are wired after sign-in, add (use the generated API + `useMutation`/`useQuery` already imported there):

```tsx
import { useSavedResourcesStore } from "@/store/savedResources";
// ...
const savedIds = useQuery(api.resources.listSaved);
const toggleSavedResource = useMutation(api.resources.toggleSaved);

useEffect(() => {
  if (savedIds) useSavedResourcesStore.getState().hydrate(savedIds);
}, [savedIds]);

useEffect(() => {
  useSavedResourcesStore.getState().setConvexToggle((id) => {
    void toggleSavedResource({ resourceId: id });
  });
  return () => useSavedResourcesStore.getState().setConvexToggle(null);
}, [toggleSavedResource]);
```

- [ ] **Step 9: Run the full suite + typecheck**

Run: `npx jest && npx tsc --noEmit`
Expected: PASS, no type errors. (Convex codegen: run `npx convex codegen` if `api.resources` is missing.)

- [ ] **Step 10: Commit**

```bash
git add convex/schema.ts convex/resources.ts src/store/savedResources.ts src/store/savedResources.test.ts src/constants/launchResources.ts "src/app/(modals)/launch-library.tsx" src/components/DataSync.tsx
git commit -m "feat(library): save resources (Saved category) with local-first + Convex persistence"
```

---

# PART B — Polish & Accessibility

This Part makes the UI testable and accessible. Task B1 (testID/label forwarding) is a prerequisite for several Part C suites — do it first.

## Task B1: Forward `testID` + `accessibilityLabel` on Button and Card

The audit found `Button` and `Card` expose no `testID`/`accessibilityLabel`, forcing brittle text queries and failing the "icon-only buttons have labels" a11y rule. Add them.

**Files:**

- Modify: `src/components/ui/Button.tsx`, `src/components/ui/Card.tsx`
- Test: `src/components/ui/Button.a11y.test.tsx`

- [ ] **Step 1: Write the failing test**

```tsx
// src/components/ui/Button.a11y.test.tsx
import { render, screen, fireEvent } from "@testing-library/react-native";
import { Button } from "./Button";

jest.mock("@/components/ui/GradientView", () => ({ GradientView: () => null }));

it("exposes an accessibilityLabel (falling back to the label) and testID", () => {
  render(
    <Button label="Transmit →" testID="transmit-btn" onPress={jest.fn()} />,
  );
  expect(screen.getByTestId("transmit-btn")).toBeTruthy();
  // label arrow is stripped for display but the a11y name stays meaningful
  expect(screen.getByLabelText("Transmit")).toBeTruthy();
});

it("prefers an explicit accessibilityLabel over the visible label", () => {
  render(
    <Button
      label="🔒"
      accessibilityLabel="Transmit Sequence (locked)"
      onPress={jest.fn()}
    />,
  );
  expect(screen.getByLabelText("Transmit Sequence (locked)")).toBeTruthy();
});

it("does not fire onPress when disabled", () => {
  const onPress = jest.fn();
  render(<Button label="Go" testID="go" disabled onPress={onPress} />);
  fireEvent.press(screen.getByTestId("go"));
  expect(onPress).not.toHaveBeenCalled();
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx jest src/components/ui/Button.a11y.test.tsx`
Expected: FAIL — `getByTestId`/`getByLabelText` find nothing.

- [ ] **Step 3: Add the props to Button**

In `src/components/ui/Button.tsx`, extend the props type:

```tsx
type Props = {
  label: string;
  onPress?: () => void;
  variant?: ButtonVariant;
  size?: "sm" | "md" | "lg";
  disabled?: boolean;
  loading?: boolean;
  fullWidth?: boolean;
  left?: React.ReactNode;
  className?: string;
  testID?: string;
  accessibilityLabel?: string;
};
```

On the root `Pressable`, forward them. The visible label is already stripped of a trailing arrow into `trimmed`; reuse it as the a11y fallback:

```tsx
    <Pressable
      testID={testID}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel ?? trimmed}
      accessibilityState={{ disabled: Boolean(disabled || loading) }}
      disabled={disabled || loading}
      onPress={onPress}
      // ...existing className/style...
    >
```

- [ ] **Step 4: Add the same to Card**

In `src/components/ui/Card.tsx`, add `testID?: string` and `accessibilityLabel?: string` to props and forward to the underlying `Pressable`/`View` (when `onPress` is set, render a `Pressable` with `accessibilityRole="button"`).

```tsx
// props
testID?: string;
accessibilityLabel?: string;
// on the rendered element:
testID={testID}
accessibilityLabel={accessibilityLabel}
```

- [ ] **Step 5: Run test to verify it passes**

Run: `npx jest src/components/ui/Button.a11y.test.tsx`
Expected: PASS (3 tests). Also run `npx jest src/components/ui/FoundryToolCard.test.tsx` to confirm no regression in existing Button consumers.

- [ ] **Step 6: Commit**

```bash
git add src/components/ui/Button.tsx src/components/ui/Card.tsx src/components/ui/Button.a11y.test.tsx
git commit -m "feat(ui): forward testID + accessibilityLabel on Button and Card"
```

---

## Task B2: Dynamic service ribbons in Profile

`profile.tsx` hardcodes three ribbons. `Docs/06 §10` wants ribbons that reflect real progress. Extract a pure deriver and render it.

**Files:**

- Create: `src/lib/ribbons.ts`
- Test: `src/lib/ribbons.test.ts`
- Modify: `src/app/(modals)/profile.tsx`

- [ ] **Step 1: Write the failing test**

```typescript
// src/lib/ribbons.test.ts
import { deriveRibbons } from "./ribbons";

it("awards First Launch once any milestone is complete", () => {
  const ribbons = deriveRibbons({
    completedMilestones: 1,
    forgedAssets: 0,
    signalsReady: 0,
    streak: 0,
  });
  expect(ribbons.find((r) => r.id === "first_launch")?.earned).toBe(true);
});

it("locks Forge Master until 3 assets are forged", () => {
  expect(
    deriveRibbons({
      completedMilestones: 0,
      forgedAssets: 2,
      signalsReady: 0,
      streak: 0,
    }).find((r) => r.id === "forge_master")?.earned,
  ).toBe(false);
  expect(
    deriveRibbons({
      completedMilestones: 0,
      forgedAssets: 3,
      signalsReady: 0,
      streak: 0,
    }).find((r) => r.id === "forge_master")?.earned,
  ).toBe(true);
});

it("always returns the full ribbon catalog (earned + unearned)", () => {
  const ribbons = deriveRibbons({
    completedMilestones: 0,
    forgedAssets: 0,
    signalsReady: 0,
    streak: 0,
  });
  expect(ribbons).toHaveLength(4);
  expect(ribbons.every((r) => r.earned === false)).toBe(true);
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx jest src/lib/ribbons.test.ts`
Expected: FAIL — `Cannot find module './ribbons'`.

- [ ] **Step 3: Implement the deriver**

```typescript
// src/lib/ribbons.ts
export interface RibbonInput {
  completedMilestones: number;
  forgedAssets: number;
  signalsReady: number;
  streak: number;
}

export interface Ribbon {
  id: "first_launch" | "forge_master" | "comms_online" | "streak_keeper";
  icon: string;
  label: string;
  earned: boolean;
}

export function deriveRibbons(input: RibbonInput): Ribbon[] {
  return [
    {
      id: "first_launch",
      icon: "🚀",
      label: "First Launch",
      earned: input.completedMilestones >= 1,
    },
    {
      id: "forge_master",
      icon: "🔨",
      label: "Forge Master",
      earned: input.forgedAssets >= 3,
    },
    {
      id: "comms_online",
      icon: "📡",
      label: "Comms Online",
      earned: input.signalsReady >= 1,
    },
    {
      id: "streak_keeper",
      icon: "🔥",
      label: "Streak Keeper",
      earned: input.streak >= 3,
    },
  ];
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx jest src/lib/ribbons.test.ts`
Expected: PASS (3 tests).

- [ ] **Step 5: Render in Profile**

In `src/app/(modals)/profile.tsx`, replace the hardcoded ribbon array with derived data. Read counts from the stores (`useMissionStore` for milestones/assets, `signalStatus` for signals-ready, `useUIStore` for streak):

```tsx
import { deriveRibbons } from "@/lib/ribbons";
import { signalStatus } from "@/components/signal/status";
import { SIGNAL_TEMPLATES } from "@/constants/signalTemplates";

// inside the component:
const { milestones, assets } = useMissionStore();
const streak = useUIStore((s) => s.streak);
const ribbons = deriveRibbons({
  completedMilestones: milestones.filter((m) => m.completed).length,
  forgedAssets: assets.length,
  signalsReady: SIGNAL_TEMPLATES.filter(
    (s) => signalStatus(s.id, assets) === "flight_ready",
  ).length,
  streak,
});
```

Render each ribbon, dimming the unearned ones (`opacity-40`) and keeping a non-color cue (a `🔒` glyph or "Locked" label) so status isn't color-only:

```tsx
{
  ribbons.map((r) => (
    <View
      key={r.id}
      className={cn("flex-row items-center gap-2", !r.earned && "opacity-40")}
    >
      <Text className="text-lg">{r.earned ? r.icon : "🔒"}</Text>
      <Text className="font-body text-sm text-text-secondary">{r.label}</Text>
    </View>
  ));
}
```

- [ ] **Step 6: Run + commit**

Run: `npx jest src/lib/ribbons.test.ts && npx tsc --noEmit`
Expected: PASS.

```bash
git add src/lib/ribbons.ts src/lib/ribbons.test.ts "src/app/(modals)/profile.tsx"
git commit -m "feat(profile): derive service ribbons from real launch progress"
```

---

## Task B3: Success micro-animation on milestone completion

`Docs/06 §3` calls for "Animate success" on milestone completion. Add a reusable one-shot burst and trigger it from the missions screen.

**Files:**

- Create: `src/components/ui/SuccessBurst.tsx`
- Test: `src/components/ui/SuccessBurst.test.tsx`
- Modify: `src/app/(tabs)/missions.tsx`

- [ ] **Step 1: Write the failing test**

```tsx
// src/components/ui/SuccessBurst.test.tsx
import { render, screen } from "@testing-library/react-native";
import { SuccessBurst } from "./SuccessBurst";

it("renders its glyph when active", () => {
  render(<SuccessBurst active glyph="✓" testID="burst" />);
  expect(screen.getByTestId("burst")).toBeTruthy();
});

it("renders nothing when inactive", () => {
  render(<SuccessBurst active={false} glyph="✓" testID="burst" />);
  expect(screen.queryByTestId("burst")).toBeNull();
});
```

- [ ] **Step 2: Run to verify it fails**

Run: `npx jest src/components/ui/SuccessBurst.test.tsx`
Expected: FAIL — module not found.

- [ ] **Step 3: Implement (Reanimated, with the test-safe stub already used elsewhere)**

```tsx
// src/components/ui/SuccessBurst.tsx
import Animated, { FadeOut, ZoomIn } from "react-native-reanimated";
import { Text } from "@/tw";

export function SuccessBurst({
  active,
  glyph = "✓",
  testID,
}: {
  active: boolean;
  glyph?: string;
  testID?: string;
}) {
  if (!active) return null;
  return (
    <Animated.View
      testID={testID}
      entering={ZoomIn.springify()}
      exiting={FadeOut}
      pointerEvents="none"
      style={{ position: "absolute", alignSelf: "center" }}
    >
      <Text className="text-4xl text-status-success">{glyph}</Text>
    </Animated.View>
  );
}
```

> The test file must include the reanimated stub used in `SignalActions.test.tsx` (copy the `jest.mock("react-native-reanimated", ...)` block) so the import doesn't initialize native Worklets. Add that block at the top of `SuccessBurst.test.tsx`.

- [ ] **Step 4: Trigger from missions**

In `src/app/(tabs)/missions.tsx`, add a transient `justCompletedId` state. When `completeMilestone(id)` is called, set it, then clear after ~900ms; render `<SuccessBurst active={justCompletedId === m.id} />` inside the milestone row.

```tsx
const [justCompletedId, setJustCompletedId] = useState<string | null>(null);

const onComplete = (id: string) => {
  completeMilestone(id);
  setJustCompletedId(id);
  setTimeout(() => setJustCompletedId(null), 900);
};
```

- [ ] **Step 5: Run + commit**

Run: `npx jest src/components/ui/SuccessBurst.test.tsx`
Expected: PASS (2 tests).

```bash
git add src/components/ui/SuccessBurst.tsx src/components/ui/SuccessBurst.test.tsx "src/app/(tabs)/missions.tsx"
git commit -m "feat(ui): success micro-animation on milestone completion"
```

---

## Task B4: Empty / loading / error coverage audit

`Docs/11` requires empty, loading, and error states per feature. Most screens already have empty states; this task closes the gaps and verifies them with tests in Part C. No new code where states already exist — audit and add only what's missing.

**Files:** Modify screens that lack a state; no new files.

- [ ] **Step 1: Audit each screen** against this matrix and check the box only when all three exist:

| Screen              | Empty                    | Loading            | Error                                        |
| ------------------- | ------------------------ | ------------------ | -------------------------------------------- |
| Deck (`deck.tsx`)   | no-mission fallback      | hydration spinner  | `ErrorState` on query error                  |
| Missions            | all-complete state       | —                  | —                                            |
| Blueprints          | —                        | —                  | —                                            |
| Foundry             | pre-generation hint      | generating spinner | failed-generation message (no fuel deducted) |
| Cargo (`cargo.tsx`) | "guide to Foundry" empty | —                  | —                                            |
| Signal Deck         | (16 always render)       | —                  | —                                            |
| Launch Library      | done in Task A4          | —                  | —                                            |

- [ ] **Step 2:** For any missing cell, add the existing `EmptyState`/`ErrorState`/`ProgressBar` components (do not invent new ones). Foundry's "failed generation does not deduct Fuel" is already enforced server-side (`convex/ai.ts` deducts only after success) — surface a user-visible error toast/text on the catch path if absent.

- [ ] **Step 3: Commit** any changes.

```bash
git add -A
git commit -m "polish: fill empty/loading/error gaps across screens"
```

> Verification of these states is automated in Part C (each domain suite asserts the empty/error branch renders).

---

## Task B5: Accessibility pass — tap targets, labels, non-color status

`Docs/11 §Accessibility`: ≥44px tap targets, icon-only buttons labeled, color not the only status indicator, form labels, understandable errors.

**Files:** Modify interactive components/screens as needed. No new files.

- [ ] **Step 1:** Audit icon-only `Pressable`s (drawer toggle, modal close, calendar nav, save heart) — ensure each has `accessibilityRole="button"` + `accessibilityLabel` and `hitSlop`/min height to reach 44px. `TabBar` and milestone checkboxes already have labels (per audit); verify the close buttons and `SignalCalendar` nav arrows.
- [ ] **Step 2:** Confirm status is never color-only: `SignalBars` already uses bar-count (not just color) ✓; ensure asset status badges include text, and the locked `Button` variant shows a lock glyph (it does ✓).
- [ ] **Step 3:** Add `accessibilityLabel` to form `TextInput`s in onboarding + blueprint detail that rely on placeholder text only.
- [ ] **Step 4: Commit.**

```bash
git add -A
git commit -m "a11y: 44px tap targets, icon-button labels, labeled inputs"
```

---

# PART C — Full QA-Checklist Coverage

`Docs/11_QA_TESTING_CHECKLIST.md` defines ~100 cases across 14 domains. They split into three testable tiers:

1. **Backend-safety cases** (fuel history written, readiness recalculates, ownership enforced, downgrade locks not deletes, fuel never < 0) → automated with `convex-test` (Task C0–C1).
2. **Client logic + render cases** (countdown, gating, status computation, completion flow, paywall, empty/error states) → automated with Jest + RNTL against the Zustand stores and pure helpers (Tasks C2–C9).
3. **Device / 3rd-party cases** (email + Google + Apple OAuth, real RevenueCat purchase/restore, TestFlight/Play builds, physical tap-target/contrast checks) → cannot be unit-tested; covered by a structured manual checklist with recorded results (Task C10).

Each automated task's "definition of done" is: the listed `it()` cases pass **and** every mapped `Docs/11` bullet is represented. Where a render assertion needs a `testID`/label, Part B added it — reference it.

## Task C0: Add Convex backend test tooling

**Files:** Modify `package.json`; create `convex/test.setup.ts` (helper to seed a user + mission).

- [ ] **Step 1: Install**

Run:

```bash
npm install --save-dev convex-test @edge-runtime/vm
```

- [ ] **Step 2: Confirm jest can load Convex modules.** `convex-test` runs functions in-process against the real `convex/` code using `import.meta.glob`-style module maps. Add a `convex` Jest project or run these suites with the existing jest-expo config — verify with the first test in C1. If `import.meta.glob` is unsupported under jest-expo, run Convex suites via a dedicated `vitest` config instead (convex-test's first-class runner) and keep RNTL suites on Jest. Decide based on C1 Step 2 output.

- [ ] **Step 3: Seed helper**

```typescript
// convex/test.setup.ts
/// <reference types="vite/client" />
import { convexTest } from "convex-test";
import schema from "./schema";

// Required so convex-test can discover function files (see convex/_generated/ai/guidelines.md).
const modules = import.meta.glob("./**/*.ts");

/** A test Convex instance with one user (cadet, 25 fuel) + active mission. */
export async function seeded() {
  const t = convexTest(schema, modules);
  const ids = await t.run(async (ctx) => {
    const userId = await ctx.db.insert("users", {
      clerkId: "clerk_test",
      email: "t@t.io",
      displayName: "Tester",
      plan: "cadet",
      fuelBalance: 25,
      currentStreak: 0,
      level: 1,
    });
    const missionId = await ctx.db.insert("missions", {
      userId,
      appName: "TestApp",
      appDescription: "",
      oneLiner: "",
      targetAudience: "",
      platform: "both",
      stage: "building",
      status: "active",
      readinessScore: 0,
    });
    return { userId, missionId };
  });
  return { t, ...ids };
}
```

> Field names must match `convex/schema.ts` exactly. If schema requires extra fields (e.g. timestamps), add them here.

- [ ] **Step 4: Commit**

```bash
git add package.json package-lock.json convex/test.setup.ts
git commit -m "test(convex): add convex-test tooling + seed helper"
```

---

## Task C1: Backend-safety tests (Convex mutations)

Covers `Docs/11`: Missions (fuel awarded, fuel history written, readiness recalculates, ownership), Foundry (no fuel deduct on failure), Refuel (downgrade locks without deleting data), plus the schema rules "fuel cannot go below zero" and "all user queries verify ownership."

**Files:** Create `convex/milestones.test.ts`, `convex/assets.test.ts`, `convex/subscriptions.test.ts`.

- [ ] **Step 1: Write the failing milestone test**

```typescript
// convex/milestones.test.ts
import { api } from "./_generated/api";
import { seeded } from "./test.setup";

it("completing a milestone awards fuel and writes fuel history", async () => {
  const { t, userId, missionId } = await seeded();
  const milestoneId = await t.run((ctx) =>
    ctx.db.insert("milestones", {
      missionId,
      templateId: "tmpl_1",
      title: "Set up",
      description: "",
      category: "foundation",
      completed: false,
      fuelReward: 10,
      requiredPlan: "cadet",
      isLocked: false,
    }),
  );

  const asUser = t.withIdentity({ subject: "clerk_test" });
  await asUser.mutation(api.milestones.complete, { milestoneId });

  const { user, history, milestone } = await t.run(async (ctx) => ({
    user: await ctx.db.get(userId),
    milestone: await ctx.db.get(milestoneId),
    history: await ctx.db.query("fuelHistory").collect(),
  }));
  expect(milestone?.completed).toBe(true);
  expect(user?.fuelBalance).toBe(35); // 25 + 10
  expect(
    history.some((h) => h.reason === "milestone_completed" && h.amount === 10),
  ).toBe(true);
});

it("recalculates readiness after completion", async () => {
  const { t, missionId } = await seeded();
  const m = await t.run((ctx) =>
    ctx.db.insert("milestones", {
      missionId,
      templateId: "x",
      title: "a",
      description: "",
      category: "foundation",
      completed: false,
      fuelReward: 5,
      requiredPlan: "cadet",
      isLocked: false,
    }),
  );
  const before = await t.run((ctx) => ctx.db.get(missionId));
  await t
    .withIdentity({ subject: "clerk_test" })
    .mutation(api.milestones.complete, { milestoneId: m });
  const after = await t.run((ctx) => ctx.db.get(missionId));
  expect(after!.readinessScore).toBeGreaterThanOrEqual(before!.readinessScore);
});

it("rejects completion from a different user (ownership)", async () => {
  const { t, missionId } = await seeded();
  const m = await t.run((ctx) =>
    ctx.db.insert("milestones", {
      missionId,
      templateId: "x",
      title: "a",
      description: "",
      category: "foundation",
      completed: false,
      fuelReward: 5,
      requiredPlan: "cadet",
      isLocked: false,
    }),
  );
  const intruder = t.withIdentity({ subject: "clerk_other" });
  await expect(
    intruder.mutation(api.milestones.complete, { milestoneId: m }),
  ).rejects.toThrow();
});
```

- [ ] **Step 2: Run to verify it fails meaningfully**

Run: `npx jest convex/milestones.test.ts`
Expected: Either the assertions fail (if `complete` doesn't write history / recalc) **or** `convex-test` can't load under jest-expo. If the latter, switch Convex suites to vitest per C0 Step 2 and re-run with `npx vitest run convex/milestones.test.ts`.

- [ ] **Step 3: Make tests pass** — adjust `convex/milestones.ts` only if a real gap is found (history write, readiness recalc, or ownership check missing). Per the audit, `complete()` already awards fuel + recalcs; this test pins that behavior and surfaces any missing `fuelHistory` insert or ownership guard. Add the missing piece in `convex/milestones.ts` / `convex/helpers.ts` if a test legitimately fails.

- [ ] **Step 4: Foundry fuel-safety + asset ownership**

```typescript
// convex/assets.test.ts
import { api } from "./_generated/api";
import { seeded } from "./test.setup";

it("createFoundryAsset deducts fuel only on success and writes history", async () => {
  const { t, userId } = await seeded();
  const asUser = t.withIdentity({ subject: "clerk_test" });
  await asUser.mutation(api.assets.createFoundryAsset, {
    type: "social_blast",
    title: "Tweet",
    content: "hi",
    category: "social",
    fuelCost: 5,
  });
  const { user, assets, history } = await t.run(async (ctx) => ({
    user: await ctx.db.get(userId),
    assets: await ctx.db.query("assets").collect(),
    history: await ctx.db.query("fuelHistory").collect(),
  }));
  expect(assets).toHaveLength(1);
  expect(user?.fuelBalance).toBe(20); // 25 - 5
  expect(history.some((h) => h.reason === "foundry_generation")).toBe(true);
});

it("rejects when fuel is insufficient and leaves balance unchanged", async () => {
  const { t, userId } = await seeded();
  await t.run((ctx) => ctx.db.patch(userId, { fuelBalance: 2 }));
  const asUser = t.withIdentity({ subject: "clerk_test" });
  await expect(
    asUser.mutation(api.assets.createFoundryAsset, {
      type: "social_blast",
      title: "x",
      content: "y",
      category: "social",
      fuelCost: 5,
    }),
  ).rejects.toThrow();
  const user = await t.run((ctx) => ctx.db.get(userId));
  expect(user?.fuelBalance).toBe(2);
});
```

> Match the real `createFoundryAsset` arg names from `convex/assets.ts`. Adjust the arg object if they differ.

- [ ] **Step 5: Downgrade locks, never deletes (subscriptions)**

```typescript
// convex/subscriptions.test.ts
import { internal } from "./_generated/api";
import { seeded } from "./test.setup";

it("a downgrade lowers plan but keeps all user data", async () => {
  const { t, userId, missionId } = await seeded();
  await t.run((ctx) => ctx.db.patch(userId, { plan: "admiral" }));
  await t.mutation(internal.subscriptions.applyEntitlement, {
    clerkId: "clerk_test",
    plan: "cadet",
    status: "expired",
  });
  const { user, mission } = await t.run(async (ctx) => ({
    user: await ctx.db.get(userId),
    mission: await ctx.db.get(missionId),
  }));
  expect(user?.plan).toBe("cadet"); // locked down
  expect(mission).not.toBeNull(); // data preserved
});
```

- [ ] **Step 6: Run all backend tests + commit**

Run: `npx jest convex/` (or `npx vitest run convex/`)
Expected: PASS.

```bash
git add convex/milestones.test.ts convex/assets.test.ts convex/subscriptions.test.ts
git commit -m "test(convex): backend-safety — fuel history, readiness, ownership, downgrade-lock"
```

---

## Task C2: Deck domain tests

Covers `Docs/11 Deck`: active mission appears, T-Minus correct, no-launch-date fallback, readiness/fuel display, today's action, critical risk card only when needed.

**Files:** Create `src/lib/launch.test.ts` (pure countdown), `src/lib/risks.test.ts` (risk derivation), `src/app/(tabs)/deck.test.tsx` (render).

- [ ] **Step 1: Pure countdown + fallback (no render flakiness)**

```typescript
// src/lib/launch.test.ts
import { tMinus, formatLaunchDate, readinessLabel } from "./launch";

const DAY = 86_400_000;

it("counts down whole days to launch", () => {
  const now = Date.now();
  expect(tMinus(now + 5 * DAY).label).toMatch(/T-5/);
});

it("falls back gracefully with no launch date", () => {
  expect(tMinus(undefined).label).toBeTruthy(); // e.g. "Set a launch date"
  expect(formatLaunchDate(undefined)).toBeTruthy();
});

it("labels readiness bands", () => {
  expect(readinessLabel(0)).toBeTruthy();
  expect(readinessLabel(100)).toBeTruthy();
});
```

> Confirm the exact fallback string from `src/lib/launch.ts` and tighten the assertion (e.g. `.toBe("Set a launch date")`).

- [ ] **Step 2: Risk derivation**

```typescript
// src/lib/risks.test.ts
import { deriveRisks } from "./risks";
import type { Milestone, Asset } from "@/types";

it("returns no critical risk when state is healthy", () => {
  // a fully-complete, asset-rich mission → empty or low-severity list
  const risks = deriveRisks({
    milestones: [],
    assets: [],
    readinessScore: 100,
  } as never);
  expect(Array.isArray(risks)).toBe(true);
});

it("flags a risk when key milestones are incomplete near launch", () => {
  const milestones = [
    { id: "1", completed: false, category: "store", title: "Submit" },
  ] as Milestone[];
  const risks = deriveRisks({
    milestones,
    assets: [] as Asset[],
    readinessScore: 10,
  } as never);
  expect(risks.length).toBeGreaterThan(0);
});
```

> Read `src/lib/risks.ts` for the exact `deriveRisks` signature and shape; adjust inputs/assertions to match. This pins "critical risk appears only when needed."

- [ ] **Step 3: Deck render smoke test** (seeded demo store)

```tsx
// src/app/(tabs)/deck.test.tsx
import { render, screen } from "@testing-library/react-native";
import { useMissionStore } from "@/store/mission";

jest.mock("react-native-reanimated", () => {
  const { ScrollView, View } = require("react-native");
  return {
    __esModule: true,
    default: { ScrollView, View, createAnimatedComponent: (c: unknown) => c },
  };
});
jest.mock("@/components/ui/GradientView", () => ({ GradientView: () => null }));
jest.mock("expo-router", () => ({
  useRouter: () => ({ push: jest.fn() }),
  Link: ({ children }: any) => children,
}));

import Deck from "./deck";

it("shows the active mission name and readiness", () => {
  // demo store ships with a FocusFlow mission
  render(<Deck />);
  expect(
    screen.getByText(useMissionStore.getState().mission.appName),
  ).toBeTruthy();
});
```

- [ ] **Step 4: Run + commit**

Run: `npx jest src/lib/launch.test.ts src/lib/risks.test.ts "src/app/(tabs)/deck.test.tsx"`
Expected: PASS.

```bash
git add src/lib/launch.test.ts src/lib/risks.test.ts "src/app/(tabs)/deck.test.tsx"
git commit -m "test(deck): countdown, risk derivation, mission render"
```

---

## Task C3: Missions domain tests

Covers `Docs/11 Missions`: milestones grouped, complete a milestone, fuel awarded, readiness recalculates, locked milestones visible, locked routes to Refuel. (Backend fuel-history is in C1; this is the client flow.)

**Files:** Create `src/store/mission.milestones.test.ts`.

- [ ] **Step 1: Write tests against the demo store**

```typescript
// src/store/mission.milestones.test.ts
import { useMissionStore } from "@/store/mission";
import { useUIStore } from "@/store/ui";

beforeEach(() => {
  useMissionStore.persist?.clearStorage?.();
  // re-seed demo data by re-importing initial state if the store exposes a reset;
  // otherwise hydrate a known fixture:
  useMissionStore.getState().hydrate({
    mission: useMissionStore.getState().mission,
    milestones: [
      {
        id: "m1",
        title: "A",
        description: "",
        category: "foundation",
        completed: false,
        fuelReward: 10,
        requiredPlan: "cadet",
        isLocked: false,
      },
      {
        id: "m2",
        title: "B",
        description: "",
        category: "store",
        completed: false,
        fuelReward: 5,
        requiredPlan: "commander",
        isLocked: true,
      },
    ],
    blueprints: useMissionStore.getState().blueprints,
    assets: [],
    broadcasts: [],
  });
  useUIStore.setState({
    plan: "cadet",
    fuel: 25,
    streak: 0,
    serverOwned: false,
  });
});

it("completing a milestone marks it done and awards fuel locally", () => {
  useMissionStore.getState().completeMilestone("m1");
  expect(
    useMissionStore.getState().milestones.find((m) => m.id === "m1")?.completed,
  ).toBe(true);
  expect(useUIStore.getState().fuel).toBe(35);
});

it("keeps locked milestones visible in the list", () => {
  const locked = useMissionStore
    .getState()
    .milestones.find((m) => m.id === "m2");
  expect(locked?.isLocked).toBe(true); // rendered but gated, never hidden
});
```

> If the store has no `hydrate`-based reset, read `src/store/mission.ts` for its reset path. The "locked routes to Refuel" navigation is asserted in the missions render test (next step) or folded into C9.

- [ ] **Step 2:** Add a render test asserting a locked milestone row shows the plan lock and pressing it calls `router.push("/(modals)/refuel")` (mock `expo-router` as in C2).

- [ ] **Step 3: Run + commit**

```bash
git add src/store/mission.milestones.test.ts
git commit -m "test(missions): completion + fuel award + locked visibility"
```

---

## Task C4: Blueprints domain tests

Covers `Docs/11 Blueprints`: sections appear, save fields, completion % updates, empty fields show examples, Ask Astro opens Copilot, Generate opens correct Foundry tool. (PDF export already tested in `blueprintPdf.test.ts`.)

**Files:** Create `src/store/mission.blueprints.test.ts`.

```typescript
// src/store/mission.blueprints.test.ts
import { useMissionStore } from "@/store/mission";

it("saving fields updates completionStatus toward 100", () => {
  const store = useMissionStore.getState();
  store.saveBlueprint("app_info", { appName: "X", oneLiner: "Y" });
  const bp = useMissionStore.getState().blueprints.app_info;
  expect(bp.fields.appName).toBe("X");
  expect(bp.completionStatus).toBeGreaterThan(0);
});

it("an empty section reports 0% completion", () => {
  useMissionStore.getState().saveBlueprint("app_store", {});
  expect(useMissionStore.getState().blueprints.app_store.completionStatus).toBe(
    0,
  );
});
```

- [ ] Add a `blueprints/[section].test.tsx` render test asserting helper examples render for empty fields and the "Generate in Foundry" button pushes `/(tabs)/foundry` with the section's mapped `tool` param. Mock `expo-router`.
- [ ] **Run + commit.**

```bash
git add src/store/mission.blueprints.test.ts
git commit -m "test(blueprints): field save + completion math"
```

---

## Task C5: Foundry domain tests

Covers `Docs/11 Foundry`: tool cards appear, fuel cost shown, locked tools show plan requirement, generation saves to Cargo, failed generation keeps fuel (server side = C1). `FoundryToolCard.test.tsx` already exists — extend the flow.

**Files:** Create `src/app/(tabs)/foundry.test.tsx`.

- [ ] **Step 1:** Render `foundry.tsx` (mock `expo-router` `useLocalSearchParams` returning `{}` and a `signalId` variant; mock `convex/react`'s `useAction` to resolve a fake asset). Assert:
  - each tool from `FOUNDRY_TOOLS` renders with its fuel cost (`getByText(\`${tool.fuelCost}\`)` or the FuelBadge label),
  - a tool whose `requiredPlan` exceeds the current plan renders the lock variant,
  - after a successful forge, `addAsset` is called and a "Saved to Cargo Bay" confirmation shows.

```tsx
// src/app/(tabs)/foundry.test.tsx (skeleton — fill assertions against real text)
import {
  render,
  screen,
  fireEvent,
  waitFor,
} from "@testing-library/react-native";
jest.mock("expo-router", () => ({
  useRouter: () => ({ push: jest.fn(), back: jest.fn() }),
  useLocalSearchParams: () => ({}),
}));
jest.mock("react-native-reanimated", () => {
  const { ScrollView, View } = require("react-native");
  return {
    __esModule: true,
    default: { ScrollView, View, createAnimatedComponent: (c: unknown) => c },
  };
});
jest.mock("@/components/ui/GradientView", () => ({ GradientView: () => null }));
// mock the Convex action used by foundry to generate content
jest.mock("convex/react", () => ({
  useAction: () => jest.fn(async () => ({ content: "AI copy", mock: true })),
}));
import Foundry from "./foundry";
import { FOUNDRY_TOOLS } from "@/constants/foundryTools";

it("renders every Foundry tool", () => {
  render(<Foundry />);
  expect(screen.getByText(FOUNDRY_TOOLS[0].name)).toBeTruthy();
});
```

- [ ] **Step 2:** Read `foundry.tsx` to confirm the Convex hook name (`useAction` vs a generated wrapper) and the exact confirmation text; tighten assertions.
- [ ] **Run + commit.**

```bash
git add "src/app/(tabs)/foundry.test.tsx"
git commit -m "test(foundry): tool list, fuel cost, plan lock, save-to-cargo flow"
```

---

## Task C6: Cargo Bay domain tests

Covers `Docs/11 Cargo`: assets appear, grouped by type, detail opens, copy works, mark flight-ready works, linked Signal appears, empty state guides to Foundry. `CategoryGrid.test.tsx` + `AssetDetail.test.tsx` already exist — fill the gaps.

**Files:** Create `src/store/mission.assets.test.ts`; extend `AssetDetail.test.tsx`.

```typescript
// src/store/mission.assets.test.ts
import { useMissionStore } from "@/store/mission";

it("marking an asset flight-ready updates status", () => {
  const id = useMissionStore.getState().addAsset({
    type: "social_blast",
    title: "T",
    content: "c",
    status: "in_prep",
    category: "social",
  } as never);
  useMissionStore.getState().updateAssetStatus(id, "flight_ready");
  expect(
    useMissionStore.getState().assets.find((a) => a.id === id)?.status,
  ).toBe("flight_ready");
});

it("a signal-linked asset retains its signalId for Signal Deck", () => {
  const id = useMissionStore.getState().addAsset({
    type: "signal_asset",
    title: "Dev log",
    content: "c",
    status: "flight_ready",
    category: "social",
    signalId: "pre_1",
    signalLabel: "Dev log thread",
    signalPhase: "pre_launch",
  } as never);
  expect(
    useMissionStore.getState().assets.find((a) => a.id === id)?.signalId,
  ).toBe("pre_1");
});
```

- [ ] Extend `AssetDetail.test.tsx`: assert "Copy content" calls the clipboard (mock `expo-clipboard` / `Clipboard`), "Mark flight-ready" calls `updateAssetStatus`, and a linked-signal banner renders when `signalLabel` is present.
- [ ] Add a `cargo.test.tsx` asserting the empty state renders an "→ Foundry" CTA when `assets` is empty.
- [ ] **Run + commit.**

```bash
git add src/store/mission.assets.test.ts src/components/cargo/AssetDetail.test.tsx
git commit -m "test(cargo): status transitions, signal linkage, copy, empty state"
```

---

## Task C7: Signal Deck domain tests

Covers `Docs/11 Signal Deck`: 16 signals, 3 phases, X/16 ready, bar states (0/3, 2/3, 3/3), forge opens correct tool, status updates from Cargo, Cadet cannot export + sees paywall, Commander can export. Much is now covered by `SignalActions.test.tsx`, `status.ts`, and Tasks A1–A3 — this consolidates the rest.

**Files:** Create `src/components/signal/status.test.ts`, `src/app/(modals)/signal-deck.test.tsx`.

```typescript
// src/components/signal/status.test.ts
import { signalStatus } from "./status";
import type { Asset } from "@/types";

const base = (over: Partial<Asset>): Asset => ({
  id: "a",
  type: "signal_asset",
  title: "t",
  status: "in_prep",
  category: "social",
  updatedAt: 0,
  ...over,
});

it("not_loaded when no asset links the signal (0/3 bars)", () => {
  expect(signalStatus("pre_1", [])).toBe("not_loaded");
});
it("in_prep when a draft asset is linked (2/3 bars)", () => {
  expect(
    signalStatus("pre_1", [base({ signalId: "pre_1", status: "in_prep" })]),
  ).toBe("in_prep");
});
it("flight_ready when the linked asset is flight-ready or exported (3/3 bars)", () => {
  expect(
    signalStatus("pre_1", [
      base({ signalId: "pre_1", status: "flight_ready" }),
    ]),
  ).toBe("flight_ready");
  expect(
    signalStatus("pre_1", [base({ signalId: "pre_1", status: "exported" })]),
  ).toBe("flight_ready");
});
```

- [ ] **Render test** (`signal-deck.test.tsx`): mock `expo-router` + reanimated + `GradientView`; seed `useUIStore` plan.
  - assert all 16 labels from `SIGNAL_TEMPLATES` render and 3 phase titles appear,
  - assert the X/16 ready count matches seeded flight-ready assets,
  - with `plan: "cadet"`, pressing "Transmit Sequence" shows `TransmitPaywallSheet` ("Export needs Commander."),
  - with `plan: "commander"`, pressing it calls `exportSignalPack` (mock the module) — no paywall.

```tsx
jest.mock("@/lib/exportSignalPack", () => ({
  exportSignalPack: jest.fn(async () => []),
}));
```

- [ ] **Run + commit.**

```bash
git add src/components/signal/status.test.ts "src/app/(modals)/signal-deck.test.tsx"
git commit -m "test(signal): status bars, 16-signal render, cadet paywall vs commander export"
```

---

## Task C8: Astro Copilot domain tests

Covers `Docs/11 Copilot`: orb opens modal, Astro belt matches plan, suggested prompts appear, standard checks fuel, powerful checks plan, receives mission context, cap displays. The pure win here is the **context builder** — test it directly.

**Files:** Create `src/app/(modals)/copilot.test.tsx`; if a `buildCopilotContext` helper isn't already extracted, extract it from `copilot.tsx` into `src/lib/copilotContext.ts` first and test that.

- [ ] **Step 1 (refactor for testability):** Extract the mission-context string builder from `copilot.tsx` into `src/lib/copilotContext.ts`:

```typescript
// src/lib/copilotContext.ts
import type { Mission, Milestone, Asset } from "@/types";

export function buildCopilotContext(args: {
  mission: Mission;
  milestones: Milestone[];
  assets: Asset[];
  readiness: number;
}): string {
  const incomplete = args.milestones
    .filter((m) => !m.completed)
    .map((m) => m.title);
  return [
    `App: ${args.mission.appName}`,
    `One-liner: ${args.mission.oneLiner}`,
    `Audience: ${args.mission.targetAudience}`,
    `Readiness: ${args.readiness}%`,
    `Incomplete milestones: ${incomplete.join(", ") || "none"}`,
  ].join("\n");
}
```

```typescript
// src/lib/copilotContext.test.ts
import { buildCopilotContext } from "./copilotContext";
it("includes app name, audience, readiness, and incomplete milestones", () => {
  const ctx = buildCopilotContext({
    mission: {
      appName: "FocusFlow",
      oneLiner: "Focus timer",
      targetAudience: "Students",
    } as never,
    milestones: [{ title: "Submit", completed: false } as never],
    assets: [],
    readiness: 42,
  });
  expect(ctx).toContain("FocusFlow");
  expect(ctx).toContain("Students");
  expect(ctx).toContain("42%");
  expect(ctx).toContain("Submit");
});
```

- [ ] **Step 2 (render):** `copilot.test.tsx` — mock `convex/react` `useAction`; assert suggested prompts render, the AstroAvatar uses the seeded plan (`getByLabelText("Astro (cadet)")`), and sending a message in standard mode with zero fuel surfaces the fuel gate.
- [ ] **Run + commit.**

```bash
git add src/lib/copilotContext.ts src/lib/copilotContext.test.ts "src/app/(modals)/copilot.test.tsx"
git commit -m "test(copilot): mission-context builder + render gates"
```

---

## Task C9: Refuel Station domain tests

Covers `Docs/11 Refuel`: 3 cards display, Astro preview per tier, RevenueCat purchase opens, restore works, plan updates after webhook (C1), downgrade-safe (C1). Purchase/restore are 3rd-party → render + handler wiring here, real transaction in C10 manual.

**Files:** Create `src/app/(modals)/refuel.test.tsx`, `src/constants/plans.test.ts`.

```typescript
// src/constants/plans.test.ts
import { planMeets, PLANS, PLAN_ORDER } from "./plans";
it("planMeets is monotonic across the tier order", () => {
  expect(planMeets("cadet", "commander")).toBe(false);
  expect(planMeets("commander", "commander")).toBe(true);
  expect(planMeets("admiral", "commander")).toBe(true);
});
it("exposes all three tiers with fuel caps", () => {
  expect(PLAN_ORDER).toEqual(["cadet", "commander", "admiral"]);
  expect(PLANS.commander.fuelCap).toBeGreaterThan(PLANS.cadet.fuelCap);
});
```

- [ ] **Render test:** mock `src/lib/purchases` (`getPlanPackages`, `purchasePlan`, `restorePurchases`); assert all three plan cards render with the per-tier Astro belt, "Restore purchases" calls `restorePurchases`, and a plan CTA calls `purchasePlan(planId)`.
- [ ] **Run + commit.**

```bash
git add src/constants/plans.test.ts "src/app/(modals)/refuel.test.tsx"
git commit -m "test(refuel): plan gating math + card render + purchase/restore wiring"
```

---

## Task C10: Notifications + Analytics tests

Covers `Docs/11 Notifications` (enable/disable, daily action, launch day, streak schedule) and `Analytics` (the 12 named events fire without storing private content). `notifications.test.ts` exists — extend; add analytics.

**Files:** Extend `src/lib/notifications.test.ts`; create `src/lib/analytics.test.ts`.

```typescript
// src/lib/analytics.test.ts
const capture = jest.fn();
jest.mock("@/lib/analytics", () => {
  const actual = jest.requireActual("@/lib/analytics");
  return actual; // we test the real module; intercept the HTTP sink instead
});
// Prefer: inject a no-op transport and assert track() builds the right event name/props.
import { track } from "./analytics";

it("track() accepts each required event name without throwing", () => {
  for (const e of [
    "user_signed_up",
    "onboarding_completed",
    "mission_created",
    "milestone_completed",
    "fuel_earned",
    "foundry_asset_generated",
    "cargo_asset_saved",
    "signal_deck_opened",
    "signal_asset_forged",
    "transmit_sequence_tapped",
    "copilot_message_sent",
    "plan_upgraded",
  ] as const) {
    expect(() => track(e)).not.toThrow();
  }
});

it("never includes raw user content in event props", () => {
  // track() should only forward whitelisted scalar props (ids, counts, flags)
  expect(() =>
    track("foundry_asset_generated", { tool: "social_blast" }),
  ).not.toThrow();
});
```

> Read `src/lib/analytics.ts` for the real `track` signature + how the HTTP sink is injected, and assert against the sink (spy on the `fetch`/transport) so the test verifies the event name + that no free-text content is sent.

- [ ] Extend `notifications.test.ts`: assert `scheduleLaunchReminders` schedules daily-action + launch-day + streak identifiers, and disabling cancels them by stable id.
- [ ] **Run + commit.**

```bash
git add src/lib/analytics.test.ts src/lib/notifications.test.ts
git commit -m "test(observability): analytics event coverage + notification scheduling"
```

---

## Task C11: Manual QA checklist (device / 3rd-party cases)

These `Docs/11` cases require a real device, real Clerk OAuth, real RevenueCat sandbox, and store tooling — they cannot be unit-tested. Record results in a tracked file.

**Files:** Create `Docs/11_QA_MANUAL_RESULTS.md`.

- [ ] **Step 1: Create the results file** with a checkbox per manual case and a Pass/Fail + notes column:

```markdown
# Manual QA Results — <date> / build <eas build id>

## Auth (device)

- [ ] Sign up with email creates a Convex user record
- [ ] Sign in with Google succeeds
- [ ] Sign in with Apple succeeds
- [ ] Logged-out user cannot reach protected routes (deep link test)
- [ ] Log out returns to auth

## Onboarding (device, end-to-end)

- [ ] Complete all steps → Mission + milestones + blueprints created → lands on Deck
- [ ] Skipping launch date still creates the Mission

## Refuel / RevenueCat (sandbox)

- [ ] Commander purchase completes; plan upgrades in Convex within seconds (webhook)
- [ ] Restore purchases re-grants entitlement
- [ ] Sandbox downgrade locks export but keeps assets

## Store prep

- [ ] App icon + splash correct on iOS + Android
- [ ] Runs on iOS simulator and Android emulator
- [ ] TestFlight build created
- [ ] Play internal-testing build created
- [ ] Privacy, Terms, Support links open

## Accessibility (device)

- [ ] All tap targets ≥ 44px (inspector)
- [ ] Text contrast readable in dark theme
- [ ] VoiceOver/TalkBack reads icon-only buttons
```

- [ ] **Step 2:** Run the checklist against the latest EAS build; fill in results; commit the filled file.

```bash
git add Docs/11_QA_MANUAL_RESULTS.md
git commit -m "test(qa): manual QA results for device + 3rd-party cases"
```

---

## Final verification (whole plan)

- [ ] **Run the full automated suite:**

Run: `npx jest` (plus `npx vitest run convex/` if Convex suites went to vitest)
Expected: all suites green; the new feature, polish, and QA suites included.

- [ ] **Typecheck + lint:**

Run: `npx tsc --noEmit && npx eslint .`
Expected: no errors.

- [ ] **Manual smoke on web (demo mode):**

Run: `npx expo start --web`, walk Deck → Missions → Blueprints → Foundry → Cargo → Signal Deck → Copilot → Refuel, and export a signal pack.

- [ ] **Map coverage back to `Docs/11`:** open the checklist and confirm every bullet is either an automated `it()` (Tasks C1–C10) or a checked manual case (C11). List any remaining gap and add a task.

---

## Self-Review notes (author)

- **Spec coverage:** Should-have features from `Docs/02` — Launch Library (A4 ✓), Signal Pack ZIP export (A1–A3 ✓), Cargo approval statuses (already built ✓), Haptics/micro-animations (B3 + existing ✓), Streak reminders (C10 ✓), Empty states (B4 ✓), Error boundaries (already built ✓). Every `Docs/11` domain maps to a Part C task.
- **Demo-mode invariant:** every new feature (A1–A4, B-series) works without API keys and persists to Convex when signed in — matching the existing dual-mode store pattern.
- **Risk flagged for the implementer:** `convex-test` may not load under jest-expo's transform; C0 Step 2 + C1 Step 2 contain the vitest fallback decision point — resolve it before writing the rest of Part C's backend suites.
- **Out of scope (deferred to a future "Ship v1" plan):** real EAS build config, production key wiring/verification, and the post-v1 web companion (`Docs/12`). This plan gets the app feature-complete + fully tested in demo mode; productionization is a separate plan.
