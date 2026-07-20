# Astro Voice Dock (Onboarding Coach + Voice Dictation) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a floating Astro orb to the onboarding wizard that coaches the user per step and lets them dictate the three text fields by voice (on-device speech-to-text), architected so a conversational Astro mode is additive later.

**Architecture:** A single floating component (`AstroVoiceDock`) renders an Astro orb + speech bubble over the existing onboarding screen. It reads per-step copy from a `COACH` map and uses an isolated `useSpeechToText` hook — the only file that imports `expo-speech-recognition`. On the three text steps it shows a mic that dictates into that step's field; on other steps it is coach-only. The onboarding screen owns all field state and passes the active field's `{ value, onChange }` to the dock.

**Tech Stack:** Expo SDK 56, React Native 0.85, `expo-speech-recognition` (jamsch — native iOS/Android + Web Speech API), NativeWind v5 via `@/tw`, `react-native-reanimated` (`useReducedMotion`), existing `AstroAvatar`, `track`, `haptics`.

**Design spec:** `Docs/superpowers/specs/2026-06-06-astro-voice-dock-design.md`

---

## File structure

**Create:**

- `src/lib/useSpeechToText.ts` — isolates `expo-speech-recognition` (start/stop, availability, permission, result events)
- `src/lib/useSpeechToText.test.ts`
- `src/constants/onboardingCoach.ts` — per-step `{ pose, line }` map
- `src/constants/onboardingCoach.test.ts`
- `src/components/onboarding/AstroVoiceDock.tsx` — floating orb + bubble + mic
- `src/components/onboarding/AstroVoiceDock.test.tsx`

**Modify:**

- `app.json` — register the `expo-speech-recognition` config plugin + permission strings
- `package.json` / `package-lock.json` — add the dependency (via `npx expo install`)
- `src/lib/analytics.ts` — add `"onboarding_voice_used"` to the `AnalyticsEvent` union
- `src/app/(auth)/onboarding.tsx` — render `<AstroVoiceDock>` and compute the active `dictationTarget`
- `src/__tests__/app/(auth)/onboarding.intent.test.tsx` — mock `expo-speech-recognition`; assert coach line renders
- `src/__tests__/app/(auth)/onboarding.mission.test.tsx` — mock `expo-speech-recognition`

**Unchanged:** onboarding flow, routing (`index.tsx`), draft persistence, auth timing, Refuel/upsell.

---

## Task 1: Add the dependency and config plugin

**Files:**
- Modify: `app.json`
- Modify: `package.json`, `package-lock.json` (via installer)

- [ ] **Step 1: Install the package**

Run: `npx expo install expo-speech-recognition`
Expected: adds `expo-speech-recognition` to `dependencies` in `package.json` and updates `package-lock.json`. (`expo install` picks the version compatible with SDK 56.)

- [ ] **Step 2: Register the config plugin in `app.json`**

In `app.json`, replace the `plugins` array's `"expo-sharing"` entry's surrounding array so the new plugin is appended. Concretely, change:

```json
      "expo-secure-store",
      "expo-audio",
      "expo-sharing"
    ],
```

to:

```json
      "expo-secure-store",
      "expo-audio",
      "expo-sharing",
      [
        "expo-speech-recognition",
        {
          "microphonePermission": "Allow LaunchDeckAI to use the microphone so you can dictate your answers.",
          "speechRecognitionPermission": "Allow LaunchDeckAI to turn your speech into text while setting up your Mission.",
          "androidSpeechServicePackages": ["com.google.android.googlequicksearchbox"]
        }
      ]
    ],
```

- [ ] **Step 3: Verify config resolves**

Run: `npx expo config --type prebuild`
Expected: command succeeds (exit 0) and prints config including the speech-recognition plugin. No schema errors.

> **Note for the engineer:** this native module requires a **dev-client rebuild** (`npx expo run:ios` / `npx expo run:android` or an EAS build). It will not work in a JS-only reload. Web works via the browser Web Speech API with no rebuild.

- [ ] **Step 4: Commit**

```bash
git add app.json package.json package-lock.json
git commit -m "build: add expo-speech-recognition dependency and config plugin"
```

