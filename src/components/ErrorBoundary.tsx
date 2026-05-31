import React from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import { View, Text, Pressable } from "@/tw";
import { captureError } from "@/lib/monitoring";

type Props = { children: React.ReactNode };
type State = { error: Error | null };

/**
 * App-wide runtime error boundary. Catches render/lifecycle errors anywhere in
 * the tree and shows a calm, on-brand fallback instead of a crash.
 */
export class ErrorBoundary extends React.Component<Props, State> {
  state: State = { error: null };

  static getDerivedStateFromError(error: Error): State {
    return { error };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    captureError(error, { componentStack: info.componentStack });
  }

  reset = () => this.setState({ error: null });

  render() {
    const { error } = this.state;
    if (!error) return this.props.children;

    return (
      <View className="flex-1 bg-bg-deep">
        <SafeAreaView style={{ flex: 1 }}>
          <View className="flex-1 items-center justify-center gap-4 px-8">
            <Text className="font-mono text-xs uppercase tracking-[2px] text-status-error">
              Mission anomaly
            </Text>
            <Text className="text-center font-display text-2xl font-bold text-text-primary">
              Something drifted off course
            </Text>
            <Text className="text-center font-body text-sm text-text-secondary">
              {error.message || "An unexpected error occurred."}
            </Text>
            <Pressable
              onPress={this.reset}
              className="mt-2 rounded-full bg-brand-teal px-6 py-3 active:opacity-80"
            >
              <Text className="font-body font-semibold text-bg-deep">Try again</Text>
            </Pressable>
          </View>
        </SafeAreaView>
      </View>
    );
  }
}
