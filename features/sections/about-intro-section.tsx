"use client";

import { motion } from "motion/react";
import Image from "next/image";
import { useTranslations } from "next-intl";
import * as React from "react";
import { loadGsap } from "~/features/motion/gsap";
import { usePrefersReducedMotion } from "~/features/motion/use-prefers-reduced-motion";

const REVEAL_EASE = [0.23, 1, 0.32, 1] as const;

export function AboutIntroSection() {
  const t = useTranslations("about");
  const parallaxRef = React.useRef<HTMLDivElement>(null);
  const reduceMotion = usePrefersReducedMotion();

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
        <motion.div
          className="h-full w-full"
          initial={reduceMotion ? undefined : { opacity: 0, y: 24 }}
          whileInView={reduceMotion ? undefined : { opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "0px 0px -10% 0px" }}
          transition={{ duration: 0.8, ease: REVEAL_EASE }}
        >
          <Image
            src="/about/about_main_mobile.avif"
            alt="My Handler team at work"
            width={768}
            height={432}
            className="block h-full w-full scale-120 object-cover lg:hidden"
            priority
          />
          <Image
            src="/about/about_main_desktop.avif"
            alt="My Handler team at work"
            width={1920}
            height={800}
            className="hidden h-full w-full scale-120 object-cover lg:block"
            priority
          />
        </motion.div>
      </div>
      <div className="layout-grid section-padding pb-0">
        <h4 className="type-h4 col-span-full">{t("teamTagline")}</h4>
      </div>
    </>
  );
}