---

## Task 2: `useSpeechToText` hook

**Files:**
- Create: `src/lib/useSpeechToText.ts`
- Test: `src/lib/useSpeechToText.test.ts`

- [ ] **Step 1: Write the failing test**

```typescript
// src/lib/useSpeechToText.test.ts
import { act, renderHook } from "@testing-library/react-native";

// Controllable mock of expo-speech-recognition: stores the latest listener per
// event so the test can emit native events, and exposes the module spies.
const listeners: Record<string, (e: unknown) => void> = {};
const mockStart = jest.fn();
const mockStop = jest.fn();
const mockRequest = jest.fn(async () => ({ granted: true }));
let mockAvailable = true;

jest.mock("expo-speech-recognition", () => ({
  ExpoSpeechRecognitionModule: {
    isRecognitionAvailable: () => mockAvailable,
    requestPermissionsAsync: (...a: unknown[]) => mockRequest(...a),
    start: (...a: unknown[]) => mockStart(...a),
    stop: (...a: unknown[]) => mockStop(...a),
  },
  useSpeechRecognitionEvent: (name: string, handler: (e: unknown) => void) => {
    listeners[name] = handler;
  },
}));

import { useSpeechToText } from "./useSpeechToText";

beforeEach(() => {
  jest.clearAllMocks();
  mockAvailable = true;
  mockRequest.mockResolvedValue({ granted: true });
});

it("reports availability from the module", () => {
  mockAvailable = false;
  const { result } = renderHook(() => useSpeechToText());
  expect(result.current.isAvailable).toBe(false);
});

it("requests permission and starts recognition when granted", async () => {
  const { result } = renderHook(() => useSpeechToText());
  await act(async () => {
    await result.current.start();
  });
  expect(mockRequest).toHaveBeenCalled();
  expect(mockStart).toHaveBeenCalledWith(
    expect.objectContaining({ lang: "en-US", interimResults: true }),
  );
});

it("sets an error and does not start when permission denied", async () => {
  mockRequest.mockResolvedValue({ granted: false });
  const { result } = renderHook(() => useSpeechToText());
  await act(async () => {
    await result.current.start();
  });
  expect(mockStart).not.toHaveBeenCalled();
  expect(result.current.error).toBe("not-allowed");
});

it("forwards interim and final results to onResult", async () => {
  const onResult = jest.fn();
  const { result } = renderHook(() => useSpeechToText({ onResult }));

  act(() => {
    listeners.result?.({ results: [{ transcript: "focus" }], isFinal: false });
  });
  expect(onResult).toHaveBeenLastCalledWith("focus", false);
  expect(result.current.partialText).toBe("focus");

  act(() => {
    listeners.result?.({ results: [{ transcript: "focus flow" }], isFinal: true });
  });
  expect(onResult).toHaveBeenLastCalledWith("focus flow", true);
});

it("stop() calls the module and start/end toggle isListening", () => {
  const { result } = renderHook(() => useSpeechToText());
  act(() => listeners.start?.(null));
  expect(result.current.isListening).toBe(true);
  act(() => result.current.stop());
  expect(mockStop).toHaveBeenCalled();
  act(() => listeners.end?.(null));
  expect(result.current.isListening).toBe(false);
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx jest src/lib/useSpeechToText.test.ts -v`
Expected: FAIL — `Cannot find module './useSpeechToText'`.

- [ ] **Step 3: Implement the hook**

