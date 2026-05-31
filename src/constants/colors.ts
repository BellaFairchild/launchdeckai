/**
 * LaunchDeckAI color tokens (TS mirror of the @theme block in src/global.css).
 * Use Tailwind classes in JSX wherever possible; use these constants only where
 * a raw color value is required (SVG, charts, animations, native props).
 * Source of truth: Docs/05_DESIGN_SYSTEM.md.
 */
export const colors = {
  // Backgrounds / surfaces
  cosmicBlack: "#050816",
  bgDeep: "#060B14",
  midnightNavy: "#07114A",
  bgSurface: "#0A1220",
  bgCard: "#0E1520",
  bgDepleted: "#0D1630",

  // Borders
  borderDefault: "#1E2D45",
  borderMed: "#2A4060",

  // Brand — blues / indigo
  deepIndigo: "#1426A8",
  electricBlue: "#315DFF",
  brandBlue: "#3B82F6",
  brandBlueLight: "#60A5FA",

  // Brand — teal
  rocketTeal: "#10B7D6",
  brandTeal: "#4DC8C0",
  brandTealLight: "#7DDBD6",
  brandTealDark: "#2BA8A2",

  // Warm accents
  walnut: "#8B5327",
  walnutDark: "#5A3418",
  brandGold: "#F3B233",
  brandFlame: "#FFD65A",

  // Status
  statusSuccess: "#4ADE80",
  statusWarning: "#FF9B42",
  statusError: "#FF5E5E",
  statusDanger: "#FF5E5E",

  // Signal phases (Docs/07)
  signalPre: "#3B82F6",
  signalLaunch: "#4DC8C0",
  signalPost: "#4ADE80",

  // Text
  textPrimary: "#F5F7FA",
  textSecondary: "#94A3B8",
  textTertiary: "#64748B",
  textMuted: "#6B7280",
} as const;

export type ColorToken = keyof typeof colors;

/** Gradients from Docs/05 (use with expo-linear-gradient where needed). */
export const gradients = {
  launch: ["#1426A8", "#10B7D6"] as const, // 135deg
  premiumDeck: ["#8B5327", "#F3B233"] as const, // 135deg
  cosmicGlass: ["rgba(20,38,168,0.20)", "rgba(16,183,214,0.08)"] as const, // 180deg
};
