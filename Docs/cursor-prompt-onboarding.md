# Cursor Prompt: Build the LaunchDeckAI Onboarding Flow

> Paste this entire document into Cursor's Composer or chat. Attach `onboarding-flow-full.jsx` as a file reference. Ensure `LAUNCHDECK_VIBE.md` and `CLAUDE.md` are visible in the workspace.

---

## Role

You are a senior React Native engineer with deep Expo, NativeWind v4, and Convex experience. You are precise, you read existing project conventions before writing code, and you don't invent patterns when canonical ones exist in `LAUNCHDECK_VIBE.md`.

## Project context (one-line refresher)

LaunchDeckAI is an AI-powered mission-control app for indie founders launching iOS/Android apps. Calm dark-cockpit aesthetic, space-mission metaphor (Missions, Fuel, Foundry, Cargo Bay, Astro). Tech stack: **Expo + React Native + TypeScript + NativeWind v4 + Convex + Clerk + RevenueCat + Anthropic Claude API (server-side via Convex Actions only)**.

## Before you write any code

1. Read `LAUNCHDECK_VIBE.md` end-to-end. It is the source of truth for terminology, voice, design tokens, and Convex schema.
2. Read `CLAUDE.md` for build conventions.
3. Read the React prototype at `onboarding-flow-full.jsx` — this is the **interaction and visual spec**. Your job is to translate it to React Native, not redesign it. Match the state machine, the timing, the dialogue beats, and the design tokens exactly.
4. Confirm `constants/colors.ts`, `convex/schema.ts`, and `lib/access.ts` exist. If anything is missing, stop and report before proceeding.

## Task

Build the full 5-step founder onboarding flow as a single Expo Router screen, plus the supporting components, Convex action, and mutation. The flow runs after Clerk sign-in and before the user reaches the Home Deck.

### Acceptance criteria

A new user signs in via Clerk and is routed to `/onboarding`. They complete all five steps. On final tap, a `missions` document is created in Convex with the captured payload, the user's first four Foundation milestones are marked complete (awarding Fuel via the existing economy), and the user is routed to the Home Deck.

---

## Architecture

### File scope (create these)

```
/app/(auth)/onboarding.tsx                          # orchestrator screen
/components/onboarding/AstroAvatar.tsx              # SVG character (Cadet variant)
/components/onboarding/AstroBubble.tsx              # dialogue bubble
/components/onboarding/Starfield.tsx                # ambient background
/components/onboarding/ProgressBar.tsx              # 4-step indicator
/components/onboarding/PrimaryButton.tsx            # teal CTA
/components/onboarding/GhostButton.tsx              # secondary CTA
/components/onboarding/steps/WelcomeStep.tsx
/components/onboarding/steps/PitchStep.tsx
/components/onboarding/steps/CommitmentStep.tsx
/components/onboarding/steps/StageStep.tsx
/components/onboarding/steps/ForgingStep.tsx
/constants/onboardingDialogue.ts                    # all Astro copy
/constants/onboardingStages.ts                      # stage option list
/types/onboarding.ts                                # OnboardingData type
/convex/actions/generateMissionBrief.ts             # AI forge action
/convex/mutations/createMissionFromOnboarding.ts    # final write
```

### Files you may modify

- `convex/schema.ts` — only if a field is genuinely missing from `missions` (verify first; the schema in `LAUNCHDECK_VIBE.md` already covers everything).
- `app/_layout.tsx` — only to ensure the onboarding redirect logic fires when `user.hasCompletedOnboarding === false`.

### Do not touch

- The Home Deck screen
- Auth flow (`sign-in.tsx`, `sign-up.tsx`)
- Existing Convex queries or mutations outside the two listed above
- Anything inside `/components/dashboard`, `/components/mission`, `/components/foundry`, `/components/cargo`

---

## State machine

```
welcome → pitch → commitment → stage → forging → (route to /dashboard)
```

`pitch` and `commitment` have internal sub-phases. Manage all sub-state inside the step components — the orchestrator only knows the six top-level nodes.

### Shape of `OnboardingData`

```ts
// types/onboarding.ts
export type Platform = 'ios' | 'android' | 'both';
export type Stage   = 'idea' | 'building' | 'testing' | 'ready_to_ship';

export interface OnboardingData {
  pitch:      string;
  name:       string;
  oneLiner:   string;
  audience:   string;
  platform:   Platform | null;
  launchDate: Date | null;
  stage:      Stage | null;
}
```

