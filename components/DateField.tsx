import { useState } from 'react';
import { Platform, Pressable, Text, View } from 'react-native';
import { format, parseISO } from 'date-fns';
import DateTimePicker from '@react-native-community/datetimepicker';

interface DateFieldProps {
  label: string;
  value?: string;
  onChange: (isoDate: string | undefined) => void;
  placeholder?: string;
}

export function DateField({ label, value, onChange, placeholder = 'Select date' }: DateFieldProps) {
  const [open, setOpen] = useState(false);

  const dateValue = value ? parseISO(value) : new Date();

  return (
    <View className="mt-4">
      <View className="mb-1.5 flex-row items-center justify-between">
        <Text className="text-sm font-medium text-text-secondary">{label}</Text>
        {value ? (
          <Pressable onPress={() => onChange(undefined)} hitSlop={8}>
            <Text className="text-xs font-semibold text-text-muted">Clear</Text>
          </Pressable>
        ) : null}
      </View>
      <Pressable
        onPress={() => setOpen(true)}
        className="min-h-[48px] justify-center rounded-xl border border-bg-border bg-bg-card px-4"
      >
        <Text className={value ? 'text-base text-text-primary' : 'text-base text-text-muted'}>
          {value ? format(dateValue, 'MMM d, yyyy') : placeholder}
        </Text>
      </Pressable>
      {open ? (
        <DateTimePicker
          value={dateValue}
          mode="date"
          display={Platform.OS === 'ios' ? 'inline' : 'default'}
          onChange={(event, selected) => {
            setOpen(Platform.OS === 'ios');
            if (event.type === 'dismissed') {
              setOpen(false);
              return;
            }
            if (selected) onChange(selected.toISOString());
            if (Platform.OS !== 'ios') setOpen(false);
          }}
        />
      ) : null}
    </View>
  );
}
