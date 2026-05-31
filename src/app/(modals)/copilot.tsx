import React, { useState } from "react";
import { useRouter } from "expo-router";
import { KeyboardAvoidingView, Platform } from "react-native";

import { ScrollView, View, Text, TextInput, Pressable } from "@/tw";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { AstroAvatar } from "@/components/astro/AstroAvatar";
import { cn } from "@/lib/cn";
import { useMissionStore } from "@/store/mission";
import { useUIStore } from "@/store/ui";
import { PLANS, planMeets } from "@/constants/plans";
import { readinessLabel } from "@/lib/launch";

type Mode = "standard" | "powerful";
type Msg = { id: number; role: "user" | "assistant"; text: string };

const SUGGESTED = [
  "What should I do next?",
  "Review my launch gaps.",
  "Help me finish this Blueprint.",
  "Prepare my Signal Deck.",
  "Explain this milestone.",
];

const STANDARD_COST = 2;

export default function CopilotModal() {
  const router = useRouter();
  const { mission, milestones } = useMissionStore();
  const { plan, fuel, spendFuel } = useUIStore();

  const [mode, setMode] = useState<Mode>("standard");
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<Msg[]>([
    {
      id: 0,
      role: "assistant",
      text: `Hey Commander — I'm Astro. ${mission.appName} is at ${mission.readinessScore}% readiness (${readinessLabel(mission.readinessScore)}). Ask me anything, or tap a prompt below.`,
    },
  ]);

  /** Mock, mission-aware reply. Real responses run server-side in the AI phase. */
  const buildReply = (prompt: string): string => {
    const next = milestones.find((m) => !m.completed);
    const incomplete = milestones.filter((m) => !m.completed).length;
    if (/next/i.test(prompt)) {
      return next
        ? `Your best next move: “${next.title}”. ${next.description} That'll bump your readiness from ${mission.readinessScore}%.`
        : `Everything available is done — you're at ${mission.readinessScore}%. Time to stage your Signal Deck.`;
    }
    if (/gap|review/i.test(prompt)) {
      return `You have ${incomplete} milestone${incomplete === 1 ? "" : "s"} left for ${mission.appName}. Biggest gaps are in Store Prep and Marketing — want me to draft App Store copy?`;
    }
    if (/signal/i.test(prompt)) {
      return `For a ${mission.platform} launch, start your Signal Deck with the dev-log thread (T-14) and waitlist email. Forge missing assets straight from the Signal Deck.`;
    }
    return `For ${mission.appName} — “${mission.oneLiner}” aimed at ${mission.targetAudience} — here's my take: focus on “${next?.title ?? "staging your launch"}” next, then prepare your Signal Deck.`;
  };

  const send = (text: string) => {
    const trimmed = text.trim();
    if (!trimmed) return;
    if (mode === "powerful" && !planMeets(plan, "admiral")) {
      router.push("/(modals)/refuel");
      return;
    }
    if (mode === "standard" && !spendFuel(STANDARD_COST)) {
      router.push("/(modals)/refuel");
      return;
    }
    setMessages((prev) => [
      ...prev,
      { id: prev.length, role: "user", text: trimmed },
      { id: prev.length + 1, role: "assistant", text: buildReply(trimmed) },
    ]);
    setInput("");
  };

  const powerfulLocked = !planMeets(plan, "admiral");

  return (
    <View className="flex-1 bg-bg-deep">
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        {/* Astro header */}
        <View className="flex-row items-center gap-3 border-b border-border-default px-5 py-3">
          <AstroAvatar plan={plan} variant="orb" size={52} />
          <View className="flex-1">
            <Text className="font-display text-lg font-bold text-text-primary">Astro</Text>
            <View className="mt-0.5 flex-row items-center gap-2">
              <Badge label={PLANS[plan].name} variant="plan" />
              <Text className="font-mono text-[11px] text-text-tertiary">
                {mode === "standard" ? `${STANDARD_COST} Fuel / msg` : "Powerful mode"}
              </Text>
            </View>
          </View>
        </View>

        {/* Mode selector */}
        <View className="flex-row gap-2 px-5 py-3">
          {(["standard", "powerful"] as Mode[]).map((m) => {
            const active = mode === m;
            const locked = m === "powerful" && powerfulLocked;
            return (
              <Pressable
                key={m}
                onPress={() => (locked ? router.push("/(modals)/refuel") : setMode(m))}
                className={cn(
                  "flex-1 items-center rounded-full border px-3 py-2",
                  active
                    ? "border-brand-teal bg-brand-teal/15"
                    : "border-border-med bg-bg-surface",
                )}
              >
                <Text
                  className={cn(
                    "font-body text-sm font-semibold capitalize",
                    active ? "text-brand-teal" : "text-text-secondary",
                  )}
                >
                  {locked ? `🔒 ${m}` : m}
                </Text>
              </Pressable>
            );
          })}
        </View>

        {/* Messages */}
        <ScrollView contentContainerClassName="gap-3 px-5 py-2">
          {messages.map((msg) => (
            <View
              key={msg.id}
              className={cn(
                "max-w-[85%]",
                msg.role === "user" ? "self-end" : "self-start",
              )}
            >
              <Card variant={msg.role === "user" ? "elevated" : "glass"}>
                <Text className="font-body text-sm text-text-primary">{msg.text}</Text>
              </Card>
            </View>
          ))}

          {/* Suggested prompts */}
          <View className="mt-1 flex-row flex-wrap gap-2">
            {SUGGESTED.map((p) => (
              <Pressable
                key={p}
                onPress={() => send(p)}
                className="rounded-full border border-border-med bg-bg-surface px-3 py-1.5 active:opacity-80"
              >
                <Text className="font-body text-xs text-text-secondary">{p}</Text>
              </Pressable>
            ))}
          </View>
        </ScrollView>

        {/* Input */}
        <View className="flex-row items-center gap-2 border-t border-border-default px-4 py-3">
          <TextInput
            value={input}
            onChangeText={setInput}
            placeholder="Ask Astro…"
            placeholderTextColor="#64748B"
            onSubmitEditing={() => send(input)}
            className="flex-1 rounded-full border border-border-med bg-bg-card px-4 py-2.5 font-body text-base text-text-primary"
          />
          <Pressable
            onPress={() => send(input)}
            accessibilityLabel="Send"
            className="h-11 w-11 items-center justify-center rounded-full bg-brand-teal active:opacity-80"
          >
            <Text className="text-lg text-bg-deep">↑</Text>
          </Pressable>
        </View>
      </KeyboardAvoidingView>
    </View>
  );
}
