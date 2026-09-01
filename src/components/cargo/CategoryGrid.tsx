import { useState } from "react";
import { useRouter } from "expo-router";

import { groupByCategory } from "@/constants/assetCategories";
import { playClick, playSignature } from "@/lib/audio";
import { haptics } from "@/lib/haptics";
import { useMissionStore } from "@/store/mission";
import { View } from "@/tw";
import type { Asset, AssetCategory } from "@/types";

import { AssetRow } from "./AssetRow";
import { CategoryCard } from "./CategoryCard";

/**
 * Cargo Bay top level: a single vertical column of category cards. Tapping a
 * card expands it in place (single-open accordion) to its asset rows; each row
 * opens the asset detail screen. Empty categories are dropped.
 */
export function CategoryGrid({ assets }: { assets: Asset[] }) {
  const router = useRouter();
  const updateAssetStatus = useMissionStore((s) => s.updateAssetStatus);
  const [open, setOpen] = useState<AssetCategory | null>(null);

  const groups = groupByCategory(assets);

  const expandedCard = (category: AssetCategory, catAssets: Asset[]) => (
    <CategoryCard
      category={category}
      count={catAssets.length}
      expanded
      onToggle={() => {
        playClick();
        setOpen(null);
      }}
    >
      {catAssets.map((a) => (
        <AssetRow
          key={a.id}
          asset={a}
          onOpen={() => {
            playClick();
            router.push(`/(modals)/cargo-asset/${a.id}`);
          }}
          onMarkReady={() => {
            updateAssetStatus(a.id, "flight_ready");
            haptics.success();
            playSignature("cargo_saved");
          }}
        />
      ))}
    </CategoryCard>
  );

  const collapsedCard = (category: AssetCategory, count: number) => (
    <CategoryCard
      category={category}
      count={count}
      expanded={false}
      onToggle={() => {
        playClick();
        haptics.light();
        setOpen(category);
      }}
    />
  );

  // One full-width card per category, stacked top to bottom. The open one
  // expands in place, so the column order never shifts.
  return (
    <View className="gap-3">
      {groups.map((group) => (
        <View key={group.category}>
          {group.category === open
            ? expandedCard(group.category, group.assets)
            : collapsedCard(group.category, group.assets.length)}
        </View>
      ))}
    </View>
  );
}
