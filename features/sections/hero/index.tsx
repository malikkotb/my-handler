"use client";

import { useTranslations } from "next-intl";
import * as React from "react";
import { loadGsap } from "~/features/motion/gsap";
import { HeroModel } from "./hero-model";

export function Hero() {
  const t = useTranslations("hero");
  const wrapRef = React.useRef<HTMLDivElement>(null);
  const pinRef = React.useRef<HTMLElement>(null);

  React.useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      return;
    }

    let cleanup: (() => void) | undefined;

    loadGsap().then(({ gsap }) => {
      if (!wrapRef.current || !pinRef.current) {
        return;
      }

      const mm = gsap.matchMedia();

      // Parallax/cover effect is lg-only (64rem === --breakpoint-lg, the value the `lg:` classes
      // below switch on, so structure and animation toggle at the exact same point). matchMedia
      // reverts the tween + ScrollTrigger when the viewport crosses the breakpoint live, so below
      // lg the hero carries no transform and the sections beneath stack normally.
      mm.add("(min-width: 64rem)", () => {
        // The hero lags the scroll while the content below slides up to cover it. Use fromTo with
        // explicit endpoints (not .to/.from): a scrubbed tween that captures a live value can lock
        // in a stale transform when the trigger is re-created during a view-transition navigation.
        // `yPercent` is the parallax amount — tune it to change how far the hero drifts.
        gsap.fromTo(
          pinRef.current,
          { yPercent: 0 },
          {
            yPercent: -30,
            ease: "none",
            scrollTrigger: { trigger: wrapRef.current, start: "top top", end: "bottom top", scrub: true },
          }
        );
      });

      cleanup = () => mm.revert();
    });

    return () => cleanup?.();
  }, []);

  return (
    <div ref={wrapRef} className="relative lg:z-[2] lg:h-[200dvh]">
      <section
        ref={pinRef}
        className="relative h-dvh w-full overflow-hidden bg-ink lg:sticky lg:top-0 lg:will-change-transform"
        aria-label="Hero"
        data-inverted
      >
        <HeroModel src="/model.glb" ariaLabel="My Handler hero model" />
        <h1 className="type-h2 absolute bottom-16 left-1/2 -translate-x-1/2 whitespace-nowrap text-center text-surface">
          <span className="block">{t("line1")}</span>
          <span className="block">{t("line2")}</span>
        </h1>
      </section>
    </div>
  );
}
