import { useRouter } from "expo-router";
import { useEffect, useState } from "react";

import { SignalActions } from "@/components/signal/SignalActions";
import { SignalCalendar } from "@/components/signal/SignalCalendar";
import { signalStatus } from "@/components/signal/status";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Segmented } from "@/components/ui/Segmented";
import { SignalBars, type SignalStatus } from "@/components/ui/SignalBars";
import { planMeets } from "@/constants/plans";
import {
    SIGNAL_PHASES,
    SIGNAL_TEMPLATES,
    TOTAL_SIGNALS,
} from "@/constants/signalTemplates";
import { track } from "@/lib/analytics";
import { playSignature } from "@/lib/audio";
import { haptics } from "@/lib/haptics";
import { formatLaunchDate, tMinus } from "@/lib/launch";
import { useMissionStore } from "@/store/mission";
import { useUIStore } from "@/store/ui";
import { Pressable, ScrollView, Text, View } from "@/tw";
import type { SignalTemplate } from "@/types";

type DeckView = "list" | "calendar";

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
      <Pressable
        onPress={() => setOpen((o) => !o)}
        accessibilityRole="button"
        accessibilityState={{ expanded: open }}
      >
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
        <View className="mt-3">
          <SignalActions
            status={status}
            signalId={signal.id}
            platform={signal.platform}
            label={signal.label}
            onForge={onForge}
            onViewCargo={onViewCargo}
          />
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
  const [view, setView] = useState<DeckView>("list");

  useEffect(() => {
    track("signal_deck_opened");
  }, []);

  const t = tMinus(mission.launchDate);
  const readyCount = SIGNAL_TEMPLATES.filter(
    (s) => signalStatus(s.id, assets) === "flight_ready",
  ).length;

  const canExport = planMeets(plan, "commander");

  const onTransmit = () => {
    track("transmit_sequence_tapped", { canExport });
    if (!canExport) {
      router.push("/(modals)/refuel");
      return;
    }
    setExported(true);
    haptics.success();
    playSignature("signal_ready");
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

  const onViewCargo = () => router.push("/(modals)/cargo");

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
            label="Transmit Sequence"
            variant={canExport ? "premium" : "locked"}
            className="mt-3"
            onPress={onTransmit}
          />
          {exported ? (
            <Text className="mt-2 font-body text-sm text-status-success">
              ✓ signal-pack.zip exported (mock) — schedule, JSON, and
              flight-ready content.
            </Text>
          ) : null}
          {!canExport ? (
            <Text className="mt-2 font-body text-xs text-text-tertiary">
              Export needs Commander. Tap to upgrade.
            </Text>
          ) : null}
        </Card>

        {/* View toggle: list (default) ⇄ calendar */}
        <Segmented
          options={[
            { value: "list", label: "List" },
            { value: "calendar", label: "Calendar" },
          ]}
          value={view}
          onChange={setView}
          className="self-center"
        />

        {view === "calendar" ? (
          <SignalCalendar
            launchDate={mission.launchDate}
            assets={assets}
            onForge={onForge}
            onViewCargo={onViewCargo}
            onSetDate={() => router.push("/(modals)/settings")}
          />
        ) : (
          SIGNAL_PHASES.map((phase) => {
            const signals = SIGNAL_TEMPLATES.filter(
              (s) => s.phase === phase.id,
            );
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
                    onViewCargo={onViewCargo}
                  />
                ))}
              </View>
            );
          })
        )}
      </ScrollView>
    </View>
  );
}
