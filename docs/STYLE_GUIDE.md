# Style Guide (APP_ID)

## Palette
- Background dark: #0f172a
- Background light: #f8fafc
- Surface: #111827 (dark), #ffffff (light)
- Primary accent (orange): #ff7a00
- Success (green): #22c55e
- Text dark: #e5e7eb
- Text light: #0f172a

## Typography
- Font: Inter, Segoe UI, system.
- Scale: xs 12, sm 14, md 16, lg 18, xl 20, 2xl 24, 3xl 30.

## Spacing
- Scale: 4, 8, 12, 16, 20, 24, 32, 40 px.

## Components
- Buttons: primary (orange), secondary (surface border), ghost (transparent). Always show focus ring.
- Cards: rounded corners, soft shadow, subtle border.
- Forms: labels always present; helper text for hints; error text in red.
- Modals: centered, ESC to close, focus initial element.
- Theme toggle: switches `data-theme` on `<html>`; persist in localStorage.

## Patterns
- Use skip link for main content.
- Provide `aria-label` for icon buttons.
- Maintain contrast >= 4.5 for text on backgrounds.
- Grid layout for dashboards; responsive cards for jobs.

TODO: Designer review microcopy and spacing tweaks.
