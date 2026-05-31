import React from "react";
import { useRouter } from "expo-router";

import { ScrollView, View, Text } from "@/tw";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { SignalBars, type SignalStatus } from "@/components/ui/SignalBars";
import { EmptyState } from "@/components/ui/EmptyState";
import { useMissionStore } from "@/store/mission";
import { haptics } from "@/lib/haptics";
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
  const isReady = asset.status === "flight_ready" || asset.status === "exported";
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
          <Button label="View Signal" size="sm" variant="ghost" onPress={onViewSignal} />
        ) : null}
      </View>
    </Card>
  );
}

export default function CargoModal() {
  const router = useRouter();
  const assets = useMissionStore((s) => s.assets);
  const updateAssetStatus = useMissionStore((s) => s.updateAssetStatus);

  return (
    <View className="flex-1 bg-bg-deep">
      <ScrollView contentContainerClassName="gap-3 px-5 py-4 pb-12">
        <Text className="font-display text-2xl font-bold text-text-primary">Cargo Bay</Text>
        <Text className="font-body text-sm text-text-secondary">
          Your launch assets, ready for transmission.
        </Text>

        {assets.length === 0 ? (
          <EmptyState
            title="No assets yet"
            message="Forge your first asset in the Foundry."
            ctaLabel="Open Foundry"
            onCtaPress={() => router.push("/(tabs)/foundry")}
          />
        ) : (
          assets.map((asset) => (
            <AssetRow
              key={asset.id}
              asset={asset}
              onMarkReady={() => {
                updateAssetStatus(asset.id, "flight_ready");
                haptics.success();
              }}
              onViewSignal={() => router.push("/(modals)/signal-deck")}
            />
          ))
        )}
      </ScrollView>
    </View>
  );
}
