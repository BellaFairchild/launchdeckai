import { useSignUp, useSSO } from "@clerk/clerk-expo";
import * as Linking from "expo-linking";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { KeyboardAvoidingView, Platform } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { ClerkAuthGate } from "@/components/auth/ClerkAuthGate";
import { ClerkCaptcha } from "@/components/auth/ClerkCaptcha";
import { ScreenBackground } from "@/components/layout/ScreenBackground";
import { Button } from "@/components/ui/Button";
import { track } from "@/lib/analytics";
import { Pressable, Text, TextInput, View } from "@/tw";

const MISSION_ROUTE = "/(auth)/onboarding?phase=mission";

export default function SavePlanScreen() {
  return (
    <ClerkAuthGate>
      <SavePlanContent />
    </ClerkAuthGate>
  );
}

function SavePlanContent() {
  const router = useRouter();
  const { signUp, setActive, isLoaded } = useSignUp();
  const { startSSOFlow } = useSSO();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [code, setCode] = useState("");
  const [pending, setPending] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    track("save_plan_viewed");
  }, []);

  const onSignUp = async () => {
    if (!isLoaded || busy) return;
    track("save_plan_sign_in_started");
    setBusy(true);
    setError(null);
    try {
      await signUp.create({ emailAddress: email.trim(), password });
      await signUp.prepareEmailAddressVerification({ strategy: "email_code" });
      setPending(true);
    } catch (e: any) {
      setError(e?.errors?.[0]?.message ?? "Sign-up failed.");
    } finally {
      setBusy(false);
    }
  };

  const onVerify = async () => {
    if (!isLoaded || busy) return;
    setBusy(true);
    setError(null);
    try {
      const res = await signUp.attemptEmailAddressVerification({
        code: code.trim(),
      });
      if (res.status === "complete") {
        await setActive({ session: res.createdSessionId });
        router.replace(MISSION_ROUTE);
      } else {
        setError("Verification incomplete — try again.");
      }
    } catch (e: any) {
      setError(e?.errors?.[0]?.message ?? "Verification failed.");
    } finally {
      setBusy(false);
    }
  };

  const onOAuth = async (strategy: "oauth_google" | "oauth_apple") => {
    track("save_plan_sign_in_started");
    setError(null);
    try {
      const { createdSessionId, setActive: setA } = await startSSOFlow({
        strategy,
        redirectUrl: Linking.createURL("/(auth)/save-plan"),
      });
      if (createdSessionId && setA) {
        await setA({ session: createdSessionId });
        router.replace(MISSION_ROUTE);
      }
    } catch (e: any) {
      setError(e?.errors?.[0]?.message ?? "OAuth sign-in failed.");
    }
  };

  return (
    <ScreenBackground>
      <SafeAreaView style={{ flex: 1 }}>
        <KeyboardAvoidingView
          style={{ flex: 1 }}
          behavior={Platform.OS === "ios" ? "padding" : undefined}
        >
          <View className="flex-1 justify-center gap-4 px-7">
            <View className="items-center gap-2">
              <Text
                accessibilityRole="header"
                className="text-center font-display text-2xl font-bold text-text-primary"
              >
                {pending ? "Check your email" : "Save your app plan"}
              </Text>
              <Text className="text-center font-body text-sm leading-relaxed text-text-secondary">
                {pending
                  ? "Enter the 6-digit code we sent you."
                  : "Create an account so your answers, checklists, and plan details stay saved securely."}
              </Text>
            </View>

            {!pending ? (
              <>
                <View className="gap-2">
                  <Button
                    label="Continue with Google"
                    variant="secondary"
                    fullWidth
                    onPress={() => onOAuth("oauth_google")}
                  />
                  <Button
                    label="Continue with Apple"
                    variant="secondary"
                    fullWidth
                    onPress={() => onOAuth("oauth_apple")}
                  />
                </View>

                <View className="flex-row items-center gap-3">
                  <View className="h-px flex-1 bg-border-default" />
                  <Text className="font-mono text-[11px] uppercase tracking-wider text-text-tertiary">
                    or
                  </Text>
                  <View className="h-px flex-1 bg-border-default" />
                </View>

                <View className="gap-2">
                  <TextInput
                    value={email}
                    onChangeText={setEmail}
                    placeholder="Email"
                    placeholderTextColor="#64748B"
                    autoCapitalize="none"
                    keyboardType="email-address"
                    className="rounded-2xl border border-border-med bg-bg-card px-4 py-3 font-body text-base text-text-primary"
                  />
                  <TextInput
                    value={password}
                    onChangeText={setPassword}
                    placeholder="Password"
                    placeholderTextColor="#64748B"
                    secureTextEntry
                    className="rounded-2xl border border-border-med bg-bg-card px-4 py-3 font-body text-base text-text-primary"
                  />
                </View>

                {error ? (
                  <Text className="font-body text-sm text-status-error">
                    {error}
                  </Text>
                ) : null}

                <ClerkCaptcha />
                <Button
                  label="Create Account"
                  fullWidth
                  loading={busy}
                  onPress={onSignUp}
                />

                <Text className="text-center font-body text-xs leading-relaxed text-text-tertiary">
                  Your plan is private, secure, and editable anytime.
                </Text>

                <Pressable
                  onPress={() => router.replace("/(auth)/sign-in")}
                  className="items-center py-2"
                >
                  <Text className="font-body text-sm text-text-secondary">
                    Already have an account?{" "}
                    <Text className="text-brand-teal">Sign in</Text>
                  </Text>
                </Pressable>
              </>
            ) : (
              <>
                <TextInput
                  value={code}
                  onChangeText={setCode}
                  placeholder="123456"
                  placeholderTextColor="#64748B"
                  keyboardType="number-pad"
                  className="rounded-2xl border border-border-med bg-bg-card px-4 py-3 text-center font-mono text-xl tracking-[6px] text-text-primary"
                />
                {error ? (
                  <Text className="font-body text-sm text-status-error">
                    {error}
                  </Text>
                ) : null}
                <Button
                  label="Verify"
                  fullWidth
                  loading={busy}
                  onPress={onVerify}
                />
              </>
            )}
          </View>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </ScreenBackground>
  );
}
