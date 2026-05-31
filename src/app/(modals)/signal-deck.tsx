import React, { useState } from "react";
import { useRouter } from "expo-router";

import { ScrollView, View, Text, Pressable } from "@/tw";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { SignalBars, type SignalStatus } from "@/components/ui/SignalBars";
import { SIGNAL_TEMPLATES, SIGNAL_PHASES, TOTAL_SIGNALS } from "@/constants/signalTemplates";
import { useMissionStore } from "@/store/mission";
import { useUIStore } from "@/store/ui";
import { planMeets } from "@/constants/plans";
import { tMinus, formatLaunchDate } from "@/lib/launch";
import type { Asset, SignalTemplate } from "@/types";

/** Compute a signal's status from its linked Cargo Bay asset (Docs/07: never manual). */
function signalStatus(signalId: string, assets: Asset[]): SignalStatus {
  const linked = assets.find((a) => a.signalId === signalId);
  if (!linked) return "not_loaded";
  if (linked.status === "flight_ready" || linked.status === "exported") return "flight_ready";
  return "in_prep";
}

function SignalRow({
  signal,
  status,
  onForge,
  onViewCargo,
}: {
  signal: SignalTemplate;
  status: SignalStatus;
  onForge: () => void;
  onViewCargo: () => void;
}) {
  const [open, setOpen] = useState(false);
  return (
    <Card variant={status === "flight_ready" ? "success" : "glass"}>
      <Pressable onPress={() => setOpen((o) => !o)} accessibilityRole="button">
        <View className="flex-row items-center gap-3">
          <SignalBars status={status} />
          <View className="flex-1">
            <Text className="font-body text-base font-semibold text-text-primary">
              {signal.label}
            </Text>
            <Text className="font-mono text-[11px] uppercase tracking-wider text-text-tertiary">
              {signal.platform} · {signal.relativeTiming}
            </Text>
          </View>
          <Text className="text-text-tertiary">{open ? "▾" : "▸"}</Text>
        </View>
      </Pressable>

      {open ? (
        <View className="mt-3 gap-2">
          {status === "not_loaded" ? (
            <Button label={`Forge this signal →`} size="sm" onPress={onForge} />
          ) : status === "in_prep" ? (
            <>
              <Text className="font-body text-sm text-status-warning">Needs finishing</Text>
              <Button label="View in Cargo Bay →" size="sm" variant="secondary" onPress={onViewCargo} />
            </>
          ) : (
            <Button label="View in Cargo Bay" size="sm" variant="secondary" onPress={onViewCargo} />
          )}
        </View>
      ) : null}
    </Card>
  );
}

export default function SignalDeckModal() {
  const router = useRouter();
  const { mission, assets } = useMissionStore();
  const plan = useUIStore((s) => s.plan);
  const [exported, setExported] = useState(false);

  const t = tMinus(mission.launchDate);
  const readyCount = SIGNAL_TEMPLATES.filter(
    (s) => signalStatus(s.id, assets) === "flight_ready",
  ).length;

  const canExport = planMeets(plan, "commander");

  const onTransmit = () => {
    if (!canExport) {
      router.push("/(modals)/refuel");
      return;
    }
    setExported(true);
  };

  const onForge = (signal: SignalTemplate) => {
    router.push({
      pathname: "/(tabs)/foundry",
      params: {
        signalId: signal.id,
        signalLabel: signal.label,
        signalPhase: signal.phase,
        tool: signal.assetType,
      },
    });
  };

  return (
    <View className="flex-1 bg-bg-deep">
      <ScrollView contentContainerClassName="gap-4 px-5 py-4 pb-12">
        {/* Context strip */}
        <Card variant="glass">
          <Text className="font-display text-xl font-bold text-text-primary">
            {mission.appName}
          </Text>
          <View className="mt-1 flex-row items-center justify-between">
            <Text className="font-mono text-sm text-brand-teal">
              {t.label} · {formatLaunchDate(mission.launchDate)}
            </Text>
            <Text className="font-mono text-sm text-text-secondary">
              {readyCount}/{TOTAL_SIGNALS} ready
            </Text>
          </View>
          <Button
            label={canExport ? "Transmit Sequence" : "Transmit Sequence"}
            variant={canExport ? "premium" : "locked"}
            className="mt-3"
            onPress={onTransmit}
          />
          {exported ? (
            <Text className="mt-2 font-body text-sm text-status-success">
              ✓ signal-pack.zip exported (mock) — schedule, JSON, and flight-ready content.
            </Text>
          ) : null}
          {!canExport ? (
            <Text className="mt-2 font-body text-xs text-text-tertiary">
              Export needs Commander. Tap to upgrade.
            </Text>
          ) : null}
        </Card>

        {SIGNAL_PHASES.map((phase) => {
          const signals = SIGNAL_TEMPLATES.filter((s) => s.phase === phase.id);
          return (
            <View key={phase.id} className="gap-2">
              <View className="flex-row items-center gap-2 px-1">
                <View
                  style={{ backgroundColor: phase.color }}
                  className="h-2.5 w-2.5 rounded-full"
                />
                <Text className="font-display text-base font-bold text-text-primary">
                  {phase.title}
                </Text>
              </View>
              <Text className="px-1 font-mono text-[11px] uppercase tracking-wider text-text-tertiary">
                {phase.subtitle}
              </Text>
              {signals.map((signal) => (
                <SignalRow
                  key={signal.id}
                  signal={signal}
                  status={signalStatus(signal.id, assets)}
                  onForge={() => onForge(signal)}
                  onViewCargo={() => router.push("/(modals)/cargo")}
                />
              ))}
            </View>
          );
        })}
      </ScrollView>
    </View>
  );
}
