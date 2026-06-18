# ARIA and accessible names

## Prefer native semantics

If a native element exists (`button`, `a`, `input`, `select`, `textarea`), use it. **ARIA does not fix wrong semantics.**

## Accessible names

Every interactive control needs a **name** exposed to assistive tech:

- Visible text (child of `button`, text in `label for=`).
- **`aria-label`** when no visible label fits (icon-only buttons—still prefer visible text or tooltip that is accessible).
- **`aria-labelledby`** when the name lives elsewhere in the DOM.

## `aria-*` when needed

- **`aria-expanded`**, **`aria-controls`** — disclose/collapse, menus tied to buttons.
- **`aria-current`** — current nav item.
- **`aria-disabled`** vs `disabled` — `disabled` removes from tab order; sometimes you need `aria-disabled` with `pointer-events` for focus retention (rare; document why).
- **`aria-live`** / **`role="status"`** — polite announcements for async updates; **`assertive`** only for urgent interruptions.

## Live regions

Toasts and inline validation: use **`role="status"`** (polite) or **`role="alert"`** (assertive) sparingly—avoid flooding announcements.

## Roles

Add **`role`** only when HTML cannot express the pattern (e.g. some composite widgets). Misused roles confuse more than they help.

## Hiding content

- **`aria-hidden="true"`** — hide decorative icons from screen readers when the name comes from visible text elsewhere; **never** on focusable elements.
- **Visually hidden** text — use a well-tested “sr-only” class for supplementary context when needed.
