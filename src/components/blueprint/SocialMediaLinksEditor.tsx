import * as Linking from "expo-linking";
import { useCallback } from "react";

import { SocialPlatformIcon } from "@/components/blueprint/SocialPlatformIcon";
import { Icon } from "@/components/ui/Icon";
import { colors } from "@/constants/colors";
import {
    SOCIAL_PLATFORMS,
    type SocialLinksMap,
    type SocialPlatformId,
} from "@/constants/socialPlatforms";
import { haptics } from "@/lib/haptics";
import { buildSocialUrl } from "@/lib/socialLinks";
import { Pressable, Text, TextInput, View } from "@/tw";

type Props = {
  links: SocialLinksMap;
  onChange: (links: SocialLinksMap) => void;
};

function updateEntry(
  links: SocialLinksMap,
  platformId: SocialPlatformId,
  patch: Partial<SocialLinksMap[SocialPlatformId]>,
): SocialLinksMap {
  return {
    ...links,
    [platformId]: { ...links[platformId], ...patch },
  };
}

function PlatformRow({
  platformId,
  baseUrl,
  placeholder,
  enabled,
  handle,
  onToggle,
  onHandleChange,
  onClear,
}: {
  platformId: SocialPlatformId;
  baseUrl: string;
  placeholder: string;
  enabled: boolean;
  handle: string;
  onToggle: () => void;
  onHandleChange: (value: string) => void;
  onClear: () => void;
}) {
  const canTest = enabled && handle.trim().length > 0;
  const url = buildSocialUrl(platformId, handle);

  const onTest = () => {
    if (!url) return;
    haptics.selection();
    void Linking.openURL(url).catch(() => {});
  };

  return (
    <View className="gap-2 border-b border-border-default py-4">
      <View className="flex-row items-center gap-3">
        <Pressable
          onPress={onToggle}
          accessibilityRole="checkbox"
          accessibilityState={{ checked: enabled }}
          accessibilityLabel={`Enable ${platformId}`}
          className={
            "h-6 w-6 items-center justify-center rounded-md border " +
            (enabled
              ? "border-brand-teal bg-brand-teal"
              : "border-border-med bg-bg-surface")
          }
        >
          {enabled ? (
            <Icon
              name="check"
              size={14}
              color={colors.bgDeep}
              strokeWidth={2.5}
            />
          ) : null}
        </Pressable>

        <SocialPlatformIcon platform={platformId} size={32} active={enabled} />

        <View className="min-w-0 flex-1">
          <Text className="font-mono text-[11px] text-text-tertiary">
            {baseUrl}
          </Text>
          {enabled ? (
            <View className="mt-1 flex-row items-end gap-2 border-b border-brand-teal/50 pb-1">
              <View className="min-w-0 flex-1">
                <Text className="font-mono text-[10px] uppercase tracking-wider text-brand-teal-light">
                  handle
                </Text>
                <TextInput
                  value={handle}
                  onChangeText={onHandleChange}
                  placeholder={placeholder}
                  placeholderTextColor={colors.textTertiary}
                  autoCapitalize="none"
                  autoCorrect={false}
                  className="font-body text-base font-semibold text-text-primary"
                />
              </View>
              {handle ? (
                <Pressable
                  onPress={onClear}
                  accessibilityLabel="Clear handle"
                  hitSlop={8}
                  className="mb-0.5 h-6 w-6 items-center justify-center"
                >
                  <Icon name="close" size={14} color={colors.textTertiary} />
                </Pressable>
              ) : null}
            </View>
          ) : (
            <View className="mt-1 border-b border-dashed border-border-med pb-1">
              <Text className="font-body text-sm text-text-muted">
                Check to enable this channel
              </Text>
            </View>
          )}
        </View>

        <Pressable
          onPress={onTest}
          disabled={!canTest}
          accessibilityRole="button"
          accessibilityLabel={`Test ${platformId} link`}
          className={
            "rounded-lg border px-3 py-1.5 " +
            (canTest
              ? "border-brand-teal/40 bg-brand-teal/10 active:opacity-80"
              : "border-border-default bg-bg-depleted opacity-50")
          }
        >
          <Text
            className={
              "font-mono text-[11px] uppercase tracking-wider " +
              (canTest ? "text-brand-teal-light" : "text-text-muted")
            }
          >
            test
          </Text>
        </Pressable>
      </View>
    </View>
  );
}

/** Compact strip of platform icons — active channels glow in brand color. */
export function SocialPlatformStrip({
  links,
  onSelect,
}: {
  links: SocialLinksMap;
  onSelect?: (platformId: SocialPlatformId) => void;
}) {
  return (
    <View className="flex-row flex-wrap items-center justify-center gap-2 py-2">
      {SOCIAL_PLATFORMS.map((platform) => {
        const entry = links[platform.id];
        const active = entry.enabled && entry.handle.trim().length > 0;
        const configured = entry.enabled;
        return (
          <Pressable
            key={platform.id}
            onPress={() => onSelect?.(platform.id)}
            accessibilityRole="button"
            accessibilityLabel={`${platform.name}${active ? ", linked" : configured ? ", enabled" : ""}`}
            className={
              "rounded-full p-0.5 " +
              (active
                ? "border border-brand-teal/60 bg-brand-teal/10"
                : configured
                  ? "border border-border-med"
                  : "opacity-60")
            }
          >
            <SocialPlatformIcon
              platform={platform.id}
              size={36}
              active={configured}
            />
          </Pressable>
        );
      })}
    </View>
  );
}

export function SocialMediaLinksEditor({ links, onChange }: Props) {
  const patch = useCallback(
    (
      platformId: SocialPlatformId,
      patch: Partial<SocialLinksMap[SocialPlatformId]>,
    ) => {
      onChange(updateEntry(links, platformId, patch));
    },
    [links, onChange],
  );

  return (
    <View className="gap-4">
      <View className="gap-2">
        <Text className="font-body text-sm leading-5 text-text-secondary">
          Add the channels you want on your launch roll cover. Enable a
          platform, enter your handle, then tap test to verify the link opens
          correctly.
        </Text>
        <SocialPlatformStrip links={links} />
      </View>

      <View className="rounded-2xl border border-border-default bg-bg-card px-4">
        {SOCIAL_PLATFORMS.map((platform) => {
          const entry = links[platform.id];
          return (
            <PlatformRow
              key={platform.id}
              platformId={platform.id}
              baseUrl={platform.baseUrl}
              placeholder={platform.placeholder}
              enabled={entry.enabled}
              handle={entry.handle}
              onToggle={() => {
                haptics.selection();
                patch(platform.id, { enabled: !entry.enabled });
              }}
              onHandleChange={(handle) => patch(platform.id, { handle })}
              onClear={() => patch(platform.id, { handle: "" })}
            />
          );
        })}
      </View>
    </View>
  );
}
