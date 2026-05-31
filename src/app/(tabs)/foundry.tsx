import React, { useState } from "react";
import { useRouter, useLocalSearchParams } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { ActivityIndicator } from "react-native";
import { useAction } from "convex/react";

import { api } from "@cvx/_generated/api";
import { ScrollView, View, Text, Pressable } from "@/tw";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { FuelBadge } from "@/components/ui/FuelBadge";
import { Button } from "@/components/ui/Button";
import { FOUNDRY_TOOLS, type FoundryTool } from "@/constants/foundryTools";
import { useMissionStore } from "@/store/mission";
import { useUIStore } from "@/store/ui";
import { planMeets, PLANS } from "@/constants/plans";
import { haptics } from "@/lib/haptics";
import { track } from "@/lib/analytics";
import type { SignalPhase } from "@/types";

export default function FoundryScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{
    signalId?: string;
    signalLabel?: string;
    signalPhase?: string;
    tool?: string;
  }>();
  const { plan, fuel, spendFuel } = useUIStore();
  const mission = useMissionStore((s) => s.mission);
  const addAsset = useMissionStore((s) => s.addAsset);
  const convex = useMissionStore((s) => s.convex);
  const generateAsset = useAction(api.ai.generateAsset);
  const [savedTitle, setSavedTitle] = useState<string | null>(null);
  const [savedViaAI, setSavedViaAI] = useState(false);
  const [busyTool, setBusyTool] = useState<string | null>(null);

  const onGenerate = async (tool: FoundryTool) => {
    if (!planMeets(plan, tool.requiredPlan)) {
      router.push("/(modals)/refuel");
      return;
    }
    if (fuel < tool.fuelCost) {
      // Fuel wall — never deduct on insufficient balance.
      router.push("/(modals)/refuel");
      return;
    }

    setBusyTool(tool.id);
    // Try the real Convex Action (server-side Anthropic). Falls back to a mock
    // draft if Convex/the key isn't configured yet, so the loop always works.
    let content = `Draft ${tool.name} for ${mission.appName} (mock — set ANTHROPIC_API_KEY for real AI).`;
    let viaAI = false;
    try {
      const res = await generateAsset({
        tool: tool.id,
        toolLabel: tool.name,
        mode: planMeets(plan, "admiral") ? "powerful" : "standard",
        mission: {
          appName: mission.appName,
          oneLiner: mission.oneLiner,
          appDescription: mission.appDescription,
          targetAudience: mission.targetAudience,
          platform: mission.platform,
          stage: mission.stage,
        },
        signalLabel: params.signalLabel,
      });
      content = res.content;
      viaAI = true;
    } catch {
      // AI not configured / unreachable — keep the mock draft.
    }

    // Persist + deduct Fuel only after a successful generation (Docs/03).
    if (convex) {
      // Server enforces plan/fuel, saves the asset, writes fuelHistory; the
      // live query re-hydrates fuel + assets.
      try {
        await convex.createFoundryAsset({
          tool: tool.id,
          assetType: tool.assetType,
          category: tool.category,
          title: params.signalLabel ?? tool.name,
          content,
          signalId: params.signalId,
          signalLabel: params.signalLabel,
          signalPhase: params.signalPhase as SignalPhase | undefined,
        });
      } catch {
        router.push("/(modals)/refuel");
        setBusyTool(null);
        return;
      }
    } else {
      spendFuel(tool.fuelCost);
      addAsset({
        type: tool.assetType,
        title: params.signalLabel ?? tool.name,
        content,
        status: "in_prep",
        category: tool.category,
        signalId: params.signalId,
        signalLabel: params.signalLabel,
        signalPhase: params.signalPhase as SignalPhase | undefined,
      });
    }
    setSavedTitle(params.signalLabel ?? tool.name);
    setSavedViaAI(viaAI);
    setBusyTool(null);
    haptics.success();
    track("foundry_asset_generated", { tool: tool.id, viaAI });
    track("cargo_asset_saved", { type: tool.assetType });
    if (params.signalId) track("signal_asset_forged", { signalId: params.signalId });
  };

  return (
    <View className="flex-1 bg-bg-deep">
      <SafeAreaView style={{ flex: 1 }} edges={["bottom"]}>
        <ScrollView contentContainerClassName="gap-3 px-5 py-4 pb-24">
          {params.signalId ? (
            <Card variant="premium">
              <Text className="font-mono text-[11px] uppercase tracking-wider text-brand-gold">
                Forging for Signal
              </Text>
              <Text className="mt-1 font-display text-base font-bold text-text-primary">
                {params.signalLabel}
              </Text>
            </Card>
          ) : null}

          {savedTitle ? (
            <Card variant="success">
              <Text className="font-display text-base font-bold text-status-success">
                Saved to Cargo Bay
              </Text>
              <Text className="mt-0.5 font-body text-sm text-text-secondary">
                “{savedTitle}” is in_prep ({savedViaAI ? "AI-generated" : "mock draft"}).
                Mark it flight-ready in Cargo Bay.
              </Text>
              <Button
                label="View in Cargo Bay →"
                variant="secondary"
                size="sm"
                className="mt-2 self-start"
                onPress={() => router.push("/(modals)/cargo")}
              />
            </Card>
          ) : null}

          <Text className="px-1 font-body text-sm text-text-secondary">
            Generate launch assets with AI, powered by your Mission context.
          </Text>

          {FOUNDRY_TOOLS.map((tool) => {
            const locked = !planMeets(plan, tool.requiredPlan);
            const affordable = fuel >= tool.fuelCost;
            return (
              <Card key={tool.id} variant={locked ? "glass" : "elevated"}>
                <View className="flex-row items-start gap-3">
                  <Text className="text-2xl">{tool.glyph}</Text>
                  <View className="flex-1">
                    <Text className="font-display text-base font-bold text-text-primary">
                      {tool.name}
                    </Text>
                    <Text className="mt-0.5 font-body text-sm text-text-secondary">
                      {tool.description}
                    </Text>
                    <View className="mt-2 flex-row items-center gap-2">
                      <FuelBadge amount={tool.fuelCost} size="sm" warning={!affordable} />
                      {locked ? (
                        <Badge label={`Needs ${PLANS[tool.requiredPlan].name}`} variant="locked" />
                      ) : null}
                    </View>
                  </View>
                </View>
                <Pressable
                  onPress={() => (busyTool ? undefined : onGenerate(tool))}
                  accessibilityRole="button"
                  className={
                    "mt-3 min-h-[44px] flex-row items-center justify-center gap-2 rounded-full px-4 py-2.5 " +
                    (locked ? "bg-bg-depleted border border-border-default" : "bg-brand-teal active:opacity-90") +
                    (busyTool && busyTool !== tool.id ? " opacity-60" : "")
                  }
                >
                  {busyTool === tool.id ? (
                    <ActivityIndicator size="small" color="#060B14" />
                  ) : (
                    <Text className={locked ? "font-body font-semibold text-text-tertiary" : "font-body font-semibold text-bg-deep"}>
                      {locked
                        ? `🔒 Unlock with ${PLANS[tool.requiredPlan].name}`
                        : affordable
                          ? `Generate · ${tool.fuelCost} Fuel`
                          : `Need ${tool.fuelCost} Fuel — Refuel`}
                    </Text>
                  )}
                </Pressable>
              </Card>
            );
          })}
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}
