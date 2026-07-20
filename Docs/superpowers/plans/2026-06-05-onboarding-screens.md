# Onboarding Screens (Landing, Welcome Back, Sign-in & Upsell Timing) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a landing page and welcome-back screen, move sign-in to after intent capture (steps 0–2), and document upsell timing so onboarding stays relief-first while Commander upsells stay at feature gates.

**Architecture:** Extend the `(auth)` route group with three new screens. Persist pre-auth intent in SecureStore via a small draft module. Refactor `index.tsx` into a state machine that routes by auth + draft + mission. Split existing `onboarding.tsx` into intent phase (0–2, can run signed-out) and mission phase (3–6, requires auth). Welcome back is a lightweight signed-in interstitial before Deck.

**Tech Stack:** Expo Router, `@clerk/clerk-expo`, Convex (`getLaunchData`, `createMission`), SecureStore (via `src/lib/secureStorage.ts`), existing UI primitives (`ScreenBackground`, `Button`, `AstroAvatar`).

**Design spec:** `Docs/superpowers/specs/2026-06-05-onboarding-screens-design.md`

---

## File structure

**Create:**

- `src/lib/onboardingDraft.ts` — read/write/clear pre-auth onboarding draft
- `src/lib/onboardingDraft.test.ts`
- `src/lib/onboardingRoutes.ts` — pure routing helpers (testable)
- `src/lib/onboardingRoutes.test.ts`
- `src/app/(auth)/landing.tsx`
- `src/app/(auth)/landing.test.tsx`
- `src/app/(auth)/welcome-back.tsx`
- `src/app/(auth)/welcome-back.test.tsx`
- `src/app/(auth)/save-plan.tsx`
- `src/app/(auth)/save-plan.test.tsx`
- `src/components/onboarding/OnboardingProgress.tsx` — shared progress bar (extract from onboarding)
- `src/components/onboarding/IntentSteps.tsx` — steps 0–2 UI (extract from onboarding)

**Modify:**

- `src/app/index.tsx` — new routing state machine
- `src/app/(auth)/onboarding.tsx` — mission phase only (steps 3–6 + confirm); hydrate from draft
- `src/app/(auth)/_layout.tsx` — register new screens (Stack auto-discovers)
- `src/app/(auth)/sign-in.tsx` — accept `?redirect=` param; post-auth merge draft
- `src/lib/analytics.ts` — add event names (if typed map exists, extend it)

**Unchanged (upsell stays here):**

- `src/app/(modals)/refuel.tsx` — primary Commander upsell
- Feature gates in `foundry.tsx`, `missions.tsx`, `TransmitPaywallSheet.tsx`

---

## Task 1: Onboarding draft persistence

**Files:**

- Create: `src/lib/onboardingDraft.ts`
- Test: `src/lib/onboardingDraft.test.ts`
- **Step 1: Write the failing test**

```typescript
// src/lib/onboardingDraft.test.ts
import {
  clearOnboardingDraft,
  getOnboardingDraft,
  saveOnboardingDraft,
  hasIntentDraft,
  DRAFT_KEY,
} from "./onboardingDraft";
import * as secureStorage from "./secureStorage";

jest.mock("./secureStorage");

const mockGet = secureStorage.getStorageItem as jest.Mock;
const mockSet = secureStorage.setStorageItem as jest.Mock;

beforeEach(() => {
  jest.clearAllMocks();
});

it("returns null when no draft stored", async () => {
  mockGet.mockResolvedValue(null);
  expect(await getOnboardingDraft()).toBeNull();
});

it("saves and parses draft JSON", async () => {
  const draft = { appName: "FocusFlow", oneLiner: "Tasks", audience: "Founders", step: 2 };
  mockGet.mockResolvedValue(JSON.stringify(draft));
  expect(await getOnboardingDraft()).toEqual(draft);
  expect(mockGet).toHaveBeenCalledWith(DRAFT_KEY);
});

it("hasIntentDraft is true when appName and oneLiner present", async () => {
  mockGet.mockResolvedValue(JSON.stringify({ appName: "A", oneLiner: "B", audience: "", step: 1 }));
  expect(await hasIntentDraft()).toBe(true);
});

it("clearOnboardingDraft writes empty string", async () => {
  await clearOnboardingDraft();
  expect(mockSet).toHaveBeenCalledWith(DRAFT_KEY, "");
});
```

