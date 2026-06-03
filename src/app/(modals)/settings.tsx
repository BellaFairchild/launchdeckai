import { useRouter } from "expo-router";
import { useState } from "react";
import { Linking, Switch } from "react-native";

import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { PLANS } from "@/constants/plans";
import { playToggle } from "@/lib/audio";
import {
    cancelReminders,
    requestNotificationPermission,
    scheduleLaunchReminders,
} from "@/lib/notifications";
import { useAudioPreferences } from "@/store/audioPreferences";
import { useMissionStore } from "@/store/mission";
import { useUIStore } from "@/store/ui";
import { Pressable, ScrollView, Text, View } from "@/tw";

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
    <Pressable
      onPress={onPress}
      className="min-h-[44px] flex-row items-center justify-between py-2"
    >
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

  const soundEnabled = useAudioPreferences((s) => s.soundEnabled);
  const hapticsEnabled = useAudioPreferences((s) => s.hapticsEnabled);
  const ambientEnabled = useAudioPreferences((s) => s.ambientEnabled);
  const playInSilentMode = useAudioPreferences((s) => s.playInSilentMode);
  const setSoundEnabled = useAudioPreferences((s) => s.setSoundEnabled);
  const setHapticsEnabled = useAudioPreferences((s) => s.setHapticsEnabled);
  const setAmbientEnabled = useAudioPreferences((s) => s.setAmbientEnabled);
  const setPlayInSilentMode = useAudioPreferences((s) => s.setPlayInSilentMode);

  const [notifications, setNotifications] = useState(false);

  const onToggleNotifications = async (next: boolean) => {
    playToggle(next);
    if (next) {
      const granted = await requestNotificationPermission();
      if (!granted) return;
      await scheduleLaunchReminders(launchDate);
      setNotifications(true);
    } else {
      await cancelReminders();
      setNotifications(false);
    }
  };

  const onToggleSound = async (next: boolean) => {
    playToggle(next);
    await setSoundEnabled(next);
  };

  const onToggleHaptics = async (next: boolean) => {
    playToggle(next);
    await setHapticsEnabled(next);
  };

  const onToggleAmbient = async (next: boolean) => {
    playToggle(next);
    await setAmbientEnabled(next);
  };

  const onToggleSilent = async (next: boolean) => {
    playToggle(next);
    await setPlayInSilentMode(next);
    const { refreshAudioSessionMode } = await import("@/lib/audio");
    await refreshAudioSessionMode();
  };

  return (
    <View className="flex-1 bg-bg-deep">
      <ScrollView contentContainerClassName="gap-4 px-5 py-4 pb-12">
        <Text className="font-display text-2xl font-bold text-text-primary">
          Settings
        </Text>

        <Card variant="glass">
          <View className="flex-row items-center justify-between">
            <Text className="font-display text-base font-bold text-text-primary">
              Plan
            </Text>
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
          <Text className="mb-1 font-display text-base font-bold text-text-primary">
            Preferences
          </Text>
          <ToggleRow
            label="Launch reminders"
            value={notifications}
            onValueChange={onToggleNotifications}
          />
          <ToggleRow
            label="Sound effects"
            value={soundEnabled}
            onValueChange={onToggleSound}
          />
          <ToggleRow
            label="Haptics"
            value={hapticsEnabled}
            onValueChange={onToggleHaptics}
          />
          <ToggleRow
            label="Ambient music"
            value={ambientEnabled}
            onValueChange={onToggleAmbient}
          />
          <ToggleRow
            label="Play in silent mode"
            value={playInSilentMode}
            onValueChange={onToggleSilent}
          />
        </Card>

        <Card variant="glass">
          <Text className="mb-1 font-display text-base font-bold text-text-primary">
            Mission
          </Text>
          <LinkRow
            label="Restart onboarding"
            onPress={() => router.push("/(auth)/onboarding")}
          />
          <LinkRow
            label="Support"
            onPress={() => router.push("/(modals)/support")}
          />
        </Card>

        <Card variant="glass">
          <Text className="mb-1 font-display text-base font-bold text-text-primary">
            Legal
          </Text>
          <LinkRow
            label="Privacy Policy"
            onPress={() => Linking.openURL("https://launchdeck.ai/privacy")}
          />
          <LinkRow
            label="Terms of Service"
            onPress={() => Linking.openURL("https://launchdeck.ai/terms")}
          />
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
