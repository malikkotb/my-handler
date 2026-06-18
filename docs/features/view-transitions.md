# View transitions (App Router)

This stack uses the **View Transitions API** for route changes. The implementation lives **in-repo** under `features/view-transition/` so navigation timing stays under our control.

## Files

| File | Role |
|------|------|
| `features/view-transition/app-view-transitions.tsx` | `ViewTransitions` root wrapper, `Link`, `useTransitionRouter`, `isSamePageReload`, `isSamePageHash`. Full architecture description is in the file header comment. |
| `features/view-transition/context.tsx` | `ViewTransitionProvider`, `useViewTransition`, `isViewTransitionComplete`; guarded pending/complete updates; patches `document.startViewTransition` to observe `transition.finished`. |
| `features/view-transition/view-transition.css` | Root transition keyframes and `--vt-duration` / `--vt-easing` on `:root`. |
| `features/use-content-ready.ts` | Gates in-page animations; read the file for which conditions apply. |
| `components/link.tsx` | Wraps the in-repo `Link`, calls `beginViewTransition()` on internal navigation. A link to the page you are already on (`isSamePageReload`) scrolls to top via Lenis instead, and a same-page hash link (`isSamePageHash`) scrolls to its section with no transition. |

Layouts import **`ViewTransitions`** from `~/features/view-transition/app-view-transitions` and nest **`ViewTransitionProvider`** inside it.

## Implementation notes

- **Gating** (`context.tsx`): `setTransitionPending` / `setTransitionComplete` use functional updates so we do not schedule React work when `isViewTransitionComplete` is already in the target state (e.g. repeated `startViewTransition` or overlapping effects).
- **`useTransitionRouter`** (`app-view-transitions.tsx`): when `document.startViewTransition` is missing, the navigation callback still runs inside **`React.startTransition`**. When the API exists, optional **`onTransitionReady`** chains off **`transition.ready`** with a no-op **`.catch`** so a rejected ready promise does not surface as an unhandled rejection.

## Agent skill

See `.agents/skills/view-transitions/SKILL.md` for workflow, file map, and boundaries.
