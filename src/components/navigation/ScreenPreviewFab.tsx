import { usePathname, useRouter, type Href } from "expo-router";
import { StyleSheet } from "react-native";

import { allowUnauthedScreenPreview } from "@/lib/screenPreview";
import { Pressable, Text } from "@/tw";

/** Dev-only jump to the screen directory. Hidden on /screens itself. */
export function ScreenPreviewFab() {
  const pathname = usePathname();
  const router = useRouter();

  if (!allowUnauthedScreenPreview()) return null;
  if (pathname === "/screens") return null;

  return (
    <Pressable
      onPress={() => router.push("/screens" as Href)}
      accessibilityRole="button"
      accessibilityLabel="Open screen directory"
      style={styles.fab}
      className="items-center justify-center rounded-full border border-brand-teal/40 bg-bg-card px-3.5 py-2"
    >
      <Text className="font-mono text-[10px] uppercase tracking-[1.5px] text-brand-teal">
        Screens
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  fab: {
    position: "absolute",
    right: 16,
    bottom: 108,
    zIndex: 60,
  },
});
