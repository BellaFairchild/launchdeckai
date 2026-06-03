---
name: LaunchDeckAI
description: Calm mission control with handcrafted warmth, for first-time app launchers.
colors:
  cosmic-black: "#050816"
  bg-deep: "#060B14"
  midnight-navy: "#07114A"
  bg-surface: "#0A1220"
  bg-card: "#0E1520"
  bg-depleted: "#0D1630"
  border-default: "#1E2D45"
  border-med: "#2A4060"
  deep-indigo: "#1426A8"
  electric-blue: "#315DFF"
  brand-blue: "#3B82F6"
  brand-blue-light: "#60A5FA"
  rocket-teal: "#10B7D6"
  brand-teal: "#4DC8C0"
  brand-teal-light: "#7DDBD6"
  brand-teal-dark: "#2BA8A2"
  walnut: "#8B5327"
  walnut-dark: "#5A3418"
  brand-gold: "#F3B233"
  brand-flame: "#FFD65A"
  status-success: "#4ADE80"
  status-warning: "#FF9B42"
  status-error: "#FF5E5E"
  text-primary: "#F5F7FA"
  text-secondary: "#94A3B8"
  text-tertiary: "#64748B"
  text-muted: "#6B7280"
typography:
  display:
    fontFamily: "SpaceGrotesk, system-ui, sans-serif"
    fontSize: "32px"
    fontWeight: 700
    lineHeight: 1.1
    letterSpacing: "-0.01em"
  headline:
    fontFamily: "SpaceGrotesk, system-ui, sans-serif"
    fontSize: "28px"
    fontWeight: 700
    lineHeight: 1.15
  title:
    fontFamily: "SpaceGrotesk, system-ui, sans-serif"
    fontSize: "20px"
    fontWeight: 600
    lineHeight: 1.25
  body:
    fontFamily: "Inter, system-ui, sans-serif"
    fontSize: "16px"
    fontWeight: 400
    lineHeight: 1.5
  label:
    fontFamily: "Inter, system-ui, sans-serif"
    fontSize: "12px"
    fontWeight: 600
    lineHeight: 1.3
    letterSpacing: "0.02em"
  mono:
    fontFamily: "JetBrainsMono, ui-monospace, monospace"
    fontSize: "16px"
    fontWeight: 500
    lineHeight: 1.2
rounded:
  sm: "8px"
  md: "12px"
  lg: "16px"
  xl: "24px"
  pill: "9999px"
spacing:
  xs: "4px"
  sm: "8px"
  md: "12px"
  lg: "16px"
  xl: "20px"
  "2xl": "24px"
  "3xl": "32px"
  "4xl": "40px"
  "5xl": "48px"
components:
  button-primary:
    backgroundColor: "{colors.deep-indigo}"
    textColor: "#FFFFFF"
    rounded: "{rounded.pill}"
    padding: "12px 20px"
  button-secondary:
    backgroundColor: "{colors.bg-surface}"
    textColor: "{colors.text-primary}"
    rounded: "{rounded.pill}"
    padding: "12px 20px"
  button-ghost:
    backgroundColor: "transparent"
    textColor: "{colors.brand-teal}"
    rounded: "{rounded.pill}"
    padding: "12px 20px"
  button-premium:
    backgroundColor: "{colors.walnut}"
    textColor: "{colors.bg-deep}"
    rounded: "{rounded.pill}"
    padding: "12px 20px"
  button-locked:
    backgroundColor: "{colors.bg-depleted}"
    textColor: "{colors.text-tertiary}"
    rounded: "{rounded.pill}"
    padding: "12px 20px"
  card-glass:
    backgroundColor: "{colors.bg-card}"
    textColor: "{colors.text-primary}"
    rounded: "{rounded.xl}"
    padding: "16px"
  card-premium:
    backgroundColor: "{colors.walnut-dark}"
    textColor: "{colors.text-primary}"
    rounded: "{rounded.xl}"
    padding: "16px"
---

# Design System: LaunchDeckAI

## 1. Overview

**Creative North Star: "Calm Mission Control with Handcrafted Warmth"**

LaunchDeckAI is a flight deck at night, not a cockpit in a crisis. The surface is deep cosmic space, almost black but tinted toward indigo, and the interface floats on it as a small set of lit, rounded panels. Light is the primary material: a gradient warms the top edge of every card, a teal glow sits under the primary action, a gold pulse marks a reward earned. Nothing is flat-white or pure-black. Everything is tinted toward the brand hue so the screen feels like a warm instrument panel rather than a spreadsheet. The handcrafted warmth comes from walnut and gold, the human counterweight to all the blue: the wood-and-brass of a well-made console.

