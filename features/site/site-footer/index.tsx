"use client";

import { useTranslations } from "next-intl";
import * as React from "react";
import { AnimatedWordmark } from "~/components/brand/animated-wordmark";
import { MainLink } from "~/components/main-link";
import { loadGsap } from "~/features/motion/gsap";
import { HeroModel } from "~/features/sections/hero/hero-model";
import { NAV_LINKS, SOCIAL_LINKS } from "~/features/site/nav";

export function SiteFooter() {
  const t = useTranslations();
  const wrapRef = React.useRef<HTMLDivElement>(null);
  const innerRef = React.useRef<HTMLElement>(null);
  const darkRef = React.useRef<HTMLDivElement>(null);
  const blurRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      return;
    }

    let cleanup: (() => void) | undefined;

    loadGsap().then(({ gsap }) => {
      if (!wrapRef.current) {
        return;
      }

      const ctx = gsap.context(() => {
        const scrollTrigger = { trigger: wrapRef.current, start: "top bottom", end: "top top", scrub: true };

        const tl = gsap.timeline({ scrollTrigger });
        // Parallax amount: tweak the start yPercent to change how far the inner block travels.
        // Use fromTo (explicit endpoints) rather than from: a scrubbed `.from()` re-captures the
        // element's *current* transform as its rest state on every ScrollTrigger refresh. After a
        // client-side (view-transition) navigation the trigger is created/refreshed while the
        // element is mid-transform and scroll is still resetting, so `.from()` would lock in a
        // wrong rest position and the footer stays visibly broken. Explicit endpoints are immune.
        tl.fromTo(innerRef.current, { yPercent: -25 }, { yPercent: 0, ease: "none" });
        tl.fromTo(darkRef.current, { opacity: 0.5 }, { opacity: 0, ease: "none" }, "<");

        tl.eventCallback("onUpdate", () => {
          if (blurRef.current) {
            const blur = 5 * (1 - tl.progress());
            blurRef.current.style.backdropFilter = `blur(${blur}px)`;
          }
        });
      }, wrapRef);

      cleanup = () => ctx.revert();
    });

    return () => cleanup?.();
  }, []);

  return (
    <div ref={wrapRef} data-footer-parallax className="relative overflow-clip">
      <footer
        ref={innerRef}
        data-footer-parallax-inner
        className="relative flex h-dvh-1 items-center bg-ink text-surface"
        data-inverted
        data-hero-model-boundary
      >
        {/* Model: desktop only, full-bleed behind the content */}
        <div className="absolute inset-0 hidden lg:flex">
          <div className="hero-model-frame">
            <HeroModel src="/model.glb" ariaLabel="My Handler logo" />
          </div>
        </div>

        <div className="section-px container relative z-10 mx-auto flex w-full flex-col gap-80 pb-0 lg:flex-row lg:justify-between lg:pb-80">
          <nav className="flex flex-col gap-20" aria-label="Footer navigation">
            {NAV_LINKS.map((link) => (
              <MainLink key={link.path} to={link.path} tone="surface" size="mobileLarge">
                {t(link.i18nKey)}
              </MainLink>
            ))}

            <div className="hidden flex-col gap-4 pt-80 lg:flex">
              <MainLink to="/legal" tone="surface">
                {t("footer.legal")}
              </MainLink>
              <div className="type-eyebrow text-surface uppercase no-underline">{t("footer.copyright")}</div>
            </div>
          </nav>

          <div className="flex flex-col gap-80">
            <div className="flex flex-col items-start gap-20 lg:items-end">
              {SOCIAL_LINKS.map((link) => (
                <MainLink
                  key={link.href}
                  href={link.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  tone="surface"
                  size="mobileLarge"
                >
                  {link.label}
                </MainLink>
              ))}
            </div>
          </div>

          <div className="flex flex-col gap-4 lg:hidden">
            <MainLink to="/legal" tone="surface">
              {t("footer.legal")}
            </MainLink>
            <div className="type-eyebrow text-surface uppercase no-underline">{t("footer.copyright")}</div>
          </div>
        </div>

        <div className="absolute right-0 bottom-0 left-0 z-10 flex flex-col gap-8 overflow-hidden px-20 pb-20 text-surface lg:px-40">
          <AnimatedWordmark className="h-full w-full object-cover" />
        </div>
      </footer>

      <div ref={darkRef} data-footer-parallax-dark className="pointer-events-none absolute inset-0 bg-ink opacity-0" />
      <div ref={blurRef} data-footer-parallax-blur className="pointer-events-none absolute inset-0" />
    </div>
  );
}
