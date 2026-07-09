"use client";

import { useLenis } from "lenis/react";
import * as React from "react";
import { loadGsap } from "./gsap";

/**
 * Drives ScrollTrigger from Lenis's scroll loop so scrubbed/parallax animations stay
 * in sync with the smooth-scrolled `.lenis` wrapper (which is the scroller, not the
 * window). Must render inside the Lenis provider.
 *
 * Binds immediately (not idle-deferred): the page runs continuous `requestAnimationFrame`
 * loops (Lenis's own scroll loop, GSAP's ticker, the hero's Three.js render loop) that can
 * starve `requestIdleCallback` indefinitely, so deferring this would risk the Lenis->ScrollTrigger
 * bridge never binding — breaking every scroll-scrubbed animation on the page (e.g. `HighlightText`).
 */
export function ScrollTriggerBridge() {
  const lenis = useLenis();

  React.useEffect(() => {
    if (!lenis) {
      return;
    }

    let cleanup: (() => void) | undefined;

    loadGsap().then(({ ScrollTrigger }) => {
      const onScroll = () => ScrollTrigger.update();
      lenis.on("scroll", onScroll);
      ScrollTrigger.refresh();
      cleanup = () => lenis.off("scroll", onScroll);
    });

    return () => cleanup?.();
  }, [lenis]);

  return null;
}