```typescript
// src/lib/useSpeechToText.ts
import { useCallback, useState } from "react";
import {
  ExpoSpeechRecognitionModule,
  useSpeechRecognitionEvent,
} from "expo-speech-recognition";

type ResultEvent = {
  results: { transcript: string }[];
  isFinal: boolean;
};

type ErrorEvent = { error: string; message: string };

export type UseSpeechToTextOptions = {
  lang?: string;
  /** Fires for every interim and final result. */
  onResult?: (text: string, isFinal: boolean) => void;
};

export type UseSpeechToText = {
  isAvailable: boolean;
  isListening: boolean;
  partialText: string;
  error: string | null;
  start: () => Promise<void>;
  stop: () => void;
};

export function useSpeechToText(
  options: UseSpeechToTextOptions = {},
): UseSpeechToText {
  const { lang = "en-US", onResult } = options;
  const [isListening, setIsListening] = useState(false);
  const [partialText, setPartialText] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isAvailable] = useState(() => {
    try {
      return ExpoSpeechRecognitionModule.isRecognitionAvailable();
    } catch {
      return false;
    }
  });

  useSpeechRecognitionEvent("start", () => {
    setIsListening(true);
    setError(null);
  });
  useSpeechRecognitionEvent("end", () => {
    setIsListening(false);
    setPartialText("");
  });
  useSpeechRecognitionEvent("result", (event: ResultEvent) => {
    const text = event.results[0]?.transcript ?? "";
    setPartialText(text);
    onResult?.(text, event.isFinal);
  });
  useSpeechRecognitionEvent("error", (event: ErrorEvent) => {
    setError(event.error ?? "error");
    setIsListening(false);
  });

  const start = useCallback(async () => {
    const perms = await ExpoSpeechRecognitionModule.requestPermissionsAsync();
    if (!perms.granted) {
      setError("not-allowed");
      return;
    }
    ExpoSpeechRecognitionModule.start({
      lang,
      interimResults: true,
      continuous: false,
    });
  }, [lang]);

  const stop = useCallback(() => {
    ExpoSpeechRecognitionModule.stop();
  }, []);

  return { isAvailable, isListening, partialText, error, start, stop };
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx jest src/lib/useSpeechToText.test.ts -v`
Expected: PASS (5 tests).

- [ ] **Step 5: Commit**

```bash
git add src/lib/useSpeechToText.ts src/lib/useSpeechToText.test.ts
git commit -m "feat: add isolated useSpeechToText hook over expo-speech-recognition"
```

---

## Task 3: Per-step coach copy map

**Files:**
- Create: `src/constants/onboardingCoach.ts`
- Test: `src/constants/onboardingCoach.test.ts`

- [ ] **Step 1: Write the failing test**

```typescript
// src/constants/onboardingCoach.test.ts
import { COACH } from "./onboardingCoach";

it("has an entry for every onboarding step 0-6", () => {
  for (let step = 0; step <= 6; step++) {
    expect(COACH[step]).toBeDefined();
    expect(typeof COACH[step].line).toBe("string");
    expect(COACH[step].line.length).toBeGreaterThan(0);
  }
});

it("uses the welcoming pose and naming prompt on step 0", () => {
  expect(COACH[0].pose).toBe("hello");
  expect(COACH[0].line).toMatch(/called/i);
});

it("uses an approving pose on the confirm step", () => {
  expect(COACH[6].pose).toBe("thumbsup");
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx jest src/constants/onboardingCoach.test.ts -v`
Expected: FAIL — `Cannot find module './onboardingCoach'`.

- [ ] **Step 3: Implement the map**

```typescript
// src/constants/onboardingCoach.ts
import type { AstroPose } from "./astroAssets";

export type CoachLine = { pose: AstroPose; line: string };

/** Calm, relief-first coaching per onboarding step (absolute step index 0-6). */
export const COACH: Record<number, CoachLine> = {
  0: { pose: "hello", line: "First up — what's it called? You can rename it anytime." },
  1: { pose: "pointing", line: "Nail the value in one sentence. Specific beats clever." },
  2: { pose: "thinking", line: "Picture one real person who needs this. That's your audience." },
  3: { pose: "pointing", line: "Where are you launching? This shapes your store checklist." },
  4: { pose: "thinking", line: "Be honest about where you are — I'll calibrate the plan." },
  5: { pose: "pointing", line: "A target date powers your countdown. An estimate's fine." },
  6: { pose: "thumbsup", line: "That's the brief. Let's build your launch deck." },
};
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx jest src/constants/onboardingCoach.test.ts -v`
Expected: PASS (3 tests).

- [ ] **Step 5: Commit**

```bash
git add src/constants/onboardingCoach.ts src/constants/onboardingCoach.test.ts
git commit -m "feat: add per-step onboarding coach copy map"
```

