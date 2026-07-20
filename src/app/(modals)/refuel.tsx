import { useEffect, useState } from "react";

import { AstroAvatar } from "@/components/astro/AstroAvatar";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { FuelGauge } from "@/components/ui/FuelGauge";
import { GradientView } from "@/components/ui/GradientView";
import { PLANS, PLAN_ORDER, type Plan } from "@/constants/plans";
import { track } from "@/lib/analytics";
import { playConfirm, playSignature } from "@/lib/audio";
import { haptics } from "@/lib/haptics";
import {
    getPlanPackages,
    purchasePlan,
    restorePurchases,
    revenueCatEnabled,
    type PlanPackage,
} from "@/lib/purchases";
import { useUIStore } from "@/store/ui";
import { Pressable, ScrollView, Text, View } from "@/tw";

function Row({ label, value }: { label: string; value: string }) {
  return (
    <View className="flex-row items-center justify-between">
      <Text className="font-body text-xs text-text-tertiary">{label}</Text>
      <Text className="font-body text-xs text-text-secondary">{value}</Text>
    </View>
  );
}

export default function RefuelModal() {
  const { plan, fuel, setPlan } = useUIStore();
  const [packages, setPackages] = useState<PlanPackage[]>([]);
  const [busyPlan, setBusyPlan] = useState<Plan | null>(null);
  const [note, setNote] = useState<string | null>(null);

  useEffect(() => {
    if (revenueCatEnabled)
      getPlanPackages()
        .then(setPackages)
        .catch(() => {});
  }, []);

  const pkgFor = (id: Plan) => packages.find((p) => p.plan === id);

  const onCta = async (id: Plan) => {
    setNote(null);
    if (!revenueCatEnabled) {
      // Demo / dev: switch plan directly (mock, or the dev Convex setPlan).
      setPlan(id);
      haptics.success();
      playSignature("fuel_earned");
      track("plan_upgraded", { plan: id, via: "demo" });
      return;
    }
    const pkg = pkgFor(id);
    if (!pkg) {
      setNote(
        `${PLANS[id].name} isn't available in the current store offering.`,
      );
      return;
    }
    setBusyPlan(id);
    try {
      const ok = await purchasePlan(pkg);
      if (ok) {
        setNote(
          "Purchase complete — your plan updates once RevenueCat confirms it.",
        );
        haptics.success();
        playSignature("fuel_earned");
        track("plan_upgraded", { plan: id, via: "revenuecat" });
      }
    } catch {
      setNote("Purchase failed. Please try again.");
    } finally {
      setBusyPlan(null);
    }
  };

  const cap = PLANS[plan].fuelCap;
  const planName = PLANS[plan].name;
  const idx = PLAN_ORDER.indexOf(plan);
  const nextPlan = PLAN_ORDER[idx + 1] ?? null;
  const resetStr = (() => {
    const now = new Date();
    const d = new Date(now.getFullYear(), now.getMonth() + 1, 1);
    return d.toLocaleDateString(undefined, { month: "short", day: "numeric" });
  })();

  const onRefuel = () => {
    if (nextPlan) {
      onCta(nextPlan);
    } else {
      haptics.success();
      playConfirm();
      setNote("You're on the top tier — fully fueled, Commander.");
    }
  };

  return (
    <View className="flex-1 bg-bg-deep">
      <ScrollView contentContainerClassName="gap-4 px-5 py-4 pb-12">
        <View className="flex-row items-start gap-3">
          <View className="flex-1">
            <Text className="font-display text-2xl font-bold text-text-primary">
              Refuel Station
            </Text>
            <Text className="font-body text-sm text-text-secondary">
              Upgrade your command tier. Downgrades lock features — they never
              delete your data.
            </Text>
          </View>
          {nextPlan ? (
            <AstroAvatar
              plan={plan}
              variant="bust"
              pose="pointing"
              size={72}
            />
          ) : null}
        </View>

        {/* Fuel hero */}
        <View
          className="relative overflow-hidden rounded-3xl border border-border-med bg-bg-card p-5"
          style={{
            shadowColor: "#5BE7B0",
            shadowOpacity: 0.18,
            shadowRadius: 22,
            shadowOffset: { width: 0, height: 10 },
            elevation: 10,
          }}
        >
          <View className="items-center rounded-3xl bg-bg-deep/60 py-3">
            <FuelGauge value={fuel} max={cap} size={240} />
          </View>
          <Text
            className="mt-4 text-center font-mono text-4xl font-bold"
            style={{
              color: "#5BE7B0",
              textShadowColor: "rgba(91,231,176,0.5)",
              textShadowOffset: { width: 0, height: 0 },
              textShadowRadius: 16,
            }}
          >
            {fuel.toLocaleString()} Fuel
          </Text>
          <Text className="mt-1 text-center font-body text-xs text-text-tertiary">
            {fuel.toLocaleString()} / {cap.toLocaleString()} Fuel · {planName}{" "}
            Plan · Resets {resetStr}
          </Text>
          <Pressable
            onPress={onRefuel}
            accessibilityRole="button"
            accessibilityLabel="Refuel Mission"
            style={{
              shadowColor: "#5BE7B0",
              shadowOpacity: 0.5,
              shadowRadius: 16,
              shadowOffset: { width: 0, height: 4 },
              elevation: 8,
            }}
            className="relative mt-5 min-h-[52px] items-center justify-center overflow-hidden rounded-full active:opacity-90"
          >
            <GradientView
              colors={["#6BEFBE", "#3FD6A0"]}
              direction="horizontal"
            />
            <Text
              className="font-body text-base font-bold"
              style={{ color: "#062018" }}
            >
              Refuel Mission
            </Text>
          </Pressable>
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
                    {isCurrent ? (
                      <Badge label="Current" variant="readiness" />
                    ) : null}
                  </View>
                  <Text className="font-body text-xs text-text-secondary">
                    {spec.bestFor}
                  </Text>
                </View>
                <View className="items-end">
                  <Text className="font-display text-base font-bold text-brand-gold">
                    {price}
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
                <Row
                  label="Signal export"
                  value={spec.exportAccess ? "Yes" : "No"}
                />
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
            setNote(
              ok
                ? "Restored — your plan will reflect any active subscription."
                : "Nothing to restore.",
            );
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
