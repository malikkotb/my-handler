---
name: view-transitions
description: Use when changing App Router view transitions, `app-view-transitions.tsx`, ViewTransitionProvider / useViewTransition, Link navigation timing, or content gating tied to transition completion. Do NOT use when the primary task is CMS schema, plop scaffolding, or unrelated UI.
---

# View transitions

## Core Rules

- Import **`ViewTransitions`**, **`Link`**, and **`useTransitionRouter`** from `~/features/view-transition/app-view-transitions`.
- Root layout: **`<ViewTransitions>`** wraps the document, then **`<ViewTransitionProvider>`** (`~/features/view-transition/context`) — it tracks **`isViewTransitionComplete`** and patches `document.startViewTransition` so **`transition.finished`** drives gating (see `context.tsx` and `app-view-transitions.tsx`).
- **`useContentReady`** (`~/features/use-content-ready`) gates in-page animations; read the file for which conditions apply (always includes view-transition completion here). Prefer that over arbitrary timeouts.
- **`router.push` / `replace`** run inside **`startTransition`** in `app-view-transitions.tsx` so React can schedule the route update with other concurrent work.
- **`ViewTransitionProvider`** uses **`setTransitionPending` / `setTransitionComplete`** (functional updates) so the gate only updates when `isViewTransitionComplete` would actually change.
- **`triggerTransition`**: without **`document.startViewTransition`**, the wrapped navigation still runs inside **`React.startTransition`**. With the API, **`onTransitionReady`** uses **`transition.ready`** with **`.catch(() => {})`** so a rejected ready promise is not an unhandled rejection.

## Trigger Conditions

Apply when the work touches **view transitions**, **`app-view-transitions.tsx`**, **`ViewTransitionProvider`**, **`Link`**, **`useContentReady`**, or **transition gating** tied to navigation.

## Execution Checklist

1. Confirm the task touches view transitions, `app-view-transitions.tsx`, `ViewTransitionProvider`, `Link`, or transition gating.
2. Read `features/view-transition/app-view-transitions.tsx` module comment (architecture overview).
3. If changing gating or Safari timing, read `features/view-transition/context.tsx` and consumers (`useContentReady`, `components/link.tsx`).
4. Keep spacing/style consistent with `features/view-transition/context.tsx` (blank lines around conditionals).
5. Run **`npm run check.types`** (and Biome) before considering the task done.

## Scope Guidance

### Key files

| Path | Role |
|------|------|
| `features/view-transition/app-view-transitions.tsx` | `ViewTransitions`, `Link`, `useTransitionRouter`, `triggerTransition` (no-API `startTransition`, `ready` handling); architecture in the file header comment. |
| `features/view-transition/context.tsx` | `ViewTransitionProvider`, `useViewTransition`, guarded gating + `startViewTransition` patch. |
| `features/view-transition/view-transition.css` | Root transition CSS; `--vt-duration` / `--vt-easing` on `:root`. |
| `features/use-content-ready.ts` | Content-ready hook; read file for exact gates. |
| `components/link.tsx` | Wraps `Link` from `app-view-transitions`; `beginViewTransition()` on internal navigation. |

- **frontend**: Pairs when the change is mostly conditional UI or animation without transition API concerns.
- **docs-maintenance**: When updating `docs/features/view-transitions.md` or onboarding text.

## Non-Goals

- Adding a third-party view-transition npm package without an explicit decision (would change `startTransition` and resolver behavior).
- Changing CSS `--vt-duration` / `view-transition.css` without checking motion timing and `useContentReady` expectations.
- General UI, Lenis, or Motion work with no view-transition or route-transition angle (use **frontend**).

## Done Criteria

- Imports resolve to `~/features/view-transition/app-view-transitions` where applicable.
- `npm run check.types` passes.

## Reference Files

- `docs/features/view-transitions.md` — contributor overview and file map.
- See Scope Guidance → Key files for the canonical in-repo paths to read when editing behavior.
