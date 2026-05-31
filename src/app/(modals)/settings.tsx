import React, { useState } from "react";
import { useRouter } from "expo-router";
import { Switch, Linking } from "react-native";

import { ScrollView, View, Text, Pressable } from "@/tw";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { PLANS } from "@/constants/plans";
import { useUIStore } from "@/store/ui";
import { useMissionStore } from "@/store/mission";
import {
  requestNotificationPermission,
  scheduleLaunchReminders,
  cancelReminders,
} from "@/lib/notifications";

function ToggleRow({
  label,
  value,
  onValueChange,
}: {
  label: string;
  value: boolean;
  onValueChange: (v: boolean) => void;
}) {
  return (
    <View className="flex-row items-center justify-between py-1">
      <Text className="font-body text-base text-text-primary">{label}</Text>
      <Switch
        value={value}
        onValueChange={onValueChange}
        trackColor={{ true: "#2BA8A2", false: "#1E2D45" }}
        thumbColor="#F5F7FA"
      />
    </View>
  );
}

function LinkRow({ label, onPress }: { label: string; onPress: () => void }) {
  return (
    <Pressable onPress={onPress} className="min-h-[44px] flex-row items-center justify-between py-2">
      <Text className="font-body text-base text-text-primary">{label}</Text>
      <Text className="text-text-tertiary">→</Text>
    </Pressable>
  );
}

export default function SettingsModal() {
  const router = useRouter();
  const plan = useUIStore((s) => s.plan);
  const signOut = useUIStore((s) => s.signOut);
  const launchDate = useMissionStore((s) => s.mission.launchDate);

  const [notifications, setNotifications] = useState(false);
  const [sound, setSound] = useState(true);
  const [haptics, setHaptics] = useState(true);

  const onToggleNotifications = async (next: boolean) => {
    if (next) {
      const granted = await requestNotificationPermission();
      if (!granted) return; // leave the toggle off if permission denied
      await scheduleLaunchReminders(launchDate);
      setNotifications(true);
    } else {
      await cancelReminders();
      setNotifications(false);
    }
  };

  return (
    <View className="flex-1 bg-bg-deep">
      <ScrollView contentContainerClassName="gap-4 px-5 py-4 pb-12">
        <Text className="font-display text-2xl font-bold text-text-primary">Settings</Text>

        <Card variant="glass">
          <View className="flex-row items-center justify-between">
            <Text className="font-display text-base font-bold text-text-primary">Plan</Text>
            <Badge label={PLANS[plan].name} variant="plan" />
          </View>
          <Button
            label="Manage in Refuel Station →"
            variant="secondary"
            size="sm"
            className="mt-3 self-start"
            onPress={() => router.push("/(modals)/refuel")}
          />
        </Card>

        <Card variant="glass">
          <Text className="mb-1 font-display text-base font-bold text-text-primary">Preferences</Text>
          <ToggleRow label="Launch reminders" value={notifications} onValueChange={onToggleNotifications} />
          <ToggleRow label="Sound effects" value={sound} onValueChange={setSound} />
          <ToggleRow label="Haptics" value={haptics} onValueChange={setHaptics} />
        </Card>

        <Card variant="glass">
          <Text className="mb-1 font-display text-base font-bold text-text-primary">Mission</Text>
          <LinkRow label="Restart onboarding" onPress={() => router.push("/(auth)/onboarding")} />
          <LinkRow label="Support" onPress={() => router.push("/(modals)/support")} />
        </Card>

        <Card variant="glass">
          <Text className="mb-1 font-display text-base font-bold text-text-primary">Legal</Text>
          <LinkRow label="Privacy Policy" onPress={() => Linking.openURL("https://launchdeck.ai/privacy")} />
          <LinkRow label="Terms of Service" onPress={() => Linking.openURL("https://launchdeck.ai/terms")} />
        </Card>

        <Button
          label="Log Out"
          variant="danger"
          onPress={() => {
            router.back();
            signOut();
          }}
        />
        <Text className="text-center font-mono text-[11px] text-text-tertiary">
          LaunchDeckAI v1.0.0
        </Text>
      </ScrollView>
    </View>
  );
}
