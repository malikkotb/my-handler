---
name: accessibility
description: Use when building or reviewing accessible UI—semantic HTML, keyboard support, focus management, ARIA and names, forms and errors, contrast and targets, and reduced-motion alignment. Applies to React/Next components, page-builder sections, modals, and content. Do NOT use as the primary skill for CMS schema, analytics wiring, or pure performance tuning without an accessibility angle.
---

# Accessibility

## Core Rules

- **Prefer native HTML** — correct element (`button`, `a`, `label`, `input`, headings) before adding ARIA; **no ARIA is better than wrong ARIA**.
- **Everything interactive must be keyboard reachable** — logical tab order, visible focus, documented shortcuts where you add custom keys.
- **Names for assistive tech** — every control needs an **accessible name** (visible label, `aria-label`, or `aria-labelledby` as appropriate).
- **Forms** — each input has an associated **label**; errors are perceivable, programmatically tied to fields, and not color-only.
- **Dialogs and layers** — trap focus while open, restore focus on close, block background interaction as expected, **Escape** closes when that is the pattern.
- **Motion** — respect **`prefers-reduced-motion`**. Branching JSX on the OS setting uses **`usePrefersReducedMotion`** (`~/features/motion/use-prefers-reduced-motion`); pair with **frontend**/motion reference—not **`useReducedMotion`** from **`motion/react`**. Pair with **design-engineering** for motion craft vs. user settings.
- **Don’t claim “WCAG certified”** from this skill alone—use it to implement patterns; formal audits are separate.

## Trigger Conditions

Apply when adding or changing **interactive UI**, **layout structure**, **forms**, **modals/overlays**, **navigation**, **media**, or **content** that must work for keyboard and assistive technology users.

## Execution Checklist

1. Confirm scope: component behavior (this skill) vs **sanity** schema vs **seo-aeo-best-practices** metadata-only.
2. Read the relevant files under Reference Files (semantic → keyboard → ARIA → forms → visual/motion).
3. Manually verify with **keyboard only** (Tab, Shift+Tab, Enter, Space, Escape) for the changed surface.
4. Run `npm run check.types` after edits; add automated a11y tests only if the repo already uses them.

## Scope Guidance

- **frontend** — implementation in components; pair for Lenis/Motion specifics and client boundaries.
- **design-engineering** — motion timing and “feel”; this skill owns **reduced-motion** policy and **non-color** cues for state.
- **mantine-hooks** — modals, focus trap, disclosure—prefer Mantine patterns that already handle focus when applicable.
- **view-transitions** — ensure route changes don’t strand focus; move focus to main content when appropriate after navigation.
- **seo-aeo-best-practices** — document title/description and structured data; overlap on **headings** and **landmarks** for page structure.

## Non-Goals

- Replacing legal **accessibility audits** or VPATs.
- Changing **Sanity schema** unless the task is Studio field labels, descriptions, or preview a11y.
- Owning **analytics** event naming (see **umami-analytics**).

## Done Criteria

- Interactive controls are keyboard operable with visible focus (unless a documented exception).
- Form fields have labels and clear error association.
- Images and non-text content have appropriate **text alternatives** where required.
- Motion respects **`prefers-reduced-motion`** or equivalent handling.

## Reference Files

- `references/semantic-and-structure.md` — landmarks, headings, buttons/links, lists, skip link.
- `references/keyboard-and-focus.md` — tab order, focus trap, Escape, focus return, composite widgets.
- `references/aria-and-names.md` — names, roles, live regions, when not to use ARIA.
- `references/forms-and-errors.md` — labels, validation, error announcements.
- `references/visual-media-and-motion.md` — contrast, targets, alt text, media, reduced motion.