### Sub-phase map

- **PitchStep**: `input` → `forging` → `results`
- **CommitmentStep**: `platform` → `date` → `reveal`
- **WelcomeStep, StageStep, ForgingStep**: single phase each

---

## Astro dialogue (extract to `constants/onboardingDialogue.ts`)

All copy lives in this constants file. Step components import from it. Do not inline strings in JSX.

```ts
// constants/onboardingDialogue.ts

export const DIALOGUE = {
  welcome: {
    headline:  'Welcome aboard.',
    line1:     "I'm Astro — your mission copilot.",
    line2:     "We'll plan your launch one phase at a time. Calm, clear, on a real timeline.",
    cta:       'Begin Mission Briefing',
    micro:     'Takes about 4 minutes · You can change anything later',
  },

  pitch: {
    prompt:    "First, tell me what you're building. Describe it in your own words — like you'd tell a friend over coffee. The more honest, the better I'll calibrate.",
    placeholder: "It's a habit tracker that adapts to your real schedule. Most apps punish you when you miss a day — mine gently catches you before the streak breaks. It's for people who've tried every productivity app and given up...",
    micro:     'Whatever you write becomes the context every AI tool uses for your mission',
    forgePhrases: [
      'Pulling your signal together…',
      'Reading the room…',
      'Sharpening positioning…',
    ],
    resultsIntro: "Here's what I picked up. Tweak anything that doesn't sound like you.",
    lockedIn:    'Got it. Locked in.',
    forgeCta:    'Forge My Mission Brief',
    confirmCta:  'This Is My App',
    reforgeCta:  '↻ Re-forge from a new pitch',
  },

  commitment: {
    platformPrompt: 'Where does this ship?',
    platformAck: {
      ios:     "Apple-first. Clean. Let's get the App Store path right.",
      android: "Play Store route. We'll prioritize ASO and screenshot specs.",
      both:    "Both stores. Doable — I'll pace the asset work in parallel.",
    },
    datePrompt: 'And when does it launch?',
    revealLabel: 'T-MINUS',
    revealSubLabel: 'DAYS TO BLASTOFF',
    revealClosing: 'T-Minus is live. From here, every move counts.',
    continueCta: 'Continue',
    pickDifferent: '↻ Pick a different date',
  },

  stage: {
    prompt: 'Where are you in the build?',
    cta:    'Build My Deck',
  },

  forging: {
    lines: [
      { text: 'Building your mission deck…',      pct: 22  },
      { text: 'Forging your first launch asset…', pct: 54  },
      { text: 'Locking in your milestones…',      pct: 81  },
      { text: 'Mission control online.',          pct: 100 },
    ],
    welcomeHeadline: 'Welcome aboard, Cadet.',
    welcomeSub:      'Your mission deck is ready. T-Minus is running.',
    cta:             'Enter Mission Control',
  },
};

// Pure function, no React. Used by CommitmentStep.
export function dayCountReaction(days: number): { headline: string; line: string } {
  if (days < 21)  return { headline: `${days} days.`, line: "Tight, but workable. We'll cut to essentials." };
  if (days < 61)  return { headline: `${days} days.`, line: "Healthy runway. We'll pace this right." };
  if (days < 121) return { headline: `${days} days.`, line: "Plenty of room to ship clean." };
  return                 { headline: `${days} days.`, line: "Long runway — let's keep momentum sharp." };
}
```

```ts
// constants/onboardingStages.ts
import type { Stage } from '@/types/onboarding';

export const STAGE_OPTIONS: Array<{
  key:   Stage;
  label: string;
  desc:  string;
  ack:   string;
}> = [
  { key: 'idea',          label: 'Just an idea',       desc: 'Concept stage. Nothing built yet.',         ack: "Foundation phase first — we'll build the rest as you ship." },
  { key: 'building',      label: 'Building',           desc: 'Code is being written.',                     ack: "Then we'll keep the build moving and stage your launch assets in parallel." },
  { key: 'testing',       label: 'Testing with users', desc: 'TestFlight, internal beta, or closed group.', ack: "Good — testing means we sharpen the copy while feedback comes in." },
  { key: 'ready_to_ship', label: 'Ready to ship',      desc: 'Code complete. Store submission imminent.',  ack: "Then we move fast. Assets first, store submission this week." },
];
```

