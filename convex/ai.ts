"use node";

import Anthropic from "@anthropic-ai/sdk";
import { v } from "convex/values";
import { action } from "./_generated/server";
import { internal } from "./_generated/api";

import { mockCopilotReply, mockGenerateAsset } from "./aiMock";

/**
 * Shared AI generation pipeline (Docs/03 §AI). All Foundry/Copilot AI runs through
 * this Convex Action — the provider key lives ONLY in the Convex environment, never
 * in the app bundle. Live calls require an authenticated user who passes plan +
 * Fuel checks (internal.users.authorize*). Unauthenticated callers get demo drafts
 * and never touch Anthropic.
 *
 * Models: standard → Sonnet 4.6, powerful (Admiral) → Opus 4.8 (Docs/08).
 */

const STANDARD_MODEL = "claude-sonnet-4-6";
const POWERFUL_MODEL = "claude-opus-4-8";
const MAX_FIELD = 4000;
const MAX_MESSAGES = 40;
const MAX_MESSAGE = 8000;

function clip(value: string, max = MAX_FIELD): string {
  return value.length <= max ? value : value.slice(0, max);
}

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
  returns: v.object({
    content: v.string(),
    mock: v.boolean(),
  }),
  handler: async (ctx, args) => {
    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey) {
      return {
        content: mockGenerateAsset(args),
        mock: true,
      };
    }

    const gate = await ctx.runQuery(internal.users.authorizeFoundryGeneration, {
      tool: args.tool,
    });
    if (!gate.ok) {
      return {
        content: mockGenerateAsset(args),
        mock: true,
      };
    }

    const client = new Anthropic({ apiKey });
    const model = args.mode === "powerful" ? POWERFUL_MODEL : STANDARD_MODEL;

    const m = args.mission;
    const userPrompt = [
      `Asset to create: ${clip(args.toolLabel)} (tool id: ${clip(args.tool, 64)}).`,
      args.signalLabel
        ? `This is for the Signal Deck step: "${clip(args.signalLabel)}".`
        : "",
      "",
      "Mission context:",
      `- App name: ${clip(m.appName, 200)}`,
      `- One-liner: ${clip(m.oneLiner, 500)}`,
      m.appDescription ? `- Description: ${clip(m.appDescription)}` : "",
      `- Target audience: ${clip(m.targetAudience, 500)}`,
      `- Platform: ${clip(m.platform, 32)}`,
      m.stage ? `- Stage: ${clip(m.stage, 64)}` : "",
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

    return { content: content || "(No content generated.)", mock: false };
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
  returns: v.object({
    content: v.string(),
    mock: v.boolean(),
  }),
  handler: async (ctx, args) => {
    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey) {
      return {
        content: mockCopilotReply(args),
        mock: true,
      };
    }

    const mode = args.mode ?? "standard";
    const gate = await ctx.runQuery(internal.users.authorizeCopilotTurn, {
      mode,
    });
    if (!gate.ok) {
      return {
        content: mockCopilotReply(args),
        mock: true,
      };
    }

    const client = new Anthropic({ apiKey });
    const model = mode === "powerful" ? POWERFUL_MODEL : STANDARD_MODEL;

    const m = args.mission;
    const c = args.context;
    const contextBlock = [
      "Current Mission context:",
      `- App: ${clip(m.appName, 200)} — "${clip(m.oneLiner, 500)}"`,
      `- Audience: ${clip(m.targetAudience, 500)}`,
      `- Platform: ${clip(m.platform, 32)}${m.stage ? `, stage: ${clip(m.stage, 64)}` : ""}`,
      `- Launch: ${clip(c.launchLabel, 200)}`,
      `- Readiness: ${c.readinessScore}%`,
      `- Blueprint completion: ${c.blueprintProgress}%`,
      `- Signals ready: ${c.signalsReady}/16`,
      c.incompleteMilestones.length
        ? `- Top incomplete milestones: ${c.incompleteMilestones
            .slice(0, 5)
            .map((title) => clip(title, 200))
            .join("; ")}`
        : "- All available milestones complete.",
    ].join("\n");

    const trimmedMessages = args.messages.slice(-MAX_MESSAGES).map((msg) => ({
      role: msg.role,
      content: clip(msg.content, MAX_MESSAGE),
    }));

    const message = await client.messages.create({
      model,
      max_tokens: 1024,
      system: [
        {
          type: "text",
          text: COPILOT_SYSTEM,
          cache_control: { type: "ephemeral" },
        },
        { type: "text", text: contextBlock },
      ],
      messages: trimmedMessages,
    });

    const content = message.content
      .filter((b): b is Anthropic.TextBlock => b.type === "text")
      .map((b) => b.text)
      .join("\n")
      .trim();

    if (mode === "standard") {
      await ctx.runMutation(internal.users.consumeCopilotFuel, {});
    }

    return { content: content || "(No reply generated.)", mock: false };
  },
});
