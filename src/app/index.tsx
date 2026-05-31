import { Redirect } from "expo-router";

/**
 * Entry route. Once auth + onboarding land (Phases 4-5) this will branch:
 * unauthenticated -> /(auth)/sign-in, un-onboarded -> /(auth)/onboarding,
 * otherwise -> the Deck. For now it sends users straight to the Deck.
 */
export default function Index() {
  return <Redirect href="/(tabs)/deck" />;
}
