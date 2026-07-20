import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { SignalBars, type SignalStatus } from "@/components/ui/SignalBars";
import { Pressable, Text, View } from "@/tw";
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

type Props = {
  asset: Asset;
  /** Open the asset detail screen. */
  onOpen: () => void;
  /** Mark this asset flight-ready (shown until it is ready). */
  onMarkReady: () => void;
};

/**
 * A single Cargo Bay asset. The whole card opens the detail screen; the
 * inline "Mark flight-ready" action stays on the row until the asset is ready.
 */
export function AssetRow({ asset, onOpen, onMarkReady }: Props) {
  const isReady =
    asset.status === "flight_ready" || asset.status === "exported";
  return (
    <Card variant={isReady ? "success" : "glass"}>
      <Pressable
        onPress={onOpen}
        accessibilityRole="button"
        accessibilityLabel={`Open ${asset.title}`}
      >
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
      </Pressable>
      {!isReady ? (
        <View className="mt-3">
          <Button label="Mark flight-ready" size="sm" onPress={onMarkReady} />
        </View>
      ) : null}
    </Card>
  );
}
