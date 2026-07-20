import { useAction } from "convex/react";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useState } from "react";
import { ActivityIndicator, Modal } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { TabScreen } from "@/components/layout/TabScreen";
import { AstroAvatar } from "@/components/astro/AstroAvatar";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { FuelBadge } from "@/components/ui/FuelBadge";
import { Icon } from "@/components/ui/Icon";
import { colors } from "@/constants/colors";
import {
  foundryIcons,
  type FoundryIconName,
} from "@/constants/foundryIcons";
import { FOUNDRY_TOOLS, type FoundryTool } from "@/constants/foundryTools";
import { planMeets, PLANS } from "@/constants/plans";
import { track } from "@/lib/analytics";
import { playSignature } from "@/lib/audio";
import { haptics } from "@/lib/haptics";
import { useMissionStore } from "@/store/mission";
import { useUIStore } from "@/store/ui";
import { Pressable, ScrollView, Text, View } from "@/tw";
import { Image } from "@/tw/image";
import type { SignalPhase } from "@/types";
import { api } from "@cvx/_generated/api";

const TOOL_GLYPH_SIZE = 48;

/**
 * 3D tool glyph — self-contained art tile (assets/images/foundry/). Dimmed
 * when the tool is plan-locked.
 */
function ToolGlyph({
  icon,
  locked,
}: {
  icon: FoundryIconName;
  locked?: boolean;
}) {
  return (
    <Image
      source={foundryIcons[icon]}
      style={{
        width: TOOL_GLYPH_SIZE,
        height: TOOL_GLYPH_SIZE,
        borderRadius: 14,
        opacity: locked ? 0.45 : 1,
      }}
      contentFit="cover"
      accessibilityIgnoresInvertColors
    />
  );
}

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
  const [busyTool, setBusyTool] = useState<string | null>(null);
  // A freshly forged draft awaiting preview / upload. Not yet persisted — Fuel
  // is spent only when the user uploads it to the Cargo Bay.
  const [forged, setForged] = useState<{
    tool: FoundryTool;
    title: string;
    content: string;
    viaAI: boolean;
  } | null>(null);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [uploading, setUploading] = useState(false);
  // Post-upload confirmation (the asset now lives in the Cargo Bay).
  const [uploadedTitle, setUploadedTitle] = useState<string | null>(null);
  const [uploadedViaAI, setUploadedViaAI] = useState(false);

  // Forge content with AI. The result is held as a draft for preview — nothing
  // is saved and no Fuel is spent until the user uploads it (see onUpload).
  const onForge = async (tool: FoundryTool) => {
    if (!planMeets(plan, tool.requiredPlan)) {
      router.push("/(modals)/refuel");
      return;
    }
    if (fuel < tool.fuelCost) {
      // Fuel wall — never deduct on insufficient balance.
      router.push("/(modals)/refuel");
      return;
    }

    setUploadedTitle(null);
    setBusyTool(tool.id);
    let content = "";
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
      viaAI = !res.mock;
    } catch {
      content = `Draft ${tool.name} for ${mission.appName} (offline — check Convex connection).`;
    }

    setForged({ tool, title: params.signalLabel ?? tool.name, content, viaAI });
    setBusyTool(null);
    haptics.success();
    playSignature("signal_ready");
    track("foundry_asset_generated", { tool: tool.id, viaAI });
  };

  // Persist the forged draft to the Cargo Bay + deduct Fuel (Docs/03). Server
  // re-enforces plan/fuel; the live query re-hydrates fuel + assets.
  const onUpload = async () => {
    if (!forged) return;
    const { tool, title, content, viaAI } = forged;
    setUploading(true);

    if (convex) {
      try {
        await convex.createFoundryAsset({
          tool: tool.id,
          assetType: tool.assetType,
          category: tool.category,
          title,
          content,
          signalId: params.signalId,
          signalLabel: params.signalLabel,
          signalPhase: params.signalPhase as SignalPhase | undefined,
        });
      } catch {
        setUploading(false);
        router.push("/(modals)/refuel");
        return;
      }
    } else {
      spendFuel(tool.fuelCost);
      addAsset({
        type: tool.assetType,
        title,
        content,
        status: "in_prep",
        category: tool.category,
        signalId: params.signalId,
        signalLabel: params.signalLabel,
        signalPhase: params.signalPhase as SignalPhase | undefined,
      });
    }

    setUploading(false);
    setPreviewOpen(false);
    setForged(null);
    setUploadedTitle(title);
    setUploadedViaAI(viaAI);
    haptics.success();
    playSignature("fuel_earned");
    track("cargo_asset_saved", { type: tool.assetType });
    if (params.signalId)
      track("signal_asset_forged", { signalId: params.signalId });
  };

  return (
    <TabScreen>
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

          {forged ? (
            <Card variant="elevated">
              <View className="flex-row items-start gap-3">
                <ToolGlyph icon={forged.tool.icon} />
                <View className="flex-1">
                  <Text className="font-display text-base font-bold text-text-primary">
                    {forged.title}
                  </Text>
                  <Text className="mt-0.5 font-mono text-[11px] uppercase tracking-wider text-brand-teal">
                    {forged.viaAI ? "AI-forged" : "Mock draft"} · ready to
                    upload
                  </Text>
                  <Text className="mt-1 font-body text-sm text-text-secondary">
                    Forged from your Mission context. Preview it, then upload to
                    your Cargo Bay.
                  </Text>
                </View>
              </View>
              <View className="mt-3 flex-row gap-2">
                <Button
                  label="Quick Preview"
                  variant="secondary"
                  size="sm"
                  className="flex-1"
                  left={<Icon name="book" size={16} color="#F5F7FA" />}
                  onPress={() => setPreviewOpen(true)}
                />
                <Button
                  label="Upload"
                  variant="primary"
                  size="sm"
                  className="flex-1"
                  loading={uploading}
                  left={<Icon name="box" size={16} color="#FFFFFF" />}
                  onPress={onUpload}
                />
              </View>
            </Card>
          ) : null}

          {uploadedTitle ? (
            <Card variant="success">
              <Text className="font-display text-base font-bold text-status-success">
                Uploaded to Cargo Bay
              </Text>
              <Text className="mt-0.5 font-body text-sm text-text-secondary">
                “{uploadedTitle}” is in_prep (
                {uploadedViaAI ? "AI-generated" : "mock draft"}). Mark it
                flight-ready in Cargo Bay.
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
                  <ToolGlyph icon={tool.icon} locked={locked} />
                  <View className="flex-1">
                    <Text className="font-display text-base font-bold text-text-primary">
                      {tool.name}
                    </Text>
                    <Text className="mt-0.5 font-body text-sm text-text-secondary">
                      {tool.description}
                    </Text>
                    <View className="mt-2 flex-row items-center gap-2">
                      <FuelBadge
                        amount={tool.fuelCost}
                        size="sm"
                        warning={!affordable}
                      />
                      {locked ? (
                        <Badge
                          label={`Needs ${PLANS[tool.requiredPlan].name}`}
                          variant="locked"
                        />
                      ) : null}
                    </View>
                  </View>
                </View>
                <Pressable
                  onPress={() => (busyTool ? undefined : onForge(tool))}
                  accessibilityRole="button"
                  className={
                    "mt-3 min-h-[44px] flex-row items-center justify-center gap-2 rounded-full px-4 py-2.5 " +
                    (locked
                      ? "bg-bg-depleted border border-border-default"
                      : "bg-brand-teal active:opacity-90") +
                    (busyTool && busyTool !== tool.id ? " opacity-60" : "")
                  }
                >
                  {busyTool === tool.id ? (
                    <ActivityIndicator size="small" color="#060B14" />
                  ) : (
                    <>
                      {locked ? (
                        <AstroAvatar
                          plan={plan}
                          variant="bust"
                          pose="crossedArms"
                          size={28}
                        />
                      ) : null}
                      {!locked && !affordable ? (
                        <AstroAvatar
                          plan={plan}
                          variant="bust"
                          pose="pointing"
                          size={28}
                        />
                      ) : null}
                      {locked ? (
                        <Icon
                          name="lock"
                          size={15}
                          color={colors.textTertiary}
                        />
                      ) : null}
                      <Text
                        className={
                          locked
                            ? "font-body font-semibold text-text-tertiary"
                            : "font-body font-semibold text-bg-deep"
                        }
                      >
                        {locked
                          ? `Unlock with ${PLANS[tool.requiredPlan].name}`
                          : affordable
                            ? "Forge Content"
                            : `Need ${tool.fuelCost} Fuel — Refuel`}
                      </Text>
                    </>
                  )}
                </Pressable>
              </Card>
            );
          })}
        </ScrollView>

        {/* Quick Preview — read the forged content before uploading it. */}
        <Modal
          visible={previewOpen && !!forged}
          transparent
          animationType="fade"
          onRequestClose={() => setPreviewOpen(false)}
        >
          <View className="flex-1 bg-bg-deep/95 px-5">
            <SafeAreaView style={{ flex: 1 }} edges={["top", "bottom"]}>
              <View className="flex-row items-center justify-between border-b border-border-med/40 py-3">
                <View className="flex-1 pr-3">
                  <Text
                    className="font-display text-base font-bold text-text-primary"
                    numberOfLines={1}
                  >
                    {forged?.title}
                  </Text>
                  <Text className="font-mono text-[10px] uppercase tracking-widest text-brand-teal">
                    {forged?.tool.category} · preview
                  </Text>
                </View>
                <Pressable
                  onPress={() => setPreviewOpen(false)}
                  accessibilityRole="button"
                  accessibilityLabel="Close preview"
                  className="h-10 w-10 items-center justify-center rounded-full border border-border-med active:opacity-80"
                >
                  <Icon name="close" size={20} color="#F5F7FA" />
                </Pressable>
              </View>

              <ScrollView className="flex-1" contentContainerClassName="py-4">
                <Text className="font-body text-sm leading-6 text-text-secondary">
                  {forged?.content}
                </Text>
              </ScrollView>

              <View className="pb-2 pt-2">
                <Button
                  label="Upload to Cargo Bay"
                  variant="primary"
                  fullWidth
                  loading={uploading}
                  left={<Icon name="box" size={18} color="#FFFFFF" />}
                  onPress={onUpload}
                />
              </View>
            </SafeAreaView>
          </View>
        </Modal>
      </SafeAreaView>
    </TabScreen>
  );
}
