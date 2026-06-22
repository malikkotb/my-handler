"use client";

import { useLenis } from "lenis/react";
import * as React from "react";
import { loadGsapCore } from "~/features/motion/gsap";

/**
 * Dispatch on `window` after a hover target's `data-cursor-text` changes without the
 * pointer moving (e.g. a click that toggles the label). Fire it from a layout/effect so
 * the new attribute value is already committed to the DOM when the cursor re-reads it.
 */
export const CURSOR_REFRESH_EVENT = "dyncursor:refresh";

/**
 * Dynamic text cursor — a pill that follows the pointer and reveals a label while
 * hovering any element tagged with `data-cursor-hover` (+ `data-cursor-text` for the
 * label). Position is driven by GSAP `quickTo`; the reveal and right-edge flip are pure
 * CSS keyed off the `data-cursor` state attribute (see `features/style/brand.css`).
 * Hidden on coarse pointers and dampened under `prefers-reduced-motion`.
 *
 * Adapted from Osmo Supply's "Dynamic Text Cursor" to this stack: element refs instead of
 * global `querySelector`, the project's shared GSAP loader, and a Lenis-aware scroll pass
 * (Lenis owns the scroll surface, so the page moves under a stationary pointer).
 */
export function DynamicTextCursor() {
  const cursorRef = React.useRef<HTMLDivElement>(null);
  const textRef = React.useRef<HTMLSpanElement>(null);
  const pointerRef = React.useRef({ x: 0, y: 0, moved: false });
  const updateRef = React.useRef<() => void>(() => {});

  React.useEffect(() => {
    const cursor = cursorRef.current;
    const textEl = textRef.current;

    if (!cursor || !textEl || !window.matchMedia("(hover: hover) and (pointer: fine)").matches) {
      return;
    }

    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    let cancelled = false;
    let raf = 0;
    let teardown = () => {};

    loadGsapCore().then((gsap) => {
      if (cancelled) {
        return;
      }

      const duration = reduceMotion ? 0 : 0.4;
      const xTo = gsap.quickTo(cursor, "x", { duration, ease: "power3.out" });
      const yTo = gsap.quickTo(cursor, "y", { duration, ease: "power3.out" });

      const update = () => {
        const { x, y } = pointerRef.current;
        const hoverItem = document.elementFromPoint(x, y)?.closest<HTMLElement>("[data-cursor-hover]");
        const isEdge = cursor.getBoundingClientRect().right >= window.innerWidth;

        cursor.dataset.cursor = hoverItem ? (isEdge ? "active-edge" : "active") : "";

        const text = hoverItem?.dataset.cursorText;
        if (text) {
          textEl.textContent = text;
        }
      };
      updateRef.current = update;

      const onMove = (event: MouseEvent) => {
        pointerRef.current = { x: event.clientX, y: event.clientY, moved: true };
        xTo(event.clientX);
        yTo(event.clientY);
        cancelAnimationFrame(raf);
        raf = requestAnimationFrame(update);
      };

      window.addEventListener("mousemove", onMove);

      teardown = () => {
        window.removeEventListener("mousemove", onMove);
        gsap.killTweensOf(cursor);
        updateRef.current = () => {};
      };
    });

    return () => {
      cancelled = true;
      cancelAnimationFrame(raf);
      teardown();
    };
  }, []);

  // Re-evaluate the hovered target as the page scrolls beneath a stationary pointer.
  useLenis(() => {
    if (pointerRef.current.moved) {
      updateRef.current();
    }
  }, []);

  // Re-read the label when a hover target updates its text in place (e.g. on click).
  React.useEffect(() => {
    const onRefresh = () => updateRef.current();
    window.addEventListener(CURSOR_REFRESH_EVENT, onRefresh);
    return () => window.removeEventListener(CURSOR_REFRESH_EVENT, onRefresh);
  }, []);

  return (
    <div ref={cursorRef} data-cursor="" className="dyn-cursor" aria-hidden>
      <div className="dyn-cursor__bubble">
        <span className="dyn-cursor__icon" aria-hidden />
        <span ref={textRef} data-cursor-text-target className="dyn-cursor__text type-cursor">
          View Details
        </span>
      </div>
    </div>
  );
}
