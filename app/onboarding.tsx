import { useMemo, useState } from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { addDays } from 'date-fns';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAppStore } from '../store/useAppStore';
import { CATEGORY_LABELS } from '../constants/categories';
import { POPULAR_TOOLS, POPULAR_TOOL_CATEGORIES, type PopularTool } from '../constants/popularTools';
import { Button } from '../components/Button';
import { FallbackIcon } from '../components/FallbackIcon';
import { formatCurrency } from '../lib/costCalculations';

export default function OnboardingScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const [step, setStep] = useState<'welcome' | 'pick'>('welcome');
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const addSubscription = useAppStore((s) => s.addSubscription);
  const completeOnboarding = useAppStore((s) => s.completeOnboarding);

  const toggle = (name: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(name)) next.delete(name);
      else next.add(name);
      return next;
    });
  };

  const finish = () => {
    const renewal = addDays(new Date(), 30).toISOString();
    for (const tool of POPULAR_TOOLS) {
      if (!selected.has(tool.name)) continue;
      addSubscription({
        softwareName: tool.name,
        category: tool.category,
        billingType: tool.billingType,
        cost: tool.defaultCost,
        currency: 'USD',
        status: 'keep',
        renewalDate: tool.billingType === 'monthly' || tool.billingType === 'annual' ? renewal : undefined,
        websiteUrl: tool.websiteUrl,
        autoRenew: true,
        alertEnabled: true,
        alertDaysBefore: 3,
      });
    }
    completeOnboarding();
    router.replace('/');
  };

  const skip = () => {
    completeOnboarding();
    router.replace('/');
  };

  if (step === 'welcome') {
    return (
      <View className="flex-1 items-center justify-center bg-bg px-8" style={{ paddingTop: insets.top }}>
        <Text className="text-center text-4xl font-extrabold text-text-primary">SubDeck</Text>
        <Text className="mt-3 text-center text-base text-text-secondary">
          Stop surprise renewals. Cut wasted tools. Keep only what earns its place.
        </Text>
        <View className="mt-10 w-full">
          <Button label="Build My Stack" onPress={() => setStep('pick')} fullWidth />
          <View className="mt-3">
            <Button label="Skip for now" variant="ghost" onPress={skip} fullWidth />
          </View>
        </View>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-bg" style={{ paddingTop: insets.top + 16 }}>
      <View className="px-5">
        <Text className="text-2xl font-bold text-text-primary">Build Your First Stack</Text>
        <Text className="mt-1 text-sm text-text-secondary">
          Tap the tools you already pay for. You can edit costs and dates after.
        </Text>
      </View>

      <ScrollView className="mt-4 px-5" contentContainerStyle={{ paddingBottom: 140 }}>
        {POPULAR_TOOL_CATEGORIES.map((category) => (
          <CategorySection
            key={category}
            category={category}
            tools={POPULAR_TOOLS.filter((t) => t.category === category)}
            selected={selected}
            onToggle={toggle}
          />
        ))}
      </ScrollView>

      <View className="absolute bottom-0 left-0 right-0 border-t border-bg-border bg-bg px-5 pt-4" style={{ paddingBottom: insets.bottom + 16 }}>
        <Button
          label={selected.size > 0 ? `Add ${selected.size} Tool${selected.size === 1 ? '' : 's'}` : 'Continue'}
          onPress={selected.size > 0 ? finish : skip}
          fullWidth
        />
      </View>
    </View>
  );
}

function CategorySection({
  category,
  tools,
  selected,
  onToggle,
}: {
  category: PopularTool['category'];
  tools: PopularTool[];
  selected: Set<string>;
  onToggle: (name: string) => void;
}) {
  return (
    <View className="mb-6">
      <Text className="mb-2 text-xs font-bold uppercase tracking-wide text-text-muted">
        {CATEGORY_LABELS[category]}
      </Text>
      <View className="flex-row flex-wrap gap-3">
        {tools.map((tool) => {
          const active = selected.has(tool.name);
          return (
            <Pressable
              key={tool.name}
              onPress={() => onToggle(tool.name)}
              className={`w-[47%] rounded-2xl border p-3 ${
                active ? 'border-brand-teal bg-brand-teal/10' : 'border-bg-border bg-bg-card'
              }`}
            >
              <View className="flex-row items-center justify-between">
                <FallbackIcon name={tool.name} category={tool.category} size={36} />
                {active ? <Text className="text-brand-teal">✓</Text> : null}
              </View>
              <Text className="mt-2 text-sm font-semibold text-text-primary" numberOfLines={1}>
                {tool.name}
              </Text>
              <Text className="mt-0.5 text-xs text-text-muted">{formatCurrency(tool.defaultCost)}/mo</Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}
