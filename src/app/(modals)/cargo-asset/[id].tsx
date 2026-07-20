import { useLocalSearchParams, useRouter } from "expo-router";

import { AssetDetail } from "@/components/cargo/AssetDetail";
import { useMissionStore } from "@/store/mission";

/** Route wrapper: resolve the asset id from the store and render the detail. */
export default function CargoAssetRoute() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const asset = useMissionStore((s) => s.assets.find((a) => a.id === id));
  return <AssetDetail asset={asset} onBack={() => router.back()} />;
}
