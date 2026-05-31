import React, { useState } from "react";
import { useRouter } from "expo-router";
import { useSignUp } from "@clerk/clerk-expo";
import { SafeAreaView } from "react-native-safe-area-context";
import { KeyboardAvoidingView, Platform } from "react-native";

import { View, Text, TextInput, Pressable } from "@/tw";
import { Button } from "@/components/ui/Button";
import { AstroAvatar } from "@/components/astro/AstroAvatar";
import { track } from "@/lib/analytics";

export default function SignUpScreen() {
  const router = useRouter();
  const { signUp, setActive, isLoaded } = useSignUp();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [code, setCode] = useState("");
  const [pending, setPending] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const onSignUp = async () => {
    if (!isLoaded || busy) return;
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
      const res = await signUp.attemptEmailAddressVerification({ code: code.trim() });
      if (res.status === "complete") {
        track("user_signed_up");
        await setActive({ session: res.createdSessionId });
        router.replace("/");
      } else {
        setError("Verification incomplete — try again.");
      }
    } catch (e: any) {
      setError(e?.errors?.[0]?.message ?? "Verification failed.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <View className="flex-1 bg-bg-deep">
      <SafeAreaView style={{ flex: 1 }}>
        <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === "ios" ? "padding" : undefined}>
          <View className="flex-1 justify-center gap-4 px-7">
            <View className="items-center gap-2">
              <AstroAvatar plan="cadet" variant="bust" size={96} />
              <Text className="font-display text-2xl font-bold text-text-primary">
                {pending ? "Check your email" : "Join the launch crew"}
              </Text>
              <Text className="text-center font-body text-sm text-text-secondary">
                {pending
                  ? "Enter the 6-digit code we sent you."
                  : "Create your account to start your Mission."}
              </Text>
            </View>

            {!pending ? (
              <>
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
                {error ? <Text className="font-body text-sm text-status-error">{error}</Text> : null}
                <Button label="Create Account" fullWidth loading={busy} onPress={onSignUp} />
                <Pressable onPress={() => router.replace("/(auth)/sign-in")} className="items-center py-2">
                  <Text className="font-body text-sm text-text-secondary">
                    Already have an account? <Text className="text-brand-teal">Sign in</Text>
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
                {error ? <Text className="font-body text-sm text-status-error">{error}</Text> : null}
                <Button label="Verify" fullWidth loading={busy} onPress={onVerify} />
              </>
            )}
          </View>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </View>
  );
}
