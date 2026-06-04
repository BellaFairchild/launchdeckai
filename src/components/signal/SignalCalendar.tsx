import React, { useEffect, useMemo, useState } from "react";

import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Segmented } from "@/components/ui/Segmented";
import { SignalBars, type SignalStatus } from "@/components/ui/SignalBars";
import { Icon } from "@/components/ui/Icon";
import { colors } from "@/constants/colors";
import { useMissionStore } from "@/store/mission";
import {
  SIGNAL_PHASES,
  SIGNAL_TEMPLATES,
} from "@/constants/signalTemplates";
import { cn } from "@/lib/cn";
import {
  activePhase,
  focusDay,
  groupSignalsByDay,
  isPastDay,
  type SignalDay,
  sortByTime,
} from "@/lib/signalCalendar";
import { Pressable, Text, View } from "@/tw";
import type { Asset, SignalPhase, SignalTemplate } from "@/types";

import { ChannelGlyph } from "./ChannelGlyph";
import { SignalActions } from "./SignalActions";
import { signalStatus } from "./status";

type Props = {
  launchDate?: number;
  assets: Asset[];
  onForge: (signal: SignalTemplate) => void;
  onViewCargo: () => void;
  /** Route to where the launch date is set (empty state). */
  onSetDate: () => void;
};

/** Aggregate a day's readiness: ready only if every signal is ready. */
function aggregateStatus(signals: SignalTemplate[], assets: Asset[]): SignalStatus {
  const statuses = signals.map((s) => signalStatus(s.id, assets));
  if (statuses.every((s) => s === "flight_ready")) return "flight_ready";
  if (statuses.some((s) => s !== "not_loaded")) return "in_prep";
  return "not_loaded";
}

const STATUS_BORDER: Record<SignalStatus, string> = {
  not_loaded: "border-border-default",
  in_prep: "border-status-warning/45",
  flight_ready: "border-status-success/45",
};

const PHASE_OPTIONS = SIGNAL_PHASES.map((p) => ({
  value: p.id,
  label: p.id === "launch_day" ? "Launch Day" : p.id === "pre_launch" ? "Pre-Launch" : "Post-Launch",
}));

function phaseColor(phase: SignalPhase): string {
  return SIGNAL_PHASES.find((p) => p.id === phase)?.color ?? colors.brandTeal;
}

/** Compact day tile in the pre/post grid. */
function DayCell({
  day,
  status,
  selected,
  past,
  scheduled,
  onPress,
}: {
  day: SignalDay;
  status: SignalStatus;
  selected: boolean;
  past: boolean;
  scheduled: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityState={{ selected }}
      accessibilityLabel={`${day.weekday} ${day.month} ${day.dayNum}, ${day.signals.length} signal${day.signals.length === 1 ? "" : "s"}`}
      style={
        selected
          ? { shadowColor: colors.rocketTeal, shadowOpacity: 0.35, shadowRadius: 14, shadowOffset: { width: 0, height: 6 }, elevation: 8 }
          : undefined
      }
      className={cn(
        "flex-1 gap-2 rounded-2xl border bg-bg-card/60 p-3 active:opacity-90",
        selected ? "border-brand-teal" : STATUS_BORDER[status],
        past && !selected && "opacity-55",
      )}
    >
      <View className="flex-row items-center justify-between">
        <Text className="font-mono text-[11px] uppercase tracking-[1.5px] text-text-tertiary">
          {day.weekday} · {day.month}
        </Text>
        <View className="flex-row items-center gap-1.5">
          {scheduled ? (
            <View className="h-5 w-5 items-center justify-center rounded-full border border-brand-teal/40 bg-brand-teal/15">
              <Icon name="signal" size={12} color={colors.brandTeal} />
            </View>
          ) : null}
          <SignalBars status={status} size="sm" />
        </View>
      </View>
      <View className="flex-row items-end justify-between">
        <Text className="font-display text-2xl font-bold leading-none text-text-primary">
          {day.dayNum}
        </Text>
        <Text className="font-mono text-[10px] uppercase tracking-wider text-text-tertiary">
          {day.signals[0]?.relativeTiming}
        </Text>
      </View>
      <View className="flex-row flex-wrap gap-1.5">
        {day.signals.map((s) => (
          <ChannelGlyph key={s.id} platform={s.platform} size={26} dimmed={past} />
        ))}
      </View>
    </Pressable>
  );
}

