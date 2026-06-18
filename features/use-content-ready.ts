import { useViewTransition } from "~/features/view-transition/context";

/**
 * View-transition gate for in-page content (e.g. `AnimatedText`).
 */
export function useContentReady() {
  const view = useViewTransition();

  return {
    isComplete: view.isViewTransitionComplete,
  };
}
