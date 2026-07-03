import { useEffect, useState } from 'react';
import { Alert, ScrollView, Switch, Text, View } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useAppStore } from '../store/useAppStore';
import { CATEGORY_LABELS, CATEGORY_OPTIONS } from '../constants/categories';
import { BILLING_TYPE_LABELS, BILLING_TYPE_OPTIONS, CURRENCY_OPTIONS, STATUS_LABELS, STATUS_OPTIONS } from '../constants/billing';
import { ScreenHeader } from '../components/ScreenHeader';
import { TextField } from '../components/TextField';
import { ChipSelect } from '../components/ChipSelect';
import { DateField } from '../components/DateField';
import { Button } from '../components/Button';
import type { BillingType, Subscription, SubscriptionCategory, SubscriptionStatus } from '../types/models';

export default function AddSubscriptionScreen() {
  const params = useLocalSearchParams<{
    id?: string;
    prefillName?: string;
    prefillCategory?: string;
    prefillBillingType?: string;
    prefillCost?: string;
  }>();
  const router = useRouter();
  const subscriptions = useAppStore((s) => s.subscriptions);
  const addSubscription = useAppStore((s) => s.addSubscription);
  const updateSubscription = useAppStore((s) => s.updateSubscription);
  const preferredCurrency = useAppStore((s) => s.profile.preferredCurrency);

  const existing = params.id ? subscriptions.find((s) => s.id === params.id) : undefined;
  const isEdit = Boolean(existing);

  const [softwareName, setSoftwareName] = useState(existing?.softwareName ?? params.prefillName ?? '');
  const [category, setCategory] = useState<SubscriptionCategory>(
    existing?.category ?? (params.prefillCategory as SubscriptionCategory) ?? 'other',
  );
  const [billingType, setBillingType] = useState<BillingType>(
    existing?.billingType ?? (params.prefillBillingType as BillingType) ?? 'monthly',
  );
  const [cost, setCost] = useState(String(existing?.cost ?? params.prefillCost ?? ''));
  const [currency, setCurrency] = useState(existing?.currency ?? preferredCurrency);
  const [status, setStatus] = useState<SubscriptionStatus>(existing?.status ?? 'keep');
  const [renewalDate, setRenewalDate] = useState(existing?.renewalDate);
  const [trialEndDate, setTrialEndDate] = useState(existing?.trialEndDate);
  const [alertEnabled, setAlertEnabled] = useState(existing?.alertEnabled ?? true);
  const [seatCount, setSeatCount] = useState(String(existing?.seatCount ?? '1'));
  const [costPerSeat, setCostPerSeat] = useState(String(existing?.costPerSeat ?? ''));
  const [estimatedMonthlyCost, setEstimatedMonthlyCost] = useState(String(existing?.estimatedMonthlyCost ?? ''));

  const [planName, setPlanName] = useState(existing?.planName ?? '');
  const [websiteUrl, setWebsiteUrl] = useState(existing?.websiteUrl ?? '');
  const [pricingUrl, setPricingUrl] = useState(existing?.pricingUrl ?? '');
  const [cancellationUrl, setCancellationUrl] = useState(existing?.cancellationUrl ?? '');
  const [paymentMethod, setPaymentMethod] = useState(existing?.paymentMethod ?? '');
  const [notes, setNotes] = useState(existing?.notes ?? '');

  useEffect(() => {
    if (existing) {
      setSoftwareName(existing.softwareName);
      setCategory(existing.category);
      setBillingType(existing.billingType);
      setCost(String(existing.cost));
      setCurrency(existing.currency);
      setStatus(existing.status);
      setRenewalDate(existing.renewalDate);
      setTrialEndDate(existing.trialEndDate);
      setAlertEnabled(existing.alertEnabled);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [existing?.id]);

  const showTrialDate = billingType === 'trial';
  const showRenewalDate = billingType !== 'free' && billingType !== 'lifetime' && billingType !== 'trial';
  const showSeatFields = billingType === 'per_seat';
  const showVariableField = billingType === 'variable';

  const handleSave = () => {
    if (!softwareName.trim()) {
      Alert.alert('Software name is required');
      return;
    }
    const parsedCost = parseFloat(cost);
    if (Number.isNaN(parsedCost) || parsedCost < 0) {
      Alert.alert('Enter a valid cost');
      return;
    }

    const payload: Omit<Subscription, 'id' | 'userId' | 'createdAt' | 'updatedAt'> = {
      softwareName: softwareName.trim(),
      category,
      billingType,
      cost: parsedCost,
      currency,
      status,
      renewalDate: showRenewalDate ? renewalDate : undefined,
      trialEndDate: showTrialDate ? trialEndDate : undefined,
      autoRenew: existing?.autoRenew ?? true,
      alertEnabled,
      alertDaysBefore: existing?.alertDaysBefore ?? 3,
      seatCount: showSeatFields ? parseFloat(seatCount) || 1 : undefined,
      costPerSeat: showSeatFields ? parseFloat(costPerSeat) || 0 : undefined,
      estimatedMonthlyCost: showVariableField ? parseFloat(estimatedMonthlyCost) || 0 : undefined,
      planName: planName.trim() || undefined,
      websiteUrl: websiteUrl.trim() || undefined,
      pricingUrl: pricingUrl.trim() || undefined,
      cancellationUrl: cancellationUrl.trim() || undefined,
      paymentMethod: paymentMethod.trim() || undefined,
      notes: notes.trim() || undefined,
      cancellationNotes: existing?.cancellationNotes,
      cancelByDate: existing?.cancelByDate,
      dateStarted: existing?.dateStarted,
      cancellationSupportTicket: existing?.cancellationSupportTicket,
      cancellationConfirmed: existing?.cancellationConfirmed,
      cancellationConfirmedDate: existing?.cancellationConfirmedDate,
      valueRating: existing?.valueRating,
      tags: existing?.tags,
      lastReviewedAt: existing?.lastReviewedAt,
      nextReviewAt: existing?.nextReviewAt,
    };

    if (isEdit && existing) {
      updateSubscription(existing.id, payload);
      router.back();
    } else {
      const created = addSubscription(payload);
      router.replace(`/subscription/${created.id}`);
    }
  };

  return (
    <View className="flex-1 bg-bg">
      <ScreenHeader title={isEdit ? 'Edit Subscription' : 'Add Subscription'} />
      <ScrollView className="px-5" contentContainerStyle={{ paddingBottom: 60 }} keyboardShouldPersistTaps="handled">
        <TextField
          label="Software Name"
          required
          value={softwareName}
          onChangeText={setSoftwareName}
          placeholder="e.g. Figma"
        />

        <ChipSelect
          label="Category"
          options={CATEGORY_OPTIONS}
          labels={CATEGORY_LABELS}
          value={category}
          onChange={setCategory}
        />

        <ChipSelect
          label="Billing Type"
          options={BILLING_TYPE_OPTIONS}
          labels={BILLING_TYPE_LABELS}
          value={billingType}
          onChange={setBillingType}
        />

        <View className="flex-row gap-3">
          <View className="flex-[2]">
            <TextField
              label="Cost"
              required
              value={cost}
              onChangeText={setCost}
              placeholder="0.00"
              keyboardType="decimal-pad"
            />
          </View>
        </View>

        <ChipSelect
          label="Currency"
          options={CURRENCY_OPTIONS}
          labels={Object.fromEntries(CURRENCY_OPTIONS.map((c) => [c, c])) as Record<string, string>}
          value={currency}
          onChange={setCurrency}
        />

        {showSeatFields ? (
          <View className="flex-row gap-3">
            <View className="flex-1">
              <TextField label="Seat Count" value={seatCount} onChangeText={setSeatCount} keyboardType="number-pad" />
            </View>
            <View className="flex-1">
              <TextField
                label="Cost Per Seat"
                value={costPerSeat}
                onChangeText={setCostPerSeat}
                keyboardType="decimal-pad"
              />
            </View>
          </View>
        ) : null}

        {showVariableField ? (
          <TextField
            label="Estimated Monthly Cost"
            value={estimatedMonthlyCost}
            onChangeText={setEstimatedMonthlyCost}
            keyboardType="decimal-pad"
          />
        ) : null}

        {showRenewalDate ? (
          <DateField label="Renewal Date" value={renewalDate} onChange={setRenewalDate} />
        ) : null}
        {showTrialDate ? (
          <DateField label="Trial End Date" value={trialEndDate} onChange={setTrialEndDate} />
        ) : null}

        <ChipSelect label="Status" options={STATUS_OPTIONS} labels={STATUS_LABELS} value={status} onChange={setStatus} />

        <View className="mt-4 flex-row items-center justify-between rounded-xl border border-bg-border bg-bg-card px-4 py-3">
          <Text className="text-base font-medium text-text-primary">Enable Alerts</Text>
          <Switch
            value={alertEnabled}
            onValueChange={setAlertEnabled}
            trackColor={{ false: '#242C38', true: '#1FD1C1' }}
            thumbColor="#F4F6F8"
          />
        </View>

        <Text className="mb-1 mt-6 text-xs font-bold uppercase tracking-wide text-text-muted">Optional Details</Text>
        <TextField label="Plan Name" value={planName} onChangeText={setPlanName} placeholder="e.g. Pro" />
        <TextField
          label="Website URL"
          value={websiteUrl}
          onChangeText={setWebsiteUrl}
          placeholder="https://"
          autoCapitalize="none"
          keyboardType="url"
        />
        <TextField
          label="Pricing URL"
          value={pricingUrl}
          onChangeText={setPricingUrl}
          placeholder="https://"
          autoCapitalize="none"
          keyboardType="url"
        />
        <TextField
          label="Cancellation URL"
          value={cancellationUrl}
          onChangeText={setCancellationUrl}
          placeholder="https://"
          autoCapitalize="none"
          keyboardType="url"
        />
        <TextField label="Payment Method" value={paymentMethod} onChangeText={setPaymentMethod} placeholder="e.g. Visa ••4242" />
        <TextField
          label="Notes"
          value={notes}
          onChangeText={setNotes}
          placeholder="Anything worth remembering"
          multiline
          numberOfLines={3}
          style={{ minHeight: 88, textAlignVertical: 'top', paddingTop: 12 }}
        />

        <View className="mt-8">
          <Button label={isEdit ? 'Save Changes' : 'Add Subscription'} onPress={handleSave} fullWidth />
        </View>
      </ScrollView>
    </View>
  );
}
