"use client";

import { usePathname } from "next/navigation";
import * as React from "react";

/**
 * Tracks whether any `[data-inverted]` section (dark backgrounds) currently sits
 * behind the absolutely-positioned header, so the header can flip to light text.
 * Re-scans on route change once the new page's DOM has settled.
 */
export function useHeaderTheme() {
  const [isInverted, setIsInverted] = React.useState(false);
  const pathname = usePathname();

  React.useEffect(() => {
    let observer: IntersectionObserver | null = null;

    const setup = () => {
      observer?.disconnect();
      setIsInverted(false);

      const header = document.querySelector("header");
      if (!header) {
        return;
      }

      const headerHeight = header.offsetHeight;
      const intersecting = new Set<Element>();

      observer = new IntersectionObserver(
        (entries) => {
          for (const entry of entries) {
            if (entry.isIntersecting) {
              intersecting.add(entry.target);
            } else {
              intersecting.delete(entry.target);
            }
          }
          setIsInverted(intersecting.size > 0);
        },
        {
          rootMargin: `0px 0px -${window.innerHeight - headerHeight}px 0px`,
          threshold: 0,
        }
      );

      for (const el of document.querySelectorAll("[data-inverted]")) {
        observer.observe(el);
      }
    };

    // Wait two frames so newly-navigated content (and its view transition) has committed.
    const raf = requestAnimationFrame(() => requestAnimationFrame(setup));

    return () => {
      cancelAnimationFrame(raf);
      observer?.disconnect();
    };
  }, [pathname]);

  return isInverted;
}
