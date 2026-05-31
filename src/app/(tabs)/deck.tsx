import React from "react";
import { useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";

import { ScrollView, View, Text } from "@/tw";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { FuelBadge } from "@/components/ui/FuelBadge";
import { ProgressRing } from "@/components/ui/ProgressRing";
import { useMissionStore } from "@/store/mission";
import { useUIStore } from "@/store/ui";
import { planMeets } from "@/constants/plans";
import { tMinus, readinessLabel, formatLaunchDate } from "@/lib/launch";
import { TOTAL_SIGNALS } from "@/constants/signalTemplates";

const STAGE_LABEL: Record<string, string> = {
  building: "Building",
  testing: "Testing",
  store_prep: "Store Prep",
  ready_to_submit: "Ready to Submit",
};

export default function DeckScreen() {
  const router = useRouter();
  const { mission, milestones, blueprints, assets } = useMissionStore();
  const { fuel, streak, plan } = useUIStore();

  const t = tMinus(mission.launchDate);

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

  const recentCargo = [...assets].sort((a, b) => b.updatedAt - a.updatedAt)[0];

  return (
    <View className="flex-1 bg-bg-deep">
      <SafeAreaView style={{ flex: 1 }} edges={["bottom"]}>
        <ScrollView contentContainerClassName="gap-4 px-5 py-4 pb-24">
          {/* Active Mission */}
          <Card variant="glass">
            <View className="flex-row items-start justify-between gap-3">
              <View className="flex-1">
                <Text className="font-display text-xl font-bold text-text-primary">
                  {mission.appName}
                </Text>
                <Text className="mt-0.5 font-body text-sm text-text-secondary">
                  {mission.oneLiner}
                </Text>
              </View>
              <Badge label={STAGE_LABEL[mission.stage] ?? mission.stage} variant="status" />
            </View>
            <View className="mt-3 flex-row items-center gap-4">
              <View>
                <Text className="font-mono text-2xl font-bold text-brand-teal">
                  {t.label}
                </Text>
                <Text className="font-mono text-[11px] uppercase tracking-wider text-text-tertiary">
                  {formatLaunchDate(mission.launchDate)}
                </Text>
              </View>
            </View>
          </Card>

          {/* Readiness hero */}
          <Card variant="glass">
            <View className="flex-row items-center gap-5">
              <ProgressRing progress={mission.readinessScore} size={104} caption="readiness" />
              <View className="flex-1 gap-2">
                <Text className="font-display text-lg font-bold text-text-primary">
                  {readinessLabel(mission.readinessScore)}
                </Text>
                <View className="flex-row flex-wrap items-center gap-2">
                  <FuelBadge amount={fuel} size="sm" />
                  <Badge label={`🔥 ${streak} day streak`} variant="readiness" />
                </View>
              </View>
            </View>
          </Card>

          {/* Today's Launch Action */}
          <Card variant="elevated">
            <Text className="font-mono text-[11px] uppercase tracking-wider text-brand-teal">
              Today&apos;s Launch Action
            </Text>
            {nextAction ? (
              <>
                <Text className="mt-1 font-display text-base font-bold text-text-primary">
                  {nextAction.title}
                </Text>
                <Text className="mt-0.5 font-body text-sm text-text-secondary">
                  {nextAction.description}
                </Text>
                <View className="mt-3 flex-row items-center justify-between">
                  <FuelBadge amount={nextAction.fuelReward} size="sm" />
                  <Button
                    label="Go to Missions →"
                    size="sm"
                    onPress={() => router.push("/(tabs)/missions")}
                  />
                </View>
              </>
            ) : (
              <Text className="mt-1 font-body text-sm text-text-secondary">
                All available milestones are complete. Outstanding, Commander.
              </Text>
            )}
          </Card>

          {/* Signal Deck CTA */}
          <Card variant="premium">
            <Text className="font-display text-base font-bold text-text-primary">
              Signal Deck · {signalsReady}/{TOTAL_SIGNALS} ready
            </Text>
            <Text className="mt-0.5 font-body text-sm text-text-secondary">
              Know exactly what to post, when, and where.
            </Text>
            <Button
              label="Stage Your Launch Sequence →"
              variant="premium"
              className="mt-3"
              onPress={() => router.push("/(modals)/signal-deck")}
            />
          </Card>

          {/* Blueprint progress + Recent cargo */}
          <Card variant="glass" onPress={() => router.push("/(tabs)/blueprints")}>
            <View className="flex-row items-center justify-between">
              <View className="flex-1">
                <Text className="font-display text-base font-bold text-text-primary">
                  Blueprints
                </Text>
                <Text className="font-body text-sm text-text-secondary">
                  {blueprintProgress}% complete
                </Text>
              </View>
              <ProgressRing progress={blueprintProgress} size={56} strokeWidth={6} color="#F3B233" centerLabel={`${blueprintProgress}%`} />
            </View>
          </Card>

          {recentCargo ? (
            <Card variant="glass" onPress={() => router.push("/(modals)/cargo")}>
              <Text className="font-mono text-[11px] uppercase tracking-wider text-text-tertiary">
                Recent Cargo
              </Text>
              <Text className="mt-1 font-display text-base font-bold text-text-primary">
                {recentCargo.title}
              </Text>
              <Text className="mt-0.5 font-body text-sm text-text-secondary">
                Tap to open Cargo Bay →
              </Text>
            </Card>
          ) : null}
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}
