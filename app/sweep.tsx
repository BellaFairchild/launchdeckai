import { useMemo, useState } from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { format, parseISO } from 'date-fns';
import { useAppStore } from '../store/useAppStore';
import { formatCurrency, monthlyCostOf, topCostSubscriptions } from '../lib/costCalculations';
import { deriveAlerts } from '../lib/alerts';
import { STATUS_LABELS, STATUS_OPTIONS } from '../constants/billing';
import { CATEGORY_LABELS } from '../constants/categories';
import { Card } from '../components/Card';
import { Button } from '../components/Button';
import { FallbackIcon } from '../components/FallbackIcon';
import type { StackSweep, Subscription, SubscriptionStatus } from '../types/models';

export default function SweepScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const subscriptions = useAppStore((s) => s.subscriptions);
  const alertStates = useAppStore((s) => s.alertStates);
  const startSweep = useAppStore((s) => s.startSweep);
  const recordSweepDecision = useAppStore((s) => s.recordSweepDecision);
  const completeSweep = useAppStore((s) => s.completeSweep);

  const [phase, setPhase] = useState<'intro' | 'review' | 'summary'>('intro');
  const [sweepId, setSweepId] = useState<string | null>(null);
  const [index, setIndex] = useState(0);
  const [summary, setSummary] = useState<StackSweep | null>(null);

  const alerts = useMemo(() => deriveAlerts(subscriptions, alertStates), [subscriptions, alertStates]);

  const queue = useMemo(() => {
    const seen = new Set<string>();
    const ordered: Subscription[] = [];

    const push = (sub?: Subscription) => {
      if (sub && !seen.has(sub.id)) {
        seen.add(sub.id);
        ordered.push(sub);
      }
    };

    alerts.filter((a) => a.daysUntil <= 30 && a.alertType === 'renewal').forEach((a) => push(a.subscription));
    topCostSubscriptions(subscriptions, 5).forEach(push);
    alerts.filter((a) => a.alertType === 'trial_ending').forEach((a) => push(a.subscription));
    subscriptions.filter((s) => s.status === 'review_later').forEach(push);
    subscriptions.filter((s) => s.status === 'cancel_soon').forEach(push);

    return ordered;
  }, [alerts, subscriptions]);

  const current = queue[index];

  const begin = () => {
    const sweep = startSweep();
    setSweepId(sweep.id);
    setIndex(0);
    setPhase(queue.length > 0 ? 'review' : 'summary');
    if (queue.length === 0) {
      const result = completeSweep(sweep.id);
      if (result) setSummary(result);
    }
  };

  const decide = (decision: SubscriptionStatus) => {
    if (!sweepId || !current) return;
    recordSweepDecision(sweepId, current.id, decision);
    advance();
  };

  const advance = () => {
    if (index + 1 < queue.length) {
      setIndex(index + 1);
    } else if (sweepId) {
      const result = completeSweep(sweepId);
      if (result) setSummary(result);
      setPhase('summary');
    }
  };

  if (phase === 'intro') {
    return (
      <View className="flex-1 items-center justify-center bg-bg px-8" style={{ paddingTop: insets.top }}>
        <Text className="text-3xl font-extrabold text-text-primary">Stack Sweep</Text>
        <Text className="mt-3 text-center text-base text-text-secondary">
          A calm monthly ritual: review upcoming renewals, your highest-cost tools, trials, and anything you've
          been meaning to revisit.
        </Text>
        <Card className="mt-8 w-full">
          <Text className="text-sm font-semibold text-text-primary">
            {queue.length} tool{queue.length === 1 ? '' : 's'} to review
          </Text>
          <Text className="mt-1 text-xs text-text-secondary">
            Renewals in 30 days, top costs, trials ending, and tools marked Review Later or Cancel Soon.
          </Text>
        </Card>
        <View className="mt-8 w-full">
          <Button label="Start Sweep" onPress={begin} fullWidth />
          <View className="mt-3">
            <Button label="Not now" variant="ghost" onPress={() => router.back()} fullWidth />
          </View>
        </View>
      </View>
    );
  }

  if (phase === 'review' && current) {
    return (
      <View className="flex-1 bg-bg px-5" style={{ paddingTop: insets.top + 16 }}>
        <Text className="text-xs font-semibold uppercase tracking-wide text-text-muted">
          Reviewing {index + 1} of {queue.length}
        </Text>
        <View className="mt-1 h-1.5 overflow-hidden rounded-full bg-bg-raised">
          <View
            className="h-full rounded-full bg-brand-teal"
            style={{ width: `${((index + 1) / queue.length) * 100}%` }}
          />
        </View>

        <Card className="mt-6 items-center">
          <FallbackIcon name={current.softwareName} category={current.category} size={56} />
          <Text className="mt-3 text-xl font-bold text-text-primary">{current.softwareName}</Text>
          <Text className="mt-1 text-sm text-text-secondary">{CATEGORY_LABELS[current.category]}</Text>
          <Text className="mt-3 text-2xl font-bold text-brand-teal">
            {formatCurrency(monthlyCostOf(current), current.currency)}
            <Text className="text-sm font-normal text-text-muted">/mo</Text>
          </Text>
          {current.renewalDate ? (
            <Text className="mt-2 text-xs text-text-muted">
              Renews {format(parseISO(current.renewalDate), 'MMM d, yyyy')}
            </Text>
          ) : null}
          {current.trialEndDate ? (
            <Text className="mt-2 text-xs text-text-muted">
              Trial ends {format(parseISO(current.trialEndDate), 'MMM d, yyyy')}
            </Text>
          ) : null}
        </Card>

        <Text className="mb-2 mt-6 text-sm font-semibold text-text-secondary">What's the decision?</Text>
        <View className="flex-row flex-wrap gap-2">
          {STATUS_OPTIONS.map((s) => (
            <Pressable
              key={s}
              onPress={() => decide(s)}
              className="min-h-[48px] flex-1 min-w-[45%] items-center justify-center rounded-xl border border-bg-border bg-bg-card px-3 active:border-brand-teal"
            >
              <Text className="text-sm font-semibold text-text-primary">{STATUS_LABELS[s]}</Text>
            </Pressable>
          ))}
        </View>

        <Pressable onPress={advance} className="mt-6 min-h-[48px] items-center justify-center">
          <Text className="text-sm font-semibold text-text-muted">Skip for now</Text>
        </Pressable>
      </View>
    );
  }

  return (
    <ScrollView className="flex-1 bg-bg" contentContainerStyle={{ paddingTop: insets.top + 24, paddingHorizontal: 20, paddingBottom: 60 }}>
      <Text className="text-center text-3xl font-extrabold text-text-primary">Sweep Complete</Text>
      <Text className="mt-2 text-center text-sm text-text-secondary">Nice work keeping your stack lean.</Text>

      <Card className="mt-6">
        <SummaryRow label="Tools Reviewed" value={String(summary?.toolsReviewed ?? 0)} />
        <SummaryRow label="Tools Kept" value={String(summary?.toolsKept ?? 0)} />
        <SummaryRow label="Marked Cancel Soon" value={String(summary?.toolsMarkedCancelSoon ?? 0)} />
        <SummaryRow label="Marked Downgrade" value={String(summary?.toolsMarkedDowngrade ?? 0)} />
      </Card>

      <Card className="mt-4 items-center">
        <Text className="text-xs font-medium uppercase tracking-wide text-text-muted">Estimated Savings</Text>
        <Text className="mt-2 text-3xl font-bold text-status-keep">
          {formatCurrency(summary?.estimatedMonthlySavings ?? 0)}
          <Text className="text-base font-normal text-text-muted">/mo</Text>
        </Text>
        <Text className="mt-1 text-sm text-text-secondary">
          {formatCurrency(summary?.estimatedAnnualSavings ?? 0)} per year
        </Text>
      </Card>

      {summary?.nextSweepDate ? (
        <Text className="mt-4 text-center text-xs text-text-muted">
          Next suggested sweep: {format(parseISO(summary.nextSweepDate), 'MMMM d, yyyy')}
        </Text>
      ) : null}

      <View className="mt-8">
        <Button label="Done" onPress={() => router.replace('/')} fullWidth />
      </View>
    </ScrollView>
  );
}

function SummaryRow({ label, value }: { label: string; value: string }) {
  return (
    <View className="mb-2 flex-row items-center justify-between">
      <Text className="text-sm text-text-secondary">{label}</Text>
      <Text className="text-sm font-bold text-text-primary">{value}</Text>
    </View>
  );
}
