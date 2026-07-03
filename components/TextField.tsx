import { Text, TextInput, View, type TextInputProps } from 'react-native';

interface TextFieldProps extends TextInputProps {
  label: string;
  required?: boolean;
}

export function TextField({ label, required, className, ...rest }: TextFieldProps) {
  return (
    <View className="mt-4">
      <Text className="mb-1.5 text-sm font-medium text-text-secondary">
        {label}
        {required ? <Text className="text-status-cancelSoon"> *</Text> : null}
      </Text>
      <TextInput
        placeholderTextColor="#6B7482"
        className="min-h-[48px] rounded-xl border border-bg-border bg-bg-card px-4 text-base text-text-primary"
        {...rest}
      />
    </View>
  );
}
