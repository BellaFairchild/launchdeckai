/**
 * Type scale from Docs/05_DESIGN_SYSTEM.md.
 * Headings: Arvo · Body: Ledger · Numbers/console: JetBrains Mono.
 * Fonts are loaded via expo-font in src/app/_layout.tsx.
 */
export const fontFamily = {
  display: "Arvo",
  body: "Ledger",
  mono: "JetBrainsMono",
} as const;

export const fontSize = {
  display: 32,
  h1: 28,
  h2: 24,
  h3: 20,
  bodyLarge: 18,
  body: 16,
  bodySmall: 14,
  caption: 12,
  micro: 11,
} as const;

export type FontSizeToken = keyof typeof fontSize;
