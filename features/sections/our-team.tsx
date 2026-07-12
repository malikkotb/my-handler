"use client";

import { useTranslations } from "next-intl";
import * as React from "react";
import { AnimatedText } from "~/components/animated-text";
import { loadGsap } from "~/features/motion/gsap";

export function OurTeam() {
  const t = useTranslations("about");
  const parallaxRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    const el = parallaxRef.current;
    if (!el || window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      return;
    }

    let cleanup: (() => void) | undefined;

    loadGsap().then(({ gsap }) => {
      if (!parallaxRef.current) {
        return;
      }

      const ctx = gsap.context(() => {
        const image = el.querySelector("img");
        if (!image) {
          return;
        }
        gsap.fromTo(
          image,
          { yPercent: -20 },
          {
            yPercent: 20,
            ease: "none",
            scrollTrigger: { trigger: el, start: "top bottom", end: "bottom top", scrub: true, markers: true },
          }
        );
      }, el);

      cleanup = () => ctx.revert();
    });

    return () => cleanup?.();
  }, []);

  return (
    <section className="section-padding">
      <div className="layout-grid">
        <div className="col-span-full w-full sm:col-span-6 lg:col-span-4">
          <div className="aspect-service-card max-h-[calc(100dvh-40px)] w-full overflow-hidden" ref={parallaxRef}>
            <img src="/about/Edouard.avif" alt="" className="h-full w-full object-cover" loading="eager" />
          </div>
          <div className="flex flex-col gap-2 pt-8">
            <span className="type-eyebrow-alt">EDOUARD JANICKI</span>
            <span className="type-eyebrow-xs">CEO &amp; FOUNDER</span>
          </div>
        </div>

        <div className="type-body col-span-full flex flex-col gap-40 py-20 sm:col-span-6 lg:col-span-3 lg:py-0">
          <AnimatedText as="div">{t("teamBody1")}</AnimatedText>
          <AnimatedText as="div" animationDelay={0.1}>
            {t("teamBody2")}
          </AnimatedText>
        </div>
      </div>
    </section>
  );
}
