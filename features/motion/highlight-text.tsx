"use client";

import SplitText from "@activetheory/split-text";
import * as React from "react";
import { loadGsap } from "~/features/motion/gsap";
import { usePrefersReducedMotion } from "~/features/motion/use-prefers-reduced-motion";

type Props = {
  as?: React.ElementType;
  children: React.ReactNode;
  className?: string;
  /** ScrollTrigger start position. Default: "top 97.5%" */
  scrollStart?: string;
  /** ScrollTrigger end position. Default: "center 40%" */
  scrollEnd?: string;
  /** Opacity of un-highlighted characters. Default: 0.2 */
  fade?: number;
  /** Stagger duration between characters. Default: 0.1 */
  stagger?: number;
};

export function HighlightText({
  as: Tag = "h2",
  children,
  className,
  scrollStart = "top 97.5%",
  scrollEnd = "center 40%",
  fade = 0.2,
  stagger = 0.1,
}: Props) {
  const ref = React.useRef<HTMLElement>(null);
  const prefersReducedMotion = usePrefersReducedMotion();

  React.useEffect(() => {
    if (prefersReducedMotion || !ref.current) {
      return;
    }

    const el = ref.current;
    let cancelled = false;
    let cleanup: (() => void) | undefined;

    loadGsap().then(({ gsap, ScrollTrigger }) => {
      // `loadGsap()` is async, so React Strict Mode's dev-only mount→cleanup→mount cycle can run
      // this effect's cleanup *before* this callback fires (`cleanup` is still unset then, so that
      // cleanup is a no-op). Without this guard, both the throwaway and the real mount's callbacks
      // would go on to split the same element, layering two conflicting timelines on nested spans.
      if (cancelled || !ref.current) {
        return;
      }

      const split = new SplitText(el, { type: "words,chars", noBalance: true });

      const tl = gsap.timeline({
        scrollTrigger: {
          scrub: true,
          trigger: el,
          start: scrollStart,
          end: scrollEnd,
        },
      });

      // chars is HTMLElement[] at runtime despite the declared string[] type
      tl.from(split.chars as unknown as HTMLElement[], {
        autoAlpha: fade,
        stagger,
        ease: "linear",
      });

      cleanup = () => {
        (tl.scrollTrigger as InstanceType<typeof ScrollTrigger> | undefined)?.kill();
        tl.kill();
        split.revert();
      };
    });

    return () => {
      cancelled = true;
      cleanup?.();
    };
  }, [prefersReducedMotion, scrollStart, scrollEnd, fade, stagger]);

  return (
    <Tag ref={ref} className={className}>
      {children}
    </Tag>
  );
}
