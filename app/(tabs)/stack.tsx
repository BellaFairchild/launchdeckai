import { useMemo, useState } from 'react';
import { FlatList, Pressable, RefreshControl, ScrollView, Text, TextInput, View } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAppStore } from '../../store/useAppStore';
import { CATEGORY_LABELS, CATEGORY_OPTIONS } from '../../constants/categories';
import { STATUS_LABELS, STATUS_OPTIONS } from '../../constants/billing';
import { monthlyCostOf } from '../../lib/costCalculations';
import { SubscriptionCard } from '../../components/SubscriptionCard';
import { EmptyState } from '../../components/EmptyState';
import type { Subscription, SubscriptionCategory, SubscriptionStatus } from '../../types/models';

type SortKey = 'renewal' | 'cost' | 'name' | 'category';

const SORT_LABELS: Record<SortKey, string> = {
  renewal: 'Renewal Date',
  cost: 'Cost',
  name: 'Name',
  category: 'Category',
};
const SORT_ORDER: SortKey[] = ['renewal', 'cost', 'name', 'category'];

function sortSubs(subs: Subscription[], key: SortKey): Subscription[] {
  const copy = [...subs];
  switch (key) {
    case 'cost':
      return copy.sort((a, b) => monthlyCostOf(b) - monthlyCostOf(a));
    case 'name':
      return copy.sort((a, b) => a.softwareName.localeCompare(b.softwareName));
    case 'category':
      return copy.sort((a, b) => a.category.localeCompare(b.category));
    case 'renewal':
    default:
      return copy.sort((a, b) => (a.renewalDate ?? a.trialEndDate ?? '9999').localeCompare(b.renewalDate ?? b.trialEndDate ?? '9999'));
  }
}

export default function StackScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const subscriptions = useAppStore((s) => s.subscriptions);

  const [query, setQuery] = useState('');
  const [category, setCategory] = useState<SubscriptionCategory | 'all'>('all');
  const [status, setStatus] = useState<SubscriptionStatus | 'all'>('all');
  const [sortKey, setSortKey] = useState<SortKey>('renewal');
  const [refreshing, setRefreshing] = useState(false);

  const filtered = useMemo(() => {
    let result = subscriptions;
    if (query.trim()) {
      const q = query.trim().toLowerCase();
      result = result.filter(
        (s) => s.softwareName.toLowerCase().includes(q) || CATEGORY_LABELS[s.category].toLowerCase().includes(q),
      );
    }
    if (category !== 'all') result = result.filter((s) => s.category === category);
    if (status !== 'all') result = result.filter((s) => s.status === status);
    return sortSubs(result, sortKey);
  }, [subscriptions, query, category, status, sortKey]);

  const onRefresh = () => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 400);
  };

  return (
    <View className="flex-1 bg-bg" style={{ paddingTop: insets.top + 12 }}>
      <View className="px-5">
        <Text className="text-2xl font-bold text-text-primary">Stack</Text>
        <TextInput
          value={query}
          onChangeText={setQuery}
          placeholder="Search subscriptions"
          placeholderTextColor="#6B7482"
          className="mt-4 min-h-[48px] rounded-xl border border-bg-border bg-bg-card px-4 text-base text-text-primary"
        />
      </View>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} className="mt-3 max-h-[44px] px-5" contentContainerStyle={{ gap: 8 }}>
        <FilterChip label="All" active={category === 'all'} onPress={() => setCategory('all')} />
        {CATEGORY_OPTIONS.map((c) => (
          <FilterChip key={c} label={CATEGORY_LABELS[c]} active={category === c} onPress={() => setCategory(c)} />
        ))}
      </ScrollView>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} className="mt-2 max-h-[44px] px-5" contentContainerStyle={{ gap: 8 }}>
        <FilterChip label="All Statuses" active={status === 'all'} onPress={() => setStatus('all')} />
        {STATUS_OPTIONS.map((s) => (
          <FilterChip key={s} label={STATUS_LABELS[s]} active={status === s} onPress={() => setStatus(s)} />
        ))}
      </ScrollView>

      <View className="mt-2 flex-row items-center justify-end px-5">
        <Text className="mr-2 text-xs text-text-muted">Sort by</Text>
        <Pressable
          onPress={() => {
            const idx = SORT_ORDER.indexOf(sortKey);
            setSortKey(SORT_ORDER[(idx + 1) % SORT_ORDER.length]);
          }}
          className="rounded-full border border-bg-border px-3 py-1.5"
        >
          <Text className="text-xs font-semibold text-brand-teal">{SORT_LABELS[sortKey]}</Text>
        </Pressable>
      </View>

      <FlatList
        data={filtered}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ padding: 20, paddingBottom: 140 }}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#1FD1C1" />}
        renderItem={({ item }) => (
          <SubscriptionCard subscription={item} onPress={() => router.push(`/subscription/${item.id}`)} />
        )}
        ListEmptyComponent={
          <EmptyState
            title={subscriptions.length === 0 ? 'No subscriptions yet' : 'No matches'}
            description={
              subscriptions.length === 0
                ? 'Tap the + button to add your first software subscription.'
                : 'Try a different search term or filter.'
            }
          />
        }
      />
    </View>
  );
}

function FilterChip({ label, active, onPress }: { label: string; active: boolean; onPress: () => void }) {
  return (
    <Pressable
      onPress={onPress}
      className={`min-h-[36px] items-center justify-center rounded-full border px-3.5 ${
        active ? 'border-brand-teal bg-brand-teal/15' : 'border-bg-border bg-bg-card'
      }`}
    >
      <Text className={`text-xs font-semibold ${active ? 'text-brand-teal' : 'text-text-secondary'}`}>{label}</Text>
    </Pressable>
  );
}
