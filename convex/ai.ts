"use node";

import Anthropic from "@anthropic-ai/sdk";
import { v } from "convex/values";
import { action } from "./_generated/server";

import {
  mockCopilotReply,
  mockGenerateAsset,
  mockGenerateMissionBrief,
} from "./aiMock";

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

function isAnthropicAuthError(error: unknown): boolean {
  if (!(error instanceof Error)) return false;
  return (
    error.message.includes("401") ||
    error.message.includes("authentication_error") ||
    error.message.includes("invalid x-api-key")
  );
}

async function createAnthropicMessage(
  client: Anthropic,
  params: Anthropic.MessageCreateParamsNonStreaming,
): Promise<Anthropic.Message> {
  return await client.messages.create(params);
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
  handler: async (_ctx, args) => {
    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey) {
      return {
        content: mockGenerateAsset(args),
        mock: true,
      };
    }

    const client = new Anthropic({ apiKey });
    const model = args.mode === "powerful" ? POWERFUL_MODEL : STANDARD_MODEL;

    const m = args.mission;
    const userPrompt = [
      `Asset to create: ${args.toolLabel} (tool id: ${args.tool}).`,
      args.signalLabel
        ? `This is for the Signal Deck step: "${args.signalLabel}".`
        : "",
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

    const message = await (async () => {
      try {
        return await createAnthropicMessage(client, {
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
      } catch (error) {
        if (isAnthropicAuthError(error)) {
          console.error(
            "ANTHROPIC_API_KEY rejected by Anthropic — returning demo draft. " +
              "Run `npx convex env set ANTHROPIC_API_KEY <valid-key>` on this deployment.",
          );
          return null;
        }
        throw error;
      }
    })();

    if (!message) {
      return {
        content: mockGenerateAsset(args),
        mock: true,
      };
    }

    const content = message.content
      .filter((b): b is Anthropic.TextBlock => b.type === "text")
      .map((b) => b.text)
      .join("\n")
      .trim();

    return { content: content || "(No content generated.)", mock: false };
  },
});

const MISSION_BRIEF_SYSTEM = `You are Astro, the launch copilot inside LaunchDeckAI. A founder has described their app in their own words. Extract exactly three things:

1. name — a working app name (1-4 words, no taglines, no punctuation other than spaces)
2. oneLiner — a declarative one-liner under 60 characters, no fluff
3. audience — one sharp sentence naming a real type of person, never "users" or "people"

Voice: calm, specific, never generic. No marketing speak. The audience must be sharp enough that the founder can immediately picture three of them.

Respond ONLY with JSON. No preamble, no markdown fences. Exactly this shape:
{ "name": "...", "oneLiner": "...", "audience": "..." }`;

/**
 * Forge a Mission brief from a founder's raw pitch (onboarding centerpiece).
 * Not auth-gated — matches this file's convention (mock fallback when no key),
 * which lets it run during the pre-auth intent phase. Never spends Fuel.
 */
export const generateMissionBrief = action({
  args: { pitch: v.string() },
  returns: v.object({
    name: v.string(),
    oneLiner: v.string(),
    audience: v.string(),
    mock: v.boolean(),
  }),
  handler: async (_ctx, args) => {
    if (args.pitch.trim().length < 12) {
      throw new Error("Pitch too short — needs at least 12 characters");
    }

    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey) {
      return { ...mockGenerateMissionBrief(args.pitch), mock: true };
    }

    const client = new Anthropic({ apiKey });

    const message = await (async () => {
      try {
        return await createAnthropicMessage(client, {
          model: STANDARD_MODEL,
          max_tokens: 400,
          system: [
            {
              type: "text",
              text: MISSION_BRIEF_SYSTEM,
              cache_control: { type: "ephemeral" },
            },
          ],
          messages: [{ role: "user", content: args.pitch }],
        });
      } catch (error) {
        if (isAnthropicAuthError(error)) {
          console.error(
            "ANTHROPIC_API_KEY rejected by Anthropic — returning demo brief. " +
              "Run `npx convex env set ANTHROPIC_API_KEY <valid-key>` on this deployment.",
          );
          return null;
        }
        throw error;
      }
    })();

    if (!message) {
      return { ...mockGenerateMissionBrief(args.pitch), mock: true };
    }

    const text = message.content
      .filter((b): b is Anthropic.TextBlock => b.type === "text")
      .map((b) => b.text)
      .join("")
      .trim();

    // Defensive parse — strip stray markdown fences, fall back to mock on failure.
    try {
      const clean = text
        .replace(/^```json\s*/i, "")
        .replace(/^```\s*/i, "")
        .replace(/```$/, "")
        .trim();
      const parsed = JSON.parse(clean) as {
        name?: string;
        oneLiner?: string;
        audience?: string;
      };
      if (parsed.name && parsed.oneLiner && parsed.audience) {
        return {
          name: parsed.name,
          oneLiner: parsed.oneLiner,
          audience: parsed.audience,
          mock: false,
        };
      }
    } catch {
      // fall through to mock
    }
    return { ...mockGenerateMissionBrief(args.pitch), mock: true };
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
  handler: async (_ctx, args) => {
    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey) {
      return {
        content: mockCopilotReply(args),
        mock: true,
      };
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

    const message = await (async () => {
      try {
        return await createAnthropicMessage(client, {
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
          messages: args.messages.map((msg) => ({
            role: msg.role,
            content: msg.content,
          })),
        });
      } catch (error) {
        if (isAnthropicAuthError(error)) {
          console.error(
            "ANTHROPIC_API_KEY rejected by Anthropic — returning demo reply. " +
              "Run `npx convex env set ANTHROPIC_API_KEY <valid-key>` on this deployment.",
          );
          return null;
        }
        throw error;
      }
    })();

    if (!message) {
      return {
        content: mockCopilotReply(args),
        mock: true,
      };
    }

    const content = message.content
      .filter((b): b is Anthropic.TextBlock => b.type === "text")
      .map((b) => b.text)
      .join("\n")
      .trim();

    return { content: content || "(No reply generated.)", mock: false };
  },
});
