import * as React from "react";

/**
 * Click-and-drag horizontal scrolling for an overflow container, on top of native
 * wheel / trackpad scrolling. Uses Pointer Events with pointer capture so a drag that
 * leaves the element keeps tracking. Touch is left to native scrolling (and ignored here
 * to avoid fighting it). While dragging, the container gets a `data-dragging` attribute
 * for cursor / selection styling.
 *
 * Attach the returned ref to the scrollable element.
 */
export function useDragScroll<T extends HTMLElement>() {
  const ref = React.useRef<T>(null);

  React.useEffect(() => {
    const el = ref.current;
    if (!el) {
      return;
    }

    let pointerId: number | null = null;
    let startX = 0;
    let startScroll = 0;

    const onPointerDown = (event: PointerEvent) => {
      // Primary mouse/pen button only; leave touch to native momentum scrolling.
      if (event.pointerType === "touch" || event.button !== 0) {
        return;
      }
      pointerId = event.pointerId;
      startX = event.clientX;
      startScroll = el.scrollLeft;
      el.setPointerCapture(event.pointerId);
      el.dataset.dragging = "true";
    };

    const onPointerMove = (event: PointerEvent) => {
      if (pointerId === null) {
        return;
      }
      // Pointer capture redirects the native image/text drag; block it explicitly too.
      event.preventDefault();
      el.scrollLeft = startScroll - (event.clientX - startX);
    };

    const endDrag = (event: PointerEvent) => {
      if (pointerId === null) {
        return;
      }
      if (el.hasPointerCapture(event.pointerId)) {
        el.releasePointerCapture(event.pointerId);
      }
      pointerId = null;
      delete el.dataset.dragging;
    };

    const preventNativeDrag = (event: DragEvent) => event.preventDefault();

    el.addEventListener("pointerdown", onPointerDown);
    el.addEventListener("pointermove", onPointerMove);
    el.addEventListener("pointerup", endDrag);
    el.addEventListener("pointercancel", endDrag);
    el.addEventListener("dragstart", preventNativeDrag);

    return () => {
      el.removeEventListener("pointerdown", onPointerDown);
      el.removeEventListener("pointermove", onPointerMove);
      el.removeEventListener("pointerup", endDrag);
      el.removeEventListener("pointercancel", endDrag);
      el.removeEventListener("dragstart", preventNativeDrag);
    };
  }, []);

  return ref;
}