---

## Task 4: Add the analytics event name

**Files:**
- Modify: `src/lib/analytics.ts`

- [ ] **Step 1: Extend the `AnalyticsEvent` union**

In `src/lib/analytics.ts`, add the new event to the union. Change:

```typescript
  | "copilot_message_sent"
  | "plan_upgraded"
  | "upsell_soft_shown";
```

to:

```typescript
  | "copilot_message_sent"
  | "plan_upgraded"
  | "upsell_soft_shown"
  | "onboarding_voice_used";
```

- [ ] **Step 2: Verify types compile**

Run: `npx tsc --noEmit`
Expected: exit 0 (no type errors introduced).

- [ ] **Step 3: Commit**

```bash
git add src/lib/analytics.ts
git commit -m "feat: add onboarding_voice_used analytics event"
```

---

## Task 5: `AstroVoiceDock` component

**Files:**
- Create: `src/components/onboarding/AstroVoiceDock.tsx`
- Test: `src/components/onboarding/AstroVoiceDock.test.tsx`

- [ ] **Step 1: Write the failing test**

```tsx
// src/components/onboarding/AstroVoiceDock.test.tsx
import { fireEvent, render, screen, waitFor } from "@testing-library/react-native";

// Same reanimated mock shape the existing onboarding tests use — the dock
// renders through @/tw (react-native-css), so a bare mock can break className
// rendering. The added useReducedMotion is what the dock itself consumes.
jest.mock("react-native-reanimated", () => {
  const { View, ScrollView } = require("react-native");
  return {
    __esModule: true,
    default: { View, ScrollView, createAnimatedComponent: (c: unknown) => c },
    useSharedValue: (v: number) => ({ value: v }),
    useAnimatedStyle: () => ({}),
    withTiming: (to: number) => to,
    withRepeat: (v: unknown) => v,
    useReducedMotion: () => false,
    Easing: { inOut: () => () => 0, ease: () => 0 },
  };
});

// Render the avatar as a plain stub so the test never touches image assets.
jest.mock("@/components/astro/AstroAvatar", () => {
  const { View } = require("react-native");
  return { AstroAvatar: () => <View testID="astro-avatar" /> };
});

const mockTrack = jest.fn();
jest.mock("@/lib/analytics", () => ({ track: (...a: unknown[]) => mockTrack(...a) }));
jest.mock("@/lib/haptics", () => ({ haptics: { light: jest.fn() } }));

// Controllable speech mock shared with the hook.
const listeners: Record<string, (e: unknown) => void> = {};
const mockStart = jest.fn();
const mockStop = jest.fn();
let mockAvailable = true;
jest.mock("expo-speech-recognition", () => ({
  ExpoSpeechRecognitionModule: {
    isRecognitionAvailable: () => mockAvailable,
    requestPermissionsAsync: async () => ({ granted: true }),
    start: (...a: unknown[]) => mockStart(...a),
    stop: (...a: unknown[]) => mockStop(...a),
  },
  useSpeechRecognitionEvent: (name: string, handler: (e: unknown) => void) => {
    listeners[name] = handler;
  },
}));

import { AstroVoiceDock } from "./AstroVoiceDock";

beforeEach(() => {
  jest.clearAllMocks();
  mockAvailable = true;
});

it("renders the step's coach line", () => {
  render(<AstroVoiceDock step={0} />);
  expect(screen.getByText(/called/i)).toBeOnTheScreen();
});

it("shows no mic when there is no dictation target", () => {
  render(<AstroVoiceDock step={3} />);
  expect(screen.queryByLabelText("Dictate")).toBeNull();
});

it("shows the mic on a text step and starts dictation on press", async () => {
  const onChange = jest.fn();
  render(
    <AstroVoiceDock
      step={1}
      field="one_liner"
      dictationTarget={{ value: "", onChange }}
    />,
  );
  fireEvent.press(screen.getByLabelText("Dictate"));
  await waitFor(() => expect(mockStart).toHaveBeenCalled());
});

it("appends a final transcript to the field and tracks the event", async () => {
  const onChange = jest.fn();
  render(
    <AstroVoiceDock
      step={1}
      field="one_liner"
      dictationTarget={{ value: "Habit app", onChange }}
    />,
  );
  fireEvent.press(screen.getByLabelText("Dictate"));
  await waitFor(() => expect(mockStart).toHaveBeenCalled());

  // Native emits a final result.
  listeners.result?.({ results: [{ transcript: "for indie devs" }], isFinal: true });

  expect(onChange).toHaveBeenLastCalledWith("Habit app for indie devs");
  expect(mockTrack).toHaveBeenCalledWith("onboarding_voice_used", { field: "one_liner" });
});

it("hides the mic when recognition is unavailable", () => {
  mockAvailable = false;
  render(
    <AstroVoiceDock step={1} field="one_liner" dictationTarget={{ value: "", onChange: jest.fn() }} />,
  );
  expect(screen.queryByLabelText("Dictate")).toBeNull();
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx jest src/components/onboarding/AstroVoiceDock.test.tsx -v`
Expected: FAIL — `Cannot find module './AstroVoiceDock'`.

