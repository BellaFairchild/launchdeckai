import { useRouter } from "expo-router";
import React from "react";
import { SafeAreaView } from "react-native-safe-area-context";

import { TabScreen } from "@/components/layout/TabScreen";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { FuelBadge } from "@/components/ui/FuelBadge";
import { NebulaBackdrop } from "@/components/ui/NebulaBackdrop";
import { Icon, type IconName } from "@/components/ui/Icon";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { ProgressRing } from "@/components/ui/ProgressRing";
import { SignalBars, type SignalStatus } from "@/components/ui/SignalBars";
import { colors } from "@/constants/colors";
import { planMeets } from "@/constants/plans";
import { TOTAL_SIGNALS } from "@/constants/signalTemplates";
import { tMinus } from "@/lib/launch";
import { useMissionStore } from "@/store/mission";
import { useUIStore } from "@/store/ui";
import { Pressable, ScrollView, Text, View } from "@/tw";

const STAGE_LABEL: Record<string, string> = {
  building: "Building",
  testing: "Testing",
  store_prep: "Store Prep",
  ready_to_submit: "Ready to Submit",
};

const HERO_GLOW = {
  shadowColor: colors.rocketTeal,
  shadowOpacity: 0.28,
  shadowRadius: 24,
  shadowOffset: { width: 0, height: 12 },
  elevation: 12,
};

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

  const t = tMinus(mission.launchDate);
  const launched = t.hasDate && t.days < 0;
  const bigCountdown = !t.hasDate ? "T-–" : launched ? "LIFTOFF" : t.label;
  const countdownCaption = !t.hasDate
    ? "Set a launch date"
    : launched
      ? "Mission launched"
      : "Days to launch";

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

  return (
    <TabScreen>
      <SafeAreaView style={{ flex: 1 }} edges={["bottom"]}>
        <ScrollView contentContainerClassName="gap-5 px-5 py-4 pb-24">
          {/* ── Launch hero: nebula · countdown · readiness ── */}
          <View
            style={HERO_GLOW}
            className="relative overflow-hidden rounded-3xl border border-border-med"
          >
            <NebulaBackdrop />
            <View className="justify-between p-5" style={{ minHeight: 300 }}>
              {/* HUD top bar */}
              <View className="flex-row items-center justify-between">
                <Text
                  numberOfLines={1}
                  className="flex-1 font-mono text-[11px] uppercase tracking-[2px] text-text-secondary"
                >
                  {mission.appName}
                </Text>
                <Badge
                  label={STAGE_LABEL[mission.stage] ?? mission.stage}
                  variant="status"
                />
              </View>

              {/* centered countdown */}
              <View className="items-center py-6">
                <Text
                  numberOfLines={1}
                  adjustsFontSizeToFit
                  className="w-full text-center font-mono font-bold leading-none text-brand-teal"
                  style={{
                    fontSize: 64,
                    textShadowColor: "rgba(4,9,18,0.55)",
                    textShadowOffset: { width: 0, height: 2 },
                    textShadowRadius: 14,
                  }}
                >
                  {bigCountdown}
                </Text>
                <Text className="mt-3 font-mono text-[11px] uppercase tracking-[4px] text-text-tertiary">
                  {countdownCaption}
                </Text>
              </View>

              {/* readiness meter */}
              <View className="gap-2">
                <View className="flex-row items-end justify-between">
                  <Text className="font-display text-base font-bold text-text-primary">
                    Mission Readiness
                  </Text>
                  <Text className="font-mono text-base font-bold text-brand-teal">
                    {Math.round(mission.readinessScore)}%
                  </Text>
                </View>
                <ProgressBar value={mission.readinessScore} height={10} />
              </View>
            </View>
          </View>

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
                <View className="mt-4 flex-row items-center justify-between">
                  <FuelBadge amount={nextAction.fuelReward} size="sm" />
                  <Button
                    label="Go to Missions →"
                    size="sm"
                    onPress={() => router.push("/(tabs)/missions")}
                  />
                </View>
              ) : null}
            </Card>
          </View>

          {/* ── Signal Deck (premium, visually distinct) ── */}
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
