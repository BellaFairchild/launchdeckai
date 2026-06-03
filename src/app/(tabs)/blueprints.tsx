import { useRouter } from "expo-router";
import { useState } from "react";
import { Alert } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { TabScreen } from "@/components/layout/TabScreen";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Icon } from "@/components/ui/Icon";
import { ProgressRing } from "@/components/ui/ProgressRing";
import { colors } from "@/constants/colors";
import { BLUEPRINT_SECTIONS } from "@/constants/blueprintSections";
import { blueprintFileName, buildBlueprintHtml } from "@/lib/blueprintPdf";
import { exportHtmlAsPdf } from "@/lib/exportPdf";
import { useMissionStore } from "@/store/mission";
import { Pressable, ScrollView, Text, View } from "@/tw";

export default function BlueprintsScreen() {
  const router = useRouter();
  const blueprints = useMissionStore((s) => s.blueprints);
  const [exporting, setExporting] = useState(false);

  const onDownload = async () => {
    if (exporting) return;
    setExporting(true);
    try {
      const html = buildBlueprintHtml(blueprints);
      await exportHtmlAsPdf(html, blueprintFileName(blueprints));
    } catch {
      Alert.alert(
        "Export failed",
        "Couldn't create the PDF. Please try again.",
      );
    } finally {
      setExporting(false);
    }
  };

  return (
    <TabScreen>
      <SafeAreaView style={{ flex: 1 }} edges={["bottom"]}>
        <ScrollView contentContainerClassName="gap-3 px-5 py-4 pb-24">
          <Text className="px-1 font-body text-sm text-text-secondary">
            Fill in launch details that power Foundry, Copilot, and your Signal
            Deck.
          </Text>
          {BLUEPRINT_SECTIONS.map((section) => {
            const bp = blueprints[section.id];
            const completion = bp?.completionStatus ?? 0;
            const filled = section.fields.filter((f) =>
              bp?.fields[f.key]?.trim(),
            ).length;
            const open = () => router.push(`/blueprints/${section.id}`);
            return (
              <Card key={section.id} variant="glass" onPress={open}>
                <View className="relative min-h-[80px]">
                  {/* Mini progress ring, pinned to the top-right corner */}
                  <View className="absolute right-0 top-0">
                    <ProgressRing
                      progress={completion}
                      size={40}
                      strokeWidth={5}
                      centerLabel=""
                    />
                  </View>

                  {/* Text column, kept clear of the corner ring */}
                  <View className="pr-12">
                    <Text className="font-display text-base font-bold text-text-primary">
                      {section.title}
                    </Text>
                    <Text className="mt-0.5 font-body text-sm text-text-secondary">
                      {section.description}
                    </Text>
                    <Text className="mt-1 font-mono text-[11px] uppercase tracking-wider text-text-tertiary">
                      {filled}/{section.fields.length} fields · {completion}%
                    </Text>
                  </View>

                  {/* Corner affordance: opens the blueprint form */}
                  <Pressable
                    onPress={open}
                    accessibilityRole="button"
                    accessibilityLabel={`Open ${section.title} blueprint`}
                    hitSlop={8}
                    className="absolute bottom-0 right-0 h-8 w-8 items-center justify-center rounded-full border border-border-med bg-bg-surface active:opacity-80"
                  >
                    <Icon name="arrow-right" size={16} color={colors.brandTeal} />
                  </Pressable>
                </View>
              </Card>
            );
          })}

          <View className="mt-2">
            <Button
              label="Download Blueprint"
              loading={exporting}
              onPress={onDownload}
            />
          </View>
        </ScrollView>
      </SafeAreaView>
    </TabScreen>
  );
}
