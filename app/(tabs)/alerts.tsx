import { useMemo } from 'react';
import { Pressable, SectionList, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { addDays } from 'date-fns';
import { useAppStore } from '../../store/useAppStore';
import { ALERT_GROUP_LABELS, ALERT_GROUP_ORDER, deriveAlerts, groupAlerts, type DerivedAlert } from '../../lib/alerts';
import { formatCurrency, monthlyCostOf } from '../../lib/costCalculations';
import { Card } from '../../components/Card';
import { EmptyState } from '../../components/EmptyState';

export default function AlertsScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const subscriptions = useAppStore((s) => s.subscriptions);
  const alertStates = useAppStore((s) => s.alertStates);
  const setAlertStatus = useAppStore((s) => s.setAlertStatus);
  const setSubscriptionStatus = useAppStore((s) => s.setSubscriptionStatus);

  const alerts = useMemo(() => deriveAlerts(subscriptions, alertStates), [subscriptions, alertStates]);
  const groups = useMemo(() => groupAlerts(alerts), [alerts]);

  const sections = ALERT_GROUP_ORDER.filter((key) => groups[key].length > 0).map((key) => ({
    title: ALERT_GROUP_LABELS[key],
    data: groups[key],
  }));

  return (
    <View className="flex-1 bg-bg" style={{ paddingTop: insets.top + 12 }}>
      <Text className="px-5 text-2xl font-bold text-text-primary">Alerts</Text>

      <SectionList
        sections={sections}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ padding: 20, paddingBottom: 140 }}
        renderSectionHeader={({ section }) => (
          <Text className="mb-2 mt-4 text-xs font-bold uppercase tracking-wide text-text-muted">
            {section.title}
          </Text>
        )}
        renderItem={({ item }) => (
          <AlertRow
            alert={item}
            onOpen={() => router.push(`/subscription/${item.subscription.id}`)}
            onSnooze={() =>
              setAlertStatus(item.subscription.id, item.alertType, 'snoozed', addDays(new Date(), 7).toISOString())
            }
            onReview={() => setAlertStatus(item.subscription.id, item.alertType, 'reviewed')}
            onDismiss={() => setAlertStatus(item.subscription.id, item.alertType, 'dismissed')}
            onKeep={() => {
              setSubscriptionStatus(item.subscription.id, 'keep');
              setAlertStatus(item.subscription.id, item.alertType, 'reviewed');
            }}
            onCancelSoon={() => {
              setSubscriptionStatus(item.subscription.id, 'cancel_soon');
              setAlertStatus(item.subscription.id, item.alertType, 'reviewed');
            }}
          />
        )}
        ListEmptyComponent={
          <EmptyState title="All clear" description="No renewals or trials need your attention right now." />
        }
      />
    </View>
  );
}

function AlertRow({
  alert,
  onOpen,
  onSnooze,
  onReview,
  onDismiss,
  onKeep,
  onCancelSoon,
}: {
  alert: DerivedAlert;
  onOpen: () => void;
  onSnooze: () => void;
  onReview: () => void;
  onDismiss: () => void;
  onKeep: () => void;
  onCancelSoon: () => void;
}) {
  const sub = alert.subscription;
  const isActionable = alert.status === 'pending' || alert.status === 'sent';

  return (
    <Card className="mb-3">
      <Pressable onPress={onOpen}>
        <View className="flex-row items-center justify-between">
          <Text className="flex-1 text-base font-semibold text-text-primary" numberOfLines={1}>
            {sub.softwareName}
          </Text>
          <Text className="text-base font-bold text-text-primary">
            {formatCurrency(monthlyCostOf(sub), sub.currency)}
          </Text>
        </View>
        <Text className="mt-1 text-sm text-text-secondary">{alert.message}</Text>
      </Pressable>

      {isActionable ? (
        <View className="mt-3 flex-row flex-wrap gap-2">
          <ActionChip label="Keep" onPress={onKeep} />
          <ActionChip label="Cancel Soon" onPress={onCancelSoon} />
          <ActionChip label="Snooze" onPress={onSnooze} />
          <ActionChip label="Mark Reviewed" onPress={onReview} />
          <ActionChip label="Dismiss" onPress={onDismiss} />
        </View>
      ) : null}
    </Card>
  );
}

function ActionChip({ label, onPress }: { label: string; onPress: () => void }) {
  return (
    <Pressable
      onPress={onPress}
      className="min-h-[36px] items-center justify-center rounded-full border border-bg-border bg-bg-raised px-3"
    >
      <Text className="text-xs font-semibold text-text-secondary">{label}</Text>
    </Pressable>
  );
}
