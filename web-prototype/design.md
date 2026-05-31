# Antigravity Design System Documentation

An overview of the visual identity, UI components, typography, layout structures, and animated feedback systems powering the Antigravity application.

---

## 🌌 1. Design Philosophy

The Antigravity interface is crafted to evoke the feeling of a premium, high-integrity tactical space-ship dashboard. It prioritizes data-rich yet spacious and highly functional micro-layouts, keeping sensory distractions low to enable high focus.

- **Atmospheric Depth**: Immersive dark modes utilizing layering of translucent card panels on top of multi-dimensional starry backgrounds instead of flat monochromatic surfaces.
- **Micro-Animations & Starry Elements**: Gentle ambient motion that makes the screen feel alive—including orbital drifts, twinkling stellar elements, and soft color shifts mimicking interstellar nebula dust.
- **Architectural Honesty**: Clean typography with zero telemetry slop or unprompted mock logs. Labels remain completely direct, readable, and human-oriented.

---

## 🎨 2. Color Palettes & Color Spaces

The theme relies on high-contrast cosmic variables defining structural hierarchies through dark slate values paired with brilliant cyan-teal or golden-yellow accents.

| Variable Name | Hex Value | Purpose |
| :--- | :--- | :--- |
| **`--color-bg-deep`** | `#060B14` | The foundational dark space void background |
| **`--color-bg-surface`** | `#0A1220` | Secondary surface backdrop layer |
| **`--color-bg-card`** | `#0E1520` | Translucent primary panel container background |
| **`--color-bg-depleted`** | `#0D1630` | Faint blue-tinted container states |
| **`--color-border-default`**| `#1E2D45` | Subtle grid lines and panel outlines |
| **`--color-border-med`** | `#2A4060` | High-emphasis interactive separators |
| **`--color-brand-teal`** | `#4DC8C0` | Primary digital accent color |
| **`--color-brand-blue`** | `#3B82F6` | Depth gradient indicator & secondary action cues |
| **`--color-brand-gold`** | `#F3B233` | Special mission and level items emphasis |
| **`--color-text-primary`** | `#F1F5F9` | Title, numeric data, and main headings |
| **`--color-text-secondary`**| `#94A3B8` | Subheadings, standard descriptions, and body text |
| **`--color-text-tertiary`** | `#64748B` | Minimal captions, tags, and small metadata |

---

## ✍️ 3. Typography & Font Strategy

Antigravity leverages three tailored font systems to maximize visual rhythm, pairing robust technological tracking with editorial headings.

- **Display Header Family (`"Syne"`, `sans-serif`)**:
  - Imparts a futuristic, wide, premium weight.
  - Used strictly for prime title headers, telemetry level headings, and splash screens.
- **Body & Text Family (`"Instrument Sans"`, `sans-serif`)**:
  - A highly legible, contemporary variable sans-serif.
  - Controls standard lists, description fields, action menus, and contextual modals.
- **Monospace Family (`"DM Mono"`, `monospace`)**:
  - Provides a technical, structured, telemetry-inspired voice.
  - Applied specifically to indicators, mission timers, counts, statistics, status nodes, and dynamic variables.

---

## 🔳 4. Layout Architecture

A modular, viewport-aware layout constraints standard layouts to avoid stretching on ultra-wide screens while ensuring 44px minimum touch sizes everywhere on mobile.

```
+---------------------------------------------+
|               Top Bar / Title               |
+---------------------------------------------+
|                                             |
|               Glass Canvas                  |
|                                             |
+---------------------------------------------+
|                 Main Content                |
+---------------------------------------------+
|  [🏠 Profile]  [✨ Orb (Copilot)]  [⚙️ Set]  v
+---------------------------------------------+
```

### Translucent Glass Layers
- **Glass Card (`.glass-card`)**: Styled with borders matching `#1E2D45` and a rounded bezel radius of `1.5rem` (`rounded-3xl`), anchoring lists or status blocks securely.
- **Glass Card with Blur Backdrop (`.glass-card-blur`)**: Infuses a `backdrop-filter: blur(16px)` layer allowing floating starry patterns behind modules to peek through organically.

---

## ✨ 5. Micro-Animations & Dynamic Motion

Transitions and micro-actions guide attention smoothly, giving instant tactile response.

### Orbital Drift Components
Floating background space vectors are styled with varying translation paths to simulate natural space dust drift:
- `drift-a`: Drifts clockwise across a mild rectangular pattern.
- `drift-b`: Sways counter-clockwise diagonally.
- `drift-c`: Ascends vertical patterns slowly.
- `drift-d`: Moves through simple horizontal paths.

### Stellar Twinkling Elements
- Custom twinkling keyframes scale and modulate element opacities between standard low-glow limits (`0.3` opacity) and high-sheen states (`0.9` opacity) mimicking genuine stellar bodies.
- Embedded as design accents in the primary interactive interactive **Middle Navigation Orb**, creating immediate parallax feedback on user gaze.

---

## 🎛️ 6. Core Navigation: The Central Orb & Drawer

### Interactive Central Orb
Designed as the primary anchor point in the main bottom navigation bar:
- Styled with a core gradient flowing from `#4DC8C0` to `#7DDBD6`.
- Surrendered by multiple layered ambient blur circles, glowing pulsars, and three independent offset starry particles animating asynchronously.
- Features hover scalability, immediate micro-touch feedback on taps (`active:scale-95`), and a transitioning custom `Sparkles` indicator.

### Slidout Navigation Panel (Drawer)
Triggered via top action menus to overlay options cleanly:
- Integrates standard literal iconography (`User`, `Fuel`, `LayoutTemplate`, `LifeBuoy`, `Settings`).
- Highlights active routes utilizing flat background states without complicating the viewport hierarchy.
