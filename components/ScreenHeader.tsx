import type { ReactNode } from 'react';
import { Pressable, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export function ScreenHeader({ title, right }: { title: string; right?: ReactNode }) {
  const insets = useSafeAreaInsets();
  const router = useRouter();

  return (
    <View
      className="flex-row items-center justify-between px-5"
      style={{ paddingTop: insets.top + 12, paddingBottom: 12 }}
    >
      <Pressable
        onPress={() => router.back()}
        accessibilityRole="button"
        className="min-h-[48px] min-w-[48px] items-center justify-start"
      >
        <Text className="text-2xl text-text-secondary">‹</Text>
      </Pressable>
      <Text className="flex-1 text-center text-lg font-bold text-text-primary" numberOfLines={1}>
        {title}
      </Text>
      <View className="min-h-[48px] min-w-[48px] items-end justify-center">{right}</View>
    </View>
  );
}
