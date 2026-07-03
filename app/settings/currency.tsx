import { Pressable, ScrollView, Text, View } from 'react-native';
import { useAppStore } from '../../store/useAppStore';
import { CURRENCY_OPTIONS } from '../../constants/billing';
import { ScreenHeader } from '../../components/ScreenHeader';

export default function CurrencyScreen() {
  const preferredCurrency = useAppStore((s) => s.profile.preferredCurrency);
  const updateProfile = useAppStore((s) => s.updateProfile);

  return (
    <View className="flex-1 bg-bg">
      <ScreenHeader title="Currency Preferences" />
      <ScrollView className="px-5" contentContainerStyle={{ paddingBottom: 40 }}>
        <Text className="mb-3 text-xs text-text-muted">
          Choose the currency used for your Deck, Insights, and cost totals. SubDeck does not convert between
          currencies in the MVP — each subscription keeps the currency it was entered in.
        </Text>
        {CURRENCY_OPTIONS.map((currency) => {
          const active = currency === preferredCurrency;
          return (
            <Pressable
              key={currency}
              onPress={() => updateProfile({ preferredCurrency: currency })}
              className={`mt-2 min-h-[48px] flex-row items-center justify-between rounded-xl border px-4 ${
                active ? 'border-brand-teal bg-brand-teal/10' : 'border-bg-border bg-bg-card'
              }`}
            >
              <Text className="text-base font-medium text-text-primary">{currency}</Text>
              {active ? <Text className="text-brand-teal">✓</Text> : null}
            </Pressable>
          );
        })}
      </ScrollView>
    </View>
  );
}
