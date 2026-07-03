import { Alert, ScrollView, Share, Text, View } from 'react-native';
import { useAppStore } from '../../store/useAppStore';
import { ScreenHeader } from '../../components/ScreenHeader';
import { Button } from '../../components/Button';
import { CATEGORY_LABELS } from '../../constants/categories';
import { BILLING_TYPE_LABELS, STATUS_LABELS } from '../../constants/billing';
import { monthlyCostOf } from '../../lib/costCalculations';

function toCsv(subscriptions: ReturnType<typeof useAppStore.getState>['subscriptions']): string {
  const header = ['Name', 'Category', 'Billing Type', 'Status', 'Cost', 'Currency', 'Monthly Cost', 'Renewal Date'];
  const rows = subscriptions.map((s) => [
    s.softwareName,
    CATEGORY_LABELS[s.category],
    BILLING_TYPE_LABELS[s.billingType],
    STATUS_LABELS[s.status],
    String(s.cost),
    s.currency,
    monthlyCostOf(s).toFixed(2),
    s.renewalDate ?? '',
  ]);
  return [header, ...rows].map((row) => row.map((cell) => `"${cell.replace(/"/g, '""')}"`).join(',')).join('\n');
}

export default function ExportScreen() {
  const subscriptions = useAppStore((s) => s.subscriptions);

  const exportCsv = async () => {
    if (subscriptions.length === 0) {
      Alert.alert('Nothing to export', 'Add a subscription first.');
      return;
    }
    await Share.share({ message: toCsv(subscriptions), title: 'SubDeck Export (CSV)' });
  };

  const exportJson = async () => {
    if (subscriptions.length === 0) {
      Alert.alert('Nothing to export', 'Add a subscription first.');
      return;
    }
    await Share.share({ message: JSON.stringify(subscriptions, null, 2), title: 'SubDeck Export (JSON)' });
  };

  return (
    <View className="flex-1 bg-bg">
      <ScreenHeader title="Export Data" />
      <ScrollView className="px-5" contentContainerStyle={{ paddingBottom: 40 }}>
        <Text className="mb-4 text-sm text-text-secondary">
          Export your {subscriptions.length} subscription{subscriptions.length === 1 ? '' : 's'} to share or back up
          outside SubDeck.
        </Text>
        <Button label="Export as CSV" onPress={exportCsv} fullWidth />
        <View className="mt-3">
          <Button label="Export as JSON" variant="secondary" onPress={exportJson} fullWidth />
        </View>
      </ScrollView>
    </View>
  );
}
