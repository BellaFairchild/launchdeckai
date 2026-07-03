import { ScrollView, Text, View } from 'react-native';
import { ScreenHeader } from '../../components/ScreenHeader';

export default function AboutScreen() {
  return (
    <View className="flex-1 bg-bg">
      <ScreenHeader title="About SubDeck" />
      <ScrollView className="px-5" contentContainerStyle={{ paddingBottom: 40 }}>
        <Text className="text-2xl font-bold text-text-primary">SubDeck</Text>
        <Text className="mt-2 text-sm text-text-secondary">
          Stop surprise renewals. Cut wasted tools. Keep only what earns its place.
        </Text>
        <Text className="mt-4 text-sm text-text-secondary">
          SubDeck helps freelancers, creators, indie developers, and small business owners track software
          subscriptions, renewal dates, trial endings, and spend — with decision support, not just passive
          tracking.
        </Text>
        <Text className="mt-4 text-xs text-text-muted">Version 1.0.0 (MVP)</Text>
      </ScrollView>
    </View>
  );
}
