import { useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";

import { TabScreen } from "@/components/layout/TabScreen";
import { Badge } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";
import { FuelBadge } from "@/components/ui/FuelBadge";
import { ProgressRing } from "@/components/ui/ProgressRing";
import { MILESTONE_CATEGORIES } from "@/constants/milestoneTemplates";
import { planMeets, PLANS } from "@/constants/plans";
import { track } from "@/lib/analytics";
import { haptics } from "@/lib/haptics";
import { readinessLabel } from "@/lib/launch";
import { useMissionStore } from "@/store/mission";
import { useUIStore } from "@/store/ui";
import { Pressable, ScrollView, Text, View } from "@/tw";
import type { Milestone } from "@/types";

function MilestoneRow({
  milestone,
  locked,
  onComplete,
  onUnlock,
}: {
  milestone: Milestone;
  locked: boolean;
  onComplete: () => void;
  onUnlock: () => void;
}) {
  const { completed } = milestone;
  return (
    <Card variant={completed ? "success" : locked ? "glass" : "elevated"}>
      <View className="flex-row items-start gap-3">
        <Pressable
          onPress={locked ? onUnlock : completed ? undefined : onComplete}
          accessibilityRole="checkbox"
          accessibilityState={{ checked: completed, disabled: locked }}
          accessibilityLabel={
            completed
              ? `${milestone.title} complete`
              : `Complete ${milestone.title}`
          }
          className={
            "mt-0.5 h-7 w-7 items-center justify-center rounded-full border " +
            (completed
              ? "border-status-success bg-status-success/20"
              : locked
                ? "border-border-default bg-bg-depleted"
                : "border-brand-teal")
          }
        >
          <Text
            className={completed ? "text-status-success" : "text-text-tertiary"}
          >
            {completed ? "✓" : locked ? "🔒" : ""}
          </Text>
        </Pressable>

        <View className="flex-1">
          <Text
            className={
              "font-body text-base font-semibold " +
              (completed
                ? "text-text-secondary line-through"
                : "text-text-primary")
            }
          >
            {milestone.title}
          </Text>
          <Text className="mt-0.5 font-body text-sm text-text-secondary">
            {milestone.description}
          </Text>
          <View className="mt-2 flex-row items-center gap-2">
            <FuelBadge amount={milestone.fuelReward} size="sm" />
            {locked ? (
              <Badge
                label={`Needs ${PLANS[milestone.requiredPlan].name}`}
                variant="locked"
              />
            ) : null}
          </View>
        </View>
      </View>
    </Card>
  );
}

export default function MissionsScreen() {
  const router = useRouter();
  const { mission, milestones, completeMilestone } = useMissionStore();
  const plan = useUIStore((s) => s.plan);

  return (
    <TabScreen>
      <SafeAreaView style={{ flex: 1 }} edges={["bottom"]}>
        <ScrollView contentContainerClassName="gap-4 px-5 py-4 pb-24">
          <Card variant="glass">
            <View className="flex-row items-center gap-4">
              <ProgressRing
                progress={mission.readinessScore}
                size={72}
                strokeWidth={7}
              />
              <View className="flex-1">
                <Text className="font-display text-lg font-bold text-text-primary">
                  {readinessLabel(mission.readinessScore)}
                </Text>
                <Text className="font-body text-sm text-text-secondary">
                  {milestones.filter((m) => m.completed).length}/
                  {milestones.length} milestones cleared
                </Text>
              </View>
            </View>
          </Card>

          {MILESTONE_CATEGORIES.map((cat) => {
            const group = milestones.filter((m) => m.category === cat.id);
            if (group.length === 0) return null;
            return (
              <View key={cat.id} className="gap-2">
                <Text className="px-1 font-mono text-xs uppercase tracking-[2px] text-brand-teal">
                  {cat.label}
                </Text>
                {group.map((m) => {
                  const locked = !planMeets(plan, m.requiredPlan);
                  return (
                    <MilestoneRow
                      key={m.id}
                      milestone={m}
                      locked={locked}
                      onComplete={() => {
                        completeMilestone(m.id);
                        haptics.success();
                        track("milestone_completed", { category: m.category });
                        track("fuel_earned", {
                          amount: m.fuelReward,
                          reason: "milestone",
                        });
                      }}
                      onUnlock={() => router.push("/(modals)/refuel")}
                    />
                  );
                })}
              </View>
            );
          })}
        </ScrollView>
      </SafeAreaView>
    </TabScreen>
  );
}
