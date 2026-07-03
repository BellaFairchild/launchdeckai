import { Text, View } from 'react-native';
import { Button } from './Button';

interface EmptyStateProps {
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
}

export function EmptyState({ title, description, actionLabel, onAction }: EmptyStateProps) {
  return (
    <View className="items-center rounded-2xl border border-dashed border-bg-border px-6 py-10">
      <Text className="text-center text-base font-bold text-text-primary">{title}</Text>
      <Text className="mt-2 text-center text-sm text-text-secondary">{description}</Text>
      {actionLabel && onAction ? (
        <View className="mt-4">
          <Button label={actionLabel} onPress={onAction} />
        </View>
      ) : null}
    </View>
  );
}