- [ ] **Step 3: Implement the component**

```tsx
// src/components/onboarding/AstroVoiceDock.tsx
import { useCallback, useRef } from "react";
import { useReducedMotion } from "react-native-reanimated";

import { AstroAvatar } from "@/components/astro/AstroAvatar";
import { COACH } from "@/constants/onboardingCoach";
import { track } from "@/lib/analytics";
import { cn } from "@/lib/cn";
import { haptics } from "@/lib/haptics";
import { useSpeechToText } from "@/lib/useSpeechToText";
import { Pressable, Text, View } from "@/tw";

export type DictationTarget = {
  value: string;
  onChange: (next: string) => void;
};

export type VoiceField = "app_name" | "one_liner" | "audience";

type Props = {
  /** Absolute onboarding step index (0-6). */
  step: number;
  /** Analytics field key; present on text steps only. */
  field?: VoiceField;
  /** The active text field's binding; present on text steps only. */
  dictationTarget?: DictationTarget;
  /** Future seam: a conversational handler for finalized utterances. */
  onUtterance?: (transcript: string) => void;
};

export function AstroVoiceDock({
  step,
  field,
  dictationTarget,
  onUtterance,
}: Props) {
  const coach = COACH[step] ?? COACH[0];
  const baseRef = useRef("");
  const reducedMotion = useReducedMotion();

  const { isAvailable, isListening, start, stop } = useSpeechToText({
    onResult: (text, isFinal) => {
      if (dictationTarget) {
        const sep = baseRef.current && text ? " " : "";
        dictationTarget.onChange(baseRef.current + sep + text);
      }
      if (isFinal) {
        if (field) track("onboarding_voice_used", { field });
        onUtterance?.(text);
      }
    },
  });

  const showMic = Boolean(dictationTarget) && isAvailable;

  const handleMicPress = useCallback(() => {
    if (isListening) {
      stop();
      return;
    }
    baseRef.current = dictationTarget?.value ?? "";
    haptics.light();
    void start();
  }, [isListening, stop, start, dictationTarget]);

  return (
    <View
      pointerEvents="box-none"
      className="absolute bottom-24 right-4 items-end gap-2"
      style={{ maxWidth: 240 }}
    >
      <View
        className="rounded-2xl rounded-br-sm border border-border-med bg-bg-card px-3 py-2"
        style={{ maxWidth: 220 }}
      >
        <Text className="font-body text-xs text-text-secondary">
          {isListening ? "Listening…" : coach.line}
        </Text>
      </View>

      <Pressable
        onPress={showMic ? handleMicPress : undefined}
        disabled={!showMic}
        accessibilityRole={showMic ? "button" : undefined}
        accessibilityLabel={
          showMic ? (isListening ? "Stop dictating" : "Dictate") : undefined
        }
        accessibilityState={showMic ? { busy: isListening } : undefined}
      >
        <AstroAvatar plan="cadet" variant="orb" pose={coach.pose} size={52} />
        {showMic ? (
          <View
            className={cn(
              "absolute -bottom-1 -right-1 h-6 w-6 items-center justify-center rounded-full border border-bg-deep",
              isListening ? "bg-brand-teal" : "bg-bg-surface",
            )}
            style={
              isListening && !reducedMotion ? { opacity: 0.92 } : undefined
            }
          >
            <Text style={{ fontSize: 11 }}>{isListening ? "■" : "🎤"}</Text>
          </View>
        ) : null}
      </Pressable>
    </View>
  );
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx jest src/components/onboarding/AstroVoiceDock.test.tsx -v`
Expected: PASS (5 tests).

