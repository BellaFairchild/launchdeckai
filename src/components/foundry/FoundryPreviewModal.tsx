import * as Clipboard from "expo-clipboard";
import { useState } from "react";
import { Alert, Modal, Pressable } from "react-native";

import { MarkdownPreview } from "@/components/foundry/MarkdownPreview";
import { Icon } from "@/components/ui/Icon";
import { colors } from "@/constants/colors";
import { playClick, playSignature } from "@/lib/audio";
import { exportHtmlAsPdf } from "@/lib/exportPdf";
import { haptics } from "@/lib/haptics";
import { buildFoundryAssetHtml, toDocFileName } from "@/lib/markdown";
import { ScrollView, Text, View } from "@/tw";

type Props = {
  visible: boolean;
  title: string;
  content: string;
  onClose: () => void;
};

/**
 * Centered document preview — rendered markdown, copy, and PDF export.
 * Matches the Foundry forge preview layout (header / body / action bar).
 */
export function FoundryPreviewModal({
  visible,
  title,
  content,
  onClose,
}: Props) {
  const [copied, setCopied] = useState(false);
  const [exporting, setExporting] = useState(false);
  const fileName = toDocFileName(title);

  const onCopy = async () => {
    playClick();
    try {
      await Clipboard.setStringAsync(content);
      haptics.success();
      playSignature("signal_ready");
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // clipboard unavailable
    }
  };

  const onExportPdf = async () => {
    if (exporting) return;
    playClick();
    setExporting(true);
    try {
      const html = buildFoundryAssetHtml(title, content);
      await exportHtmlAsPdf(html, `${fileName}.pdf`);
      haptics.success();
    } catch {
      Alert.alert(
        "Export failed",
        "Couldn't create the PDF. Please try again.",
      );
    } finally {
      setExporting(false);
    }
  };

  const onDismiss = () => {
    playClick();
    onClose();
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onDismiss}
    >
      <View className="flex-1 items-center justify-center bg-bg-deep/85 px-4 py-6">
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Dismiss preview"
          className="absolute inset-0"
          onPress={onDismiss}
        />

        <View
          className="z-10 w-full max-w-lg overflow-hidden rounded-2xl border border-border-med bg-bg-surface"
          style={{
            maxHeight: "85%",
            shadowColor: colors.brandTeal,
            shadowOpacity: 0.12,
            shadowRadius: 24,
            shadowOffset: { width: 0, height: 8 },
            elevation: 12,
          }}
        >
          {/* Header */}
          <View className="flex-row items-center justify-between border-b border-border-default bg-bg-card px-4 py-3.5">
            <View className="min-w-0 flex-1 flex-row items-center gap-3 pr-3">
              <View className="h-9 w-9 items-center justify-center rounded-xl border border-status-success/30 bg-status-success/10">
                <Icon name="file" size={18} color={colors.statusSuccess} />
              </View>
              <Text
                className="flex-1 font-display text-sm font-bold text-text-primary"
                numberOfLines={1}
              >
                {fileName}
              </Text>
            </View>
            <Pressable
              onPress={onDismiss}
              accessibilityRole="button"
              accessibilityLabel="Close preview"
              className="h-9 w-9 items-center justify-center rounded-full border border-border-med active:opacity-80"
            >
              <Icon name="close" size={18} color={colors.textSecondary} />
            </Pressable>
          </View>

          {/* Body */}
          <ScrollView
            className="bg-bg-deep"
            contentContainerClassName="px-5 py-4"
            showsVerticalScrollIndicator
          >
            <MarkdownPreview content={content} />
          </ScrollView>

          {/* Footer actions */}
          <View className="flex-row flex-wrap items-center gap-2 border-t border-border-default bg-bg-card px-4 py-3">
            <Pressable
              onPress={onCopy}
              accessibilityRole="button"
              accessibilityLabel="Copy markdown"
              className="min-h-10 flex-row items-center gap-2 rounded-xl border border-border-med bg-bg-surface px-3 active:opacity-80"
            >
              <Icon
                name="copy"
                size={14}
                color={copied ? colors.brandTeal : colors.textSecondary}
              />
              <Text className="font-mono text-[10px] font-semibold uppercase tracking-wider text-text-primary">
                {copied ? "Copied" : "Copy Markdown"}
              </Text>
            </Pressable>

            <View className="min-w-0 flex-1 flex-row justify-end gap-2">
              <Pressable
                onPress={onExportPdf}
                disabled={exporting}
                accessibilityRole="button"
                accessibilityLabel="Export PDF"
                className="min-h-10 flex-row items-center gap-2 rounded-xl border border-brand-teal/40 bg-brand-teal/10 px-3 active:opacity-80"
              >
                <Icon name="download" size={14} color={colors.brandTeal} />
                <Text className="font-mono text-[10px] font-semibold uppercase tracking-wider text-brand-teal">
                  {exporting ? "Exporting…" : "Export PDF"}
                </Text>
              </Pressable>

              <Pressable
                onPress={onDismiss}
                accessibilityRole="button"
                accessibilityLabel="Close"
                className="min-h-10 items-center justify-center rounded-xl border border-border-med bg-bg-surface px-4 active:opacity-80"
              >
                <Text className="font-mono text-[10px] font-semibold uppercase tracking-wider text-text-primary">
                  Close
                </Text>
              </Pressable>
            </View>
          </View>
        </View>
      </View>
    </Modal>
  );
}
