"use client";

import { useTranslations } from "next-intl";
import * as React from "react";
import { loadGsap } from "~/features/motion/gsap";

export function AboutIntroSection() {
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
        const images = el.querySelectorAll("img");
        if (!images.length) {
          return;
        }
        gsap.fromTo(
          images,
          { yPercent: -20 },
          {
            yPercent: 20,
            ease: "none",
            scrollTrigger: { trigger: el, start: "top bottom", end: "bottom top", scrub: true },
          }
        );
      }, el);

      cleanup = () => ctx.revert();
    });

    return () => cleanup?.();
  }, []);

  return (
    <>
      <div id="about-parallax" ref={parallaxRef} className="max-h-[calc(100dvh-40px)] overflow-hidden">
        {/* biome-ignore lint/performance/noImgElement: local static asset */}
        <img
          src="/about/about_main_mobile.avif"
          alt="My Handler team at work"
          width={768}
          height={432}
          className="block h-full w-full scale-120 object-cover lg:hidden"
          loading="eager"
        />
        {/* biome-ignore lint/performance/noImgElement: local static asset */}
        <img
          src="/about/about_main_desktop.avif"
          alt="My Handler team at work"
          width={1920}
          height={800}
          className="hidden h-full w-full scale-120 object-cover lg:block"
          loading="eager"
        />
      </div>
      <div className="layout-grid section-padding pb-0">
        <h3 className="type-h4 col-span-full">{t("teamTagline")}</h3>
      </div>
    </>
  );
}
