import { Modal } from "react-native";

import { Button } from "@/components/ui/Button";
import { Pressable, Text, View } from "@/tw";

export function TransmitPaywallSheet({
  visible,
  onUpgrade,
  onDismiss,
}: {
  visible: boolean;
  onUpgrade: () => void;
  onDismiss: () => void;
}) {
  if (!visible) return null;
  return (
    <Modal visible transparent animationType="slide" onRequestClose={onDismiss}>
      <Pressable
        className="flex-1 justify-end bg-black/60"
        accessibilityLabel="Dismiss paywall"
        onPress={onDismiss}
      >
        <Pressable className="gap-3 rounded-t-3xl bg-bg-card px-6 pb-10 pt-6">
          <Text className="font-display text-2xl font-bold text-text-primary">
            Export needs Commander.
          </Text>
          <Text className="font-body text-base text-text-secondary">
            Package your full launch sequence into one clean ZIP file with your schedule,
            platform timing, and ready-to-post content.
          </Text>
          <Text className="font-body text-base text-text-secondary">
            No scrambling. No copy-paste maze. Just your launch signals packed and ready.
          </Text>
          <Button label="Upgrade to Commander" variant="premium" className="mt-2" onPress={onUpgrade} />
          <Button label="Maybe later" variant="ghost" onPress={onDismiss} />
        </Pressable>
      </Pressable>
    </Modal>
  );
}
