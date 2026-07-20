/** Demo-mode copy when ANTHROPIC_API_KEY is not set on the Convex deployment. */

const DEMO_FOOTER =
  "\n\n---\n_Demo draft — run `npx convex env set ANTHROPIC_API_KEY <your-key>` on your dev deployment for live Astro generation._";

export type MissionContext = {
  appName: string;
  oneLiner: string;
  appDescription?: string;
  targetAudience: string;
  platform: string;
  stage?: string;
};

export function mockGenerateAsset(args: {
  tool: string;
  toolLabel: string;
  mission: MissionContext;
  signalLabel?: string;
}): string {
  const m = args.mission;
  const signal = args.signalLabel ? `\n**Signal:** ${args.signalLabel}\n` : "";
  const body = [
    `# ${args.toolLabel}`,
    "",
    `**${m.appName}** — ${m.oneLiner}`,
    signal,
    `**Audience:** ${m.targetAudience}`,
    `**Platform:** ${m.platform}${m.stage ? ` · **Stage:** ${m.stage}` : ""}`,
    m.appDescription ? `\n${m.appDescription}` : "",
    "",
    `## Sample ${args.toolLabel} outline`,
    "",
    "- Hook that names the problem your audience feels",
    "- One clear outcome your app delivers",
    "- Proof or credibility (beta users, waitlist, demo)",
    "- Single call to action aligned with launch week",
    "",
    "_Replace this scaffold with a full draft once AI is connected._",
    DEMO_FOOTER,
  ]
    .filter((line) => line !== undefined)
    .join("\n");

  return body;
}

const PITCH_STOPWORDS = new Set([
  "a", "an", "the", "it", "its", "it's", "is", "im", "i'm", "i", "my", "we",
  "our", "this", "that", "for", "to", "of", "and", "with", "app", "application",
  "tool", "platform", "thing", "something", "basically", "really", "just",
]);

/** Demo-mode mission brief when ANTHROPIC_API_KEY is absent — deterministic, no AI. */
export function mockGenerateMissionBrief(pitch: string): {
  name: string;
  oneLiner: string;
  audience: string;
} {
  const trimmed = pitch.trim();
  const titleCase = (w: string) =>
    w.charAt(0).toUpperCase() + w.slice(1).toLowerCase();

  const salient = trimmed
    .replace(/[^\p{L}\p{N}\s']/gu, " ")
    .split(/\s+/)
    .filter((w) => w.length > 1 && !PITCH_STOPWORDS.has(w.toLowerCase()));

  const name =
    salient.slice(0, 2).map(titleCase).join(" ").trim() || "Launch App";

  const firstSentence = (trimmed.split(/(?<=[.!?])\s/)[0] ?? trimmed).trim();
  const oneLiner =
    firstSentence.length > 60
      ? `${firstSentence.slice(0, 57).trimEnd()}…`
      : firstSentence || "A focused app built for people who tried the rest.";

  const forMatch = trimmed.match(/\bfor\s+([^.!?]{4,60})/i);
  const audience = forMatch
    ? `For ${forMatch[1].trim()}.`
    : "People who've tried every alternative and want something that finally fits.";

  return { name, oneLiner, audience };
}

export function mockCopilotReply(args: {
  mission: MissionContext;
  context: {
    readinessScore: number;
    incompleteMilestones: string[];
    blueprintProgress: number;
    signalsReady: number;
    launchLabel: string;
  };
  messages: { role: "user" | "assistant"; content: string }[];
}): string {
  const lastUser = [...args.messages].reverse().find((m) => m.role === "user");
  const prompt = lastUser?.content ?? "";
  const m = args.mission;
  const c = args.context;
  const next = c.incompleteMilestones[0];

  let reply: string;
  if (/next/i.test(prompt)) {
    reply = next
      ? `Your best next move: “${next}”. That should move ${m.appName} past ${c.readinessScore}% readiness.`
      : `Available milestones look complete — you're at ${c.readinessScore}%. Stage your Signal Deck next.`;
  } else if (/gap|review/i.test(prompt)) {
    const n = c.incompleteMilestones.length;
    reply = `You have ${n} milestone${n === 1 ? "" : "s"} left for ${m.appName}. Blueprints are ${c.blueprintProgress}% filled in; ${c.signalsReady}/16 signals are flight-ready.`;
  } else if (/signal/i.test(prompt)) {
    reply = `For a ${m.platform} launch (${c.launchLabel}), prioritize dev-log and waitlist signals first, then forge missing assets from Signal Deck.`;
  } else {
    reply = `For ${m.appName} — “${m.oneLiner}” for ${m.targetAudience} — focus on “${next ?? "staging your launch"}” next, then tighten Signal Deck coverage.`;
  }

  return `${reply}${DEMO_FOOTER}`;
}
