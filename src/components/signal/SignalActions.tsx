import React, { useState } from "react";
import { Share } from "react-native";

import { BroadcastScheduler } from "@/components/signal/BroadcastScheduler";
import { Button } from "@/components/ui/Button";
import type { SignalStatus } from "@/components/ui/SignalBars";
import { track } from "@/lib/analytics";
import { playSignature } from "@/lib/audio";
import { Text, View } from "@/tw";

type Props = {
  status: SignalStatus;
  /** Label of the signal being scheduled, surfaced in the picker header. */
  label?: string;
  onForge: () => void;
  onViewCargo: () => void;
};

/** Human-readable broadcast slot, e.g. "Jan 4, 2025 · 18:45". */
function formatWhen(when: Date): string {
  const date = when.toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
  const hh = String(when.getHours()).padStart(2, "0");
  const mm = String(when.getMinutes()).padStart(2, "0");
  return `${date} · ${hh}:${mm}`;
}

/**
 * Status-driven actions for a single signal — shared by the Signal Deck list
 * row and the calendar's inline expansion so both behave identically:
 *   not_loaded  → Broadcast (pick a date/time, then forge it)
 *   in_prep     → finish it (View in Cargo Bay)
 *   flight_ready→ View in Cargo Bay
 */
export function SignalActions({ status, label, onForge, onViewCargo }: Props) {
  const [schedulerOpen, setSchedulerOpen] = useState(false);
  const [scheduledFor, setScheduledFor] = useState<Date | null>(null);

  const onShare = async () => {
    track("signal_shared", { label });
    try {
      await Share.share({
        message: label
          ? `Check out my launch signal: ${label}`
          : "Check out my launch signal on LaunchDeck",
      });
    } catch {
      // User dismissed the share sheet, or sharing is unsupported (e.g. web) — no-op.
    }
  };

  if (status === "not_loaded") {
    return (
      <>
        {scheduledFor ? (
          <Text className="mb-2 font-body text-sm text-brand-teal">
            ✓ Broadcast set for {formatWhen(scheduledFor)}
          </Text>
        ) : null}
        <View className="flex-row gap-2">
          <Button
            label="Share"
            size="sm"
            variant="secondary"
            className="flex-1"
            onPress={onShare}
          />
          <Button
            label="Broadcast →"
            size="sm"
            className="flex-1"
            onPress={() => {
              track("broadcast_scheduler_opened");
              setSchedulerOpen(true);
            }}
          />
        </View>
        <BroadcastScheduler
          visible={schedulerOpen}
          title={label}
          onClose={() => setSchedulerOpen(false)}
          onConfirm={(when) => {
            setScheduledFor(when);
            setSchedulerOpen(false);
            track("broadcast_scheduled", { at: when.toISOString() });
            playSignature("signal_ready");
            onForge();
          }}
        />
      </>
    );
  }
  if (status === "in_prep") {
    return (
      <View className="gap-2">
        <Text className="font-body text-sm text-status-warning">Needs finishing</Text>
        <Button
          label="View in Cargo Bay →"
          size="sm"
          variant="secondary"
          onPress={onViewCargo}
        />
      </View>
    );
  }
  return (
    <Button
      label="View in Cargo Bay"
      size="sm"
      variant="secondary"
      onPress={onViewCargo}
    />
  );
}
