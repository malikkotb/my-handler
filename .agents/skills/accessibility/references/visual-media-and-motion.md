# Visual design, media, and motion

## Contrast

Text and interactive boundaries need sufficient contrast against their background (commonly **~4.5:1** for normal text, **~3:1** for large text—verify against WCAG level you target). Custom focus rings and disabled states must remain readable.

## Touch targets

Interactive targets should be large enough for touch (often **~44×44 CSS px** minimum); increase hit area with padding if the visual is smaller.

## Images

- **Meaningful images** — `alt` describes purpose; empty `alt=""` for decorative images.
- **Complex images** — long description nearby or `aria-describedby` when needed.
- **SVG icons** — `aria-hidden="true"` if decorative; otherwise provide name on the **button** or **link** wrapping them.

## Video and audio

Provide **captions** for spoken content; **transcripts** where appropriate; do not autoplay audio without user control (or respect reduced motion / system settings per policy).

## Motion and vestibular issues

Respect **`prefers-reduced-motion: reduce`**:

- Reduce or remove large parallax, auto-playing motion, and excessive movement.
- Keep **opacity** and subtle transitions that do not imply spatial movement if they help comprehension.

Pair with **design-engineering** for intentional motion; this file sets the **user-setting** bar.

## Zoom and reflow

Avoid horizontal scroll at **200% zoom** for main content where possible; layouts should reflow without losing function (within reason for complex dashboards).
