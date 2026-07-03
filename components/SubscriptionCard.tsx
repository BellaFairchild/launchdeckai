import { Pressable, Text, View } from 'react-native';
import { format, parseISO } from 'date-fns';
import { CATEGORY_LABELS } from '../constants/categories';
import { BILLING_TYPE_LABELS } from '../constants/billing';
import { formatCurrency, monthlyCostOf } from '../lib/costCalculations';
import type { Subscription } from '../types/models';
import { Card } from './Card';
import { FallbackIcon } from './FallbackIcon';
import { StatusChip } from './StatusChip';

interface SubscriptionCardProps {
  subscription: Subscription;
  onPress: () => void;
  hasAlert?: boolean;
}

function dateLabel(sub: Subscription): string | null {
  if (sub.billingType === 'trial' && sub.trialEndDate) {
    return `Trial ends ${format(parseISO(sub.trialEndDate), 'MMM d')}`;
  }
  if (sub.renewalDate) {
    return `Renews ${format(parseISO(sub.renewalDate), 'MMM d')}`;
  }
  return null;
}

export function SubscriptionCard({ subscription, onPress, hasAlert }: SubscriptionCardProps) {
  const date = dateLabel(subscription);
  const monthly = monthlyCostOf(subscription);

  return (
    <Pressable onPress={onPress} accessibilityRole="button">
      <Card className="mb-3 flex-row items-center">
        <View>
          <FallbackIcon name={subscription.softwareName} category={subscription.category} />
          {hasAlert ? (
            <View className="absolute -right-1 -top-1 h-3 w-3 rounded-full border-2 border-bg-card bg-status-cancelSoon" />
          ) : null}
        </View>

        <View className="ml-3 flex-1">
          <Text className="text-base font-semibold text-text-primary" numberOfLines={1}>
            {subscription.softwareName}
          </Text>
          <Text className="mt-0.5 text-xs text-text-secondary">
            {CATEGORY_LABELS[subscription.category]} · {BILLING_TYPE_LABELS[subscription.billingType]}
          </Text>
          {date ? <Text className="mt-0.5 text-xs text-text-muted">{date}</Text> : null}
          <View className="mt-2">
            <StatusChip status={subscription.status} />
          </View>
        </View>

        <View className="items-end">
          <Text className="text-base font-bold text-text-primary">
            {formatCurrency(monthly, subscription.currency)}
          </Text>
          <Text className="text-xs text-text-muted">/mo</Text>
        </View>
      </Card>
    </Pressable>
  );
}
