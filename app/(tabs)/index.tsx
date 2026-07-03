import { Redirect, useRouter } from 'expo-router';
import { ScrollView, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useMemo } from 'react';
import { useAppStore } from '../../store/useAppStore';
import { deriveAlerts, groupAlerts } from '../../lib/alerts';
import {
  formatCurrency,
  potentialMonthlySavings,
  totalAnnualForecast,
  totalMonthlySpend,
} from '../../lib/costCalculations';
import { StatRow, StatTile } from '../../components/StatTile';
import { SectionHeader } from '../../components/SectionHeader';
import { SubscriptionCard } from '../../components/SubscriptionCard';
import { EmptyState } from '../../components/EmptyState';
import { Button } from '../../components/Button';
import { Card } from '../../components/Card';

export default function DeckScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const profile = useAppStore((s) => s.profile);
  const subscriptions = useAppStore((s) => s.subscriptions);
  const alertStates = useAppStore((s) => s.alertStates);

  const alerts = useMemo(() => deriveAlerts(subscriptions, alertStates), [subscriptions, alertStates]);
  const groups = useMemo(() => groupAlerts(alerts), [alerts]);

  if (!profile.onboardingCompleted) {
    return <Redirect href="/onboarding" />;
  }

  const monthlySpend = totalMonthlySpend(subscriptions);
  const annualForecast = totalAnnualForecast(subscriptions);
  const savings = potentialMonthlySavings(subscriptions);
  const renewingSoon = groups.this_week.length + groups.next_14_days.length + groups.due_today.length;
  const trialsEnding = groups.trials_ending.length;
  const urgentAlerts = groups.due_today.length + groups.trials_ending.filter((a) => a.daysUntil <= 3).length;
  const recent = [...subscriptions]
    .sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1))
    .slice(0, 4);

  if (subscriptions.length === 0) {
    return (
      <View className="flex-1 bg-bg px-5" style={{ paddingTop: insets.top + 16 }}>
        <Header name={profile.name} onMenu={() => router.push('/menu')} />
        <View className="mt-10">
          <EmptyState
            title="Your deck is empty"
            description="Add your first few subscriptions to see your spend, renewals, and savings at a glance."
            actionLabel="Build My Stack"
            onAction={() => router.push('/onboarding')}
          />
        </View>
      </View>
    );
  }

  return (
    <ScrollView
      className="flex-1 bg-bg"
      contentContainerStyle={{ paddingTop: insets.top + 16, paddingBottom: 140, paddingHorizontal: 20 }}
    >
      <Header name={profile.name} onMenu={() => router.push('/menu')} />

      <View className="mt-5">
        <StatRow>
          <StatTile label="Monthly Spend" value={formatCurrency(monthlySpend, profile.preferredCurrency)} />
          <StatTile label="Annual Forecast" value={formatCurrency(annualForecast, profile.preferredCurrency)} />
        </StatRow>
        <View className="mt-3">
          <StatRow>
            <StatTile label="Renewing Soon" value={String(renewingSoon)} tone={renewingSoon > 0 ? 'warning' : 'default'} />
            <StatTile label="Trials Ending" value={String(trialsEnding)} tone={trialsEnding > 0 ? 'warning' : 'default'} />
          </StatRow>
        </View>
        <View className="mt-3">
          <StatRow>
            <StatTile label="Potential Savings" value={formatCurrency(savings, profile.preferredCurrency)} tone="positive" sublabel="per month" />
            <StatTile label="Urgent Alerts" value={String(urgentAlerts)} tone={urgentAlerts > 0 ? 'danger' : 'default'} />
          </StatRow>
        </View>
      </View>

      <Card className="mt-6 items-center bg-bg-raised">
        <Text className="text-base font-bold text-text-primary">Monthly Stack Sweep</Text>
        <Text className="mt-1 text-center text-sm text-text-secondary">
          Review renewals, trials, and high-cost tools in one calm pass.
        </Text>
        <View className="mt-4 w-full">
          <Button label="Start Sweep" onPress={() => router.push('/sweep')} fullWidth />
        </View>
      </Card>

      <View className="mt-6">
        <SectionHeader title="Recent Subscriptions" actionLabel="View Stack" onAction={() => router.push('/stack')} />
        {recent.map((sub) => (
          <SubscriptionCard
            key={sub.id}
            subscription={sub}
            onPress={() => router.push(`/subscription/${sub.id}`)}
            hasAlert={alerts.some((a) => a.subscription.id === sub.id && a.daysUntil <= 7)}
          />
        ))}
      </View>
    </ScrollView>
  );
}

function Header({ name, onMenu }: { name: string; onMenu: () => void }) {
  return (
    <View className="flex-row items-center justify-between">
      <View>
        <Text className="text-xs font-medium uppercase tracking-wide text-text-muted">
          {name ? `Welcome back, ${name.split(' ')[0]}` : 'Welcome back'}
        </Text>
        <Text className="mt-1 text-2xl font-bold text-text-primary">Your Deck</Text>
      </View>
      <Text
        onPress={onMenu}
        accessibilityRole="button"
        className="min-h-[48px] min-w-[48px] text-center text-2xl leading-[48px] text-text-secondary"
      >
        ≡
      </Text>
    </View>
  );
}
