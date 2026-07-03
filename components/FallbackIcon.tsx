import { Text, View } from 'react-native';
import { CATEGORY_COLORS } from '../constants/theme';
import type { SubscriptionCategory } from '../types/models';

interface FallbackIconProps {
  name: string;
  category: SubscriptionCategory;
  size?: number;
}

export function FallbackIcon({ name, category, size = 44 }: FallbackIconProps) {
  const initial = name.trim().charAt(0).toUpperCase() || '?';
  const color = CATEGORY_COLORS[category];
  return (
    <View
      className="items-center justify-center rounded-xl"
      style={{ width: size, height: size, backgroundColor: `${color}26` }}
    >
      <Text className="text-lg font-bold" style={{ color }}>
        {initial}
      </Text>
    </View>
  );
}
