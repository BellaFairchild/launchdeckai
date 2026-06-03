import React, { useState } from "react";
import { Share } from "react-native";

import { BroadcastScheduler } from "@/components/signal/BroadcastScheduler";
import { Button } from "@/components/ui/Button";
import type { SignalStatus } from "@/components/ui/SignalBars";
import { track } from "@/lib/analytics";
import { playSignature } from "@/lib/audio";
import {
  scheduleBroadcastReminder,
  cancelBroadcastReminder,
} from "@/lib/notifications";
import { useMissionStore } from "@/store/mission";
import { Pressable, Text, View } from "@/tw";

type Props = {
  status: SignalStatus;
  /** Template id, e.g. "pre_1" — keys the broadcast plan. */
  signalId: string;
  /** Channel, e.g. "X/Twitter" — shown in the reminder body. */
  platform: string;
  /** Label of the signal, surfaced in the picker + reminder. */
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

/** The content action — depends on whether the asset exists / is ready. */
function ContentAction({
  status,
  onForge,
  onViewCargo,
}: Pick<Props, "status" | "onForge" | "onViewCargo">) {
  if (status === "not_loaded") {
    return <Button label="Forge →" size="sm" variant="secondary" fullWidth onPress={onForge} />;
  }
  if (status === "in_prep") {
    return (
      <View className="gap-2">
        <Text className="font-body text-sm text-status-warning">Needs finishing</Text>
        <Button label="Finish in Cargo →" size="sm" variant="secondary" onPress={onViewCargo} />
      </View>
    );
  }
  return <Button label="View in Cargo" size="sm" variant="secondary" onPress={onViewCargo} />;
}

/**
 * Two independent actions per signal:
 *   Content  → Forge / Finish / View in Cargo Bay (depends on status)
 *   Broadcast→ schedule a send (destination + date/time → calm reminder)
 * Broadcast is always available, regardless of content status.
 */
export function SignalActions({
  status,
  signalId,
  platform,
  label,
  onForge,
  onViewCargo,
}: Props) {
  const [schedulerOpen, setSchedulerOpen] = useState(false);
  const broadcast = useMissionStore((s) =>
    s.broadcasts.find((b) => b.signalId === signalId),
  );
  const scheduleBroadcast = useMissionStore((s) => s.scheduleBroadcast);
  const cancelBroadcast = useMissionStore((s) => s.cancelBroadcast);

  const onShare = async () => {
    track("signal_shared", { label });
    try {
      await Share.share({
        message: label
          ? `Check out my launch signal: ${label}`
          : "Check out my launch signal on LaunchDeck",
      });
    } catch {
      // dismissed / unsupported — no-op.
    }
  };

  const onConfirm = (when: Date, url: string) => {
    setSchedulerOpen(false);
    scheduleBroadcast({ signalId, destinationUrl: url, scheduledAt: when.getTime() });
    void scheduleBroadcastReminder({
      signalId,
      signalLabel: label ?? "your signal",
      platform,
      destinationUrl: url,
      scheduledAt: when.getTime(),
    });
    track("broadcast_scheduled", { at: when.toISOString() });
    playSignature("signal_ready");
  };

  const onCancelBroadcast = () => {
    cancelBroadcast(signalId);
    void cancelBroadcastReminder(signalId);
    track("broadcast_cancelled", { signalId });
  };

  const scheduledWhen = broadcast ? new Date(broadcast.scheduledAt) : null;

  return (
    <View className="gap-3">
      <View className="flex-row gap-2">
        <View className="flex-1">
          <ContentAction status={status} onForge={onForge} onViewCargo={onViewCargo} />
        </View>
        <Button label="Share" size="sm" variant="secondary" className="flex-1" onPress={onShare} />
      </View>

      {scheduledWhen ? (
        <View className="gap-1.5 rounded-2xl border border-brand-teal/40 bg-brand-teal/5 p-3">
          <Text className="font-body text-sm text-brand-teal">
            ✓ Broadcast set for {formatWhen(scheduledWhen)}
          </Text>
          <View className="flex-row gap-2">
            <Button
              label="Edit"
              size="sm"
              variant="secondary"
              className="flex-1"
              onPress={() => {
                track("broadcast_scheduler_opened", { editing: true });
                setSchedulerOpen(true);
              }}
            />
            <Pressable
              onPress={onCancelBroadcast}
              accessibilityRole="button"
              className="flex-1 items-center justify-center rounded-full py-2 active:opacity-70"
            >
              <Text className="font-body text-sm text-status-error">Cancel broadcast</Text>
            </Pressable>
          </View>
        </View>
      ) : (
        <Button
          label="Broadcast →"
          size="sm"
          onPress={() => {
            track("broadcast_scheduler_opened");
            setSchedulerOpen(true);
          }}
        />
      )}

      <BroadcastScheduler
        visible={schedulerOpen}
        title={label}
        editing={!!broadcast}
        initialWhen={scheduledWhen ?? undefined}
        initialUrl={broadcast?.destinationUrl}
        onClose={() => setSchedulerOpen(false)}
        onConfirm={onConfirm}
        onRemove={
          broadcast
            ? () => {
                setSchedulerOpen(false);
                onCancelBroadcast();
              }
            : undefined
        }
      />
    </View>
  );
}
