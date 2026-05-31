/**
 * 4pt spacing scale. Prefer Tailwind spacing utilities in JSX; use these where a
 * numeric value is needed (gaps in non-className contexts, layout math).
 */
export const spacing = {
  none: 0,
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  "2xl": 24,
  "3xl": 32,
  "4xl": 40,
  "5xl": 48,
} as const;

export const radius = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  pill: 9999,
} as const;

/** Minimum accessible tap target (Docs/05 accessibility). */
export const MIN_TAP_TARGET = 44;

export type SpacingToken = keyof typeof spacing;
