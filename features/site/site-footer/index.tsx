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
  const footerRef = React.useRef<HTMLElement>(null);
  const navRef = React.useRef<HTMLElement>(null);
  const logoRef = React.useRef<HTMLDivElement>(null);
  const rightColRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      return;
    }

    let cleanup: (() => void) | undefined;

    loadGsap().then(({ gsap }) => {
      if (!footerRef.current) {
        return;
      }

      const trigger = { trigger: footerRef.current, start: "top bottom", end: "top top", scrub: true };

      const ctx = gsap.context(() => {
        for (const el of [logoRef.current, navRef.current, rightColRef.current]) {
          gsap.fromTo(el, { y: 400 }, { y: 0, ease: "none", scrollTrigger: trigger });
        }
      });

      cleanup = () => ctx.revert();
    });

    return () => cleanup?.();
  }, []);

  return (
    <footer ref={footerRef} className="relative h-dvh-1 overflow-clip" data-inverted>
      <div className="relative -top-dvh-1 h-dvh-2">
        <div className="sticky top-0 flex h-dvh-1 items-center bg-ink text-surface">
          <div className="section-px flex w-full flex-col gap-80 pb-0 lg:pb-80 lg:flex-row lg:justify-between">
            {/* Logo: desktop only, centered */}
            <div
              ref={logoRef}
              className="absolute top-1/2 left-1/2 hidden -translate-x-1/2 -translate-y-1/2 items-center justify-center lg:flex"
            >
              <MyHandlerMonogram aria-label="My Handler logo" className="h-192 w-auto lg:h-256" />
            </div>

            <nav ref={navRef} className="flex flex-col gap-20 lg:gap-12" aria-label="Footer navigation">
              {NAV_LINKS.map((link) => (
                <MainLink key={link.path} to={link.path} tone="surface" size="mobileLarge">
                  {t(link.i18nKey)}
                </MainLink>
              ))}
            </nav>

            <div ref={rightColRef} className="flex flex-col gap-80">
              <div className="flex flex-col items-start gap-20 lg:items-end lg:gap-12">
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
          </div>
        </div>

        <div className="absolute right-0 bottom-0 left-0 flex flex-col gap-8 overflow-hidden px-20 pb-8 text-surface lg:px-40 lg:pb-16">
          <AnimatedWordmark className="h-full w-full object-cover" />
          <div className="flex items-center justify-between gap-12">
            <MainLink to="/legal" tone="surface">
              {t("footer.legal")}
            </MainLink>
            <div className="type-eyebrow text-surface uppercase no-underline">{t("footer.copyright")}</div>
          </div>
        </div>
      </div>
    </footer>
  );
}
