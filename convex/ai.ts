"use node";

import Anthropic from "@anthropic-ai/sdk";
import { action } from "./_generated/server";
import { v } from "convex/values";

/**
 * Shared AI generation pipeline (Docs/03 §AI). All Foundry/Copilot AI runs through
 * this Convex Action — the provider key lives ONLY in the Convex environment, never
 * in the app bundle. Identity/plan/fuel enforcement (steps 1-5 of the documented
 * pipeline) moves server-side once Clerk auth lands in Phase 4; for now this action
 * owns prompt-building + the provider call (steps 6-7), and the client handles the
 * mock fuel/plan gating + saving the result to Cargo Bay.
 *
 * Models: standard → Sonnet 4.6, powerful (Admiral) → Opus 4.8 (Docs/08).
 */

const STANDARD_MODEL = "claude-sonnet-4-6";
const POWERFUL_MODEL = "claude-opus-4-8";

const SYSTEM_PROMPT = `You are Astro, the AI launch copilot inside LaunchDeckAI — a calm, capable guide for first-time app creators.

You generate launch marketing and store assets that are ready to ship. Rules:
- Write in a clear, confident, human voice. No fluff, no clichés, no emoji spam.
- Use the creator's Mission context (app name, one-liner, audience, platform, stage).
- Match the requested asset format exactly (e.g. App Store copy, social posts, email sequence).
- Output ONLY the finished asset content. Do not include preamble, reasoning, or meta-commentary like "Here is...".`;

const missionContextValidator = v.object({
  appName: v.string(),
  oneLiner: v.string(),
  appDescription: v.optional(v.string()),
  targetAudience: v.string(),
  platform: v.string(),
  stage: v.optional(v.string()),
});

export const generateAsset = action({
  args: {
    /** Foundry tool id, e.g. "app_store_copy", "social_blast". */
    tool: v.string(),
    /** Human label for the tool / signal being forged. */
    toolLabel: v.string(),
    mode: v.optional(v.union(v.literal("standard"), v.literal("powerful"))),
    mission: missionContextValidator,
    /** Optional Signal Deck context when forging for a specific signal. */
    signalLabel: v.optional(v.string()),
  },
  returns: v.object({ content: v.string() }),
  handler: async (_ctx, args) => {
    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey) {
      throw new Error(
        "AI is not configured yet. Set ANTHROPIC_API_KEY in the Convex environment (npx convex env set ANTHROPIC_API_KEY ...).",
      );
    }

    const client = new Anthropic({ apiKey });
    const model = args.mode === "powerful" ? POWERFUL_MODEL : STANDARD_MODEL;

    const m = args.mission;
    const userPrompt = [
      `Asset to create: ${args.toolLabel} (tool id: ${args.tool}).`,
      args.signalLabel ? `This is for the Signal Deck step: "${args.signalLabel}".` : "",
      "",
      "Mission context:",
      `- App name: ${m.appName}`,
      `- One-liner: ${m.oneLiner}`,
      m.appDescription ? `- Description: ${m.appDescription}` : "",
      `- Target audience: ${m.targetAudience}`,
      `- Platform: ${m.platform}`,
      m.stage ? `- Stage: ${m.stage}` : "",
      "",
      "Generate the asset now.",
    ]
      .filter(Boolean)
      .join("\n");

    const message = await client.messages.create({
      model,
      max_tokens: 4000,
      // Stable system prompt is cached; volatile mission context lives in the
      // user turn (after the cache breakpoint) so the prefix stays reusable.
      system: [
        {
          type: "text",
          text: SYSTEM_PROMPT,
          cache_control: { type: "ephemeral" },
        },
      ],
      messages: [{ role: "user", content: userPrompt }],
    });

    const content = message.content
      .filter((b): b is Anthropic.TextBlock => b.type === "text")
      .map((b) => b.text)
      .join("\n")
      .trim();

    return { content: content || "(No content generated.)" };
  },
});

const COPILOT_SYSTEM = `You are Astro, the AI launch copilot inside LaunchDeckAI — a calm, capable guide for first-time app creators.

Give mission-aware launch guidance. Rules:
- Be concise: 2-5 sentences. Warm, specific, practical — never generic.
- Reference the creator's actual Mission (app, audience, readiness, next milestones, gaps).
- Suggest a concrete next step where helpful.
- Output ONLY your reply — no preamble, no reasoning, no "Here is...".`;

export const copilotReply = action({
  args: {
    mode: v.optional(v.union(v.literal("standard"), v.literal("powerful"))),
    mission: missionContextValidator,
    /** Live launch state for context (Docs/06 §Astro required context). */
    context: v.object({
      readinessScore: v.number(),
      incompleteMilestones: v.array(v.string()),
      blueprintProgress: v.number(),
      signalsReady: v.number(),
      launchLabel: v.string(),
    }),
    /** Conversation so far (must start with a user turn, alternating). */
    messages: v.array(
      v.object({
        role: v.union(v.literal("user"), v.literal("assistant")),
        content: v.string(),
      }),
    ),
  },
  returns: v.object({ content: v.string() }),
  handler: async (_ctx, args) => {
    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey) {
      throw new Error(
        "AI is not configured yet. Set ANTHROPIC_API_KEY in the Convex environment (npx convex env set ANTHROPIC_API_KEY ...).",
      );
    }

    const client = new Anthropic({ apiKey });
    const model = args.mode === "powerful" ? POWERFUL_MODEL : STANDARD_MODEL;

    const m = args.mission;
    const c = args.context;
    const contextBlock = [
      "Current Mission context:",
      `- App: ${m.appName} — "${m.oneLiner}"`,
      `- Audience: ${m.targetAudience}`,
      `- Platform: ${m.platform}${m.stage ? `, stage: ${m.stage}` : ""}`,
      `- Launch: ${c.launchLabel}`,
      `- Readiness: ${c.readinessScore}%`,
      `- Blueprint completion: ${c.blueprintProgress}%`,
      `- Signals ready: ${c.signalsReady}/16`,
      c.incompleteMilestones.length
        ? `- Top incomplete milestones: ${c.incompleteMilestones.slice(0, 5).join("; ")}`
        : "- All available milestones complete.",
    ].join("\n");

    const message = await client.messages.create({
      model,
      max_tokens: 1024,
      system: [
        { type: "text", text: COPILOT_SYSTEM, cache_control: { type: "ephemeral" } },
        { type: "text", text: contextBlock },
      ],
      messages: args.messages.map((msg) => ({
        role: msg.role,
        content: msg.content,
      })),
    });

    const content = message.content
      .filter((b): b is Anthropic.TextBlock => b.type === "text")
      .map((b) => b.text)
      .join("\n")
      .trim();

    return { content: content || "(No reply generated.)" };
  },
});
