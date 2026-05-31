/**
 * Type scale from Docs/05_DESIGN_SYSTEM.md.
 * Headings: Space Grotesk · Body: Inter · Numbers/console: JetBrains Mono.
 * Fonts are loaded via expo-font in the root layout (Phase 2).
 */
export const fontFamily = {
  display: "SpaceGrotesk",
  body: "Inter",
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
