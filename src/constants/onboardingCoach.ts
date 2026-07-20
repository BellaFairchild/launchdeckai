import type { AstroPose } from "./astroAssets";

export type CoachLine = { pose: AstroPose; line: string };

/** Sub-phase coaching for the intent pitch-and-forge flow (overrides COACH[step]). */
export const INTENT_COACH: Record<"pitch" | "results" | "manual", CoachLine> = {
  pitch: {
    pose: "hello",
    line: "Tell me what you're building — your words, like you'd tell a friend.",
  },
  results: {
    pose: "thumbsup",
    line: "Here's what I picked up. Tweak anything that doesn't sound like you.",
  },
  manual: {
    pose: "pointing",
    line: "No problem — fill these in and we'll keep moving.",
  },
};

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
