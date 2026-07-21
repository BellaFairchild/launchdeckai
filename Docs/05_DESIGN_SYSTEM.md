# LaunchDeckAI Design System

## Design North Star

LaunchDeckAI should feel like calm mission control with handcrafted warmth.

The visual identity should combine:

- Deep space blues
- Warm walnut wood
- Glowing launch gold
- Energetic teal
- Soft glassmorphism
- Friendly astronaut character design

## Core Colors

```ts
export const colors = {
  cosmicBlack: '#050816',
  deepCanvas: '#060B14',
  midnightNavy: '#07114A',
  surface: '#0A1220',
  card: '#0E1520',
  deepIndigo: '#1426A8',
  electricBlue: '#315DFF',
  signalBlue: '#3B82F6',
  rocketTeal: '#10B7D6',
  signalTeal: '#4DC8C0',
  signalGreen: '#4ADE80',
  walnut: '#8B5327',
  walnutDark: '#5A3418',
  gold: '#F3B233',
  flame: '#FFD65A',
  warning: '#FF9B42',
  danger: '#FF5E5E',
  cloudWhite: '#F5F7FA',
  muted: '#6B7280',
  borderDefault: '#1E2D45',
  borderMedium: '#2A4060',
};
```

## Gradients

### Launch Gradient

```text
linear-gradient(135deg, #1426A8 0%, #10B7D6 100%)
```

### Premium Deck Gradient

```text
linear-gradient(135deg, #8B5327 0%, #F3B233 100%)
```

### Cosmic Glass Gradient

```text
linear-gradient(180deg, rgba(20,38,168,0.20), rgba(16,183,214,0.08))
```

## Typography

Canonical fonts (see also `DESIGN.md` at repo root):

- Headings: **Space Grotesk**
- Body: **Inter**
- Numbers / telemetry: **JetBrains Mono**

> The `web-prototype/` uses Syne, Instrument Sans, and DM Mono for its separate
> React + Vite simulator — do not treat those as the mobile app standard.

## Type Scale

```ts
export const typography = {
  display: 32,
  h1: 28,
  h2: 24,
  h3: 20,
  bodyLarge: 18,
  body: 16,
  bodySmall: 14,
  caption: 12,
  micro: 11,
};
```

Avoid text smaller than 12px except decorative labels.

## Core Components

### Button

Variants:

- primary
- secondary
- ghost
- premium
- danger
- locked

### Card

Variants:

- glass
- elevated
- premium
- warning
- success

### Badge

Variants:

- plan
- status
- fuel
- readiness
- signal
- locked

### FuelBadge

Shows:

- flame icon
- Fuel amount
- glow state
- warning state

### ProgressRing

Used for:

- Mission Readiness
- Blueprint progress
- Signal Deck readiness

### SignalBars

Three vertical bars used in Signal Deck.

States:

- 0/3 grey = not-loaded
- 2/3 orange = in-prep
- 3/3 green = flight-ready

### AstroAvatar

Props:

```ts
type AstroVariant = 'orb' | 'bust' | 'fullBody';
type Plan = 'cadet' | 'commander' | 'admiral';
```

Visual rules:

- Cadet: black belt
- Commander: silver belt
- Admiral: gold belt

Cadet should still look friendly and capable, not downgraded.

## Motion Rules

Use:

- Soft easing
- Gentle glow pulses
- Calm orbital transitions
- Smooth modal slides
- Small haptic hits for important moments

Avoid:

- Fast chaotic motion
- Overly bouncy effects
- Harsh flashing

## Signature Moments

### Fuel Earned

- Gold pulse
- Tiny flame burst
- Haptic feedback

### Milestone Complete

- Orbit ring animation
- Readiness ring fills slightly
- Calm success sound if sound is enabled

### Signal Ready

- SignalBars fill to green
- Tiny transmission shimmer

### Launch Day

- Starfield motion
- Rocket ignition glow
- Celebration card

## Accessibility

- Maintain strong text contrast
- Use 44px minimum tap targets
- Support larger text where possible
- Do not rely on color alone for status
- Add labels for all icon-only buttons
- Keep copy clear and anxiety-reducing
