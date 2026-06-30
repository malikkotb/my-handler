"use client";

import * as React from "react";
import { loadGsap } from "~/features/motion/gsap";
import { usePrefersReducedMotion } from "~/features/motion/use-prefers-reduced-motion";

type Props = {
  children: React.ReactNode;
  className?: string;
  /** Vertical distance to travel from. Default: 24 */
  distance?: number;
  /** Animation duration in seconds. Default: 0.8 */
  duration?: number;
  /** Delay before animation starts in seconds. Default: 0 */
  delay?: number;
  /** ScrollTrigger start. Default: "top 92%" */
  scrollStart?: string;
  /** Ease name. Default: "mainLink" (custom site ease) */
  ease?: string;
};

export function FadeUpReveal({
  children,
  className,
  distance = 20,
  duration = 0.8,
  delay = 0,
  scrollStart = "top 92%",
  ease = "cubic-bezier(.22,.61,.36,1)",
}: Props) {
  const ref = React.useRef<HTMLSpanElement>(null);
  const prefersReducedMotion = usePrefersReducedMotion();

  React.useEffect(() => {
    const el = ref.current;
    if (!el) return;

    if (prefersReducedMotion) {
      el.style.opacity = "1";
      el.style.transform = "none";
      return;
    }

    let cleanup: (() => void) | undefined;

    loadGsap().then(({ gsap, ScrollTrigger }) => {
      if (!ref.current) return;

      const tween = gsap.fromTo(
        el,
        { opacity: 0, y: distance },
        {
          opacity: 1,
          y: 0,
          duration,
          delay,
          ease,
          scrollTrigger: {
            trigger: el,
            start: scrollStart,
            once: true,
          },
        }
      );

      cleanup = () => {
        (tween.scrollTrigger as InstanceType<typeof ScrollTrigger> | undefined)?.kill();
        tween.kill();
      };
    });

    return () => cleanup?.();
  }, [prefersReducedMotion, distance, duration, delay, scrollStart, ease]);

  return (
    <span
      ref={ref}
      className={className ? `block ${className}` : "block"}
      style={{ opacity: 0, transform: `translateY(${distance}px)` }}
    >
      {children}
    </span>
  );
}