- **Step 2: Run test to verify it fails**

Run: `npx jest src/lib/onboardingDraft.test.ts -v`  
Expected: FAIL — module not found

- **Step 3: Implement minimal module**

```typescript
// src/lib/onboardingDraft.ts
import { getStorageItem, setStorageItem } from "./secureStorage";

export const DRAFT_KEY = "launchdeck_onboarding_draft_v1";

export type OnboardingDraft = {
  appName: string;
  oneLiner: string;
  audience: string;
  step: number;
};

export async function getOnboardingDraft(): Promise<OnboardingDraft | null> {
  const raw = await getStorageItem(DRAFT_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as OnboardingDraft;
  } catch {
    return null;
  }
}

export async function saveOnboardingDraft(draft: OnboardingDraft): Promise<void> {
  await setStorageItem(DRAFT_KEY, JSON.stringify(draft));
}

export async function clearOnboardingDraft(): Promise<void> {
  await setStorageItem(DRAFT_KEY, "");
}

export async function hasIntentDraft(): Promise<boolean> {
  const d = await getOnboardingDraft();
  return Boolean(d?.appName?.trim() && d?.oneLiner?.trim());
}
```

- **Step 4: Run test to verify it passes**

Run: `npx jest src/lib/onboardingDraft.test.ts -v`  
Expected: PASS

- **Step 5: Commit**

```bash
git add src/lib/onboardingDraft.ts src/lib/onboardingDraft.test.ts
git commit -m "feat: persist pre-auth onboarding intent draft"
```

---

## Task 2: Pure routing helpers

**Files:**

- Create: `src/lib/onboardingRoutes.ts`
- Test: `src/lib/onboardingRoutes.test.ts`
- **Step 1: Write the failing test**

```typescript
// src/lib/onboardingRoutes.test.ts
import { resolveEntryRoute } from "./onboardingRoutes";

it("demo mode goes straight to deck", () => {
  expect(
    resolveEntryRoute({ authEnabled: false, isLoading: false, isAuthenticated: false }),
  ).toBe("/(tabs)/deck");
});

it("signed out with no draft goes to landing", () => {
  expect(
    resolveEntryRoute({
      authEnabled: true,
      isLoading: false,
      isAuthenticated: false,
      hasDraft: false,
    }),
  ).toBe("/(auth)/landing");
});

it("signed out with intent draft goes to save-plan", () => {
  expect(
    resolveEntryRoute({
      authEnabled: true,
      isLoading: false,
      isAuthenticated: false,
      hasDraft: true,
      intentComplete: true,
    }),
  ).toBe("/(auth)/save-plan");
});

it("signed in with mission goes to welcome-back by default", () => {
  expect(
    resolveEntryRoute({
      authEnabled: true,
      isLoading: false,
      isAuthenticated: true,
      hasMission: true,
      skipWelcomeBack: false,
    }),
  ).toBe("/(auth)/welcome-back");
});

it("signed in with mission and skip flag goes to deck", () => {
  expect(
    resolveEntryRoute({
      authEnabled: true,
      isLoading: false,
      isAuthenticated: true,
      hasMission: true,
      skipWelcomeBack: true,
    }),
  ).toBe("/(tabs)/deck");
});

it("signed in without mission goes to onboarding", () => {
  expect(
    resolveEntryRoute({
      authEnabled: true,
      isLoading: false,
      isAuthenticated: true,
      hasMission: false,
    }),
  ).toBe("/(auth)/onboarding");
});
```

- **Step 2: Run test — expect FAIL**

Run: `npx jest src/lib/onboardingRoutes.test.ts -v`

- **Step 3: Implement**