/** Full-width detail for the selected grid day. */
function DayDetail({
  day,
  assets,
  scheduledIds,
  onForge,
  onViewCargo,
}: {
  day: SignalDay;
  assets: Asset[];
  scheduledIds: Set<string>;
  onForge: (s: SignalTemplate) => void;
  onViewCargo: () => void;
}) {
  return (
    <Card variant="elevated">
      <Text className="font-mono text-[11px] uppercase tracking-[1.5px] text-brand-teal">
        {day.weekday} · {day.month} {day.dayNum} · {day.signals[0]?.relativeTiming}
      </Text>
      <View className="mt-3 gap-4">
        {day.signals.map((s) => {
          const status = signalStatus(s.id, assets);
          return (
            <View key={s.id} className="gap-2">
              <View className="flex-row items-center gap-3">
                <ChannelGlyph platform={s.platform} size={32} />
                <View className="flex-1">
                  <Text className="font-body text-base font-semibold text-text-primary">
                    {s.label}
                  </Text>
                  <View className="flex-row items-center gap-1.5">
                    <Text className="font-mono text-[11px] uppercase tracking-wider text-text-tertiary">
                      {s.platform}
                    </Text>
                    {scheduledIds.has(s.id) ? (
                      <View className="flex-row items-center gap-1 rounded-full border border-brand-teal/30 bg-brand-teal/10 px-2 py-0.5">
                        <Icon name="signal" size={11} color={colors.brandTeal} />
                        <Text className="font-mono text-[10px] uppercase tracking-wider text-brand-teal">
                          Scheduled
                        </Text>
                      </View>
                    ) : null}
                  </View>
                </View>
                <SignalBars status={status} />
              </View>
              <SignalActions
                status={status}
                signalId={s.id}
                platform={s.platform}
                label={s.label}
                onForge={() => onForge(s)}
                onViewCargo={onViewCargo}
              />
            </View>
          );
        })}
      </View>
    </Card>
  );
}

/** A single timed row on launch day. */
function TimelineRow({
  signal,
  status,
  expanded,
  scheduled,
  onToggle,
  onForge,
  onViewCargo,
}: {
  signal: SignalTemplate;
  status: SignalStatus;
  expanded: boolean;
  scheduled: boolean;
  onToggle: () => void;
  onForge: () => void;
  onViewCargo: () => void;
}) {
  return (
    <View className="flex-row gap-3">
      {/* time rail */}
      <View className="w-14 items-end pt-1">
        <Text className="font-mono text-sm font-bold text-brand-teal">
          {signal.relativeTiming}
        </Text>
      </View>
      <View className="flex-1">
        <Card variant={status === "flight_ready" ? "success" : "glass"}>
          <Pressable onPress={onToggle} accessibilityRole="button" accessibilityState={{ expanded }}>
            <View className="flex-row items-center gap-3">
              <ChannelGlyph platform={signal.platform} size={30} />
              <View className="flex-1">
                <Text className="font-body text-base font-semibold text-text-primary">
                  {signal.label}
                </Text>
                <View className="flex-row items-center gap-1.5">
                  <Text className="font-mono text-[11px] uppercase tracking-wider text-text-tertiary">
                    {signal.platform}
                  </Text>
                  {scheduled ? (
                    <View className="flex-row items-center gap-1 rounded-full border border-brand-teal/30 bg-brand-teal/10 px-2 py-0.5">
                      <Icon name="signal" size={11} color={colors.brandTeal} />
                      <Text className="font-mono text-[10px] uppercase tracking-wider text-brand-teal">
                        Scheduled
                      </Text>
                    </View>
                  ) : null}
                </View>
              </View>
              <SignalBars status={status} />
            </View>
          </Pressable>
          {expanded ? (
            <View className="mt-3">
              <SignalActions status={status} signalId={signal.id} platform={signal.platform} label={signal.label} onForge={onForge} onViewCargo={onViewCargo} />
            </View>
          ) : null}
        </Card>
      </View>
    </View>
  );
}