- [ ] **Step 5: Commit**

```bash
git add src/components/onboarding/AstroVoiceDock.tsx src/components/onboarding/AstroVoiceDock.test.tsx
git commit -m "feat: add floating Astro voice dock for onboarding"
```

---

## Task 6: Wire the dock into the onboarding screen

**Files:**
- Modify: `src/app/(auth)/onboarding.tsx`

- [ ] **Step 1: Import the dock**

In `src/app/(auth)/onboarding.tsx`, add to the imports (next to the other `@/components` imports, e.g. after the `Button` import on line 8):

```typescript
import {
  AstroVoiceDock,
  type DictationTarget,
  type VoiceField,
} from "@/components/onboarding/AstroVoiceDock";
```

- [ ] **Step 2: Compute the active dictation target**

Inside `OnboardingScreenContent`, after `canNext` is defined (around line 180), add:

```typescript
  const voiceField: VoiceField | undefined =
    step === 0 ? "app_name" : step === 1 ? "one_liner" : step === 2 ? "audience" : undefined;

  const dictationTarget: DictationTarget | undefined =
    step === 0
      ? { value: appName, onChange: setAppName }
      : step === 1
        ? { value: oneLiner, onChange: setOneLiner }
        : step === 2
          ? { value: audience, onChange: setAudience }
          : undefined;
```

- [ ] **Step 3: Render the dock inside the KeyboardAvoidingView**

In the returned JSX, add the dock as the last child **inside** `<KeyboardAvoidingView>`, immediately before its closing tag (currently around line 459, just before `</KeyboardAvoidingView>`):

```tsx
          <AstroVoiceDock
            step={step}
            field={voiceField}
            dictationTarget={dictationTarget}
          />
        </KeyboardAvoidingView>
```

> Anchoring the dock inside the `KeyboardAvoidingView` is intentional (spec §"keyboard coexistence"): the avoiding view lifts it above the keyboard so the mic stays tappable on the text steps. Its `absolute bottom-24 right-4` keeps it clear of the footer CTA.

- [ ] **Step 4: Verify the screen still type-checks**

Run: `npx tsc --noEmit`
Expected: exit 0.

- [ ] **Step 5: Commit**

```bash
git add "src/app/(auth)/onboarding.tsx"
git commit -m "feat: mount Astro voice dock in onboarding wizard"
```

---

## Task 7: Keep existing onboarding tests green + assert the coach

**Files:**
- Modify: `src/__tests__/app/(auth)/onboarding.intent.test.tsx`
- Modify: `src/__tests__/app/(auth)/onboarding.mission.test.tsx`

The onboarding screen now renders `AstroVoiceDock`, which imports `expo-speech-recognition`. Both existing test files must mock that module so it does not load native code. The intent test additionally asserts the coach bubble renders.

- [ ] **Step 1: Add the speech mock to `onboarding.intent.test.tsx`**

Add this `jest.mock` alongside the other mocks near the top of the file (e.g. after the `@/lib/haptics` mock on line 73):

```typescript
jest.mock("expo-speech-recognition", () => ({
  ExpoSpeechRecognitionModule: {
    isRecognitionAvailable: () => false,
    requestPermissionsAsync: async () => ({ granted: false }),
    start: jest.fn(),
    stop: jest.fn(),
  },
  useSpeechRecognitionEvent: () => undefined,
}));
```

(With `isRecognitionAvailable: () => false` the dock renders coach-only — no mic, no permission flow — which is all these flow tests need.)

- [ ] **Step 2: Add a coach assertion to `onboarding.intent.test.tsx`**