```typescript
// src/lib/onboardingRoutes.ts
export type EntryRouteInput = {
  authEnabled: boolean;
  isLoading: boolean;
  isAuthenticated: boolean;
  hasDraft?: boolean;
  intentComplete?: boolean;
  hasMission?: boolean;
  skipWelcomeBack?: boolean;
};

export function resolveEntryRoute(input: EntryRouteInput): string | "loading" {
  if (!input.authEnabled) return "/(tabs)/deck";
  if (input.isLoading) return "loading";

  if (!input.isAuthenticated) {
    if (input.intentComplete) return "/(auth)/save-plan";
    if (input.hasDraft) return "/(auth)/landing"; // resume via Get Started on landing
    return "/(auth)/landing";
  }

  if (input.hasMission) {
    return input.skipWelcomeBack ? "/(tabs)/deck" : "/(auth)/welcome-back";
  }
  return "/(auth)/onboarding";
}
```

- **Step 4: Run test — expect PASS**
- **Step 5: Commit**

```bash
git add src/lib/onboardingRoutes.ts src/lib/onboardingRoutes.test.ts
git commit -m "feat: add pure onboarding entry route resolver"
```

---

## Task 3: Landing screen

**Files:**

- Create: `src/app/(auth)/landing.tsx`
- Test: `src/app/(auth)/landing.test.tsx`
- **Step 1: Write failing test**

```typescript
// src/app/(auth)/landing.test.tsx
import { fireEvent, render, screen } from "@testing-library/react-native";
import LandingScreen from "./landing";

const mockPush = jest.fn();
jest.mock("expo-router", () => ({
  useRouter: () => ({ push: mockPush, replace: mockPush }),
}));
jest.mock("@/lib/analytics", () => ({ track: jest.fn() }));

it("renders relief headline and both CTAs", () => {
  render(<LandingScreen />);
  expect(screen.getByText(/less overwhelm/i)).toBeTruthy();
  expect(screen.getByText("Get Started")).toBeTruthy();
  expect(screen.getByText("I already have an account")).toBeTruthy();
});

it("Get Started navigates to intent flow", () => {
  render(<LandingScreen />);
  fireEvent.press(screen.getByText("Get Started"));
  expect(mockPush).toHaveBeenCalledWith("/(auth)/onboarding?phase=intent");
});
```

- **Step 2: Run test — expect FAIL**
- **Step 3: Implement landing screen**

Key UI (match `DESIGN.md` tokens, web prototype copy):

```tsx
// src/app/(auth)/landing.tsx — structure
export default function LandingScreen() {
  const router = useRouter();
  useEffect(() => { track("landing_viewed"); }, []);

  return (
    <ScreenBackground>
      <SafeAreaView style={{ flex: 1 }}>
        {/* Wordmark + BUILDER COMPANION mono label */}
        {/* Headline: Plan your app launch with less overwhelm */}
        {/* Subcopy + 3 benefit chips */}
        <Button label="Get Started" fullWidth onPress={() => {
          track("landing_get_started");
          router.push("/(auth)/onboarding?phase=intent");
        }} />
        <Button label="I already have an account" variant="ghost" onPress={() => {
          track("landing_have_account");
          router.push("/(auth)/sign-in");
        }} />
      </SafeAreaView>
    </ScreenBackground>
  );
}
```

- **Step 4: Run test — expect PASS**
- **Step 5: Commit**

---

## Task 4: Intent phase in onboarding (steps 0–2, signed-out OK)

**Files:**

- Create: `src/components/onboarding/IntentSteps.tsx`
- Modify: `src/app/(auth)/onboarding.tsx`
- **Step 1: Write failing test** — intent step saves draft on Continue

```typescript
// extend onboarding.test.tsx or new IntentSteps.test.tsx
it("persists draft after completing audience step", async () => {
  // render intent phase, fill fields, press Continue through step 2
  // assert saveOnboardingDraft called with step: 2
});
```

