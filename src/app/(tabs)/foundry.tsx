import { useAction } from "convex/react";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useRef, useState } from "react";
import type { ScrollView as RNScrollView } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { FoundryPreviewModal } from "@/components/foundry/FoundryPreviewModal";
import { TabScreen } from "@/components/layout/TabScreen";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { ErrorState } from "@/components/ui/ErrorState";
import { FoundryToolCard } from "@/components/ui/FoundryToolCard";
import { Icon } from "@/components/ui/Icon";
import { foundryIcons } from "@/constants/foundryIcons";
import { FOUNDRY_TOOLS, type FoundryTool } from "@/constants/foundryTools";
import { planMeets } from "@/constants/plans";
import { track } from "@/lib/analytics";
import { playSignature } from "@/lib/audio";
import { haptics } from "@/lib/haptics";
import { useMissionStore } from "@/store/mission";
import { useUIStore } from "@/store/ui";
import { ScrollView, Text, View } from "@/tw";
import { Image } from "@/tw/image";
import type { SignalPhase } from "@/types";
import { api } from "@cvx/_generated/api";

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
  // The forged-draft card renders at the top of the list, but the user may have
  // scrolled down to tap a tool — scroll back up so the result is visible
  // instead of appearing off-screen above (looks like "nothing happened").
  const scrollRef = useRef<RNScrollView>(null);
  const [busyTool, setBusyTool] = useState<string | null>(null);
  const [forgeError, setForgeError] = useState<string | null>(null);
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
    setForgeError(null);
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
      setBusyTool(null);
      setForgeError(tool.id);
      haptics.warning();
      return;
    }

    setForged({ tool, title: params.signalLabel ?? tool.name, content, viaAI });
    setBusyTool(null);
    scrollRef.current?.scrollTo({ y: 0, animated: true });
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
        <ScrollView
          ref={scrollRef}
          contentContainerClassName="gap-3 px-5 py-4 pb-24"
        >
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

          {forgeError ? (
            <ErrorState
              title="Generation failed"
              message="Couldn't reach the Forge. Check your connection and try again — no Fuel was spent."
              onRetry={() => {
                const tool = FOUNDRY_TOOLS.find((t) => t.id === forgeError);
                if (tool) void onForge(tool);
              }}
            />
          ) : null}

          {forged ? (
            <Card variant="elevated">
              <View className="flex-row items-start gap-3">
                <Image
                  source={foundryIcons[forged.tool.icon]}
                  style={{ width: 48, height: 48, borderRadius: 14 }}
                  contentFit="cover"
                  accessibilityIgnoresInvertColors
                />
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

          {FOUNDRY_TOOLS.map((tool) => (
            <FoundryToolCard
              key={tool.id}
              tool={tool}
              locked={!planMeets(plan, tool.requiredPlan)}
              affordable={fuel >= tool.fuelCost}
              busy={busyTool === tool.id}
              anyBusy={!!busyTool}
              onForge={() => onForge(tool)}
            />
          ))}
        </ScrollView>

        {forged ? (
          <FoundryPreviewModal
            visible={previewOpen}
            title={forged.title}
            content={forged.content}
            onClose={() => setPreviewOpen(false)}
          />
        ) : null}
      </SafeAreaView>
    </TabScreen>
  );
}
