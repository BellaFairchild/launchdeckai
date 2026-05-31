import React from "react";

import { ScrollView, View, Text } from "@/tw";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { AstroAvatar } from "@/components/astro/AstroAvatar";
import { PLANS, PLAN_ORDER, type Plan } from "@/constants/plans";
import { useUIStore } from "@/store/ui";

function Row({ label, value }: { label: string; value: string }) {
  return (
    <View className="flex-row items-center justify-between">
      <Text className="font-body text-xs text-text-tertiary">{label}</Text>
      <Text className="font-body text-xs text-text-secondary">{value}</Text>
    </View>
  );
}

export default function RefuelModal() {
  const { plan, setPlan } = useUIStore();

  return (
    <View className="flex-1 bg-bg-deep">
      <ScrollView contentContainerClassName="gap-4 px-5 py-4 pb-12">
        <View>
          <Text className="font-display text-2xl font-bold text-text-primary">
            Refuel Station
          </Text>
          <Text className="font-body text-sm text-text-secondary">
            Upgrade your command tier. Downgrades lock features — they never delete your data.
          </Text>
        </View>

        {PLAN_ORDER.map((id: Plan) => {
          const spec = PLANS[id];
          const isCurrent = plan === id;
          return (
            <Card key={id} variant={id === "admiral" ? "premium" : "glass"}>
              <View className="flex-row items-center gap-3">
                <AstroAvatar plan={id} variant="orb" size={56} />
                <View className="flex-1">
                  <View className="flex-row items-center gap-2">
                    <Text className="font-display text-lg font-bold text-text-primary">
                      {spec.name}
                    </Text>
                    {isCurrent ? <Badge label="Current" variant="readiness" /> : null}
                  </View>
                  <Text className="font-body text-xs text-text-secondary">{spec.bestFor}</Text>
                </View>
                <View className="items-end">
                  <Text className="font-display text-base font-bold text-brand-gold">
                    {spec.price}
                  </Text>
                  {spec.priceYearly ? (
                    <Text className="font-mono text-[10px] text-text-tertiary">
                      {spec.priceYearly}
                    </Text>
                  ) : null}
                </View>
              </View>

              <View className="mt-3 gap-1.5">
                <Row label="Fuel" value={spec.fuel} />
                <Row label="Missions" value={spec.activeMissions} />
                <Row label="AI access" value={spec.aiAccess} />
                <Row label="Signal export" value={spec.exportAccess ? "Yes" : "No"} />
              </View>

              <View className="mt-3">
                {isCurrent ? (
                  <Button label="Current plan" variant="locked" />
                ) : (
                  <Button
                    label={`Switch to ${spec.name}`}
                    variant={id === "admiral" ? "premium" : "primary"}
                    onPress={() => setPlan(id)}
                  />
                )}
              </View>
            </Card>
          );
        })}

        <Button
          label="Restore purchases"
          variant="ghost"
          onPress={() => {
            // Wired to RevenueCat in Phase 13 (real purchases).
          }}
        />
        <Text className="text-center font-body text-xs text-text-tertiary">
          Purchases are mocked until RevenueCat is wired.
        </Text>
      </ScrollView>
    </View>
  );
}
