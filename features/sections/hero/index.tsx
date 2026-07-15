"use client";

import { useTranslations } from "next-intl";
import * as React from "react";
import { AnimatedText } from "~/components/animated-text";
import { loadGsap } from "~/features/motion/gsap";
import { HeroModel } from "./hero-model";

export function Hero() {
  const t = useTranslations("hero");
  const wrapRef = React.useRef<HTMLDivElement>(null);
  const pinRef = React.useRef<HTMLElement>(null);
  const darkRef = React.useRef<HTMLDivElement>(null);
  const blurRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      return;
    }

    let cleanup: (() => void) | undefined;

    loadGsap().then(({ gsap }) => {
      if (!wrapRef.current || !pinRef.current) {
        return;
      }

      const ctx = gsap.context(() => {
        const scrollTrigger = { trigger: wrapRef.current, start: "top top", end: "bottom top", scrub: true };

        const tl = gsap.timeline({ scrollTrigger });
        // The hero lags the scroll while the content below slides up to cover it. Use fromTo with
        // explicit endpoints (not .to/.from): a scrubbed tween that captures a live value can lock
        // in a stale transform when the trigger is re-created during a view-transition navigation.
        // `yPercent` is the parallax amount — tune it to change how far the hero drifts.
        tl.fromTo(pinRef.current, { yPercent: 0 }, { yPercent: -90, ease: "none" });
        tl.fromTo(darkRef.current, { opacity: 0 }, { opacity: 0.5, ease: "none" }, "<");

        tl.eventCallback("onUpdate", () => {
          if (blurRef.current) {
            const blur = 5 * tl.progress();
            blurRef.current.style.backdropFilter = `blur(${blur}px)`;
          }
        });
      }, wrapRef);

      cleanup = () => ctx.revert();
    });

    return () => cleanup?.();
  }, []);

  return (
    <div ref={wrapRef} className="relative z-2 h-dvh-2">
      {/* Marks where the header should stay inverted. Sized/positioned to match the hero's actual
          visible span (it's covered by the IntroSection's -mt-dvh-1 overlap at the halfway point of
          this 200dvh track), not the sticky+parallaxed section below, whose transformed rect keeps
          "intersecting" the header long after the surface section has visually covered it. */}
      <div aria-hidden className="pointer-events-none absolute inset-x-0 top-0 h-dvh-1" data-inverted />
      <section
        ref={pinRef}
        className="sticky top-0 h-dvh w-full overflow-hidden bg-ink will-change-transform"
        aria-label="Hero"
        data-hero-model-boundary
      >
        <HeroModel src="/model.glb" ariaLabel="My Handler hero model" />
        {/* this was originally splitType words, not lines */}
        <h2 className="type-h2 pointer-events-none absolute bottom-48 left-1/2 -translate-x-1/2 whitespace-nowrap text-center text-surface">
          <AnimatedText as="div" viewport={false} duration={0.8}>
            <span className="block">{t("line1")}</span>
            <span className="block">{t("line2")}</span>
          </AnimatedText>
        </h2>
        {/* this was originally splitType words, not lines */}
        <p className="type-eyebrow pointer-events-none absolute bottom-20 left-1/2 -translate-x-1/2 whitespace-nowrap text-center text-surface">
          <AnimatedText as="span" viewport={false} animationDelay={0.2}>
            {t("scroll")}
          </AnimatedText>
        </p>

        <div ref={darkRef} data-hero-parallax-dark className="pointer-events-none absolute inset-0 bg-ink opacity-0" />
        <div ref={blurRef} data-hero-parallax-blur className="pointer-events-none absolute inset-0" />
      </section>
    </div>
  );
}
