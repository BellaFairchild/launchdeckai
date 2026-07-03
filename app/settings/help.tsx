import { ScrollView, Text, View } from 'react-native';
import { ScreenHeader } from '../../components/ScreenHeader';
import { Card } from '../../components/Card';

const FAQS = [
  {
    q: 'How does SubDeck calculate my monthly spend?',
    a: 'Monthly subscriptions count as-is, annual subscriptions are divided by 12, variable tools use your estimated monthly cost, and per-seat tools multiply cost per seat by seat count. Cancelled, paused, free, and lifetime tools are excluded.',
  },
  {
    q: 'What is a Stack Sweep?',
    a: 'A guided monthly review where you walk through renewals, high-cost tools, trials, and anything marked Review Later, then decide what to keep, downgrade, or cancel.',
  },
  {
    q: 'Where is my data stored?',
    a: 'In this MVP, your subscriptions are stored securely on your device. Account sync and cloud backup are planned for a future release.',
  },
  {
    q: 'Can I track subscriptions in different currencies?',
    a: 'Yes. Each subscription keeps its own currency. SubDeck does not yet convert between currencies when totaling spend.',
  },
];

export default function HelpScreen() {
  return (
    <View className="flex-1 bg-bg">
      <ScreenHeader title="Help & Support" />
      <ScrollView className="px-5" contentContainerStyle={{ paddingBottom: 40, gap: 12 }}>
        {FAQS.map((item) => (
          <Card key={item.q}>
            <Text className="text-sm font-semibold text-text-primary">{item.q}</Text>
            <Text className="mt-1.5 text-sm text-text-secondary">{item.a}</Text>
          </Card>
        ))}
        <Text className="mt-2 text-center text-xs text-text-muted">
          Still stuck? Reach us at support@subdeck.app
        </Text>
      </ScrollView>
    </View>
  );
}
