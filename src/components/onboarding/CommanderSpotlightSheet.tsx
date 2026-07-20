import { useEffect } from "react";
import { Modal } from "react-native";

import { Button } from "@/components/ui/Button";
import { track } from "@/lib/analytics";
import { Pressable, Text, View } from "@/tw";

export function CommanderSpotlightSheet({
  visible,
  onUpgrade,
  onDismiss,
}: {
  visible: boolean;
  onUpgrade: () => void;
  onDismiss: () => void;
}) {
  useEffect(() => {
    if (visible) {
      track("upsell_soft_shown");
    }
  }, [visible]);

  if (!visible) return null;
  return (
    <Modal visible transparent animationType="slide" onRequestClose={onDismiss}>
      <View className="flex-1 justify-end">
        <Pressable
          className="absolute inset-0 bg-black/60"
          accessibilityLabel="Dismiss Commander spotlight"
          accessibilityRole="button"
          onPress={onDismiss}
        />
        <View className="relative z-10 gap-3 rounded-t-3xl bg-bg-card px-6 pb-10 pt-6">
          <Text className="font-display text-2xl font-bold text-text-primary">
            Launch prep gets serious.
          </Text>
          <Text className="font-body text-base text-text-secondary">
            Commander unlocks Signal Pack export and unlimited Copilot — right when launch
            prep gets serious.
          </Text>
          <Button
            label="Upgrade to Commander"
            variant="premium"
            className="mt-2"
            onPress={onUpgrade}
          />
          <Button label="Not now" variant="ghost" onPress={onDismiss} />
        </View>
      </View>
    </Modal>
  );
}
