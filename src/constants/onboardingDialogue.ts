/**
 * Astro copy for the intent pitch-and-forge flow. Calm, brief, specific —
 * two sentences max per beat, no exclamation marks, no emoji. Step components
 * import these strings; do not inline copy in JSX.
 */
export const DIALOGUE = {
  pitch: {
    prompt:
      "First, tell me what you're building. Describe it in your own words — the more honest, the better I'll calibrate.",
    placeholder:
      "It's a habit tracker that adapts to your real schedule. Most apps punish you when you miss a day — mine gently catches you before the streak breaks…",
    micro: "Whatever you write becomes the context every AI tool uses for your mission.",
    forgePhrases: [
      "Pulling your signal together…",
      "Reading the room…",
      "Sharpening positioning…",
    ],
    forgeCta: "Forge My Mission Brief",
    manualCta: "I'll fill it in myself",
    resultsIntro: "Here's what I picked up. Tweak anything that doesn't sound like you.",
    lockedIn: "Got it. Locked in.",
    confirmCta: "This Is My App",
    reforgeCta: "↻ Re-forge from a new pitch",
    error:
      "Couldn't reach the forge. Fill these in yourself, or try again.",
    fieldLabels: {
      name: "App name",
      oneLiner: "One-liner",
      audience: "Audience",
    },
  },
} as const;
