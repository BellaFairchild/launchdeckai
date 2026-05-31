import React from "react";
import { Linking } from "react-native";

import { ScrollView, View, Text } from "@/tw";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { AstroAvatar } from "@/components/astro/AstroAvatar";
import { useUIStore } from "@/store/ui";

const FAQ = [
  { q: "What is Fuel?", a: "Fuel powers AI generation in the Foundry and Astro Copilot. Earn it by completing milestones or top up in the Refuel Station." },
  { q: "How does the Signal Deck work?", a: "It's a 16-step launch sequence. Each signal's status is computed from its linked Cargo Bay asset — forge what's missing right from the deck." },
  { q: "What happens if I downgrade?", a: "Nothing is deleted. Premium features are simply locked until you upgrade again." },
];

export default function SupportModal() {
  const plan = useUIStore((s) => s.plan);

  return (
    <View className="flex-1 bg-bg-deep">
      <ScrollView contentContainerClassName="gap-4 px-5 py-4 pb-12">
        <View className="flex-row items-center gap-3">
          <AstroAvatar plan={plan} variant="orb" size={52} />
          <View className="flex-1">
            <Text className="font-display text-2xl font-bold text-text-primary">Support</Text>
            <Text className="font-body text-sm text-text-secondary">
              Astro&apos;s here to help you launch.
            </Text>
          </View>
        </View>

        <Card variant="glass">
          <Text className="font-display text-base font-bold text-text-primary">Contact us</Text>
          <Text className="mt-0.5 font-body text-sm text-text-secondary">
            We usually reply within a day.
          </Text>
          <Button
            label="Email support@launchdeck.ai"
            variant="secondary"
            className="mt-3"
            onPress={() => Linking.openURL("mailto:support@launchdeck.ai")}
          />
        </Card>

        <Text className="px-1 font-mono text-xs uppercase tracking-[2px] text-brand-teal">
          FAQ
        </Text>
        {FAQ.map((item) => (
          <Card key={item.q} variant="glass">
            <Text className="font-body text-base font-semibold text-text-primary">{item.q}</Text>
            <Text className="mt-1 font-body text-sm text-text-secondary">{item.a}</Text>
          </Card>
        ))}
      </ScrollView>
    </View>
  );
}
