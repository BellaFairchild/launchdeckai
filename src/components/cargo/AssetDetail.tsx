import { useState } from "react";
import { Share } from "react-native";
import * as Clipboard from "expo-clipboard";

import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { CATEGORY_META } from "@/constants/assetCategories";
import { playClick, playSignature } from "@/lib/audio";
import { haptics } from "@/lib/haptics";
import { ScrollView, Text, View } from "@/tw";
import type { Asset, AssetStatus } from "@/types";

const STATUS_LABEL: Record<AssetStatus, string> = {
  not_loaded: "Not loaded",
  in_prep: "In prep",
  needs_clearance: "Needs clearance",
  flight_ready: "Flight ready",
  exported: "Exported",
};

type Props = {
  /** The asset, or undefined when the id didn't resolve. */
  asset: Asset | undefined;
  /** Navigate back to the Cargo Bay. */
  onBack: () => void;
};

/**
 * Read-only Cargo Bay asset detail: header, scrollable content, and Share /
 * Copy export actions. Renders a not-found state when the asset is missing and
 * a placeholder (with Share/Copy disabled) when it carries no content.
 */
export function AssetDetail({ asset, onBack }: Props) {
  const [copied, setCopied] = useState(false);

  if (!asset) {
    return (
      <View className="flex-1 items-center justify-center gap-4 bg-bg-deep px-6">
        <Text className="font-display text-xl font-bold text-text-primary">
          Asset not found
        </Text>
        <Text className="text-center font-body text-sm text-text-secondary">
          It may have been removed. Head back to the Cargo Bay.
        </Text>
        <Button label="Back to Cargo Bay" onPress={onBack} />
      </View>
    );
  }

  const meta = CATEGORY_META[asset.category];
  const content = asset.content?.trim() ?? "";
  const hasContent = content.length > 0;

  const onShare = async () => {
    if (!hasContent) return;
    playClick();
    try {
      await Share.share({ message: content, title: asset.title });
    } catch {
      // dismissed / unsupported — no-op.
    }
  };

  const onCopy = async () => {
    if (!hasContent) return;
    try {
      await Clipboard.setStringAsync(content);
      haptics.success();
      playSignature("signal_ready");
      setCopied(true);
    } catch {
      // clipboard unavailable — no-op.
    }
  };

  return (
    <View className="flex-1 bg-bg-deep">
      <ScrollView contentContainerClassName="gap-4 px-5 py-4 pb-12">
        <View>
          <Text className="font-display text-2xl font-bold text-text-primary">
            {asset.title}
          </Text>
          <Text className="mt-1 font-mono text-[11px] uppercase tracking-wider text-text-tertiary">
            {meta.glyph} {meta.label} · {STATUS_LABEL[asset.status]}
          </Text>
        </View>

        <Card variant="glass">
          {hasContent ? (
            <Text className="font-body text-base leading-6 text-text-primary">
              {content}
            </Text>
          ) : (
            <Text className="font-body text-sm text-text-tertiary">
              No content yet — forge this asset in the Foundry to fill it in.
            </Text>
          )}
        </Card>

        <View className="flex-row gap-2">
          <Button
            label="Share"
            className="flex-1"
            disabled={!hasContent}
            onPress={onShare}
          />
          <Button
            label={copied ? "Copied ✓" : "Copy"}
            variant="secondary"
            className="flex-1"
            disabled={!hasContent}
            onPress={onCopy}
          />
        </View>
      </ScrollView>
    </View>
  );
}
