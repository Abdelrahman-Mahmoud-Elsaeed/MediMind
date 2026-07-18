---
name: Deep Tech Interface
colors:
  surface: '#111319'
  surface-dim: '#111319'
  surface-bright: '#373940'
  surface-container-lowest: '#0c0e14'
  surface-container-low: '#191b22'
  surface-container: '#1d1f26'
  surface-container-high: '#282a30'
  surface-container-highest: '#33343b'
  on-surface: '#e2e2eb'
  on-surface-variant: '#bbcac0'
  inverse-surface: '#e2e2eb'
  inverse-on-surface: '#2e3037'
  outline: '#86948b'
  outline-variant: '#3c4a43'
  surface-tint: '#4adea9'
  primary: '#6cfbc4'
  on-primary: '#003827'
  primary-container: '#4adea9'
  on-primary-container: '#005e43'
  inverse-primary: '#006c4d'
  secondary: '#4adea9'
  on-secondary: '#003827'
  secondary-container: '#00b987'
  on-secondary-container: '#00422e'
  tertiary: '#d7e3ff'
  on-tertiary: '#0e305e'
  tertiary-container: '#abc7ff'
  on-tertiary-container: '#365283'
  error: '#ffb4ab'
  on-error: '#690005'
  error-container: '#93000a'
  on-error-container: '#ffdad6'
  primary-fixed: '#6cfbc4'
  primary-fixed-dim: '#4adea9'
  on-primary-fixed: '#002115'
  on-primary-fixed-variant: '#005139'
  secondary-fixed: '#6cfbc4'
  secondary-fixed-dim: '#4adea9'
  on-secondary-fixed: '#002115'
  on-secondary-fixed-variant: '#005139'
  tertiary-fixed: '#d7e2ff'
  tertiary-fixed-dim: '#abc7ff'
  on-tertiary-fixed: '#001b3f'
  on-tertiary-fixed-variant: '#294676'
  background: '#111319'
  on-background: '#e2e2eb'
  surface-variant: '#33343b'
typography:
  headline-xl:
    fontFamily: Manrope
    fontSize: 40px
    fontWeight: '700'
    lineHeight: 48px
    letterSpacing: -0.02em
  headline-xl-mobile:
    fontFamily: Manrope
    fontSize: 32px
    fontWeight: '700'
    lineHeight: 40px
    letterSpacing: -0.02em
  headline-lg:
    fontFamily: Manrope
    fontSize: 32px
    fontWeight: '600'
    lineHeight: 40px
    letterSpacing: -0.01em
  headline-md:
    fontFamily: Manrope
    fontSize: 24px
    fontWeight: '600'
    lineHeight: 32px
  body-md:
    fontFamily: Manrope
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
  label-md:
    fontFamily: Manrope
    fontSize: 12px
    fontWeight: '600'
    lineHeight: 16px
    letterSpacing: 0.05em
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  base: 4px
  xs: 4px
  sm: 8px
  md: 16px
  lg: 24px
  xl: 32px
  xxl: 48px
---

## Brand & Style
This design system is built upon a **Minimalist-High-Tech** aesthetic, specifically tailored for developer tools, SaaS platforms, and data-intensive environments. The brand personality is precise, focused, and systematic.

The style leverages a "Deep Canvas" approach—using a dark mode default with a sophisticated range of charcoal and obsidian tones to create a sense of infinite depth. By combining clean **Minimalism** with subtle **Glassmorphism**, the interface prioritizes content clarity and reduced cognitive load. Visual hierarchy is established through tonal shifts rather than heavy borders, resulting in a professional and trustworthy environment that feels both cutting-edge and dependable.

## Colors
The palette is centered on a high-contrast dark mode foundation. The primary **Mint Green** (#4adea9) serves as a high-visibility signal color for actions and "active" states, while the **Soft Blue** tertiary color is reserved for informational highlights or secondary accents.

The background system utilizes a tiered surface approach. Instead of true black, it uses a deep slate (#111319) to reduce eye strain. Components should be placed on their respective container levels (Lowest to Highest) to indicate z-index importance. The `outline` and `outline-variant` colors are critical for defining structure without overwhelming the user with heavy contrast.

## Typography
This design system utilizes **Manrope** exclusively to maintain a modern, geometric, and highly legible interface. 

Headlines utilize tighter letter-spacing and heavier weights to create an authoritative presence. The `label-md` role is intended for small metadata, overlines, or button text; it should be used sparingly in all-caps to ensure clear distinction from body text. For mobile displays, `headline-xl` should scale down to 32px to ensure word-wrapping remains readable on narrow viewports.

## Layout & Spacing
The system follows a strict 4px/8px baseline grid. All spacing between elements should be a multiple of the `base` unit. 

The layout uses a **Fluid Grid** model. On desktop, a 12-column grid provides maximum flexibility for complex dashboards. On mobile, the system collapses to a 4-column grid. Internal padding for cards and containers should default to `md` (16px) for standard density or `lg` (24px) for more spacious, marketing-led layouts.

## Elevation & Depth
Elevation is primarily expressed through **Tonal Layering**. Objects do not use traditional drop shadows unless they are floating overlays (like dropdown menus or modals). 

- **Level 0 (Base):** `surface-container-lowest`.
- **Level 1 (Cards/Sections):** `surface-container`.
- **Level 2 (Active/Hover):** `surface-container-high`.
- **Level 3 (Modals/Popovers):** `surface-container-highest` with a 10% opacity white `outline-variant` and a soft, deep ambient shadow (32px blur, 20% opacity black).

For a high-tech feel, use `surface-bright` as a thin 1px top-border on cards to simulate a light source from above.

## Shapes
The design system employs a **Rounded** shape language to balance the technical nature of the typography and colors. 

Standard components (inputs, buttons, cards) use a 0.5rem (8px) radius. Larger layout containers or prominent feature cards should scale to `rounded-xl` (1.5rem/24px) to create a distinct visual "nesting" effect where outer containers are more rounded than inner elements.

## Components
- **Buttons:** Primary buttons use `primary` fill with `on-primary` text. Secondary buttons use an `outline` border with `primary` text. Ensure a 48px minimum hit target.
- **Input Fields:** Use `surface-container-low` for the background and `outline-variant` for the border. On focus, the border transitions to `primary`.
- **Chips:** Small, 8px rounded elements using `surface-container-high` and `label-md` typography.
- **Cards:** Default to `surface-container` with no border. Use `on-surface` for primary headings and `on-surface-variant` for secondary descriptions.
- **Lists:** Items should be separated by a 1px border using `outline-variant`. Use `md` spacing for vertical padding within list items.
- **Status Indicators:** Use `primary` for "success/active", `tertiary` for "info", and the `inverse-surface` for high-priority alerts.