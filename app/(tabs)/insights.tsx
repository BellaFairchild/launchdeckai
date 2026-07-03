import { useMemo } from 'react';
import { ScrollView, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAppStore } from '../../store/useAppStore';
import {
  billingTypeBreakdown,
  formatCurrency,
  monthlyCostOf,
  potentialAnnualSavings,
  potentialMonthlySavings,
  spendByCategory,
  topCostSubscriptions,
  totalAnnualForecast,
  totalMonthlySpend,
} from '../../lib/costCalculations';
import { CATEGORY_LABELS } from '../../constants/categories';
import { BILLING_TYPE_LABELS } from '../../constants/billing';
import { CATEGORY_COLORS, CHART_PALETTE } from '../../constants/theme';
import { Card } from '../../components/Card';
import { SectionHeader } from '../../components/SectionHeader';
import { BarList } from '../../components/BarList';
import { EmptyState } from '../../components/EmptyState';
import { deriveAlerts } from '../../lib/alerts';
import type { SubscriptionCategory } from '../../types/models';

export default function InsightsScreen() {
  const insets = useSafeAreaInsets();
  const subscriptions = useAppStore((s) => s.subscriptions);
  const alertStates = useAppStore((s) => s.alertStates);
  const profile = useAppStore((s) => s.profile);

  const monthlySpend = totalMonthlySpend(subscriptions);
  const annualForecast = totalAnnualForecast(subscriptions);
  const monthlySavings = potentialMonthlySavings(subscriptions);
  const annualSavings = potentialAnnualSavings(subscriptions);

  const categorySpend = useMemo(() => spendByCategory(subscriptions), [subscriptions]);
  const categoryItems = Object.entries(categorySpend)
    .sort((a, b) => b[1] - a[1])
    .map(([category, value]) => ({
      label: CATEGORY_LABELS[category as SubscriptionCategory],
      value,
      color: CATEGORY_COLORS[category as SubscriptionCategory],
      valueLabel: formatCurrency(value, profile.preferredCurrency),
    }));

  const topCosts = topCostSubscriptions(subscriptions, 5).map((sub, i) => ({
    label: sub.softwareName,
    value: monthlyCostOf(sub),
    color: CHART_PALETTE[i % CHART_PALETTE.length],
    valueLabel: formatCurrency(monthlyCostOf(sub), sub.currency),
  }));

  const billingBreakdown = useMemo(() => billingTypeBreakdown(subscriptions), [subscriptions]);
  const billingItems = Object.entries(billingBreakdown)
    .sort((a, b) => b[1] - a[1])
    .map(([type, count], i) => ({
      label: BILLING_TYPE_LABELS[type as keyof typeof BILLING_TYPE_LABELS],
      value: count,
      color: CHART_PALETTE[i % CHART_PALETTE.length],
      valueLabel: `${count} tool${count === 1 ? '' : 's'}`,
    }));

  const alerts = useMemo(() => deriveAlerts(subscriptions, alertStates), [subscriptions, alertStates]);
  const trialsAtRisk = alerts.filter((a) => a.alertType === 'trial_ending');

  if (subscriptions.length === 0) {
    return (
      <View className="flex-1 bg-bg px-5" style={{ paddingTop: insets.top + 16 }}>
        <Text className="text-2xl font-bold text-text-primary">Insights</Text>
        <View className="mt-10">
          <EmptyState
            title="Nothing to analyze yet"
            description="Add a few subscriptions and your spending story will show up here."
          />
        </View>
      </View>
    );
  }

  return (
    <ScrollView
      className="flex-1 bg-bg"
      contentContainerStyle={{ paddingTop: insets.top + 16, paddingHorizontal: 20, paddingBottom: 140 }}
    >
      <Text className="text-2xl font-bold text-text-primary">Insights</Text>

      <Card className="mt-5">
        <SectionHeader title="Monthly vs Annual" />
        <BarList
          items={[
            { label: 'Monthly Spend', value: monthlySpend, color: CHART_PALETTE[0], valueLabel: formatCurrency(monthlySpend, profile.preferredCurrency) },
            { label: 'Annual Forecast', value: annualForecast, color: CHART_PALETTE[1], valueLabel: formatCurrency(annualForecast, profile.preferredCurrency) },
          ]}
        />
      </Card>

      {categoryItems.length > 0 && (
        <Card className="mt-4">
          <SectionHeader title="Spend by Category" />
          <BarList items={categoryItems} />
        </Card>
      )}

      {topCosts.length > 0 && (
        <Card className="mt-4">
          <SectionHeader title="Top 5 Costs" />
          <BarList items={topCosts} />
        </Card>
      )}

      <Card className="mt-4">
        <SectionHeader title="Potential Savings" />
        <View className="flex-row justify-between">
          <View>
            <Text className="text-xs text-text-muted">Per Month</Text>
            <Text className="mt-1 text-xl font-bold text-status-keep">
              {formatCurrency(monthlySavings, profile.preferredCurrency)}
            </Text>
          </View>
          <View>
            <Text className="text-xs text-text-muted">Per Year</Text>
            <Text className="mt-1 text-xl font-bold text-status-keep">
              {formatCurrency(annualSavings, profile.preferredCurrency)}
            </Text>
          </View>
        </View>
      </Card>

      {billingItems.length > 0 && (
        <Card className="mt-4">
          <SectionHeader title="Billing Type Breakdown" />
          <BarList items={billingItems} />
        </Card>
      )}

      <Card className="mt-4">
        <SectionHeader title="Trial-to-Paid Risk" />
        {trialsAtRisk.length === 0 ? (
          <Text className="text-sm text-text-secondary">No trials are ending soon.</Text>
        ) : (
          trialsAtRisk.map((a) => (
            <Text key={a.id} className="mb-1 text-sm text-text-secondary">
              {a.subscription.softwareName} converts to paid in {Math.max(a.daysUntil, 0)} day
              {a.daysUntil === 1 ? '' : 's'}
            </Text>
          ))
        )}
      </Card>
    </ScrollView>
  );
}
