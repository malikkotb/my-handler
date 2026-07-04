"use client";

import { useLocale } from "next-intl";
import * as React from "react";
import { Link } from "~/components/link";
import { screens } from "~/features/dom/constants";
import { loadGsap } from "~/features/motion/gsap";
import { cx } from "~/features/style/utils";
import { getPathname } from "~/i18n/navigation";

type CtaButtonProps = {
  to: string;
  /** Plain-text label — required for the hover char-blur animation. */
  children: string;
  className?: string;
};

export function CtaButton({ to, children, className }: CtaButtonProps) {
  const locale = useLocale();
  const href = getPathname({ href: to, locale });
  const hostRef = React.useRef<HTMLSpanElement>(null);
  const chars = Array.from(children);

  React.useEffect(() => {
    const host = hostRef.current;
    if (!host || chars.length === 0) {
      return;
    }

    const root = host.closest("a") ?? host;
    const glyphs = Array.from(host.querySelectorAll<HTMLElement>(".cta-char-glyph"));

    let isCancelled = false;
    let detach: (() => void) | undefined;

    loadGsap().then(({ gsap }) => {
      if (isCancelled) {
        return;
      }

      const reducedMotionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
      const largeScreenQuery = window.matchMedia(`(min-width: ${screens.lg})`);
      const hoverCapableQuery = window.matchMedia("(hover: hover) and (pointer: fine)");

      const onEnter = () => {
        if (reducedMotionQuery.matches || !largeScreenQuery.matches || !hoverCapableQuery.matches) {
          return;
        }

        gsap.killTweensOf(glyphs);

        const stagger = 0.1;
        const hold = 0.1;
        const tl = gsap.timeline();
        glyphs.forEach((glyph, index) => {
          const start = index * stagger;
          tl.set(glyph, { filter: "blur(5px)" }, start).to(glyph, { filter: "blur(0px)", ease: "ctaBlur" }, start + hold);
        });
      };

      root.addEventListener("mouseenter", onEnter);

      detach = () => {
        root.removeEventListener("mouseenter", onEnter);
        gsap.killTweensOf(glyphs);
      };
    });

    return () => {
      isCancelled = true;
      detach?.();
    };
  }, [chars.length]);

  return (
    <Link
      href={href}
      className={cx(
        "type-cta border border-accent justify-center items-end w-fit gap-8 text-ink uppercase no-underline",
        className
      )}
    >
      <span ref={hostRef} className="inline-flex">
        {chars.map((char, index) => (
          <span key={`${char}-${index}`} className="cta-char-glyph">
            {char === " " ? " " : char}
          </span>
        ))}
      </span>
      <span aria-hidden="true" className="translate-y-arrow pl-8">
        ↗
      </span>
    </Link>
  );
}
