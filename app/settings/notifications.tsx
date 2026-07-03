import { ScrollView, Switch, Text, View } from 'react-native';
import { useAppStore } from '../../store/useAppStore';
import { ScreenHeader } from '../../components/ScreenHeader';
import type { NotificationPreferences } from '../../types/models';

const ROWS: { key: keyof NotificationPreferences; label: string; description: string }[] = [
  { key: 'renewalAlerts', label: 'Renewal Alerts', description: 'Notify before a subscription renews and charges you.' },
  { key: 'trialAlerts', label: 'Trial Alerts', description: 'Notify before a free trial converts to paid.' },
  { key: 'reviewReminders', label: 'Review Reminders', description: 'Nudge you to revisit tools marked Review Later.' },
  { key: 'sweepReminders', label: 'Sweep Reminders', description: 'Remind you when your next Stack Sweep is due.' },
];

export default function NotificationsScreen() {
  const preferences = useAppStore((s) => s.profile.notificationPreferences);
  const updateProfile = useAppStore((s) => s.updateProfile);

  const toggle = (key: keyof NotificationPreferences) => {
    updateProfile({ notificationPreferences: { ...preferences, [key]: !preferences[key] } });
  };

  return (
    <View className="flex-1 bg-bg">
      <ScreenHeader title="Notification Preferences" />
      <ScrollView className="px-5" contentContainerStyle={{ paddingBottom: 40 }}>
        <Text className="mb-2 text-xs text-text-muted">
          SubDeck uses on-device local notifications. You can fine-tune what you're notified about below.
        </Text>
        {ROWS.map((row) => (
          <View
            key={row.key}
            className="mt-3 flex-row items-center justify-between rounded-2xl border border-bg-border bg-bg-card p-4"
          >
            <View className="mr-3 flex-1">
              <Text className="text-base font-semibold text-text-primary">{row.label}</Text>
              <Text className="mt-1 text-xs text-text-secondary">{row.description}</Text>
            </View>
            <Switch
              value={preferences[row.key]}
              onValueChange={() => toggle(row.key)}
              trackColor={{ false: '#242C38', true: '#1FD1C1' }}
              thumbColor="#F4F6F8"
            />
          </View>
        ))}
      </ScrollView>
    </View>
  );
}
