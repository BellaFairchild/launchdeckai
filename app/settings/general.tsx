import { Alert, ScrollView, Text, View } from 'react-native';
import { useAppStore } from '../../store/useAppStore';
import { ScreenHeader } from '../../components/ScreenHeader';
import { Button } from '../../components/Button';
import { Card } from '../../components/Card';

export default function GeneralSettingsScreen() {
  const resetAllData = useAppStore((s) => s.resetAllData);
  const subscriptionCount = useAppStore((s) => s.subscriptions.length);

  const confirmReset = () => {
    Alert.alert(
      'Reset all data?',
      'This deletes every subscription, alert, and sweep stored on this device. This cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Reset', style: 'destructive', onPress: resetAllData },
      ],
    );
  };

  return (
    <View className="flex-1 bg-bg">
      <ScreenHeader title="Settings" />
      <ScrollView className="px-5" contentContainerStyle={{ paddingBottom: 40, gap: 12 }}>
        <Card>
          <Text className="text-sm font-semibold text-text-primary">Data</Text>
          <Text className="mt-1 text-xs text-text-secondary">
            {subscriptionCount} subscription{subscriptionCount === 1 ? '' : 's'} stored on this device.
          </Text>
          <View className="mt-3">
            <Button label="Reset All Data" variant="danger" onPress={confirmReset} />
          </View>
        </Card>
      </ScrollView>
    </View>
  );
}
