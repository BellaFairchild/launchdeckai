import React from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import { ScrollView, View, Text } from "@/tw";
import {
  Button,
  Card,
  Badge,
  FuelBadge,
  ProgressRing,
  SignalBars,
  ScreenHeader,
  EmptyState,
  ErrorState,
} from "@/components/ui";
import { AstroAvatar } from "@/components/astro/AstroAvatar";
import type { ButtonVariant } from "@/components/ui";
import type { CardVariant } from "@/components/ui";
import type { BadgeVariant } from "@/components/ui";
import type { Plan } from "@/constants/plans";

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <View className="gap-3 px-5 py-4">
      <Text className="font-mono text-xs uppercase tracking-[2px] text-brand-teal">
        {title}
      </Text>
      {children}
    </View>
  );
}

const BUTTONS: ButtonVariant[] = [
  "primary",
  "secondary",
  "ghost",
  "premium",
  "danger",
  "locked",
];
const CARDS: CardVariant[] = ["glass", "elevated", "premium", "warning", "success"];
const BADGES: BadgeVariant[] = [
  "plan",
  "status",
  "fuel",
  "readiness",
  "signal",
  "locked",
];
const PLANS: Plan[] = ["cadet", "commander", "admiral"];

/**
 * Dev-only design-system gallery (Phase 2 verification). Reachable at /gallery.
 * Not linked from production navigation.
 */
export default function Gallery() {
  return (
    <View className="flex-1 bg-bg-deep">
      <SafeAreaView style={{ flex: 1 }} edges={["top"]}>
        <ScreenHeader title="Design System" subtitle="Phase 2 component gallery" />
        <ScrollView contentContainerClassName="pb-16">
          <Section title="Buttons">
            <View className="gap-2">
              {BUTTONS.map((v) => (
                <Button key={v} label={v} variant={v} onPress={() => {}} />
              ))}
            </View>
          </Section>

          <Section title="Cards">
            <View className="gap-2">
              {CARDS.map((v) => (
                <Card key={v} variant={v}>
                  <Text className="font-body text-text-primary">{v} card</Text>
                </Card>
              ))}
            </View>
          </Section>

          <Section title="Badges">
            <View className="flex-row flex-wrap gap-2">
              {BADGES.map((v) => (
                <Badge key={v} label={v} variant={v} />
              ))}
            </View>
          </Section>

          <Section title="Fuel Badge">
            <View className="flex-row flex-wrap items-center gap-3">
              <FuelBadge amount={420} />
              <FuelBadge amount={8} warning />
              <FuelBadge amount={1500} glow />
            </View>
          </Section>

          <Section title="Progress Ring">
            <View className="flex-row flex-wrap items-center gap-6">
              <ProgressRing progress={68} caption="readiness" />
              <ProgressRing progress={40} size={90} color="#F3B233" caption="blueprint" />
            </View>
          </Section>

          <Section title="Signal Bars">
            <View className="flex-row items-end gap-6">
              <SignalBars status="not_loaded" />
              <SignalBars status="in_prep" />
              <SignalBars status="flight_ready" />
            </View>
          </Section>

          <Section title="Astro — orb / bust / full body × plans">
            <View className="flex-row flex-wrap items-end gap-4">
              {PLANS.map((p) => (
                <AstroAvatar key={`orb-${p}`} plan={p} variant="orb" />
              ))}
            </View>
            <View className="mt-3 flex-row flex-wrap items-end gap-4">
              {PLANS.map((p) => (
                <AstroAvatar key={`bust-${p}`} plan={p} variant="bust" />
              ))}
            </View>
            <View className="mt-3 flex-row flex-wrap items-end gap-4">
              {PLANS.map((p) => (
                <AstroAvatar
                  key={`full-${p}`}
                  plan={p}
                  variant="fullBody"
                  size={140}
                />
              ))}
            </View>
          </Section>

          <Section title="Empty / Error states">
            <Card>
              <EmptyState
                astroPose="pointing"
                title="No assets yet"
                message="Forge your first asset in the Foundry."
                ctaLabel="Open Foundry"
                onCtaPress={() => {}}
              />
            </Card>
            <Card>
              <ErrorState onRetry={() => {}} />
            </Card>
          </Section>
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}
