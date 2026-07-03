import { Pressable, ScrollView, Text, View } from 'react-native';

interface ChipSelectProps<T extends string> {
  label: string;
  options: readonly T[];
  labels: Record<T, string>;
  value: T;
  onChange: (value: T) => void;
}

export function ChipSelect<T extends string>({ label, options, labels, value, onChange }: ChipSelectProps<T>) {
  return (
    <View className="mt-4">
      <Text className="mb-1.5 text-sm font-medium text-text-secondary">{label}</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8 }}>
        {options.map((option) => {
          const active = option === value;
          return (
            <Pressable
              key={option}
              onPress={() => onChange(option)}
              className={`min-h-[40px] items-center justify-center rounded-full border px-4 ${
                active ? 'border-brand-teal bg-brand-teal/15' : 'border-bg-border bg-bg-card'
              }`}
            >
              <Text className={`text-sm font-semibold ${active ? 'text-brand-teal' : 'text-text-secondary'}`}>
                {labels[option]}
              </Text>
            </Pressable>
          );
        })}
      </ScrollView>
    </View>
  );
}
