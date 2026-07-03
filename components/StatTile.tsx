import type { ReactNode } from 'react';
import { Text, View } from 'react-native';
import { Card } from './Card';

interface StatTileProps {
  label: string;
  value: string;
  tone?: 'default' | 'positive' | 'warning' | 'danger';
  sublabel?: string;
}

const TONE_TEXT: Record<NonNullable<StatTileProps['tone']>, string> = {
  default: 'text-text-primary',
  positive: 'text-status-keep',
  warning: 'text-status-review',
  danger: 'text-status-cancelSoon',
};

export function StatTile({ label, value, tone = 'default', sublabel }: StatTileProps) {
  return (
    <Card className="flex-1 min-w-[150px]">
      <Text className="text-xs font-medium uppercase tracking-wide text-text-muted">{label}</Text>
      <Text className={`mt-2 text-2xl font-bold ${TONE_TEXT[tone]}`}>{value}</Text>
      {sublabel ? <Text className="mt-1 text-xs text-text-secondary">{sublabel}</Text> : null}
    </Card>
  );
}

export function StatRow({ children }: { children: ReactNode }) {
  return <View className="flex-row flex-wrap gap-3">{children}</View>;
}
