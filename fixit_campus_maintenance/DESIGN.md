---
name: FixIt Campus Maintenance
colors:
  surface: '#fcf8fa'
  surface-dim: '#dcd9db'
  surface-bright: '#fcf8fa'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f6f3f5'
  surface-container: '#f0edef'
  surface-container-high: '#eae7e9'
  surface-container-highest: '#e4e2e4'
  on-surface: '#1b1b1d'
  on-surface-variant: '#45464d'
  inverse-surface: '#303032'
  inverse-on-surface: '#f3f0f2'
  outline: '#76777d'
  outline-variant: '#c6c6cd'
  surface-tint: '#565e74'
  primary: '#000000'
  on-primary: '#ffffff'
  primary-container: '#131b2e'
  on-primary-container: '#7c839b'
  inverse-primary: '#bec6e0'
  secondary: '#515f74'
  on-secondary: '#ffffff'
  secondary-container: '#d5e3fd'
  on-secondary-container: '#57657b'
  tertiary: '#000000'
  on-tertiary: '#ffffff'
  tertiary-container: '#271901'
  on-tertiary-container: '#98805d'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#dae2fd'
  primary-fixed-dim: '#bec6e0'
  on-primary-fixed: '#131b2e'
  on-primary-fixed-variant: '#3f465c'
  secondary-fixed: '#d5e3fd'
  secondary-fixed-dim: '#b9c7e0'
  on-secondary-fixed: '#0d1c2f'
  on-secondary-fixed-variant: '#3a485c'
  tertiary-fixed: '#fcdeb5'
  tertiary-fixed-dim: '#dec29a'
  on-tertiary-fixed: '#271901'
  on-tertiary-fixed-variant: '#574425'
  background: '#fcf8fa'
  on-background: '#1b1b1d'
  surface-variant: '#e4e2e4'
typography:
  display-lg:
    fontFamily: Inter
    fontSize: 48px
    fontWeight: '700'
    lineHeight: 56px
    letterSpacing: -0.02em
  headline-lg:
    fontFamily: Inter
    fontSize: 32px
    fontWeight: '700'
    lineHeight: 40px
    letterSpacing: -0.01em
  headline-lg-mobile:
    fontFamily: Inter
    fontSize: 24px
    fontWeight: '700'
    lineHeight: 32px
  headline-md:
    fontFamily: Inter
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
    fontWeight: '600'
    lineHeight: 20px
  label-sm:
    fontFamily: Inter
    fontSize: 12px
    fontWeight: '500'
    lineHeight: 16px
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
  container-max: 1280px
  gutter: 24px
  margin-mobile: 16px
---

## Brand & Style
The design system for this campus maintenance platform focuses on **Corporate / Modern** aesthetics with a functional, systematic edge. It is designed to evoke a sense of reliability and immediate responsiveness, essential for institutional facilities management. 

The style prioritizes clarity and efficiency through a high-contrast interface, utilizing white space to reduce cognitive load for maintenance staff and administrators. Elements are structured with a "Service-First" mentality, ensuring that critical data is never obscured by decorative elements.

## Colors
The palette is rooted in a "Deep Navy" primary to establish institutional authority. A systematic status-based color logic is applied to the accent palette to represent maintenance urgency:

- **Primary (Deep Navy):** Used for global navigation, primary buttons, and heavy headings.
- **Critical (Red):** Reserved for emergency repairs and system alerts.
- **High (Orange):** Denotes urgent work orders requiring same-day attention.
- **Medium (Amber):** Used for scheduled maintenance and standard requests.
- **Low (Green):** Indicates completed tasks or non-urgent cosmetic updates.
- **Background & Surface:** A crisp white-on-slate foundation ensures maximum legibility in various lighting conditions (e.g., outdoor inspections).

## Typography
This design system utilizes **Inter** for its neutral, highly legible, and systematic character. 

- **Headlines:** Use Bold (700) and Semi-Bold (600) weights to establish a clear information hierarchy. Larger displays utilize tighter letter spacing for a more "designed" look.
- **Body:** Set at 16px for optimal readability across device types.
- **Labels:** Used for metadata, ticket IDs, and status badges. Medium (500) and Semi-Bold (600) weights ensure these small elements remain accessible.

## Layout & Spacing
The layout follows a **Fluid Grid** model with strict 8px incremental spacing to ensure consistency.

- **Desktop:** 12-column grid with 24px gutters and a 1280px max-container width. 
- **Tablet:** 8-column grid with 24px gutters.
- **Mobile:** 4-column grid with 16px side margins. 

Vertical spacing between cards and sections should primarily use the `lg` (24px) or `xl` (40px) tokens to maintain an airy, professional feel.

## Elevation & Depth
The design system employs **Tonal Layers** combined with **Ambient Shadows**. 

- **Level 0 (Background):** #F8FAFC.
- **Level 1 (Cards/Surfaces):** Pure white with a subtle, highly diffused shadow (e.g., `0 4px 6px -1px rgba(15, 23, 42, 0.05)`).
- **Level 2 (Modals/Dropdowns):** Increased shadow spread and a slightly darker tint to indicate closer proximity to the user.

Avoid heavy black shadows; use the Deep Navy (#0F172A) at very low opacities (5-10%) to tint the shadows for a more integrated, modern look.

## Shapes
The shape language is defined as **Rounded**, utilizing a 0.5rem (8px) base radius.

- **Standard Elements (Inputs, Buttons):** 8px radius.
- **Large Containers (Cards):** Use the `rounded-xl` token (1.5rem / 24px) to create a friendly, modern frame for technical content.
- **Status Badges:** Use a fully rounded (pill) shape to distinguish them from interactive buttons.

## Components
- **Buttons:** Primary buttons use Deep Navy with white text. High-priority action buttons (like "Report Emergency") may use the Critical Red palette.
- **Status Badges:** High-contrast background with dark text. For example, a "Critical" badge uses a light red background with the `status.critical` hex for text and border.
- **Cards:** White surface, `rounded-xl` corners, and a subtle Level 1 shadow. Include a 2px left-border accent using the priority color tokens to categorize work orders at a glance.
- **Input Fields:** 1px Slate (#E2E8F0) border that thickens to 2px Deep Navy on focus. 
- **Lists:** Clean rows with 16px vertical padding and subtle bottom dividers (#F1F5F9).
- **Progress Indicators:** Linear bars using the Success/Low Priority Green to show repair completion stages.