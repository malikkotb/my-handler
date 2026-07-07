"use client";

import { useTranslations } from "next-intl";
import * as React from "react";
import { MaskTextReveal } from "~/components/mask-text-reveal";
import { loadGsap } from "~/features/motion/gsap";
import { SiteHeader } from "~/features/site/site-header";
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
      <section
        ref={pinRef}
        className="sticky top-0 h-dvh w-full overflow-hidden bg-ink will-change-transform"
        aria-label="Hero"
        data-inverted
      >
        {/* TEMP: header rendered here (absolutely positioned, not fixed) instead of in SiteShell,
            so it's a child of this transformed section and parallaxes with the rest of the hero
            content on scroll. SiteShell's <SiteHeader /> is disabled for the homepage while
            testing this (see features/sections/home-page.tsx). */}
        <SiteHeader />
        <HeroModel src="/model.glb" ariaLabel="My Handler hero model" />
        <MaskTextReveal splitType="words" immediate duration={0.8}>
          <h2 className="type-h2 absolute bottom-48 left-1/2 -translate-x-1/2 whitespace-nowrap text-center text-surface">
            <span className="block">{t("line1")}</span>
            <span className="block">{t("line2")}</span>
          </h2>
        </MaskTextReveal>
        <MaskTextReveal splitType="words" immediate fade delay={0.6}>
          <p className="type-eyebrow absolute bottom-20 left-1/2 -translate-x-1/2 whitespace-nowrap text-center text-surface">
            {t("scroll")}
          </p>
        </MaskTextReveal>

        <div ref={darkRef} data-hero-parallax-dark className="pointer-events-none absolute inset-0 bg-ink opacity-0" />
        <div ref={blurRef} data-hero-parallax-blur className="pointer-events-none absolute inset-0" />
      </section>
    </div>
  );
}
