# ARIA Hints

- Buttons/links: ensure `aria-label` when icon-only.
- Forms: associate labels with inputs via `for`/`id`; use `aria-invalid` on error.
- Modals: set `role="dialog"`, `aria-modal="true"`, and focus the container on open; allow ESC to close.
- Lists: use `aria-label` on grouped lists (jobs, notifications) for screen readers.
- Images: meaningful images require `alt`; decorative images should set `aria-hidden="true"`.
- Skip link: keep `.skip-link` target at main content.
- Keyboard: ensure tab order is logical; provide visible focus ring using CSS variables.