The audience is a first-time app creator who is quietly scared of missing something. So the system is engineered to lower the heart rate. Density is low, breathing room is generous, and the most important thing on any screen is the one next move, not a wall of metrics. Motion is calm and orbital: glow pulses, gentle slides, a readiness ring filling slightly. The four signature moments (Fuel earned, milestone complete, signal ready, launch day) are where craft and delight concentrate; everything between them stays quiet so those moments land.

This system explicitly rejects two things. It is **not a sterile checklist tool**: progress reads as momentum on a mission, carried by Astro, the readiness ring, fuel, and signal bars, never as plain checkboxes with no character. And it is **not a corporate SaaS dashboard**: no flat gray cards, no dense data tables, no enterprise-cool detachment, no big-number hero-metric template. It also avoids the two reflex traps for this category: childish gamification (cartoon mascots, candy colors, confetti spam) and the generic dark crypto/AI look (neon-on-black, purple gradients, glowing grid lines).

**Key Characteristics:**
- Deep, indigo-tinted dark space as the canvas; light and glow as the primary material.
- Cool blue/teal for structure and signal, warm walnut/gold for reward and humanity.
- Low density, one clear next move per screen, anxiety reduction as a design requirement.
- Soft pill buttons and large-radius glass panels; nothing sharp, nothing flat.
- Calm orbital motion punctuated by four earned, high-craft signature moments.

## 2. Colors

A deep, indigo-tinted space palette where cool blues and teals carry structure and signal, and warm walnut and gold carry reward and humanity.

