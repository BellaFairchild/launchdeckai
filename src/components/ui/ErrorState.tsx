import React from "react";
import { View, Text } from "@/tw";
import { Button } from "./Button";

type Props = {
  title?: string;
  message?: string;
  onRetry?: () => void;
};

export function ErrorState({
  title = "Something drifted off course",
  message = "We hit a snag loading this. Try again in a moment.",
  onRetry,
}: Props) {
  return (
    <View className="items-center justify-center gap-3 px-8 py-12">
      <Text className="text-4xl">📡</Text>
      <Text className="text-center font-display text-lg font-bold text-text-primary">
        {title}
      </Text>
      <Text className="text-center font-body text-sm text-text-secondary">
        {message}
      </Text>
      {onRetry ? (
        <Button label="Try again" onPress={onRetry} variant="secondary" size="sm" className="mt-2" />
      ) : null}
    </View>
  );
}
