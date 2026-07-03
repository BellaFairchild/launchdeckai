import { Pressable, Text, type PressableProps } from 'react-native';

type Variant = 'primary' | 'secondary' | 'ghost' | 'danger';

interface ButtonProps extends Omit<PressableProps, 'children'> {
  label: string;
  variant?: Variant;
  fullWidth?: boolean;
}

const VARIANT_STYLES: Record<Variant, { container: string; text: string }> = {
  primary: { container: 'bg-brand-teal active:bg-brand-tealDark', text: 'text-bg font-semibold' },
  secondary: {
    container: 'bg-bg-card border border-bg-border active:bg-bg-raised',
    text: 'text-text-primary font-semibold',
  },
  ghost: { container: 'bg-transparent active:bg-bg-card', text: 'text-brand-teal font-semibold' },
  danger: { container: 'bg-status-cancelSoon/90 active:bg-status-cancelSoon', text: 'text-bg font-semibold' },
};

export function Button({ label, variant = 'primary', fullWidth, style, ...rest }: ButtonProps) {
  const styles = VARIANT_STYLES[variant];
  return (
    <Pressable
      accessibilityRole="button"
      className={`min-h-[48px] items-center justify-center rounded-xl px-5 py-3 ${styles.container} ${
        fullWidth ? 'w-full' : ''
      }`}
      style={style}
      {...rest}
    >
      <Text className={`text-base ${styles.text}`}>{label}</Text>
    </Pressable>
  );
}
