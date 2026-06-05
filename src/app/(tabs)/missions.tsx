import { useRouter } from "expo-router";
import { useRef, useState } from "react";
import { Alert, Platform, ScrollView, type ViewStyle } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { TabScreen } from "@/components/layout/TabScreen";
import { LaunchFlightPath } from "@/components/mission/LaunchFlightPath";
import { MissionHeroCard } from "@/components/mission/MissionHeroCard";
import { Badge } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";
import { FuelBadge } from "@/components/ui/FuelBadge";
import { SuccessBurst } from "@/components/ui/SuccessBurst";
import { colors } from "@/constants/colors";
import { MILESTONE_CATEGORIES } from "@/constants/milestoneTemplates";
import { planMeets, PLANS } from "@/constants/plans";
import { track } from "@/lib/analytics";
import { playSignature } from "@/lib/audio";
import { haptics } from "@/lib/haptics";
import { useMissionStore } from "@/store/mission";
import { useUIStore } from "@/store/ui";
import { Pressable, Text, View } from "@/tw";
import type { Milestone } from "@/types";

const HIGHLIGHT_RING: ViewStyle = {
  borderWidth: 2,
  borderColor: colors.rocketTeal,
  borderRadius: 24,
  shadowColor: colors.rocketTeal,
  shadowOpacity: 0.5,
  shadowRadius: 16,
  shadowOffset: { width: 0, height: 0 },
  elevation: 10,
};

/** Brand-gold outer glow shown when a milestone is tapped done. */
const COMPLETED_GLOW: ViewStyle = {
  shadowColor: colors.brandGold,
  shadowOpacity: 0.35,
  shadowRadius: 18,
  shadowOffset: { width: 0, height: 0 },
  elevation: 10,
};

function MilestoneRow({
  milestone,
  locked,
  highlighted,
  justCompleted,
  onComplete,
  onUnlock,
}: {
  milestone: Milestone;
  locked: boolean;
  highlighted: boolean;
  justCompleted: boolean;
  onComplete: () => void;
  onUnlock: () => void;
}) {
  const { completed } = milestone;
  return (
    <View style={highlighted ? HIGHLIGHT_RING : undefined}>
      <Card
        variant={completed ? "success" : locked ? "glass" : "elevated"}
        style={completed ? COMPLETED_GLOW : undefined}
      >
        <SuccessBurst active={justCompleted} />
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
              className={
                completed ? "text-status-success" : "text-text-tertiary"
              }
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
    </View>
  );
}

export default function MissionsScreen() {
  const router = useRouter();
  const { mission, milestones, completeMilestone } = useMissionStore();
  const plan = useUIStore((s) => s.plan);

  const scrollRef = useRef<ScrollView>(null);
  const catY = useRef<Record<string, number>>({});
  const highlightTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [highlightId, setHighlightId] = useState<string | null>(null);
  const [justCompletedId, setJustCompletedId] = useState<string | null>(null);

  const handleComplete = (id: string, category: string, fuelReward: number) => {
    completeMilestone(id);
    haptics.success();
    playSignature("milestone");
    track("milestone_completed", { category });
    track("fuel_earned", { amount: fuelReward, reason: "milestone" });
    setJustCompletedId(id);
    setTimeout(() => setJustCompletedId(null), 900);
  };

  const completedCount = milestones.filter((m) => m.completed).length;
  const nextMilestone = milestones.find(
    (m) => !m.completed && planMeets(plan, m.requiredPlan),
  );

  const onContinue = () => {
    haptics.selection();
    if (!nextMilestone) {
      scrollRef.current?.scrollTo({ y: 0, animated: true });
      return;
    }
    const y = catY.current[nextMilestone.category];
    if (y != null) {
      scrollRef.current?.scrollTo({ y: Math.max(0, y - 12), animated: true });
    }
    setHighlightId(nextMilestone.id);
    if (highlightTimer.current) clearTimeout(highlightTimer.current);
    highlightTimer.current = setTimeout(() => setHighlightId(null), 4000);
  };

  const onNewMission = () => {
    const title = "Start a new mission?";
    const body =
      "Setting up a new mission replaces your current launch details and milestone progress.";
    const start = () => router.push("/(auth)/onboarding");

    if (Platform.OS === "web") {
      if (
        typeof window !== "undefined" &&
        window.confirm(`${title}\n\n${body}`)
      ) {
        start();
      }
      return;
    }
    Alert.alert(title, body, [
      { text: "Cancel", style: "cancel" },
      { text: "Start New", style: "destructive", onPress: start },
    ]);
  };

  return (
    <TabScreen>
      <SafeAreaView style={{ flex: 1 }} edges={["bottom"]}>
        <ScrollView
          ref={scrollRef}
          contentContainerStyle={{
            gap: 16,
            paddingHorizontal: 20,
            paddingTop: 16,
            paddingBottom: 96,
          }}
        >
          <MissionHeroCard
            mission={mission}
            completedCount={completedCount}
            totalCount={milestones.length}
            onContinue={onContinue}
            onNewMission={onNewMission}
          />

          <LaunchFlightPath />

          {MILESTONE_CATEGORIES.map((cat) => {
            const group = milestones.filter((m) => m.category === cat.id);
            if (group.length === 0) return null;
            return (
              <View
                key={cat.id}
                className="gap-2"
                onLayout={(e) => {
                  catY.current[cat.id] = e.nativeEvent.layout.y;
                }}
              >
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
                      highlighted={highlightId === m.id}
                      justCompleted={justCompletedId === m.id}
                      onComplete={() => handleComplete(m.id, m.category, m.fuelReward)}
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
