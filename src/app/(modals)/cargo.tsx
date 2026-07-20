import { useRouter } from "expo-router";

import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { EmptyState } from "@/components/ui/EmptyState";
import { Icon } from "@/components/ui/Icon";
import { SignalBars, type SignalStatus } from "@/components/ui/SignalBars";
import { colors } from "@/constants/colors";
import { playClick, playSignature } from "@/lib/audio";
import { cn } from "@/lib/cn";
import { haptics } from "@/lib/haptics";
import { useMissionStore } from "@/store/mission";
import { useUIStore } from "@/store/ui";
import { Pressable, ScrollView, Text, View } from "@/tw";
import type { Asset, AssetStatus } from "@/types";

const STATUS_BARS: Record<AssetStatus, SignalStatus> = {
  not_loaded: "not_loaded",
  in_prep: "in_prep",
  needs_clearance: "in_prep",
  flight_ready: "flight_ready",
  exported: "flight_ready",
};

const STATUS_LABEL: Record<AssetStatus, string> = {
  not_loaded: "Not loaded",
  in_prep: "In prep",
  needs_clearance: "Needs clearance",
  flight_ready: "Flight ready",
  exported: "Exported",
};

function AssetRow({
  asset,
  onMarkReady,
  onViewSignal,
}: {
  asset: Asset;
  onMarkReady: () => void;
  onViewSignal: () => void;
}) {
  const isReady =
    asset.status === "flight_ready" || asset.status === "exported";
  return (
    <Card variant={isReady ? "success" : "glass"}>
      <View className="flex-row items-start justify-between gap-3">
        <View className="flex-1">
          <Text className="font-display text-base font-bold text-text-primary">
            {asset.title}
          </Text>
          <View className="mt-1 flex-row flex-wrap items-center gap-2">
            <Badge label={STATUS_LABEL[asset.status]} variant="status" />
            {asset.signalLabel ? (
              <Badge label={`📡 ${asset.signalLabel}`} variant="signal" />
            ) : null}
          </View>
        </View>
        <SignalBars status={STATUS_BARS[asset.status]} />
      </View>
      <View className="mt-3 flex-row gap-2">
        {!isReady ? (
          <Button label="Mark flight-ready" size="sm" onPress={onMarkReady} />
        ) : null}
        {asset.signalId ? (
          <Button
            label="View Signal"
            size="sm"
            variant="ghost"
            onPress={onViewSignal}
          />
        ) : null}
      </View>
    </Card>
  );
}

function CargoPayloadHub({
  clearedCount,
  onDownload,
}: {
  clearedCount: number;
  onDownload: () => void;
}) {
  const disabled = clearedCount === 0;
  return (
    <Card className="mt-2">
      <View className="flex-row items-center gap-4">
        <View className="h-16 w-16 items-center justify-center rounded-2xl border border-brand-teal/30 bg-brand-teal/10">
          <Icon name="box" size={30} color={colors.brandTeal} />
        </View>
        <View className="flex-1">
          <Text className="font-display text-xl font-bold text-text-primary">
            Cargo Payload Hub
          </Text>
          <Text className="mt-1 font-body text-sm text-text-secondary">
            Package and download all cleared mission files.
          </Text>
        </View>
      </View>
      <Pressable
        onPressIn={() => {
          if (disabled) return;
          playClick();
          haptics.light();
        }}
        onPress={disabled ? undefined : onDownload}
        accessibilityRole="button"
        accessibilityState={{ disabled }}
        className={cn(
          "mt-4 min-h-[52px] flex-row items-center justify-center gap-2 rounded-full bg-brand-teal active:opacity-90",
          disabled && "opacity-40",
        )}
        style={
          disabled
            ? undefined
            : {
                shadowColor: colors.brandTeal,
                shadowOpacity: 0.4,
                shadowRadius: 16,
                shadowOffset: { width: 0, height: 6 },
                elevation: 8,
              }
        }
      >
        <Icon name="download" size={20} color={colors.bgDeep} />
        <Text className="font-body text-base font-bold uppercase tracking-wide text-bg-deep">
          Download assets ({clearedCount})
        </Text>
      </Pressable>
    </Card>
  );
}

export default function CargoModal() {
  const router = useRouter();
  const plan = useUIStore((s) => s.plan);
  const assets = useMissionStore((s) => s.assets);
  const updateAssetStatus = useMissionStore((s) => s.updateAssetStatus);

  const clearedCount = assets.filter(
    (a) => a.status === "flight_ready" || a.status === "exported",
  ).length;

  return (
    <View className="flex-1 bg-bg-deep">
      <ScrollView contentContainerClassName="gap-3 px-5 py-4 pb-12">
        <Text className="font-display text-2xl font-bold text-text-primary">
          Cargo Bay
        </Text>
        <Text className="font-body text-sm text-text-secondary">
          Your launch assets, ready for transmission.
        </Text>

        {assets.length === 0 ? (
          <EmptyState
            astroPose="pointing"
            plan={plan}
            title="No assets yet"
            message="Forge your first asset in the Foundry."
            ctaLabel="Open Foundry"
            onCtaPress={() => router.push("/(tabs)/foundry")}
          />
        ) : (
          <>
            {assets.map((asset) => (
              <AssetRow
                key={asset.id}
                asset={asset}
                onMarkReady={() => {
                  updateAssetStatus(asset.id, "flight_ready");
                  haptics.success();
                  playSignature("signal_ready");
                }}
                onViewSignal={() => router.push("/(modals)/signal-deck")}
              />
            ))}

            <CargoPayloadHub
              clearedCount={clearedCount}
              onDownload={() => {
                assets.forEach((a) => {
                  if (a.status === "flight_ready") {
                    updateAssetStatus(a.id, "exported");
                  }
                });
                haptics.success();
                playSignature("signal_ready");
              }}
            />
          </>
        )}
      </ScrollView>
    </View>
  );
}