Append this test to the file:

```typescript
it("shows Astro's coaching line on the first intent step", async () => {
  render(<OnboardingScreen />);
  await waitFor(() => {
    expect(screen.getByText(/called/i)).toBeOnTheScreen();
  });
});
```

- [ ] **Step 3: Add the same speech mock to `onboarding.mission.test.tsx`**

Add the identical `jest.mock("expo-speech-recognition", …)` block (from Step 1) alongside the existing mocks at the top of `src/__tests__/app/(auth)/onboarding.mission.test.tsx`.

- [ ] **Step 4: Run both onboarding test files**

Run: `npx jest "src/__tests__/app/(auth)/onboarding" -v`
Expected: PASS — all prior tests plus the new coach assertion.

- [ ] **Step 5: Run the full suite**

Run: `npx jest`
Expected: all green. If any other test renders the onboarding screen and now fails to resolve `expo-speech-recognition`, add the same mock block to that file.

- [ ] **Step 6: Commit**

```bash
git add "src/__tests__/app/(auth)/onboarding.intent.test.tsx" "src/__tests__/app/(auth)/onboarding.mission.test.tsx"
git commit -m "test: mock speech recognition and assert onboarding coach line"
```

---

## Task 8: Manual QA checklist

**Files:**
- Modify: `Docs/11_QA_MANUAL_RESULTS.md` (append an "Astro voice dock" section; create the file with an `# Astro voice dock` heading if it does not exist)

- [ ] **Step 1: Add the checklist**

```markdown
## Astro voice dock (2026-06-06)

- [ ] Dev-client rebuilt (`npx expo run:ios` / `run:android`) — module loads, no red screen.
- [ ] Onboarding step 0: Astro orb + bubble visible bottom-right; bubble shows the step-0 line.
- [ ] First mic tap prompts for mic + speech permission; granting starts dictation (orb mic turns teal, bubble shows "Listening…").
- [ ] Dictation **appends** to typed text (type "Habit app", then dictate "for indie devs" → field reads "Habit app for indie devs").
- [ ] **Keyboard coexistence:** with the keyboard open on steps 0–2, the orb stays visible and tappable above the keyboard.
- [ ] Steps 3–6 (platform/stage/date/confirm): orb shows coaching, **no** mic badge.
- [ ] Permission denied: a hint is acceptable; typing still works; no crash.
- [ ] Web (Chrome, `npm run web`): mic appears and dictation works via Web Speech API.
- [ ] Reduced motion ON (OS setting): orb does not animate; "Listening…" shown as a static label.
- [ ] VoiceOver/TalkBack: mic button announces "Dictate" / "Stop dictating".
```

- [ ] **Step 2: Commit**

```bash
git add Docs/11_QA_MANUAL_RESULTS.md
git commit -m "docs: add Astro voice dock manual QA checklist"
```

---

## Self-review (spec coverage)

| Spec requirement | Task |
| --- | --- |
| `expo-speech-recognition` + config plugin + permissions | Task 1 |
| Isolated `useSpeechToText` hook (start/stop/availability/permission/result) | Task 2 |
| Per-step coach copy + pose map | Task 3 |
| `onboarding_voice_used` analytics event | Task 4 (defined), Task 5 (fired) |
| `AstroVoiceDock` floating orb + bubble; mic only on text steps; append semantics; unavailable → no mic; reduced-motion label; a11y | Task 5 |
| `onUtterance` future-conversational seam | Task 5 (prop) |
| Mount in onboarding; dictation target per step; keyboard coexistence anchoring | Task 6 |
| Existing onboarding tests unaffected; coach line asserted | Task 7 |
| Manual QA (rebuild, permissions, keyboard, web, reduced motion) | Task 8 |

**Deferred (not built here, per spec):** conversational Astro (STT + LLM + TTS), app-wide Astro voice mounting, and the HTML-concept extras (description/problem fields, priorities step, idea stage, T-minus preview, readiness ring, starfield, Fuel/Cadet welcome messaging).

---

**Plan complete and saved to `Docs/superpowers/plans/2026-06-06-astro-voice-dock.md`.**
