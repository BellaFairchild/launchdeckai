import React from "react";
import { useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";

import { ScrollView, View, Text } from "@/tw";
import { Card } from "@/components/ui/Card";
import { ProgressRing } from "@/components/ui/ProgressRing";
import { useMissionStore } from "@/store/mission";
import { BLUEPRINT_SECTIONS } from "@/constants/blueprintSections";

export default function BlueprintsScreen() {
  const router = useRouter();
  const blueprints = useMissionStore((s) => s.blueprints);

  return (
    <View className="flex-1 bg-bg-deep">
      <SafeAreaView style={{ flex: 1 }} edges={["bottom"]}>
        <ScrollView contentContainerClassName="gap-3 px-5 py-4 pb-24">
          <Text className="px-1 font-body text-sm text-text-secondary">
            Fill in launch details that power Foundry, Copilot, and your Signal Deck.
          </Text>
          {BLUEPRINT_SECTIONS.map((section) => {
            const bp = blueprints[section.id];
            const completion = bp?.completionStatus ?? 0;
            const filled = section.fields.filter((f) => bp?.fields[f.key]?.trim()).length;
            return (
              <Card
                key={section.id}
                variant="glass"
                onPress={() => router.push(`/blueprints/${section.id}`)}
              >
                <View className="flex-row items-center gap-4">
                  <View className="flex-1">
                    <Text className="font-display text-base font-bold text-text-primary">
                      {section.title}
                    </Text>
                    <Text className="mt-0.5 font-body text-sm text-text-secondary">
                      {section.description}
                    </Text>
                    <Text className="mt-1 font-mono text-[11px] uppercase tracking-wider text-text-tertiary">
                      {filled}/{section.fields.length} fields
                    </Text>
                  </View>
                  <ProgressRing
                    progress={completion}
                    size={52}
                    strokeWidth={6}
                    centerLabel={`${completion}%`}
                  />
                </View>
              </Card>
            );
          })}
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}
