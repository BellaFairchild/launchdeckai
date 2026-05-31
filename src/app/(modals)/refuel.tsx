import React, { useEffect, useState } from "react";

import { ScrollView, View, Text } from "@/tw";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { AstroAvatar } from "@/components/astro/AstroAvatar";
import { PLANS, PLAN_ORDER, type Plan } from "@/constants/plans";
import { useUIStore } from "@/store/ui";
import {
  revenueCatEnabled,
  getPlanPackages,
  purchasePlan,
  restorePurchases,
  type PlanPackage,
} from "@/lib/purchases";

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
  const [packages, setPackages] = useState<PlanPackage[]>([]);
  const [busyPlan, setBusyPlan] = useState<Plan | null>(null);
  const [note, setNote] = useState<string | null>(null);

  useEffect(() => {
    if (revenueCatEnabled) getPlanPackages().then(setPackages).catch(() => {});
  }, []);

  const pkgFor = (id: Plan) => packages.find((p) => p.plan === id);

  const onCta = async (id: Plan) => {
    setNote(null);
    if (!revenueCatEnabled) {
      // Demo / dev: switch plan directly (mock, or the dev Convex setPlan).
      setPlan(id);
      return;
    }
    const pkg = pkgFor(id);
    if (!pkg) {
      setNote(`${PLANS[id].name} isn't available in the current store offering.`);
      return;
    }
    setBusyPlan(id);
    try {
      const ok = await purchasePlan(pkg);
      if (ok) setNote("Purchase complete — your plan updates once RevenueCat confirms it.");
    } catch {
      setNote("Purchase failed. Please try again.");
    } finally {
      setBusyPlan(null);
    }
  };

  return (
    <View className="flex-1 bg-bg-deep">
      <ScrollView contentContainerClassName="gap-4 px-5 py-4 pb-12">
        <View>
          <Text className="font-display text-2xl font-bold text-text-primary">Refuel Station</Text>
          <Text className="font-body text-sm text-text-secondary">
            Upgrade your command tier. Downgrades lock features — they never delete your data.
          </Text>
        </View>

        {note ? (
          <Card variant="glass">
            <Text className="font-body text-sm text-brand-teal">{note}</Text>
          </Card>
        ) : null}

        {PLAN_ORDER.map((id: Plan) => {
          const spec = PLANS[id];
          const isCurrent = plan === id;
          const pkg = pkgFor(id);
          const price = revenueCatEnabled && pkg ? pkg.priceString : spec.price;
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
                  <Text className="font-display text-base font-bold text-brand-gold">{price}</Text>
                  {spec.priceYearly ? (
                    <Text className="font-mono text-[10px] text-text-tertiary">{spec.priceYearly}</Text>
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
                    label={
                      revenueCatEnabled
                        ? pkg
                          ? `Upgrade to ${spec.name}`
                          : `${spec.name} unavailable`
                        : `Switch to ${spec.name}`
                    }
                    variant={id === "admiral" ? "premium" : "primary"}
                    loading={busyPlan === id}
                    disabled={revenueCatEnabled && !pkg}
                    onPress={() => onCta(id)}
                  />
                )}
              </View>
            </Card>
          );
        })}

        <Button
          label="Restore purchases"
          variant="ghost"
          onPress={async () => {
            if (!revenueCatEnabled) {
              setNote("Purchases are mocked until RevenueCat keys are set.");
              return;
            }
            const ok = await restorePurchases();
            setNote(ok ? "Restored — your plan will reflect any active subscription." : "Nothing to restore.");
          }}
        />
        {!revenueCatEnabled ? (
          <Text className="text-center font-body text-xs text-text-tertiary">
            Demo mode — purchases are mocked until RevenueCat keys are set.
          </Text>
        ) : null}
      </ScrollView>
    </View>
  );
}
