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
