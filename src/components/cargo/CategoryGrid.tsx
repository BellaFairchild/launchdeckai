import type { ReactNode } from "react";
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
 * Cargo Bay top level: a 2-column grid of category cards. Tapping a card
 * expands it in place (single-open accordion) to its asset rows; each row opens
 * the asset detail screen. Empty categories are dropped.
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

  // Lay out collapsed cards two-per-row; an expanded card breaks to full width
  // in place, so it "expands where it sits".
  const rows: ReactNode[] = [];
  let buffer: AssetCategory[] = [];
  const flushPair = () => {
    if (buffer.length === 0) return;
    const pair = buffer;
    rows.push(
      <View key={`pair-${rows.length}`} className="flex-row gap-3">
        {pair.map((category) => {
          const group = groups.find((g) => g.category === category);
          return (
            <View key={category} className="flex-1">
              {collapsedCard(category, group?.assets.length ?? 0)}
            </View>
          );
        })}
        {pair.length === 1 ? <View className="flex-1" /> : null}
      </View>,
    );
    buffer = [];
  };

  for (const group of groups) {
    if (group.category === open) {
      flushPair();
      rows.push(
        <View key={`expanded-${group.category}`}>
          {expandedCard(group.category, group.assets)}
        </View>,
      );
    } else {
      buffer.push(group.category);
      if (buffer.length === 2) flushPair();
    }
  }
  flushPair();

  return <View className="gap-3">{rows}</View>;
}