/** Chunk into rows of two for a clean 2-column grid. */
function pairs<T>(items: T[]): (T | null)[][] {
  const out: (T | null)[][] = [];
  for (let i = 0; i < items.length; i += 2) {
    out.push([items[i], items[i + 1] ?? null]);
  }
  return out;
}

export function SignalCalendar({
  launchDate,
  assets,
  onForge,
  onViewCargo,
  onSetDate,
}: Props) {
  const [phase, setPhase] = useState<SignalPhase>(() => activePhase(launchDate));
  const [selectedDay, setSelectedDay] = useState<number | null>(null);
  const [expandedSignal, setExpandedSignal] = useState<string | null>(null);

  const phaseSignals = useMemo(
    () => SIGNAL_TEMPLATES.filter((s) => s.phase === phase),
    [phase],
  );
  const days = useMemo(
    () => groupSignalsByDay(phaseSignals, launchDate),
    [phaseSignals, launchDate],
  );
  const broadcasts = useMissionStore((s) => s.broadcasts);
  const scheduledIds = useMemo(
    () => new Set(broadcasts.map((b) => b.signalId)),
    [broadcasts],
  );

  // On phase change, orient to the "you are here" day and collapse rows.
  useEffect(() => {
    setSelectedDay(focusDay(days));
    setExpandedSignal(null);
  }, [phase, days]);

  if (!launchDate) {
    return (
      <Card variant="glass">
        <Text className="font-display text-lg font-bold text-text-primary">
          Map your signal calendar
        </Text>
        <Text className="mt-1 font-body text-sm text-text-secondary">
          Set your launch date and every signal lands on a real day, from T-14
          through your first month live.
        </Text>
        <Button label="Set launch date →" className="mt-4" onPress={onSetDate} />
      </Card>
    );
  }

  const selected = days.find((d) => d.dateMs === selectedDay) ?? null;

  return (
    <View className="gap-4">
      <Segmented
        options={PHASE_OPTIONS}
        value={phase}
        onChange={setPhase}
        activeColor={phaseColor(phase)}
        activeTextColor={colors.bgDeep}
        className="self-center"
      />

      {phase === "launch_day" ? (
        <View className="gap-3">
          {sortByTime(phaseSignals, launchDate).map((s) => {
            const status = signalStatus(s.id, assets);
            return (
              <TimelineRow
                key={s.id}
                signal={s}
                status={status}
                expanded={expandedSignal === s.id}
                scheduled={scheduledIds.has(s.id)}
                onToggle={() =>
                  setExpandedSignal((cur) => (cur === s.id ? null : s.id))
                }
                onForge={() => onForge(s)}
                onViewCargo={onViewCargo}
              />
            );
          })}
        </View>
      ) : (
        <View className="gap-3">
          {pairs(days).map((row, i) => (
            <View key={i} className="flex-row gap-3">
              {row.map((day, j) =>
                day ? (
                  <DayCell
                    key={day.dateMs}
                    day={day}
                    status={aggregateStatus(day.signals, assets)}
                    selected={day.dateMs === selectedDay}
                    past={isPastDay(day.dateMs)}
                    scheduled={day.signals.some((s) => scheduledIds.has(s.id))}
                    onPress={() => setSelectedDay(day.dateMs)}
                  />
                ) : (
                  // keep the last odd cell from stretching full width
                  <View key={`spacer-${j}`} className="flex-1" />
                ),
              )}
            </View>
          ))}

          {selected ? (
            <DayDetail
              day={selected}
              assets={assets}
              scheduledIds={scheduledIds}
              onForge={onForge}
              onViewCargo={onViewCargo}
            />
          ) : null}
        </View>
      )}
    </View>
  );
}
