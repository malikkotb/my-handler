"use client";

import { useLocale } from "next-intl";
import * as React from "react";
import { Link } from "~/components/link";
import { loadGsap } from "~/features/motion/gsap";
import { cx } from "~/features/style/utils";
import { getPathname } from "~/i18n/navigation";

type MainLinkTone = "inherit" | "ink" | "surface";
type MainLinkSize = "default" | "mobileLarge";

type MainLinkOwnProps = {
  /** Internal route (uses the locale-aware Link). */
  to?: string;
  /** Target locale override (used by the language switcher). */
  locale?: "en" | "fr";
  /** External URL (renders a plain anchor). */
  href?: string;
  type?: "button" | "submit" | "reset";
  tone?: MainLinkTone;
  size?: MainLinkSize;
  /** Plain-text label — required for the char-split animation. */
  children: string;
  className?: string;
};

type MainLinkProps = MainLinkOwnProps &
  Omit<React.HTMLAttributes<HTMLElement>, keyof MainLinkOwnProps> & {
    target?: string;
    rel?: string;
    "aria-label"?: string;
    "aria-expanded"?: boolean;
    "aria-controls"?: string;
  };

/** Builds one row of per-character glyph spans. */
function makeRow(chars: string[], isHidden: boolean) {
  const row = document.createElement("span");
  row.classList.add("char-split-row");
  if (isHidden) {
    row.classList.add("char-split-row-copy");
  }

  const spans = chars.map((char) => {
    const span = document.createElement("span");
    span.classList.add("char-split-glyph");
    span.textContent = char === " " ? " " : char;
    if (isHidden) {
      span.setAttribute("aria-hidden", "true");
    }
    row.appendChild(span);
    return span;
  });

  return { row, spans };
}

export function MainLink(props: MainLinkProps) {
  const { to, locale, href, type = "button", tone = "inherit", size = "default", className, children, ...rest } = props;
  const activeLocale = useLocale();
  const hostRef = React.useRef<HTMLSpanElement>(null);

  React.useEffect(() => {
    const host = hostRef.current;
    if (!host) {
      return;
    }

    const text = children.trim();
    if (!text) {
      return;
    }

    const root = host.closest("a, button") ?? host;
    const chars = Array.from(text);
    const { row: origRow, spans: origSpans } = makeRow(chars, false);
    const { row: copyRow, spans: copySpans } = makeRow(chars, true);

    host.textContent = "";
    host.appendChild(origRow);
    host.appendChild(copyRow);

    let detach: (() => void) | undefined;

    loadGsap().then(({ gsap }) => {
      gsap.set(copySpans, { y: "100%" });

      if (
        window.matchMedia("(prefers-reduced-motion: reduce)").matches ||
        !window.matchMedia("(hover: hover) and (pointer: fine)").matches
      ) {
        return;
      }

      const opts = { duration: 0.6, ease: "mainLink", stagger: 0.018 } as const;

      const onEnter = () => {
        gsap.killTweensOf([...origSpans, ...copySpans]);
        gsap.to(origSpans, { y: "-100%", ...opts });
        gsap.to(copySpans, { y: "0%", ...opts });
      };

      const onLeave = () => {
        gsap.killTweensOf([...origSpans, ...copySpans]);
        gsap.to(origSpans, { y: "0%", ...opts });
        gsap.to(copySpans, { y: "100%", ...opts });
      };

      root.addEventListener("mouseenter", onEnter);
      root.addEventListener("mouseleave", onLeave);

      detach = () => {
        root.removeEventListener("mouseenter", onEnter);
        root.removeEventListener("mouseleave", onLeave);
        gsap.killTweensOf([...origSpans, ...copySpans]);
      };
    });

    return () => detach?.();
  }, [children]);

  const classes = cx(
    "type-eyebrow relative inline-flex overflow-hidden align-middle uppercase no-underline",
    "focus-visible:outline-2 focus-visible:outline-ink focus-visible:outline-offset-4",
    tone === "ink" && "text-ink",
    tone === "surface" && "text-surface",
    size === "mobileLarge" && "text-nav-mobile lg:text-eyebrow",
    className
  );

  const label = rest["aria-label"] ?? children;
  const inner = (
    <span ref={hostRef} className="inline-flex">
      {children}
    </span>
  );

  if (to) {
    // Resolve the locale-prefixed path, then route through the boilerplate's
    // transition Link so navigation plays the View Transitions page animation.
    const localizedHref = getPathname({ href: to, locale: locale ?? activeLocale });
    return (
      <Link href={localizedHref} className={classes} aria-label={label} {...rest}>
        {inner}
      </Link>
    );
  }

  if (href) {
    return (
      <a href={href} className={classes} aria-label={label} {...rest}>
        {inner}
      </a>
    );
  }

  return (
    <button type={type} className={classes} aria-label={label} {...rest}>
      {inner}
    </button>
  );
}
