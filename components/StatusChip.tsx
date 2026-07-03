import { Text, View } from 'react-native';
import { STATUS_LABELS } from '../constants/billing';
import { STATUS_COLORS } from '../constants/theme';
import type { SubscriptionStatus } from '../types/models';

export function StatusChip({ status }: { status: SubscriptionStatus }) {
  const color = STATUS_COLORS[status];
  return (
    <View
      className="flex-row items-center self-start rounded-full px-2.5 py-1"
      style={{ backgroundColor: `${color}26` }}
    >
      <View className="mr-1.5 h-2 w-2 rounded-full" style={{ backgroundColor: color }} />
      <Text className="text-xs font-semibold" style={{ color }}>
        {STATUS_LABELS[status]}
      </Text>
    </View>
  );
}