---

## Visual translation: React (web) → React Native

The prototype uses CSS/Tailwind. Your job is to translate intent, not class names.

### Layout & components

| Prototype (web) | React Native |
|---|---|
| `<div>` | `<View>` |
| `<button>` | `<Pressable>` |
| `<input type="date">` | `@react-native-community/datetimepicker` (or `expo-datetime-picker`) |
| `<textarea>` | `<TextInput multiline />` |
| `className="..."` | NativeWind `className="..."` |
| SVG inline | `react-native-svg` (`Svg`, `Circle`, `Ellipse`, `Defs`, `RadialGradient`, `Stop`) |

### Colors

Use the existing `constants/colors.ts`. Do **not** hardcode hex values in components. If a token referenced in the prototype isn't in `colors.ts`, add it there first.

### Typography

NativeWind class names won't load Syne / Instrument Sans / DM Mono automatically. Confirm these fonts are loaded via `expo-font` in `app/_layout.tsx` (per `LAUNCHDECK_VIBE.md` section 9.2). If they aren't, load them. Use the font families in Text component `style` props or via NativeWind variants — match whichever pattern is already used elsewhere in the app.

### Animations

Use `react-native-reanimated` (assume already installed; if not, install via `npx expo install react-native-reanimated` and add the Babel plugin).

The animations that matter:

1. **Step transitions** — fade up 12px + opacity, 500ms ease. Wrap each step in an `Animated.View` with `entering={FadeInDown.duration(500)}`.

2. **The Pixar moment (Step 3 reveal)** — this is the centerpiece. When the date locks in:
   - T-Minus label fades in (200ms)
   - Day number scales from 0.6 → 1.0 with overshoot spring (`withSpring`, damping ~10, stiffness ~120) and opacity 0 → 1 over 700ms, 300ms delay
   - "DAYS TO BLASTOFF" sub-label and date fade in (600ms delay)
   - Astro's day-count reaction line fades in at 1000ms delay
   - "T-Minus is live…" line fades in at 1300ms delay
   - Continue button fades in at 1600ms delay
   - Fire `Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success)` exactly when the day number begins its scale-in

3. **Forge ring (Step 2 forging)** — two concentric circles pulsing outward (`scale 0.6 → 1.4`, opacity `0.8 → 0`, 2s ease-out, infinite, with one offset by 600ms). The core dot pulses gently (`scale 0.85 → 1.0`, 1.4s alternate).

4. **Starfield** — 90 stars with randomized twinkle. Use `Animated.View` with `useAnimatedStyle` or just CSS-style on web. On native, a simpler approach: render static stars with varying opacity — full twinkle animation is not worth the performance cost for ambient background. **Render the Starfield once and memoize it** — re-randomization on re-render will look broken.

5. **Final forge progress bar** — width transition from 0% → target%, 1s ease.

### Haptics moments

Use `expo-haptics`. Fire haptics at these moments:

| Moment | Haptic |
|---|---|
| Tapping any primary CTA | `impactAsync(ImpactFeedbackStyle.Light)` |
| Platform card selected | `selectionAsync()` |
| Date locks in (Pixar moment trigger) | `notificationAsync(NotificationFeedbackType.Success)` |
| Stage option selected | `selectionAsync()` |
| Forging step "Mission control online" line lands | `notificationAsync(NotificationFeedbackType.Success)` |
| Final "Enter Mission Control" tap | `impactAsync(ImpactFeedbackStyle.Medium)` |

Do not over-haptic. The list above is exhaustive.

### Keyboard handling

The pitch input (Step 2 sub-phase `input`) needs `KeyboardAvoidingView` wrapping the screen with `behavior="padding"` on iOS, `"height"` on Android. The textarea should auto-focus on mount. Add a "Done" toolbar or just rely on the Forge button being above the keyboard.

---

## Convex backend changes

### 1. New action: `convex/actions/generateMissionBrief.ts`

```ts
import { action } from '../_generated/server';
import { v } from 'convex/values';
import Anthropic from '@anthropic-ai/sdk';

export const generateMissionBrief = action({
  args: { pitch: v.string() },
  returns: v.object({
    name:     v.string(),
    oneLiner: v.string(),
    audience: v.string(),
  }),
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error('Unauthorized');

    if (args.pitch.trim().length < 12) {
      throw new Error('Pitch too short — needs at least 12 characters');
    }

    const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

    const systemPrompt = `You are Astro, the launch copilot for LaunchDeckAI. A founder has described their app in their own words. Extract three things:

