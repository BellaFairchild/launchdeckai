import { Text, View } from 'react-native';

export interface BarListItem {
  label: string;
  value: number;
  color: string;
  valueLabel: string;
}

export function BarList({ items }: { items: BarListItem[] }) {
  const max = Math.max(...items.map((i) => i.value), 1);

  return (
    <View className="gap-3">
      {items.map((item) => (
        <View key={item.label}>
          <View className="mb-1 flex-row items-center justify-between">
            <Text className="text-sm font-medium text-text-primary">{item.label}</Text>
            <Text className="text-sm text-text-secondary">{item.valueLabel}</Text>
          </View>
          <View className="h-2.5 overflow-hidden rounded-full bg-bg-raised">
            <View
              className="h-full rounded-full"
              style={{ width: `${Math.max((item.value / max) * 100, 4)}%`, backgroundColor: item.color }}
            />
          </View>
        </View>
      ))}
    </View>
  );
}
