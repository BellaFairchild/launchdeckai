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
