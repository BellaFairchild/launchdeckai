import { Pressable, ScrollView, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAppStore } from '../store/useAppStore';

const MENU_ITEMS: { label: string; href: `/settings/${string}`; icon: string }[] = [
  { label: 'Profile', href: '/settings/profile', icon: '◐' },
  { label: 'Settings', href: '/settings/general', icon: '⚙' },
  { label: 'Notification Preferences', href: '/settings/notifications', icon: '🔔' },
  { label: 'Currency Preferences', href: '/settings/currency', icon: '¤' },
  { label: 'Export Data', href: '/settings/export', icon: '⇩' },
  { label: 'Help & Support', href: '/settings/help', icon: '?' },
  { label: 'About SubDeck', href: '/settings/about', icon: 'i' },
];

export default function MenuScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const profile = useAppStore((s) => s.profile);

  return (
    <View className="flex-1 bg-bg" style={{ paddingTop: insets.top + 16 }}>
      <View className="flex-row items-center justify-between px-5">
        <Text className="text-2xl font-bold text-text-primary">Menu</Text>
        <Pressable
          onPress={() => router.back()}
          accessibilityRole="button"
          className="min-h-[48px] min-w-[48px] items-center justify-center"
        >
          <Text className="text-2xl text-text-secondary">✕</Text>
        </Pressable>
      </View>

      <View className="mt-2 px-5">
        <Text className="text-sm text-text-secondary">
          {profile.name || 'Your account'}
        </Text>
        {profile.email ? <Text className="text-xs text-text-muted">{profile.email}</Text> : null}
      </View>

      <ScrollView className="mt-6 px-5" contentContainerStyle={{ gap: 4 }}>
        {MENU_ITEMS.map((item) => (
          <Pressable
            key={item.href}
            onPress={() => router.push(item.href)}
            className="min-h-[48px] flex-row items-center rounded-xl px-2 py-3 active:bg-bg-card"
          >
            <Text className="w-8 text-lg text-brand-teal">{item.icon}</Text>
            <Text className="text-base font-medium text-text-primary">{item.label}</Text>
          </Pressable>
        ))}
      </ScrollView>
    </View>
  );
}
