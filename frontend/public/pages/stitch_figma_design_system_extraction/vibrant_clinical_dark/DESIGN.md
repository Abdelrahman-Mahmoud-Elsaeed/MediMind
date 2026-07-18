---
name: Vibrant Clinical Dark
colors:
  surface: '#0e1511'
  surface-dim: '#0e1511'
  surface-bright: '#333b37'
  surface-container-lowest: '#09100c'
  surface-container-low: '#161d19'
  surface-container: '#1a211d'
  surface-container-high: '#242c28'
  surface-container-highest: '#2f3632'
  on-surface: '#dde4de'
  on-surface-variant: '#bbcac0'
  inverse-surface: '#dde4de'
  inverse-on-surface: '#2b322e'
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
  background: '#0e1511'
  on-background: '#dde4de'
  surface-variant: '#2f3632'
typography:
  display-lg:
    fontFamily: Manrope
    fontSize: 57px
    fontWeight: '700'
    lineHeight: 64px
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
    fontSize: 28px
    fontWeight: '600'
    lineHeight: 36px
  title-lg:
    fontFamily: Manrope
    fontSize: 22px
    fontWeight: '500'
    lineHeight: 28px
  title-md:
    fontFamily: Manrope
    fontSize: 16px
    fontWeight: '500'
    lineHeight: 24px
    letterSpacing: 0.15px
  body-lg:
    fontFamily: Manrope
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
    letterSpacing: 0.5px
  body-md:
    fontFamily: Manrope
    fontSize: 14px
    fontWeight: '400'
    lineHeight: 20px
    letterSpacing: 0.25px
  label-lg:
    fontFamily: Manrope
    fontSize: 14px
    fontWeight: '500'
    lineHeight: 20px
    letterSpacing: 0.1px
  label-md:
    fontFamily: Manrope
    fontSize: 12px
    fontWeight: '500'
    lineHeight: 16px
    letterSpacing: 0.5px
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
  2xl: 48px
  3xl: 64px
  gutter: 24px
  margin-mobile: 16px
  margin-desktop: 32px
---

## Brand & Style

This design system is engineered for high-stakes clinical and medical environments where precision meets vitality. The aesthetic is a refined fusion of **Modern Corporate** and **High-Contrast Digital**, utilizing a deep-space canvas to reduce eye strain during long-duration usage while employing "Brand Emerald" as a high-visibility functional anchor.

The brand personality is authoritative yet energetic—moving away from traditional cold clinical blues toward a more regenerative emerald palette. The target audience includes healthcare professionals, lab technicians, and data analysts who require a UI that feels responsive, reliable, and technologically advanced. The emotional response is one of "calm urgency": the dark surfaces provide the calm, while the vibrant emerald accents signal action and health.

## Colors

The color system utilizes a sophisticated grayscale palette based on deep navys and charcoals to establish a clear spatial hierarchy. 

- **Primary Emerald:** Used for critical actions, status indicators signifying 'normal' or 'healthy', and key brand moments.
- **Tertiary Blue:** Reserved for informational accents, secondary data visualizations, or navigational highlights to prevent emerald-overload.
- **Hierarchy of Containment:** Using the `container` tokens is critical for legibility. Backgrounds should default to `surface`, while cards and interactive zones should step up through `container-low` to `container-high` to create visual "lift" without relying on heavy shadows.
- **Contrast Ratios:** All `on-` tokens are mathematically paired to their respective containers to ensure WCAG AA compliance for clinical accessibility.

## Typography

This design system exclusively uses **Manrope** to maintain a modern, technical, yet highly readable atmosphere. 

- **Weight Strategy:** Use `SemiBold` (600) and `Bold` (700) for headlines to provide a strong visual anchor against the dark background. 
- **Body Text:** Always use `Regular` (400) for long-form data or clinical notes to maximize legibility. 
- **Data Labels:** Use `Medium` (500) for small labels and metadata to ensure they remain distinct from body text even at 12px. 
- **Tracking:** For `display` levels, a slight negative letter-spacing is applied to keep the wide character set of Manrope feeling compact and professional.

## Layout & Spacing

The design system employs a **Fluid Grid** model with a base-8 rhythm for all spatial relationships. 

- **Grid:** Use a 12-column layout for desktop (1440px+) with 24px gutters. For mobile, collapse to a 4-column layout with 16px margins.
- **Density:** Clinical interfaces often require high information density. In "Compact Mode" (e.g., data tables), reduce the vertical spacing tokens by one level (e.g., use `sm` instead of `md`).
- **Alignment:** Content should strictly align to the 8px grid. Use `md` (16px) for standard component padding and `lg` (24px) for section-level separation.

## Elevation & Depth

In this dark clinical environment, depth is communicated through **Tonal Layering** rather than traditional shadows. 

- **Z-Index Hierarchy:** The further "forward" an element is (closer to the user), the lighter its surface color becomes. 
    - Level 0 (Base): `surface`
    - Level 1 (Cards): `container-low`
    - Level 2 (Dialogs/Popovers): `container-high`
- **Borders:** Use `outline-variant` for subtle separation between adjacent containers. Use `outline` for interactive element boundaries (like input fields).
- **Glassmorphism:** For overlays like modal backdrops, use a 12px blur with a 40% opacity fill of `container-lowest` to maintain context of the underlying data without visual clutter.

## Shapes

The shape language is defined as **Rounded**, utilizing an 8px (0.5rem) base corner radius. This strikes a balance between the precision of a sharp grid and the approachability of a modern healthcare tool.

- **Base Components:** (Buttons, Inputs, Cards) use `0.5rem`.
- **Large Containers:** (Modals, Side Sheets) use `1rem` (rounded-lg).
- **Maximum Softness:** (Selection Pills, Chips) use `1.5rem` (rounded-xl) or full-pill shapes to distinguish them from structural containers.

## Components

- **Buttons:** 
    - Primary: `primary` background with `on-primary` text. No border.
    - Secondary: `outline` border with `primary` text.
    - Ghost: `on-surface-variant` text, appearing only on hover with a `container-low` background.
- **Input Fields:** 
    - Use `container` for the fill and `outline` for the border. 
    - On focus, transition border to `primary` with a 2px stroke.
- **Chips:** 
    - Use `secondary-container` for the background and `on-secondary-container` for the text. 
    - Use for status tags like "Stable" or "In Progress".
- **Cards:** 
    - Use `container-low` as the default surface. 
    - On hover, elevate to `container-high` and apply a subtle `outline-variant` border to emphasize interactivity.
- **Data Lists:** 
    - Use alternating rows with `surface` and `container-lowest`. 
    - Use `primary-fixed` for text-based highlights within dense data grids to ensure the eye captures key metrics instantly.