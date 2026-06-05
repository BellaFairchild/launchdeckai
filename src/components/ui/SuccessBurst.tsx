import Animated, { FadeIn, ZoomIn } from "react-native-reanimated";

import { Text } from "@/tw";

export function SuccessBurst({
  active,
  glyph = "✓",
  testID,
}: {
  active: boolean;
  glyph?: string;
  testID?: string;
}) {
  if (!active) return null;
  return (
    <Animated.View
      testID={testID}
      entering={ZoomIn.springify()}
      exiting={FadeIn}
      pointerEvents="none"
      style={{ position: "absolute", alignSelf: "center" }}
    >
      <Text className="text-4xl text-status-success">{glyph}</Text>
    </Animated.View>
  );
}