### Primary
- **Rocket Teal** (#10B7D6): The energetic anchor and primary glow. Drives the launch gradient (paired with Deep Indigo), the shadow under the primary button, and active signal/teal states. This is the color of forward motion.
- **Deep Indigo** (#1426A8): The deep end of the launch gradient and primary fills. Grounds the teal so the action feels weighted, not weightless.
- **Electric Blue** (#315DFF) / **Brand Blue** (#3B82F6): Interactive blues for links, focus, and the pre-launch signal phase. Brand Blue Light (#60A5FA) for hovered/secondary emphasis.

### Secondary
- **Brand Gold** (#F3B233): The reward color. Premium plans, the Fuel economy, the "milestone complete" pulse. Used sparingly so it stays special, never as decoration.
- **Brand Flame** (#FFD65A): The lighter top of the premium gradient and the flame/Fuel glow accent.
- **Walnut** (#8B5327) / **Walnut Dark** (#5A3418): The handcrafted warmth. The deep end of the premium gradient and the warm base of premium card surfaces; the wood-and-brass counterweight to the cool field.

### Tertiary
- **Brand Teal Variants** (#4DC8C0 launch-signal, #7DDBD6 light, #2BA8A2 dark): The teal family used across SignalBars, ghost-button text, and the launch-phase signal color.

### Status (never color-alone)
- **Success** (#4ADE80): Flight-ready, completed, post-launch signal phase.
- **Warning** (#FF9B42): In-prep, caution, low fuel.
- **Error** (#FF5E5E): Blocked, failed, destructive. Also the danger button gradient.

### Neutral (surfaces, borders, text)
- **Cosmic Black** (#050816) / **BG Deep** (#060B14): The deepest space; root background. Indigo-tinted, never pure black.
- **BG Surface** (#0A1220) / **BG Card** (#0E1520) / **BG Depleted** (#0D1630): The layered panel surfaces; depleted is the dimmed/locked state.
- **Border Default** (#1E2D45) / **Border Med** (#2A4060): Quiet structural strokes; medium for slightly lifted panels.
- **Text Primary** (#F5F7FA) cloud-white, **Secondary** (#94A3B8), **Tertiary** (#64748B), **Muted** (#6B7280): The text ladder, never pure #fff.

### Named Rules
**The Tinted-Neutral Rule.** Pure #000 and #fff are forbidden. Every background is tinted toward indigo (#050816, not #000000) and every "white" is cloud-white (#F5F7FA). The screen should feel like a warm instrument, not a printout.

**The Gold-Is-Rare Rule.** Gold and flame are the reward currency. They appear on premium surfaces and the earned signature moments, never as a default accent or a decorative gradient. Spend gold like Fuel.

## 3. Typography

**Display Font:** Space Grotesk (with system-ui, sans-serif fallback)
**Body Font:** Inter (with system-ui, sans-serif fallback)
**Numeric / Console Font:** JetBrains Mono (with ui-monospace fallback)

**Character:** Space Grotesk gives headings a precise, slightly technical confidence: instrument labels on a well-made console, not a startup wordmark. Inter keeps body text calm, neutral, and effortlessly legible for anxious late-night reading. JetBrains Mono is reserved for numbers that should read as telemetry: Fuel counts, readiness scores, countdowns.

### Hierarchy
- **Display** (Space Grotesk 700, 32px, line-height 1.1, -0.01em): Screen-defining moments only. Launch day, hero headers.
- **Headline** (Space Grotesk 700, 28px, line-height 1.15): Primary screen titles (h1).
- **Title** (Space Grotesk 600/700, 24px / 20px): Section and card headings (h2 / h3).
- **Body** (Inter 400, 16px, line-height 1.5): Default reading text. Keep measure at 65–75ch where layout allows.
- **Body Small** (Inter 400, 14px): Secondary descriptions, helper text.
- **Label** (Inter 600, 12px, +0.02em): Badges, captions, status chips. Floor for legible text at 12px; below that is decorative only.
- **Mono** (JetBrains Mono 500): Numeric telemetry: Fuel, readiness %, counts, countdowns.

### Named Rules
**The Telemetry Rule.** Numbers that represent state (Fuel, readiness, signal counts, countdowns) are set in JetBrains Mono. Numbers that are just words (a sentence with a quantity) stay in Inter. Mono signals "this is a live instrument reading."

**The Scale-Step Rule.** Hierarchy comes from the documented scale (32 / 28 / 24 / 20 / 18 / 16 / 14 / 12 / 11) with weight contrast, never from squeezing in arbitrary sizes. Steps stay ≥1.25 apart so hierarchy is felt, not measured.

## 4. Elevation

This system conveys depth through **glowing tonal layering, not neutral drop shadows**. Every surface is a panel of light floating on deep space. Two devices do the work together: (1) a subtle top-to-bottom surface gradient on each card, lighter at the top edge as if lit from above, fading into the deep; plus a 1px `rgba(255,255,255,0.07)` lit top edge that reads as a catch of light on the panel's lip. (2) A soft, often colored glow beneath the panel or control. Structural panels glow near-black for quiet depth; reward and status surfaces glow in their own hue (gold for premium, orange for warning, green for success). The glow is the elevation.

### Shadow Vocabulary
- **Panel depth** (`box-shadow: 0 8px 16px rgba(1,4,10,0.5)`): Default glass card; quiet near-black diffusion.
- **Lifted depth** (`box-shadow: 0 12px 22px rgba(1,4,10,0.6)`): Elevated cards that sit above the field.
- **Primary action glow** (`box-shadow: 0 6px 16px rgba(16,183,214,0.45)`): Teal glow under the primary button. The action literally radiates.
- **Premium glow** (`box-shadow: 0 10px 20px rgba(243,178,51,0.22)`): Gold halo on premium surfaces and the premium button.
- **Status glow** (warning `rgba(255,155,66,0.18)`, success `rgba(74,222,128,0.16)`): Hue-matched soft halos on status cards.

### Named Rules
**The Glow-Is-Elevation Rule.** Depth is built from a lit top edge plus a soft (often colored) glow beneath, never a hard gray drop shadow. If a surface looks like it has a flat 2014-era box-shadow, the glow is too dark and too tight: widen the radius and tint it toward the surface's own hue.

## 5. Components

### Buttons
- **Shape:** Full pill (`border-radius: 9999px`), minimum height 44px, sizes sm/md/lg (`12px 20px` at md). Always a single confident pill, never a square chip.
- **Primary:** The launch gradient (Deep Indigo #1426A8 to Rocket Teal #10B7D6, diagonal) with white label and a teal glow beneath. The one "go" action per screen.
- **Premium:** The premium gradient (Walnut #8B5327 to Gold #F3B233, diagonal) with dark (#060B14) label and a gold glow. Reserved for upgrade/Refuel.
- **Secondary:** BG Surface fill, Border Med stroke, primary text. The quiet alternative.
- **Ghost:** Transparent with teal (#4DC8C0) label. Lowest-emphasis text action.
- **Danger:** Red gradient (#FF7A6E to #E2453F), white label. Destructive only.
- **Locked:** BG Depleted fill, dimmed, with a leading lock glyph and tertiary text. Communicates a gated feature without scolding.
- **Behavior:** A trailing arrow in the label string is auto-rendered as a real arrow-right icon. Press feedback is `active:opacity-90` (or 0.70 for ghost), no scale bounce.

### Cards / Containers
- **Corner Style:** Large, soft (`border-radius: 24px`, `rounded-3xl`). The signature soft panel.
- **Background:** A subtle top-to-bottom surface gradient per variant (glass #15233B to #0B1220; premium warm walnut #241A11 to #0F1018) plus the 1px lit top edge.
- **Border:** Always a full 1px stroke. Glass uses Border Default, elevated uses Border Med, premium/warning/success use a 45%-opacity tint of their hue. Side-stripe borders are forbidden.
- **Shadow Strategy:** Per the Elevation section: near-black glow for glass/elevated, hue-matched glow for premium/warning/success.
- **Internal Padding:** 16px default. Nested cards are forbidden.

### Inputs / Fields
- **Style:** BG Surface fill, Border Default 1px stroke, medium radius (12px), primary text on a `text-muted` (#6B7280) placeholder.
- **Focus:** Border shifts to Rocket Teal with a soft teal glow, matching the primary action language. No hard outline.
- **Error:** Border and helper text shift to Error (#FF5E5E), always paired with a message, never color-alone.

### Navigation
- **Style:** Bottom tab bar over the cosmic field with the StarryNight backdrop. Active tab uses brand teal with its icon filled; inactive uses text-tertiary. Labels in Inter label style. Astro lives as an always-available Copilot Orb above the tabs.

### Signature Components
- **ProgressRing:** Circular readiness/progress indicator (Mission readiness, Blueprint, Signal Deck). Fills with the launch gradient; the "fills slightly" animation is a signature moment.
- **SignalBars:** Three vertical bars. 0/3 grey (not-loaded), 2/3 orange (in-prep), 3/3 green (flight-ready). Count plus color, never color alone.
- **FuelBadge / FuelGauge:** Flame glyph plus mono Fuel amount with a gold glow and warning state. The Fuel economy made visible.
- **AstroAvatar:** orb / bust / fullBody variants across cadet (black belt) / commander (silver) / admiral (gold). Cadet stays friendly and capable, never downgraded-looking.

## 6. Do's and Don'ts

### Do:
- **Do** tint every neutral toward indigo: backgrounds anchor on #050816 / #060B14, "white" is cloud-white #F5F7FA. Pure #000 and #fff are banned.
- **Do** build depth from a lit top edge (1px `rgba(255,255,255,0.07)`) plus a soft, hue-matched glow beneath. The glow is the elevation.
- **Do** keep buttons as full pills with a 44px minimum height and reserve the teal-glow primary for the single most important action on a screen.
- **Do** set live numeric state (Fuel, readiness %, counts, countdowns) in JetBrains Mono so it reads as telemetry.
- **Do** pair every status with an icon, label, or shape (SignalBars count, readiness ring, fuel glyph). Never rely on color alone.
- **Do** honor reduced motion: degrade the starfield, orbital transitions, and glow pulses to calm static or cross-fade equivalents.
- **Do** concentrate craft on the four signature moments (Fuel earned, milestone complete, signal ready, launch day) and keep everything between them quiet.
- **Do** show one clear next move per screen. Reduce density to reduce anxiety.

### Don't:
- **Don't** build a **sterile checklist tool**: no plain checkbox lists stripped of Astro, the readiness ring, Fuel, or the launch-world metaphor. Progress must feel like momentum on a mission.
- **Don't** build a **corporate SaaS dashboard**: no flat gray cards, no dense data tables, no enterprise-cool detachment, and no big-number-plus-stat-row hero-metric template.
- **Don't** drift into childish gamification: no cartoon mascots, candy colors, or confetti spam. Astro is calm and capable, not a Duolingo owl.
- **Don't** fall into the generic dark crypto/AI reflex: no neon-on-black, no purple gradients, no glowing grid lines.
- **Don't** use a `border-left` / `border-right` greater than 1px as a colored accent stripe. Cards always take a full 1px border.
- **Don't** use gradient text (`background-clip: text`). Emphasis comes from weight, size, and the solid brand colors.
- **Don't** nest cards inside cards, and don't wrap everything in a container. Most content sits directly on the field.
- **Don't** use hard gray drop shadows or bouncy/elastic motion. Glow-as-elevation and calm ease-out only.
