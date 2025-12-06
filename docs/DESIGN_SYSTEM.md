# Design System

This document explains the Mervo design system, design tokens, and component guidelines.

## Philosophy

Mervo's design system prioritizes:
- **Accessibility** — WCAG 2.1 AA compliance, keyboard navigation, semantic HTML
- **Consistency** — Centralized tokens for colors, spacing, and typography
- **Simplicity** — Minimal, functional UI focused on task completion
- **Internationalization** — Dark mode, theme switching, multi-language support

## Design Tokens

Design tokens are centralized values for colors, spacing, typography, and elevation. Located in `src/styles/design-tokens.ts`.

### Colors

#### Neutral Palette (Charcoal)
- **50 - 100:** Light backgrounds, subtle UI
- **200 - 400:** Borders, disabled states
- **500 - 700:** Text, primary UI
- **800 - 900:** Dark backgrounds, emphasis

#### Brand Orange
Used for primary actions, highlights, and interactive elements.
```typescript
orange[500] = '#ff8c1a' // Primary brand color
```

#### Semantic Colors
- **Green:** Success, completed, positive feedback
- **Red:** Errors, destructive actions, alerts
- **Yellow/Amber:** Warnings, caution, pending

### Spacing

```typescript
xs:  0.25rem (4px)
sm:  0.5rem  (8px)
md:  1rem    (16px)
lg:  1.5rem  (24px)
xl:  2rem    (32px)
```

**Usage:** Use spacing tokens for margins, padding, and gaps. Never use arbitrary values.

### Typography

#### Font Family
- **System font stack** — -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto
- **Monospace:** "SF Mono", Monaco, "Source Code Pro"

#### Font Sizes
- **xs:** 0.75rem (12px) — Small labels, helper text
- **sm:** 0.875rem (14px) — Body text, supporting information
- **base:** 1rem (16px) — Standard body text
- **lg:** 1.125rem (18px) — Section headings
- **xl–4xl:** Use for page headings

#### Font Weights
- **300:** Light (rare, only for subtle UI)
- **400:** Normal (body text, descriptions)
- **500:** Medium (labels, secondary headings)
- **600:** Semibold (subheadings, strong emphasis)
- **700:** Bold (headings, CTAs)

### Elevation (Box Shadow)

```typescript
xs: Subtle, icon hover states
sm: Cards, dropdowns, tooltips
md: Modals, popovers
lg: Important overlays
xl: Highest layering (not used often)
```

### Transitions

- **fast (150ms):** Button hover, icon feedback
- **base (200ms):** Standard transitions
- **slow (300ms):** Modals, major layout shifts

### Border Radius

- **xs (2px):** Minimal rounding, buttons
- **md (4px):** Standard cards, inputs
- **lg (8px):** Larger cards, modals
- **xl–2xl:** Large components, full rounded pills

## Dark Mode

Dark mode is enabled via the `dark` class on the `<html>` element. Tailwind's dark mode strategy is **class-based**.

```html
<!-- Light mode -->
<html>
  <body class="bg-white text-charcoal-900"></body>
</html>

<!-- Dark mode -->
<html class="dark">
  <body class="bg-charcoal-900 text-charcoal-50"></body>
</html>
```

### Dark Mode Usage in Components

```tsx
<div className="bg-white dark:bg-charcoal-900 text-charcoal-900 dark:text-charcoal-50">
  Content
</div>
```

## Component Guidelines

### Buttons

```tsx
// Primary action
<Button className="bg-orange-500 text-white hover:bg-orange-600">
  Save job
</Button>

// Secondary
<Button className="bg-charcoal-200 dark:bg-charcoal-700">
  Cancel
</Button>

// Disabled
<Button disabled className="opacity-50 cursor-not-allowed">
  Unavailable
</Button>
```

**Rules:**
- Button text should be a verb
- Always include `aria-label` for icon buttons
- Provide visual feedback on hover and focus
- Loading state: show spinner, disable interaction

### Cards

```tsx
<Card>
  <CardBody>
    <h3>Card title</h3>
    <p>Card content</p>
  </CardBody>
</Card>
```

**Rules:**
- Use consistent padding (`p-md`, `p-lg`)
- Separate sections with `space-y-*` utilities
- Apply shadows for elevation

### Forms

```tsx
<div className="space-y-md">
  <label htmlFor="job-name" className="block text-sm font-medium">
    Job name
  </label>
  <Input
    id="job-name"
    type="text"
    placeholder="Enter job name"
    aria-label="Job name"
  />
  <p className="text-xs text-charcoal-600">Optional description</p>
</div>
```

**Rules:**
- Label all inputs with `<label>` or `aria-label`
- Use helper text for guidance
- Show validation errors below inputs
- Maintain consistent spacing

### Accessibility Checklist

- [ ] Semantic HTML: `<button>`, `<a>`, `<form>`, `<nav>`
- [ ] Color contrast: minimum 4.5:1 for text
- [ ] Focus visible: all interactive elements have `:focus-visible`
- [ ] Labels: all inputs have labels
- [ ] ARIA: dialogs have `role="dialog"` and `aria-labelledby`
- [ ] Keyboard: all features work with Tab, Enter, Escape, Arrow keys
- [ ] Motion: respect `prefers-reduced-motion`
- [ ] Images: all images have `alt` text

## When to Use Tokens vs. Classes

| Use Case | Approach |
|----------|----------|
| Padding, margins, gaps | Tailwind classes (`p-md`, `space-y-lg`) |
| Colors (not semantic) | Design tokens in JS/TS |
| Font sizing | Tailwind classes (`text-lg`, `text-xl`) |
| Shadows, elevation | Tailwind `shadow-*` or design tokens |
| Custom animations | Design tokens (transitions) |

## Adding New Components

1. Create file in `src/components/ui/` or appropriate subdirectory
2. Use design tokens for all styling
3. Support dark mode with `dark:` classes
4. Include JSDoc comments explaining props
5. Add keyboard support if interactive
6. Test accessibility with axe-core

## Colors in Use

### Primary Actions & Focus
```
orange-500 (#ff8c1a)
```

### Text
```
charcoal-900 (light mode, body text)
charcoal-50 (dark mode, body text)
charcoal-700 (secondary text light mode)
charcoal-300 (secondary text dark mode)
```

### Backgrounds
```
white (light mode primary)
charcoal-900 (dark mode primary)
charcoal-50 (light mode secondary)
charcoal-800 (dark mode secondary)
```

### Borders & Dividers
```
charcoal-200 (light mode)
charcoal-700 (dark mode)
```

## Responsive Design

Use Tailwind's responsive prefixes:
```tsx
<div className="p-md md:p-lg lg:p-xl">
  Responsive padding
</div>

<nav className="hidden md:flex">
  Desktop navigation
</nav>
```

Breakpoints:
- **sm:** 640px
- **md:** 768px
- **lg:** 1024px
- **xl:** 1280px

## Motion & Animation

Respect `prefers-reduced-motion`:

```tsx
const shouldReduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

// Disable transitions if user prefers reduced motion
<div className={shouldReduceMotion ? '' : 'transition-all'}>
  Content
</div>
```

## FAQ

**Q: Can I use custom colors?**
A: No, always use design tokens or Tailwind's extended palette.

**Q: Can I increase the font size beyond lg?**
A: Yes, but use Tailwind's `2xl–4xl` only for headings.

**Q: How do I support new locales?**
A: Add a new JSON file in `src/i18n/locales/` and update `src/i18n/i18n.ts`.

**Q: What if a color token doesn't match my design?**
A: Update both `tailwind.config.cjs` and `src/styles/design-tokens.ts`.
