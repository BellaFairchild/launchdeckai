import React from "react";

import { ScrollView, View, Text } from "@/tw";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { FuelBadge } from "@/components/ui/FuelBadge";
import { AstroAvatar } from "@/components/astro/AstroAvatar";
import { PLANS } from "@/constants/plans";
import { useUIStore } from "@/store/ui";
import { useMissionStore } from "@/store/mission";
import { cn } from "@/lib/cn";
import { deriveRibbons } from "@/lib/ribbons";
import { signalStatus } from "@/components/signal/status";
import { SIGNAL_TEMPLATES } from "@/constants/signalTemplates";

function Stat({ value, label }: { value: string; label: string }) {
  return (
    <View className="flex-1 items-center rounded-2xl border border-border-default bg-bg-card py-3">
      <Text className="font-display text-xl font-bold text-text-primary">{value}</Text>
      <Text className="font-mono text-[10px] uppercase tracking-wider text-text-tertiary">
        {label}
      </Text>
    </View>
  );
}

export default function ProfileModal() {
  const { plan, fuel, streak } = useUIStore();
  const { mission, milestones, assets } = useMissionStore();

  const cleared = milestones.filter((m) => m.completed).length;
  const level = Math.max(1, Math.floor(cleared / 2) + 1);

  const ribbons = deriveRibbons({
    completedMilestones: cleared,
    forgedAssets: assets.length,
    signalsReady: SIGNAL_TEMPLATES.filter((s) => signalStatus(s.id, assets) === "flight_ready").length,
    streak,
  });

  return (
    <View className="flex-1 bg-bg-deep">
      <ScrollView contentContainerClassName="gap-4 px-5 py-4 pb-12">
        <View className="items-center gap-2 py-2">
          <AstroAvatar plan={plan} variant="fullBody" size={180} />
          <Text className="font-display text-2xl font-bold text-text-primary">
            Commander
          </Text>
          <Badge label={`${PLANS[plan].name} · ${PLANS[plan].belt} belt`} variant="plan" />
        </View>

        <View className="flex-row gap-3">
          <Stat value={fuel.toLocaleString()} label="Fuel" />
          <Stat value={`${streak}`} label="Streak" />
          <Stat value={`${level}`} label="Level" />
        </View>

        <Card variant="glass">
          <Text className="font-display text-base font-bold text-text-primary">
            Active Mission
          </Text>
          <Text className="mt-0.5 font-body text-sm text-text-secondary">
            {mission.appName} · {mission.readinessScore}% ready
          </Text>
          <View className="mt-2">
            <FuelBadge amount={fuel} size="sm" />
          </View>
        </Card>

        <Card variant="glass">
          <Text className="font-display text-base font-bold text-text-primary">
            Service Ribbons
          </Text>
          <View className="mt-3 flex-row flex-wrap gap-3">
            {ribbons.map((r) => (
              <View key={r.id} className={cn("items-center gap-1", !r.earned && "opacity-40")}>
                <View className="h-12 w-12 items-center justify-center rounded-2xl border border-border-med bg-bg-surface">
                  <Text className="text-xl">{r.earned ? r.icon : "🔒"}</Text>
                </View>
                <Text className="font-mono text-[10px] uppercase tracking-wider text-text-tertiary">
                  {r.label}
                </Text>
              </View>
            ))}
          </View>
        </Card>
      </ScrollView>
    </View>
  );
}