- **Step 2: Refactor onboarding.tsx**
- Read `phase` search param: `intent` | `mission` (default `mission` if signed in, `intent` if signed out).
- Steps 0–2: on each Continue, `saveOnboardingDraft({ appName, oneLiner, audience, step })`.
- After step 2 Continue:
  - If `authEnabled && !isSignedIn` → `router.replace("/(auth)/save-plan")`
  - If signed in → advance to step 3 in same file
  - If demo mode → continue to step 3 locally
- **Step 3: Hydrate fields from draft on mount**
- **Step 4: Run tests — expect PASS**
- **Step 5: Commit**

---

## Task 5: Save-plan screen (sign-in prompt)

**Files:**

- Create: `src/app/(auth)/save-plan.tsx`
- Test: `src/app/(auth)/save-plan.test.tsx`
- **Step 1: Write failing test** — shows “Save your app plan” and OAuth buttons
- **Step 2: Implement** — reuse OAuth handlers from `sign-in.tsx` (extract shared `useClerkSignIn` hook if needed to avoid duplication):

Copy frame from web prototype `AccountPromptScreen`:

- Title: **Save your app plan**
- Subtitle: Create an account so your answers stay saved securely.
- Google / Apple / email → sign-in or sign-up
- Privacy reassurance line
- **No skip** when draft exists
- **Step 3: On successful auth** — `router.replace("/(auth)/onboarding?phase=mission")`
- **Step 4: Run tests — expect PASS**
- **Step 5: Commit**

---

## Task 6: Welcome-back screen

**Files:**

- Create: `src/app/(auth)/welcome-back.tsx`
- Test: `src/app/(auth)/welcome-back.test.tsx`
- **Step 1: Write failing test**

```typescript
it("shows mission name and Return to Deck", () => {
  // mock useQuery getLaunchData → { mission: { appName: "FocusFlow" }, readiness: 42 }
  // mock useUser → { firstName: "Alex" }
  render(<WelcomeBackScreen />);
  expect(screen.getByText(/Welcome back, Alex/)).toBeTruthy();
  expect(screen.getByText("FocusFlow")).toBeTruthy();
  expect(screen.getByText("Return to Deck")).toBeTruthy();
});
```

- **Step 2: Implement**

```tsx
// Uses useUser from @clerk/clerk-expo + useQuery(api.missions.getLaunchData)
// Primary CTA: router.replace("/(tabs)/deck") + set skipWelcomeBack pref
// track("welcome_back_viewed") / track("welcome_back_continue")
```

- **Step 3: Add `skipWelcomeBack` pref** in `src/lib/onboardingDraft.ts` or new `userPrefs.ts` (key: `launchdeck_skip_welcome_back`)
- **Step 4: Run tests — expect PASS**
- **Step 5: Commit**

---

## Task 7: Wire index.tsx state machine

**Files:**

- Modify: `src/app/index.tsx`
- Test: add `src/app/index.test.tsx` (optional but recommended)
- **Step 1: Replace AuthGate redirect logic**

```tsx
function AuthGate() {
  const { isLoading, isAuthenticated } = useConvexAuth();
  const data = useQuery(api.missions.getLaunchData, isAuthenticated ? {} : "skip");
  const [draftReady, setDraftReady] = useState(false);
  const [hasDraft, setHasDraft] = useState(false);
  const [intentComplete, setIntentComplete] = useState(false);
  const [skipWelcomeBack, setSkipWelcomeBack] = useState(false);

  useEffect(() => {
    Promise.all([hasIntentDraft(), getOnboardingDraft(), getSkipWelcomeBack()]).then(
      ([intent, draft, skip]) => {
        setIntentComplete(intent);
        setHasDraft(Boolean(draft));
        setSkipWelcomeBack(skip);
        setDraftReady(true);
      },
    );
  }, []);

  if (isLoading || (isAuthenticated && data === undefined) || !draftReady) return <Splash />;

  const href = resolveEntryRoute({
    authEnabled: true,
    isLoading: false,
    isAuthenticated,
    hasDraft,
    intentComplete,
    hasMission: Boolean(data?.mission),
    skipWelcomeBack,
  });

  if (href === "loading") return <Splash />;
  return <Redirect href={href} />;
}
```

