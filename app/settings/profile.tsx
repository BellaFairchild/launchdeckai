import { useState } from 'react';
import { ScrollView, Text, TextInput, View } from 'react-native';
import { useAppStore } from '../../store/useAppStore';
import { ScreenHeader } from '../../components/ScreenHeader';
import { Button } from '../../components/Button';

export default function ProfileScreen() {
  const profile = useAppStore((s) => s.profile);
  const updateProfile = useAppStore((s) => s.updateProfile);
  const [name, setName] = useState(profile.name);
  const [email, setEmail] = useState(profile.email);

  return (
    <View className="flex-1 bg-bg">
      <ScreenHeader title="Profile" />
      <ScrollView className="px-5" contentContainerStyle={{ paddingBottom: 40 }}>
        <Field label="Name" value={name} onChangeText={setName} placeholder="Your name" />
        <Field
          label="Email"
          value={email}
          onChangeText={setEmail}
          placeholder="you@example.com"
          keyboardType="email-address"
          autoCapitalize="none"
        />
        <Text className="mt-1 text-xs text-text-muted">
          SubDeck currently stores your profile on this device only. Account sync arrives with authentication in a
          future update.
        </Text>
        <View className="mt-6">
          <Button label="Save Changes" onPress={() => updateProfile({ name, email })} fullWidth />
        </View>
      </ScrollView>
    </View>
  );
}

function Field(props: {
  label: string;
  value: string;
  onChangeText: (v: string) => void;
  placeholder?: string;
  keyboardType?: 'default' | 'email-address';
  autoCapitalize?: 'none' | 'sentences';
}) {
  return (
    <View className="mt-4">
      <Text className="mb-1.5 text-sm font-medium text-text-secondary">{props.label}</Text>
      <TextInput
        value={props.value}
        onChangeText={props.onChangeText}
        placeholder={props.placeholder}
        placeholderTextColor="#6B7482"
        keyboardType={props.keyboardType}
        autoCapitalize={props.autoCapitalize}
        className="min-h-[48px] rounded-xl border border-bg-border bg-bg-card px-4 text-base text-text-primary"
      />
    </View>
  );
}
