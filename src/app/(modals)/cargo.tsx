import { useRouter } from "expo-router";
import { Share } from "react-native";

import { CategoryGrid } from "@/components/cargo/CategoryGrid";
import { Card } from "@/components/ui/Card";
import { EmptyState } from "@/components/ui/EmptyState";
import { Icon } from "@/components/ui/Icon";
import { colors } from "@/constants/colors";
import { buildCargoBundle } from "@/lib/cargoBundle";
import { playClick, playSignature } from "@/lib/audio";
import { cn } from "@/lib/cn";
import { haptics } from "@/lib/haptics";
import { useMissionStore } from "@/store/mission";
import { Pressable, ScrollView, Text, View } from "@/tw";

/** Packages all flight-ready assets into one share. Disabled at zero ready. */
function CargoPayloadHub({
  readyCount,
  onExport,
}: {
  readyCount: number;
  onExport: () => void;
}) {
  const disabled = readyCount === 0;
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
            Bundle every flight-ready asset into one export.
          </Text>
        </View>
      </View>
      <Pressable
        onPressIn={() => {
          if (disabled) return;
          playClick();
          haptics.light();
        }}
        onPress={disabled ? undefined : onExport}
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
          Export ({readyCount})
        </Text>
      </Pressable>
    </Card>
  );
}

export default function CargoModal() {
  const router = useRouter();
  const assets = useMissionStore((s) => s.assets);
  const updateAssetStatus = useMissionStore((s) => s.updateAssetStatus);

  const readyCount = assets.filter((a) => a.status === "flight_ready").length;

  const onExport = async () => {
    const { ids, doc } = buildCargoBundle(assets);
    if (ids.length === 0) return;
    try {
      const result = await Share.share({ message: doc, title: "LaunchDeck cargo" });
      // Only count it shipped on an actual share (not a dismiss).
      if (result.action === Share.sharedAction) {
        ids.forEach((id) => updateAssetStatus(id, "exported"));
        haptics.success();
        playSignature("signal_ready");
      }
    } catch {
      // share unsupported / dismissed — no state change.
    }
  };

  return (
    <View className="flex-1 bg-bg-deep">
      <ScrollView contentContainerClassName="gap-3 px-5 py-4 pb-12">
        <Text className="font-display text-2xl font-bold text-text-primary">
          Cargo Bay
        </Text>
        <Text className="font-body text-sm text-text-secondary">
          Your launch assets, organized by category and ready to ship.
        </Text>

        {assets.length === 0 ? (
          <EmptyState
            title="No assets yet"
            message="Forge your first asset in the Foundry."
            ctaLabel="Open Foundry"
            onCtaPress={() => router.push("/(tabs)/foundry")}
          />
        ) : (
          <>
            <CategoryGrid assets={assets} />
            <CargoPayloadHub readyCount={readyCount} onExport={onExport} />
          </>
        )}
      </ScrollView>
    </View>
  );
}
