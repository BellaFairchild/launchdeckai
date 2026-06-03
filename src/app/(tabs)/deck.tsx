import { useRouter } from "expo-router";
import React from "react";
import { SafeAreaView } from "react-native-safe-area-context";

import { DeckHeroCard } from "@/components/deck/DeckHeroCard";
import { RiskAlert } from "@/components/deck/RiskAlert";
import { TabScreen } from "@/components/layout/TabScreen";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { FuelBadge } from "@/components/ui/FuelBadge";
import { Icon, type IconName } from "@/components/ui/Icon";
import { ProgressRing } from "@/components/ui/ProgressRing";
import { SignalBars, type SignalStatus } from "@/components/ui/SignalBars";
import { colors } from "@/constants/colors";
import { planMeets } from "@/constants/plans";
import { TOTAL_SIGNALS } from "@/constants/signalTemplates";
import { deriveRisks } from "@/lib/risks";
import { useMissionStore } from "@/store/mission";
import { useUIStore } from "@/store/ui";
import { Pressable, ScrollView, Text, View } from "@/tw";

/** Micro section label — mono, spaced, dimmed. */
function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <Text className="px-1 font-mono text-[11px] uppercase tracking-[2px] text-text-tertiary">
      {children}
    </Text>
  );
}

/** Lightweight grouped-list row — distinct from the heavier cards above. */
function SystemRow({
  icon,
  label,
  sub,
  trailing,
  onPress,
}: {
  icon: IconName;
  label: string;
  sub?: string;
  trailing?: React.ReactNode;
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      className="flex-row items-center gap-3 px-3.5 py-3 active:bg-bg-card"
    >
      <View className="h-9 w-9 items-center justify-center rounded-xl border border-border-default bg-bg-surface">
        <Icon name={icon} size={18} color={colors.brandTeal} />
      </View>
      <View className="flex-1">
        <Text className="font-display text-[15px] font-semibold text-text-primary">
          {label}
        </Text>
        {sub ? (
          <Text className="font-body text-xs text-text-secondary">{sub}</Text>
        ) : null}
      </View>
      {trailing ?? (
        <Icon name="chevron-right" size={18} color={colors.textTertiary} />
      )}
    </Pressable>
  );
}

export default function DeckScreen() {
  const router = useRouter();
  const { mission, milestones, blueprints, assets } = useMissionStore();
  const { plan } = useUIStore();

  const nextAction = milestones.find(
    (m) => !m.completed && planMeets(plan, m.requiredPlan),
  );

  const blueprintValues = Object.values(blueprints);
  const blueprintProgress = Math.round(
    blueprintValues.reduce((sum, b) => sum + b.completionStatus, 0) /
      Math.max(1, blueprintValues.length),
  );

  const signalsReady = assets.filter(
    (a) => a.signalId && a.status === "flight_ready",
  ).length;

  const signalStatus: SignalStatus =
    signalsReady >= TOTAL_SIGNALS
      ? "flight_ready"
      : signalsReady > 0
        ? "in_prep"
        : "not_loaded";

  const recentCargo = [...assets].sort((a, b) => b.updatedAt - a.updatedAt)[0];

  const risks = deriveRisks(mission, milestones, assets);

  return (
    <TabScreen>
      <SafeAreaView style={{ flex: 1 }} edges={["bottom"]}>
        <ScrollView contentContainerClassName="gap-5 px-5 py-4 pb-24">
          <DeckHeroCard mission={mission} />

          <Button
            label="Continue Mission 🚀"
            variant="primary"
            fullWidth
            size="lg"
            onPress={() => router.push("/(tabs)/missions")}
          />

          {/* ── Signal Deck — directly under hero ── */}
          <Card variant="premium">
            <View className="flex-row items-center gap-3">
              <View className="h-11 w-11 items-center justify-center rounded-2xl border border-brand-gold/40 bg-brand-gold/10">
                <Icon name="signal" size={22} color={colors.brandGold} />
              </View>
              <View className="flex-1">
                <Text className="font-display text-base font-bold text-text-primary">
                  Signal Deck
                </Text>
                <Text className="font-mono text-xs text-brand-gold">
                  {signalsReady}/{TOTAL_SIGNALS} signals ready
                </Text>
              </View>
              <SignalBars status={signalStatus} />
            </View>
            <Text className="mt-3 font-body text-sm text-text-secondary">
              Know exactly what to post, when, and where.
            </Text>
            <Button
              label="Stage Your Launch Sequence →"
              variant="premium"
              className="mt-4"
              onPress={() => router.push("/(modals)/signal-deck")}
            />
          </Card>

          {/* ── Critical risks — only when the mission has open gaps ── */}
          <RiskAlert risks={risks} />

          {/* ── Primary action: the one thing to do today ── */}
          <View className="gap-2">
            <SectionLabel>Today&apos;s Launch Action</SectionLabel>
            <Card variant="elevated">
              <View className="flex-row items-start gap-3">
                <View className="h-10 w-10 items-center justify-center rounded-xl border border-brand-teal/30 bg-brand-teal/10">
                  <Icon name="bolt" size={20} color={colors.brandTeal} />
                </View>
                <View className="flex-1">
                  {nextAction ? (
                    <>
                      <Text className="font-display text-base font-bold text-text-primary">
                        {nextAction.title}
                      </Text>
                      <Text className="mt-0.5 font-body text-sm text-text-secondary">
                        {nextAction.description}
                      </Text>
                    </>
                  ) : (
                    <Text className="font-body text-sm text-text-secondary">
                      All available milestones are complete. Outstanding,
                      Commander.
                    </Text>
                  )}
                </View>
              </View>
              {nextAction ? (
                <View className="mt-4">
                  <FuelBadge amount={nextAction.fuelReward} size="sm" />
                </View>
              ) : null}
            </Card>
          </View>

          {/* ── Mission systems: lightweight grouped rows ── */}
          <View className="gap-2">
            <SectionLabel>Mission Systems</SectionLabel>
            <View className="overflow-hidden rounded-2xl border border-border-default bg-bg-card/50">
              <SystemRow
                icon="blueprints"
                label="Blueprints"
                sub={`${blueprintProgress}% complete`}
                onPress={() => router.push("/(tabs)/blueprints")}
                trailing={
                  <ProgressRing
                    progress={blueprintProgress}
                    size={38}
                    strokeWidth={5}
                    color={colors.brandGold}
                    centerLabel=""
                  />
                }
              />
              <View
                style={{ height: 1, backgroundColor: colors.borderDefault }}
              />
              <SystemRow
                icon="box"
                label="Recent Cargo"
                sub={recentCargo ? recentCargo.title : "Open the Cargo Bay"}
                onPress={() => router.push("/(modals)/cargo")}
              />
            </View>
          </View>
        </ScrollView>
      </SafeAreaView>
    </TabScreen>
  );
}