- **Step 2: Run full jest suite**

Run: `npx jest -v`  
Expected: all green (fix any routing test mocks)

- **Step 3: Commit**

```bash
git add src/app/index.tsx
git commit -m "feat: route landing, welcome-back, and save-plan from entry gate"
```

---

## Task 8: Mission phase completion + draft cleanup

**Files:**

- Modify: `src/app/(auth)/onboarding.tsx`
- **Step 1: On `createMission` success** — call `clearOnboardingDraft()`
- **Step 2: Hydrate steps 3–6 defaults from draft** (appName, oneLiner, audience pre-filled)
- **Step 3: Final confirm step (step 6)** — add tertiary text link only:

```tsx
<Pressable onPress={() => router.push("/(modals)/refuel")} accessibilityRole="link">
  <Text className="text-text-tertiary text-xs text-center">
    See what Commander unlocks
  </Text>
</Pressable>
```

Do **not** auto-open Refuel modal. This is the only onboarding upsell touch.

- **Step 4: Test createMission clears draft**
- **Step 5: Commit**

---

## Task 9: Post-milestone soft upsell (optional, ship after core flow)

**Files:**

- Create: `src/components/onboarding/CommanderSpotlightSheet.tsx`
- Modify: `src/app/(tabs)/missions.tsx` — after first milestone completion only
- **Step 1: Track `hasSeenCommanderSpotlight` in SecureStore**
- **Step 2: On first `milestone_complete` for cadet user** — show bottom sheet once:

Copy (from `Docs/08`):

> Commander unlocks Signal Pack export and unlimited Copilot — right when launch prep gets serious.

Buttons: **Upgrade to Commander** → refuel | **Not now** → dismiss

- **Step 3: Test sheet shows once**
- **Step 4: Commit**

---

## Task 10: Manual QA checklist

- **Cold install, auth on:** Landing → intent 0–2 → save-plan → Google/Apple/email → mission 3–6 → Deck
- **Kill app mid-intent step 1:** reopen → landing → Get Started resumes draft
- **Returning signed-in user:** welcome back → Deck; second launch skips welcome back
- **Sign out with mission:** landing → “I already have an account” → sign-in → welcome back
- **Demo mode (no Clerk key):** still lands on Deck; no landing/sign-in
- **Onboarding:** no Refuel modal; tertiary link on confirm only
- **First milestone (cadet):** optional Commander spotlight once
- **Foundry lock / Signal export:** existing Refuel modal unchanged
- **Reduced motion:** no auto-advance on welcome back

Document results in `Docs/11_QA_MANUAL_RESULTS.md` (append onboarding section).

---

## Upsell timing reference (for product — not new code)


| Priority  | Trigger                                                          | Surface                   | When                         |
| --------- | ---------------------------------------------------------------- | ------------------------- | ---------------------------- |
| Primary   | Fuel wall, Foundry lock, Signal export, mission cap, Copilot cap | `/(modals)/refuel`        | User hits gate (existing)    |
| Secondary | First milestone complete                                         | `CommanderSpotlightSheet` | Once per install, cadet only |
| Tertiary  | Onboarding confirm                                               | Text link                 | Optional, non-blocking       |


**Never:** landing, intent steps, save-plan, welcome back.

---

## Self-review (spec coverage)


| Spec requirement            | Task               |
| --------------------------- | ------------------ |
| Landing page                | Task 3             |
| Welcome back                | Task 6             |
| Sign-in after intent        | Tasks 4, 5, 7      |
| Upsell not in onboarding    | Task 8 (link only) |
| Soft upsell after first win | Task 9             |
| Draft persistence           | Task 1             |
| Analytics                   | Tasks 3, 5, 6, 8   |


---

**Plan complete and saved to `Docs/superpowers/plans/2026-06-05-onboarding-screens.md`.**

**Two execution options:**

1. **Subagent-Driven (recommended)** — fresh subagent per task, review between tasks
2. **Inline Execution** — run tasks in this session with checkpoints

Which approach?

