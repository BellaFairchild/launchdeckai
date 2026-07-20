import { useLocalSearchParams, useRouter } from "expo-router";
import { useMemo, useState } from "react";
import { KeyboardAvoidingView, Platform } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { SocialMediaLinksEditor } from "@/components/blueprint/SocialMediaLinksEditor";
import { Button } from "@/components/ui/Button";
import { Segmented } from "@/components/ui/Segmented";
import { BLUEPRINT_SECTIONS } from "@/constants/blueprintSections";
import { foundryToolById } from "@/constants/foundryTools";
import { SOCIAL_LINKS_FIELD_KEY } from "@/constants/socialPlatforms";
import { playSignature } from "@/lib/audio";
import { haptics } from "@/lib/haptics";
import { parseSocialLinks, serializeSocialLinks } from "@/lib/socialLinks";
import { useMissionStore } from "@/store/mission";
import { Pressable, ScrollView, Text, TextInput, View } from "@/tw";
import type { BlueprintSection } from "@/types";

type MarketingTab = "details" | "social";

export default function BlueprintDetail() {
  const router = useRouter();
  const { section } = useLocalSearchParams<{ section: string }>();
  const meta = BLUEPRINT_SECTIONS.find((s) => s.id === section);
  const stored = useMissionStore(
    (s) => s.blueprints[section as BlueprintSection],
  );
  const saveBlueprint = useMissionStore((s) => s.saveBlueprint);
  const isMarketing = section === "marketing";

  const [fields, setFields] = useState<Record<string, string>>(() => ({
    ...(stored?.fields ?? {}),
  }));
  const [marketingTab, setMarketingTab] = useState<MarketingTab>("details");
  const socialLinks = useMemo(
    () => parseSocialLinks(fields[SOCIAL_LINKS_FIELD_KEY]),
    [fields],
  );

  if (!meta) {
    return (
      <View className="flex-1 items-center justify-center bg-bg-deep">
        <Text className="font-body text-text-secondary">
          Unknown blueprint section.
        </Text>
      </View>
    );
  }

  const tool = meta.foundryTool ? foundryToolById(meta.foundryTool) : undefined;

  const onSave = () => {
    const payload = isMarketing
      ? {
          ...fields,
          [SOCIAL_LINKS_FIELD_KEY]: serializeSocialLinks(socialLinks),
        }
      : fields;
    saveBlueprint(meta.id, payload);
    // Celebrate a section that just reached 100% (all fields filled).
    const filled = meta.fields.filter((f) => payload[f.key]?.trim()).length;
    if (filled === meta.fields.length) {
      haptics.success();
      playSignature("blueprint_complete");
    }
    router.back();
  };

  return (
    <View className="flex-1 bg-bg-deep">
      <SafeAreaView style={{ flex: 1 }} edges={["top", "bottom"]}>
        <View className="flex-row items-center gap-2 border-b border-border-default px-3 py-2">
          <Pressable
            onPress={() => router.back()}
            accessibilityRole="button"
            accessibilityLabel="Back"
            className="h-11 w-11 items-center justify-center"
          >
            <Text className="text-xl text-text-secondary">←</Text>
          </Pressable>
          <View className="flex-1">
            <Text className="font-display text-lg font-bold text-text-primary">
              {meta.title}
            </Text>
            <Text className="font-body text-xs text-text-secondary">
              {meta.description}
            </Text>
          </View>
        </View>

        <KeyboardAvoidingView
          style={{ flex: 1 }}
          behavior={Platform.OS === "ios" ? "padding" : undefined}
        >
          <ScrollView contentContainerClassName="gap-4 px-5 py-4 pb-28">
            {isMarketing ? (
              <Segmented<MarketingTab>
                options={[
                  { value: "details", label: "Details" },
                  { value: "social", label: "Social Links" },
                ]}
                value={marketingTab}
                onChange={setMarketingTab}
              />
            ) : null}

            {isMarketing && marketingTab === "social" ? (
              <SocialMediaLinksEditor
                links={socialLinks}
                onChange={(links) =>
                  setFields((prev) => ({
                    ...prev,
                    [SOCIAL_LINKS_FIELD_KEY]: serializeSocialLinks(links),
                  }))
                }
              />
            ) : (
              meta.fields.map((f) => (
                <View key={f.key} className="gap-1.5">
                  <Text className="font-body text-sm font-semibold text-text-primary">
                    {f.label}
                  </Text>
                  <TextInput
                    value={fields[f.key] ?? ""}
                    onChangeText={(v) =>
                      setFields((prev) => ({ ...prev, [f.key]: v }))
                    }
                    placeholder={f.example}
                    placeholderTextColor="#64748B"
                    multiline={f.multiline}
                    accessibilityLabel={f.label}
                    className={
                      "rounded-2xl border border-border-med bg-bg-card px-4 py-3 font-body text-base text-text-primary " +
                      (f.multiline ? "min-h-[88px]" : "")
                    }
                    style={
                      f.multiline ? { textAlignVertical: "top" } : undefined
                    }
                  />
                  <Text className="font-body text-xs text-text-tertiary">
                    e.g. {f.example}
                  </Text>
                </View>
              ))
            )}

            <View className="mt-2 gap-2">
              <Button label="Save" onPress={onSave} />
              <View className="flex-row gap-2">
                <Button
                  label="Ask Astro"
                  variant="secondary"
                  className="flex-1"
                  onPress={() => router.push("/(modals)/copilot")}
                />
                {tool ? (
                  <Button
                    label="Generate in Foundry"
                    variant="ghost"
                    className="flex-1"
                    onPress={() => router.push("/(tabs)/foundry")}
                  />
                ) : null}
              </View>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </View>
  );
}
