"use client";

import { useTranslations } from "next-intl";
import * as React from "react";
import { AnimatedWordmark } from "~/components/brand/animated-wordmark";
import { MyHandlerMonogram } from "~/components/brand/monogram";
import { MainLink } from "~/components/main-link";
import { loadGsap } from "~/features/motion/gsap";
import { NAV_LINKS, SOCIAL_LINKS } from "~/features/site/nav";

export function SiteFooter() {
  const t = useTranslations();
  const wrapRef = React.useRef<HTMLDivElement>(null);
  const innerRef = React.useRef<HTMLElement>(null);
  const darkRef = React.useRef<HTMLDivElement>(null);

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
        // Parallax amount: tweak yPercent to change how far the inner block travels.
        tl.from(innerRef.current, { yPercent: -25, ease: "none" });
        tl.from(darkRef.current, { opacity: 0.5, ease: "none" }, "<");
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
      >
        <div className="section-px flex w-full flex-col gap-80 pb-0 lg:flex-row lg:justify-between lg:pb-80">
          {/* Logo: desktop only, centered */}
          <div className="absolute top-[40%] left-1/2 hidden -translate-x-1/2 -translate-y-1/2 items-center justify-center lg:flex">
            <MyHandlerMonogram aria-label="My Handler logo" className="w-auto lg:h-[40vh]" />
          </div>

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

        <div className="absolute right-0 bottom-0 left-0 flex flex-col gap-8 overflow-hidden px-20 pb-20 text-surface lg:px-40">
          <AnimatedWordmark className="h-full w-full object-cover" />
        </div>
      </footer>

      <div ref={darkRef} data-footer-parallax-dark className="pointer-events-none absolute inset-0 bg-ink opacity-0" />
    </div>
  );
}
