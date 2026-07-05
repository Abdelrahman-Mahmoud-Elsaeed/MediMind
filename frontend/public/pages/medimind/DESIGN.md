---
name: MediMind
colors:
  surface: '#111316'
  surface-dim: '#111316'
  surface-bright: '#37393d'
  surface-container-lowest: '#0c0e11'
  surface-container-low: '#1a1c1f'
  surface-container: '#1e2023'
  surface-container-high: '#282a2d'
  surface-container-highest: '#333538'
  on-surface: '#e2e2e6'
  on-surface-variant: '#c1c7d0'
  inverse-surface: '#e2e2e6'
  inverse-on-surface: '#2f3034'
  outline: '#8b919a'
  outline-variant: '#41474f'
  surface-tint: '#95ccff'
  primary: '#95ccff'
  on-primary: '#003352'
  primary-container: '#5c9bd1'
  on-primary-container: '#00314f'
  inverse-primary: '#166396'
  secondary: '#9fd588'
  on-secondary: '#0a3900'
  secondary-container: '#225113'
  on-secondary-container: '#8ec378'
  tertiary: '#fabb5e'
  on-tertiary: '#452b00'
  tertiary-container: '#c38b33'
  on-tertiary-container: '#422900'
  error: '#ffb4ab'
  on-error: '#690005'
  error-container: '#93000a'
  on-error-container: '#ffdad6'
  primary-fixed: '#cde5ff'
  primary-fixed-dim: '#95ccff'
  on-primary-fixed: '#001d32'
  on-primary-fixed-variant: '#004a75'
  secondary-fixed: '#baf2a1'
  secondary-fixed-dim: '#9fd588'
  on-secondary-fixed: '#042100'
  on-secondary-fixed-variant: '#225113'
  tertiary-fixed: '#ffddb3'
  tertiary-fixed-dim: '#fabb5e'
  on-tertiary-fixed: '#291800'
  on-tertiary-fixed-variant: '#624000'
  background: '#111316'
  on-background: '#e2e2e6'
  surface-variant: '#333538'
typography:
  display-lg:
    fontFamily: Manrope
    fontSize: 48px
    fontWeight: '700'
    lineHeight: 56px
    letterSpacing: -0.02em
  headline-lg:
    fontFamily: Manrope
    fontSize: 32px
    fontWeight: '600'
    lineHeight: 40px
  headline-lg-mobile:
    fontFamily: Manrope
    fontSize: 28px
    fontWeight: '600'
    lineHeight: 36px
  headline-md:
    fontFamily: Manrope
    fontSize: 24px
    fontWeight: '600'
    lineHeight: 32px
  body-lg:
    fontFamily: Inter
    fontSize: 18px
    fontWeight: '400'
    lineHeight: 28px
  body-md:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
  label-md:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '500'
    lineHeight: 20px
    letterSpacing: 0.01em
  label-sm:
    fontFamily: Inter
    fontSize: 12px
    fontWeight: '600'
    lineHeight: 16px
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  unit: 8px
  container-max: 1280px
  gutter: 24px
  margin-mobile: 16px
  margin-desktop: 40px
---

## Brand & Style

The design system embodies a "Precision Care" philosophy, merging technical clinical reliability with organic, human-centered wellness. It targets healthcare professionals and patients who require clarity, speed, and a sense of calm in high-stakes environments. 

The aesthetic is **Corporate Modern with subtle Glassmorphic accents**. This approach utilizes deep, monochromatic backgrounds paired with vibrant, extracted primary colors to create a "luminous" effect. The visual language is defined by high legibility, generous whitespace, and soft, approachable geometry that mirrors the leaf and heart motifs of the logo.

## Colors

The palette is anchored in a sophisticated dark mode foundation to reduce ocular strain during extended use. 

- **Primary (Mind Blue):** Extracted from the heart logo, used for primary actions, progress indicators, and core branding.
- **Secondary (Vital Green):** Extracted from the leaf motif, signifying health, growth, and "normal" status indicators.
- **Neutral:** A range of deep charcoals and slate grays that provide high-contrast support for text while maintaining a premium feel.
- **Surface Strategy:** Layers are defined by increasing luminosity. Higher-order elements (modals, popovers) use a lighter slate than the base background.

## Typography

The typographic system prioritizes clinical legibility. **Manrope** is used for headlines to provide a modern, balanced, and trustworthy personality. **Inter** is utilized for all body and UI labels due to its exceptional performance on screens and its highly distinguishable letterforms, which are critical for medical data.

- **Scale:** A modular scale is employed to ensure clear hierarchy in data-heavy views.
- **Emphasis:** Semi-bold and Bold weights are reserved for critical headings and primary CTA labels.
- **Accessibility:** All body text maintains a minimum contrast ratio of 7:1 against background surfaces.

## Layout & Spacing

The system uses a **Fluid-Responsive Grid** based on an 8px base unit. This ensures all components align perfectly regardless of screen size.

- **Desktop:** 12-column grid with a 1280px max-width. Large 40px margins provide "breathing room" to reduce cognitive load.
- **Tablet:** 8-column grid with 24px margins.
- **Mobile:** 4-column grid with 16px margins.
- **Density:** High-density views (patient lists, vitals dashboards) utilize 4px and 8px spacing, while informational landing pages utilize 24px and 32px increments to feel more approachable.

## Elevation & Depth

Depth is established through **Tonal Layering** and **Subtle Glassmorphism** rather than heavy shadows.

- **Level 0 (Background):** The darkest neutral hex, providing the base canvas.
- **Level 1 (Cards/Containers):** A slightly lighter surface with a 1px low-opacity border (#FFFFFF08) to define edges.
- **Level 2 (Modals/Overlays):** Utilizes a backdrop-blur (12px to 20px) and a semi-transparent surface fill. This creates a "frosted" look that keeps the user grounded in their previous context.
- **Shadows:** When used, shadows are highly diffused (24px+ blur) with a tint of the Primary Blue to simulate a soft ambient glow.

## Shapes

The shape language is **Rounded (Level 2)**, mirroring the soft curves of the heart and leaf in the logo. 

- **Components:** Standard buttons and input fields use a 0.5rem (8px) radius.
- **Large Elements:** Primary cards and containers use 1rem (16px) or 1.5rem (24px) for a modern, friendly appearance.
- **Status Pills:** Use a full "Pill" radius to distinguish them from interactive buttons.

## Components

- **Buttons:** Primary buttons use a solid gradient of the Primary Blue. Secondary buttons use a ghost style with a 1px border. All interactive states feature a subtle glow on hover.
- **Inputs:** Dark surfaces with a subtle inner-shadow and a 1px border that glows Primary Blue when focused.
- **Chips/Badges:** Small, pill-shaped indicators. For "Health Status," they use the Secondary Green with a 10% opacity background fill and 100% opacity text.
- **Cards:** Essential for patient data. Cards feature a subtle 1px border and an 8px corner radius. Headlines within cards are always semi-bold Manrope.
- **Vitals Dashboard:** A specialized component set including sparklines (using Secondary Green) and large numeric displays (using Manrope Bold) for immediate recognition of patient metrics.
- **Navigation:** A sidebar navigation with blurred background and Primary Blue active state indicators.