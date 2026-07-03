import '../global.css';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { View } from 'react-native';
import { useAppStore } from '../store/useAppStore';

export default function RootLayout() {
  const hasHydrated = useAppStore((state) => state.hasHydrated);

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <StatusBar style="light" />
        {hasHydrated ? (
          <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: '#0B0F14' } }}>
            <Stack.Screen name="(tabs)" />
            <Stack.Screen name="onboarding" />
            <Stack.Screen
              name="add-subscription"
              options={{ presentation: 'modal', headerShown: false }}
            />
            <Stack.Screen
              name="sweep"
              options={{ presentation: 'fullScreenModal', headerShown: false }}
            />
            <Stack.Screen name="menu" options={{ presentation: 'modal', headerShown: false }} />
          </Stack>
        ) : (
          <View className="flex-1 bg-bg" />
        )}
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
