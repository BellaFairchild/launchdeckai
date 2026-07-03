import { useState, type ReactNode } from 'react';
import { Alert, Linking, Pressable, ScrollView, Switch, Text, View } from 'react-native';
import { Redirect, useLocalSearchParams, useRouter } from 'expo-router';
import { format, parseISO } from 'date-fns';
import { useAppStore } from '../../store/useAppStore';
import { CATEGORY_LABELS } from '../../constants/categories';
import { BILLING_TYPE_LABELS, STATUS_LABELS, STATUS_OPTIONS } from '../../constants/billing';
import { formatCurrency, monthlyCostOf } from '../../lib/costCalculations';
import { ScreenHeader } from '../../components/ScreenHeader';
import { Card } from '../../components/Card';
import { ChipSelect } from '../../components/ChipSelect';
import { DateField } from '../../components/DateField';
import { TextField } from '../../components/TextField';
import { Button } from '../../components/Button';
import { FallbackIcon } from '../../components/FallbackIcon';
import type { SubscriptionStatus } from '../../types/models';

export default function SubscriptionDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const subscriptions = useAppStore((s) => s.subscriptions);
  const updateSubscription = useAppStore((s) => s.updateSubscription);
  const setSubscriptionStatus = useAppStore((s) => s.setSubscriptionStatus);
  const deleteSubscription = useAppStore((s) => s.deleteSubscription);

  const subscription = subscriptions.find((s) => s.id === id);

  const [cancelByDate, setCancelByDate] = useState(subscription?.cancelByDate);
  const [cancellationNotes, setCancellationNotes] = useState(subscription?.cancellationNotes ?? '');
  const [supportTicket, setSupportTicket] = useState(subscription?.cancellationSupportTicket ?? '');
  const [confirmed, setConfirmed] = useState(subscription?.cancellationConfirmed ?? false);
  const [confirmedDate, setConfirmedDate] = useState(subscription?.cancellationConfirmedDate);

  if (!subscription) {
    return <Redirect href="/stack" />;
  }

  const saveCancellationTracker = () => {
    updateSubscription(subscription.id, {
      cancelByDate,
      cancellationNotes: cancellationNotes.trim() || undefined,
      cancellationSupportTicket: supportTicket.trim() || undefined,
      cancellationConfirmed: confirmed,
      cancellationConfirmedDate: confirmed ? confirmedDate ?? new Date().toISOString() : undefined,
    });
    Alert.alert('Saved', 'Cancellation tracker updated.');
  };

  const confirmDelete = () => {
    Alert.alert('Delete subscription?', `This removes ${subscription.softwareName} permanently.`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: () => {
          deleteSubscription(subscription.id);
          router.back();
        },
      },
    ]);
  };

  const openUrl = (url?: string) => {
    if (!url) return;
    Linking.openURL(url.startsWith('http') ? url : `https://${url}`).catch(() => {
      Alert.alert('Could not open link');
    });
  };

  return (
    <View className="flex-1 bg-bg">
      <ScreenHeader
        title={subscription.softwareName}
        right={
          <Pressable onPress={() => router.push(`/add-subscription?id=${subscription.id}`)} hitSlop={8}>
            <Text className="text-sm font-semibold text-brand-teal">Edit</Text>
          </Pressable>
        }
      />
      <ScrollView className="px-5" contentContainerStyle={{ paddingBottom: 60 }}>
        {/* Overview */}
        <Card className="flex-row items-center">
          <FallbackIcon name={subscription.softwareName} category={subscription.category} size={52} />
          <View className="ml-3 flex-1">
            <Text className="text-lg font-bold text-text-primary">{subscription.softwareName}</Text>
            <Text className="mt-0.5 text-sm text-text-secondary">
              {CATEGORY_LABELS[subscription.category]}
              {subscription.planName ? ` · ${subscription.planName}` : ''}
            </Text>
          </View>
          <View className="items-end">
            <Text className="text-lg font-bold text-text-primary">
              {formatCurrency(monthlyCostOf(subscription), subscription.currency)}
            </Text>
            <Text className="text-xs text-text-muted">/mo</Text>
          </View>
        </Card>

        {/* Billing details */}
        <SectionCard title="Billing Details">
          <DetailRow label="Billing Type" value={BILLING_TYPE_LABELS[subscription.billingType]} />
          <DetailRow label="Cost" value={formatCurrency(subscription.cost, subscription.currency)} />
          {subscription.seatCount ? <DetailRow label="Seats" value={String(subscription.seatCount)} /> : null}
          {subscription.paymentMethod ? <DetailRow label="Payment Method" value={subscription.paymentMethod} /> : null}
        </SectionCard>

        {/* Renewal / trial date */}
        {(subscription.renewalDate || subscription.trialEndDate) && (
          <SectionCard title={subscription.trialEndDate ? 'Trial End Date' : 'Renewal Date'}>
            <Text className="text-base text-text-primary">
              {format(parseISO((subscription.trialEndDate ?? subscription.renewalDate)!), 'MMMM d, yyyy')}
            </Text>
          </SectionCard>
        )}

        {/* Links */}
        {(subscription.websiteUrl || subscription.pricingUrl || subscription.cancellationUrl) && (
          <SectionCard title="Links">
            {subscription.websiteUrl ? <LinkRow label="Website" onPress={() => openUrl(subscription.websiteUrl)} /> : null}
            {subscription.pricingUrl ? <LinkRow label="Pricing" onPress={() => openUrl(subscription.pricingUrl)} /> : null}
            {subscription.cancellationUrl ? (
              <LinkRow label="Cancellation Page" onPress={() => openUrl(subscription.cancellationUrl)} />
            ) : null}
          </SectionCard>
        )}

        {/* Alert settings */}
        <SectionCard title="Alert Settings">
          <View className="flex-row items-center justify-between">
            <Text className="text-base text-text-primary">Alerts Enabled</Text>
            <Switch
              value={subscription.alertEnabled}
              onValueChange={(value) => updateSubscription(subscription.id, { alertEnabled: value })}
              trackColor={{ false: '#242C38', true: '#1FD1C1' }}
              thumbColor="#F4F6F8"
            />
          </View>
        </SectionCard>

        {/* Notes */}
        {subscription.notes ? (
          <SectionCard title="Notes">
            <Text className="text-sm text-text-secondary">{subscription.notes}</Text>
          </SectionCard>
        ) : null}

        {/* Decision Zone */}
        <SectionCard title="Decision Zone">
          <ChipSelect
            label="What should happen to this tool?"
            options={STATUS_OPTIONS}
            labels={STATUS_LABELS}
            value={subscription.status}
            onChange={(value: SubscriptionStatus) => setSubscriptionStatus(subscription.id, value)}
          />
        </SectionCard>

        {/* Cancellation tracker */}
        <SectionCard title="Cancellation Tracker">
          <DateField label="Cancel-by Date" value={cancelByDate} onChange={setCancelByDate} />
          <TextField
            label="Support Ticket Number"
            value={supportTicket}
            onChangeText={setSupportTicket}
            placeholder="e.g. #48213"
          />
          <TextField
            label="Cancellation Notes"
            value={cancellationNotes}
            onChangeText={setCancellationNotes}
            placeholder="What did you do to cancel?"
            multiline
            numberOfLines={3}
            style={{ minHeight: 80, textAlignVertical: 'top', paddingTop: 12 }}
          />
          <View className="mt-4 flex-row items-center justify-between rounded-xl border border-bg-border bg-bg-raised px-4 py-3">
            <Text className="text-base font-medium text-text-primary">Confirmation Received</Text>
            <Switch
              value={confirmed}
              onValueChange={(value) => {
                setConfirmed(value);
                if (value && !confirmedDate) setConfirmedDate(new Date().toISOString());
              }}
              trackColor={{ false: '#242C38', true: '#1FD1C1' }}
              thumbColor="#F4F6F8"
            />
          </View>
          <View className="mt-4">
            <Button label="Save Cancellation Tracker" variant="secondary" onPress={saveCancellationTracker} fullWidth />
          </View>
        </SectionCard>

        <View className="mt-4">
          <Button label="Delete Subscription" variant="danger" onPress={confirmDelete} fullWidth />
        </View>
      </ScrollView>
    </View>
  );
}

function SectionCard({ title, children }: { title: string; children: ReactNode }) {
  return (
    <Card className="mt-4">
      <Text className="mb-3 text-xs font-bold uppercase tracking-wide text-text-muted">{title}</Text>
      {children}
    </Card>
  );
}

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <View className="mb-2 flex-row items-center justify-between">
      <Text className="text-sm text-text-secondary">{label}</Text>
      <Text className="text-sm font-semibold text-text-primary">{value}</Text>
    </View>
  );
}

function LinkRow({ label, onPress }: { label: string; onPress: () => void }) {
  return (
    <Pressable onPress={onPress} className="mb-2 min-h-[40px] flex-row items-center justify-between">
      <Text className="text-sm text-text-primary">{label}</Text>
      <Text className="text-brand-teal">↗</Text>
    </Pressable>
  );
}
