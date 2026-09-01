import { Redirect, useRouter, type Href } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";

import { ScreenHeader } from "@/components/ui";
import { Pressable, ScrollView, Text, View } from "@/tw";

type ScreenLink = { href: Href; label: string; path: string };

const GROUPS: { title: string; screens: ScreenLink[] }[] = [
  {
    title: "Tabs",
    screens: [
      { href: "/(tabs)/deck", label: "Deck", path: "/deck" },
      { href: "/(tabs)/missions", label: "Missions", path: "/missions" },
      { href: "/(tabs)/blueprints", label: "Blueprints", path: "/blueprints" },
      { href: "/(tabs)/foundry", label: "Foundry", path: "/foundry" },
    ],
  },
  {
    title: "Auth",
    screens: [
      { href: "/(auth)/landing", label: "Landing", path: "/landing" },
      { href: "/(auth)/onboarding", label: "Onboarding", path: "/onboarding" },
      { href: "/(auth)/save-plan", label: "Save plan", path: "/save-plan" },
      { href: "/(auth)/sign-in", label: "Sign in", path: "/sign-in" },
      { href: "/(auth)/sign-up", label: "Sign up", path: "/sign-up" },
      {
        href: "/(auth)/welcome-back",
        label: "Welcome back",
        path: "/welcome-back",
      },
    ],
  },
  {
    title: "Modals",
    screens: [
      { href: "/(modals)/profile", label: "Profile", path: "/profile" },
      { href: "/(modals)/cargo", label: "Cargo Bay", path: "/cargo" },
      {
        href: "/(modals)/signal-deck",
        label: "Signal Deck",
        path: "/signal-deck",
      },
      {
        href: "/(modals)/launch-library",
        label: "Launch Library",
        path: "/launch-library",
      },
      { href: "/(modals)/refuel", label: "Refuel", path: "/refuel" },
      { href: "/(modals)/settings", label: "Settings", path: "/settings" },
      { href: "/(modals)/support", label: "Support", path: "/support" },
      { href: "/(modals)/copilot", label: "Copilot", path: "/copilot" },
      {
        href: "/(modals)/cargo-asset/a_1",
        label: "Cargo asset",
        path: "/cargo-asset/a_1",
      },
    ],
  },
  {
    title: "Other",
    screens: [
      { href: "/gallery", label: "Design gallery", path: "/gallery" },
      {
        href: "/blueprints/app_info",
        label: "Blueprint: App Info",
        path: "/blueprints/app_info",
      },
    ],
  },
];

/**
 * Dev-only directory of app routes for local web preview. Production redirects home.
 */
export default function ScreensDirectory() {
  const router = useRouter();

  if (!__DEV__) return <Redirect href="/" />;

  return (
    <View className="flex-1 bg-bg-deep">
      <SafeAreaView style={{ flex: 1 }} edges={["top"]}>
        <ScreenHeader
          title="Screens"
          subtitle="Local web preview — tap a route"
        />
        <ScrollView contentContainerClassName="pb-16">
          {GROUPS.map((group) => (
            <View key={group.title} className="gap-2 px-5 py-4">
              <Text className="font-mono text-xs uppercase tracking-[2px] text-brand-teal">
                {group.title}
              </Text>
              {group.screens.map((screen) => (
                <Pressable
                  key={screen.path}
                  onPress={() => router.push(screen.href)}
                  accessibilityRole="link"
                  accessibilityLabel={screen.label}
                  className="flex-row items-center justify-between rounded-2xl border border-border-default bg-bg-card px-4 py-3"
                >
                  <Text className="font-display text-base font-semibold text-text-primary">
                    {screen.label}
                  </Text>
                  <Text className="font-mono text-[11px] text-text-tertiary">
                    {screen.path}
                  </Text>
                </Pressable>
              ))}
            </View>
          ))}
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}
