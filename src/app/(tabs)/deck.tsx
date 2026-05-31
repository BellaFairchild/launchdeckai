import { useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";

import { View, Text } from "@/tw";
import { Button } from "@/components/ui/Button";

export default function DeckScreen() {
  const router = useRouter();
  return (
    <View className="flex-1 bg-bg-deep">
      <SafeAreaView style={{ flex: 1 }} edges={["bottom"]}>
        <View className="flex-1 items-center justify-center gap-3 px-8">
          <Text className="font-mono text-xs uppercase tracking-[2px] text-brand-teal">
            Phase 6 · Mission Control
          </Text>
          <Text className="text-center font-display text-3xl font-bold text-text-primary">
            Deck
          </Text>
          <Text className="text-center font-body text-base text-text-secondary">
            Your launch command center — next move, readiness, fuel, and today&apos;s action.
          </Text>
          <Button
            label="Stage Your Launch Sequence →"
            onPress={() => router.push("/(modals)/signal-deck")}
            className="mt-3"
          />
        </View>
      </SafeAreaView>
    </View>
  );
}
