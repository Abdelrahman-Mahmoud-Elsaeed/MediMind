---
name: Vibrant Professionalism
colors:
  surface: '#f8f9ff'
  surface-dim: '#cbdbf5'
  surface-bright: '#f8f9ff'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#eff4ff'
  surface-container: '#e5eeff'
  surface-container-high: '#dce9ff'
  surface-container-highest: '#d3e4fe'
  on-surface: '#0b1c30'
  on-surface-variant: '#3c4a43'
  inverse-surface: '#213145'
  inverse-on-surface: '#eaf1ff'
  outline: '#6c7a72'
  outline-variant: '#bbcac1'
  surface-tint: '#006c4e'
  primary: '#006c4e'
  on-primary: '#ffffff'
  primary-container: '#09bc8a'
  on-primary-container: '#004430'
  inverse-primary: '#4adea9'
  secondary: '#006c4e'
  on-secondary: '#ffffff'
  secondary-container: '#6bfbc4'
  on-secondary-container: '#007353'
  tertiary: '#005cbb'
  on-tertiary: '#ffffff'
  tertiary-container: '#72a6ff'
  on-tertiary-container: '#003a7a'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#6bfbc4'
  primary-fixed-dim: '#4adea9'
  on-primary-fixed: '#002115'
  on-primary-fixed-variant: '#00513a'
  secondary-fixed: '#6bfbc4'
  secondary-fixed-dim: '#4adea9'
  on-secondary-fixed: '#002115'
  on-secondary-fixed-variant: '#00513a'
  tertiary-fixed: '#d7e3ff'
  tertiary-fixed-dim: '#abc7ff'
  on-tertiary-fixed: '#001b3f'
  on-tertiary-fixed-variant: '#00458f'
  background: '#f8f9ff'
  on-background: '#0b1c30'
  surface-variant: '#d3e4fe'
typography:
  headline-lg:
    fontFamily: Manrope
    fontSize: 40px
    fontWeight: '800'
    lineHeight: 48px
    letterSpacing: -0.02em
  headline-lg-mobile:
    fontFamily: Manrope
    fontSize: 32px
    fontWeight: '800'
    lineHeight: 40px
    letterSpacing: -0.02em
  headline-md:
    fontFamily: Manrope
    fontSize: 24px
    fontWeight: '700'
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
  label-sm:
    fontFamily: JetBrains Mono
    fontSize: 12px
    fontWeight: '500'
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
  xl: 40px
  gutter: 24px
  margin-mobile: 16px
  margin-desktop: 48px
---

## Brand & Style

This design system is built on a foundation of **Corporate Modernism** with a high-energy technical edge. It targets professional environments that require both efficiency and a sense of forward-thinking momentum. The aesthetic is clean and systematic but avoids being sterile through the use of high-saturation accents and precise geometry.

The UI should evoke a sense of **reliability, speed, and clarity**. By leaning into a "Hyper-Functional" style, we use generous whitespace and rigorous alignment to ensure that the vibrant primary palette remains sophisticated rather than overwhelming.

## Colors

The color palette centers on a singular, powerful emerald green (#09bc8a) used for both primary and secondary actions to create a unified brand signature. The system uses a clean, cool-white background (#F8FAFB) to ensure maximum legibility and a contemporary "app" feel.

Semantic colors are highly saturated to ensure status updates are immediately recognizable. Light and dark variants of these colors should be derived by adjusting luminance while maintaining the base hue:
- **Surface roles:** Use a 10% opacity version of the base color on the background.
- **Bold roles:** Use a -15% luminance shift for hover and active states.
- **Contrast:** Always ensure white text on primary/success/info backgrounds meets WCAG AA standards.

## Typography

This design system utilizes a trio of typefaces to establish a clear information hierarchy. **Manrope** provides a modern, geometric feel for headlines, using tight letter spacing and heavy weights to command attention. **Inter** handles all body content, prioritized for its exceptional readability and neutral tone. For technical metadata, status labels, and code snippets, **JetBrains Mono** is used to inject a precise, developer-friendly aesthetic.

Scale headlines down by approximately 20% on mobile devices. Always prioritize line height (leading) over decorative spacing to ensure long-form text remains accessible.

## Layout & Spacing

The system follows a **12-column fluid grid** for desktop and a **4-column grid** for mobile. We utilize a strict 4px baseline grid to ensure vertical rhythm across all components.

- **Desktop (1440px+):** 48px side margins, 24px gutters.
- **Tablet (768px - 1439px):** 32px side margins, 20px gutters.
- **Mobile (Up to 767px):** 16px side margins, 16px gutters.

Spacing should be applied using the defined increments to maintain consistency. Use `lg` (24px) for most container padding and `sm` (8px) for internal element grouping.

## Elevation & Depth

We utilize **Tonal Layers** combined with **Low-contrast outlines** to define hierarchy. In this design system, shadows are used sparingly to avoid visual clutter.

- **Level 0 (Background):** #F8FAFB.
- **Level 1 (Cards/Surface):** White (#FFFFFF) with a 1px solid border in #E2E8F0. No shadow.
- **Level 2 (Dropdowns/Modals):** White (#FFFFFF) with a soft, diffused shadow: `0px 10px 15px -3px rgba(0, 0, 0, 0.05)`.
- **Interactions:** On hover, Level 1 elements should transition to a primary-colored subtle border (#09bc8a at 30% opacity) rather than increasing shadow depth.

## Shapes

The shape language is **Rounded**, utilizing an 8px (0.5rem) radius for standard components. This strikes a balance between the precision of the typography and a modern, approachable feel. 

- **Standard (Buttons, Inputs, Cards):** 8px (0.5rem)
- **Large (Modals, Large Containers):** 16px (1rem)
- **Small (Badges, Tags):** 4px (0.25rem) or fully pill-shaped for status indicators.

## Components

### Buttons
Primary buttons use the solid Primary color (#09bc8a) with white text. Secondary buttons use a primary-colored border with primary-colored text. All buttons should have a subtle 200ms transition on hover.

### Input Fields
Inputs feature a 1px border (#E2E8F0) and a 16px horizontal padding. On focus, the border shifts to Primary (#09bc8a) with a 2px outer glow (ring) at 20% opacity.

### Chips & Badges
Use the "Surface" semantic tokens (e.g., Success Surface for positive statuses). Text within chips should be the "Bold" version of the semantic color to ensure readability against the light background.

### Cards
Cards are flat with a 1px border. They should not use shadows unless they are part of a draggable interface or a temporary overlay. Use a 24px padding for internal card content.

### Lists
List items use a subtle divider (#F1F5F9). Interactive list items should feature a background color shift to #F1F5F9 on hover.