1. A working app name (1–4 words, no taglines, no punctuation other than spaces)
2. A one-liner (under 60 characters, declarative, no fluff)
3. A target audience description (one sentence, sharp and specific — name a real type of person, not "users" or "people")

Voice: calm, specific, never generic. Avoid marketing speak. The audience should be sharp enough that the founder can immediately imagine three of them.

Respond ONLY with JSON. No preamble. No markdown fences. Exactly this shape:
{ "name": "...", "oneLiner": "...", "audience": "..." }`;

    const response = await client.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 400,
      system: systemPrompt,
      messages: [{ role: 'user', content: args.pitch }],
    });

    const text = response.content
      .filter((b) => b.type === 'text')
      .map((b) => (b as { type: 'text'; text: string }).text)
      .join('')
      .trim();

    // Defensive parse — strip any stray markdown fences
    const clean = text.replace(/^```json\s*/i, '').replace(/```$/, '').trim();
    const parsed = JSON.parse(clean) as { name: string; oneLiner: string; audience: string };

    if (!parsed.name || !parsed.oneLiner || !parsed.audience) {
      throw new Error('Invalid AI response shape');
    }
    return parsed;
  },
});
```

**Important:** `generateMissionBrief` does **not** spend Fuel. It runs once during onboarding, gated by Clerk auth. Do not call the standard Foundry generation path.

### 2. New mutation: `convex/mutations/createMissionFromOnboarding.ts`

```ts
import { mutation } from '../_generated/server';
import { v } from 'convex/values';

export const createMissionFromOnboarding = mutation({
  args: {
    appName:        v.string(),
    oneLiner:       v.string(),
    appDescription: v.string(),   // the original pitch
    targetAudience: v.string(),
    platform:       v.union(v.literal('ios'), v.literal('android'), v.literal('both')),
    launchDate:     v.number(),   // unix ms
    stage:          v.union(
      v.literal('idea'),
      v.literal('building'),
      v.literal('testing'),
      v.literal('ready_to_submit')
    ),
  },
  returns: v.id('missions'),
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error('Unauthorized');

    const user = await ctx.db
      .query('users')
      .withIndex('by_clerk_id', (q) => q.eq('clerkId', identity.subject))
      .unique();
    if (!user) throw new Error('User record not found');

    const missionId = await ctx.db.insert('missions', {
      userId:         user._id,
      appName:        args.appName,
      appDescription: args.appDescription,
      oneLiner:       args.oneLiner,
      targetAudience: args.targetAudience,
      platform:       args.platform,
      launchDate:     args.launchDate,
      stage:          args.stage,
      status:         'active',
      readinessScore: 0,
      fuelEarned:     0,
      createdAt:      Date.now(),
    });

    // Mark Foundation milestones 1, 2, 3, 5 as complete and award Fuel
    // (skip #4 "Upload logo" — that happens after onboarding)
    const foundationTemplateOrders = [1, 2, 3, 5];
    const templates = await ctx.db
      .query('milestoneTemplates')
      .filter((q) => q.eq(q.field('category'), 'foundation'))
      .collect();

    let totalFuel = 0;
    for (const template of templates) {
      if (!foundationTemplateOrders.includes(template.order)) continue;

      await ctx.db.insert('milestones', {
        missionId,
        userId:        user._id,
        templateId:    template._id,
        completed:     true,
        completedAt:   Date.now(),
        fuelAwarded:   true,
      });

      await ctx.db.insert('fuelHistory', {
        userId:           user._id,
        amount:           template.fuelReward,
        reason:           'milestone_complete',
        relatedMissionId: missionId,
        createdAt:        Date.now(),
      });

      totalFuel += template.fuelReward;
    }

    await ctx.db.patch(user._id, {
      fuelBalance: user.fuelBalance + totalFuel,
    });

    // Readiness recalc is handled by the existing query that derives it live.
    // If your readiness lives as a stored field, patch the mission here.

    return missionId;
  },
});
```

### 3. Add to `users` schema (verify first)

If the `users` table doesn't already have `hasCompletedOnboarding: v.boolean()`, add it. Set to `true` after `createMissionFromOnboarding` succeeds. The `app/_layout.tsx` redirect check uses this field.

---

## Implementation rules (non-negotiable)

1. **No client-side Anthropic calls.** The forge step calls `useAction(api.actions.generateMissionBrief.generateMissionBrief)`. The Anthropic API key lives only in Convex env vars.
2. **No localStorage / AsyncStorage during onboarding.** State is in-memory only. The Mission record is the single source of truth, created at the end.
3. **No back navigation between steps.** Forward-only. The "↻ Re-forge from a new pitch" and "↻ Pick a different date" affordances within Step 2 and Step 3 are the only "back" allowed in v1.
4. **No paywall surfaces.** Onboarding never sells. Locked features are visible only on the Deck after onboarding completes.
5. **Single primary action per screen.** Every step has exactly one teal CTA. Ghost buttons (↻) are secondary affordances, not equal alternatives.
6. **Astro voice rules** (from `LAUNCHDECK_VIBE.md` section 4): calm, brief, specific. Two-sentence max per beat. No exclamation marks. No emoji. The dialogue in the constants file is final — do not edit it.
7. **The pitch becomes the system prompt context.** Store the full pitch as `missions.appDescription`. It will be injected into every future Foundry and Copilot call. Do not summarize it before saving.
8. **Token-safe.** The forge action has `max_tokens: 400`. Do not raise this.
9. **Don't compute readiness on the client.** Per section 15 of the vibe doc, readiness is a server-side query.
10. **Use 12px as the minimum font size.** Mono labels can be 11px only if absolutely necessary for spacing; never below.

---

## Out of scope (do not build)

- The Home Deck screen (already exists or built separately)
- Logo upload during onboarding (milestone #4 — deferred to post-onboarding)
- Brand color selection (milestone #8 — deferred)
- Any paywall, plan selection, or upgrade UI
- Notification permission requests (handle separately)
- Analytics events (handle in a separate PR — leave `// TODO: posthog.capture(...)` markers at: onboarding_started, pitch_forged, date_committed, onboarding_completed)
- Back-navigation arrows
- Localization (English only for v1)
- Error retry UX for the forge action — show a simple inline error message and let the user re-tap Forge

---

## Verification checklist

Before submitting, confirm all of the following on iOS simulator:

- [ ] New user signs in → routes to `/onboarding`, not `/dashboard`
- [ ] Welcome screen: Astro animates in, second dialogue line appears after ~1.2s, CTA appears after ~2.4s
- [ ] Pitch step: textarea auto-focuses; Forge button stays disabled until 12+ characters; tapping Forge calls the Convex action and renders results within ~3s
- [ ] Each result card is tap-to-edit; Astro's "Got it. Locked in." confirmation appears once any field is edited
- [ ] Platform select: tapping a card triggers Astro ack inline; auto-advances to date sub-phase after ~600ms
- [ ] Date select: three preset buttons (4w/8w/12w) and a native date picker both work; picking either advances to reveal
- [ ] Pixar moment: T-Minus day number scales in with spring overshoot; success haptic fires at scale-in start; all five elements (label, number, sub-label, date, reaction line, closing line, CTA) stagger correctly
- [ ] Day-count reaction phrase matches the correct bucket (< 21 / 21–60 / 61–120 / > 120)
- [ ] Stage step: selecting any option shows Astro ack inline; CTA stays disabled until a selection is made
- [ ] Forging step: 4 lines stagger over ~4.4s; progress bar animates 0 → 100; final "Welcome aboard, Cadet" + Enter CTA render
- [ ] Tapping Enter Mission Control creates the Mission record, marks 4 Foundation milestones complete, awards ~250 Fuel, sets `hasCompletedOnboarding = true`, and routes to `/dashboard`
- [ ] If the forge action fails, the user sees an inline error and can re-tap Forge without losing their pitch text
- [ ] Re-launching the app for a completed user routes directly to `/dashboard`, never back through onboarding
- [ ] No Anthropic SDK import appears anywhere in `/app` or `/components` (check with `grep`)
- [ ] No font sizes below 11px exist in any new component

---

## Deliverable

A single PR containing all listed files, the Convex schema diff (if any), and a brief PR description that includes:

1. A short Loom or screen recording of the iOS simulator running the full flow
2. The captured Convex Mission record from one completed run, as JSON
3. Confirmation that all verification checklist items pass

Build it.
