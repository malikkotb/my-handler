# Semantic structure and page outline

## Landmarks

Use **semantic regions** so assistive tech can navigate: `header`, `nav`, `main`, `footer`, `aside` when appropriate. Avoid multiple elements with the same landmark role without distinct labels (use `aria-label` on `nav` when you have several).

**`main`:** one primary `main` per view; route-level layout should wrap primary content so skip links have a clear target.

## Headings

Use **`h1`–`h6`** in order—do not skip levels for styling. One logical `h1` per page (or per main landmark in SPA-like views). Headings define the document outline for screen reader “rotor” navigation.

## Buttons vs links

- **`button`** — actions that do not navigate (submit, toggle, open dialog).
- **`a href`** — navigation to another URL or in-page anchor. Do not use `<div onClick>` for navigation or primary actions.

## Lists

Use **`ul`/`ol`/`li`** for real lists. Do not fake lists with divs unless the role is truly not a list (then consider `role="list"` / `role="listitem"` only if necessary).

## Skip link

Provide a **skip to main content** link as the first focusable element (visually hidden until focused). Target `id` on `main`.

```html
<a href="#main-content" class="skip-link">Skip to main content</a>
<main id="main-content" tabIndex={-1}>…</main>
```

Focus can move to `main` on activate (`focus()` in React) for smoother experience.

## Language

Set **`lang`** on `<html>` (Next.js `layout` / `metadata`) so screen readers use the correct voice.
