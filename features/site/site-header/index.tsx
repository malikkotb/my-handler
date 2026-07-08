"use client";

import { useReducedMotion } from "@mantine/hooks";
import { useLenis } from "lenis/react";
import { motion } from "motion/react";
import { useLocale, useTranslations } from "next-intl";
import * as React from "react";
import { createPortal } from "react-dom";
import { MyHandlerWordmark } from "~/components/brand/wordmark";
import { Link } from "~/components/link";
import { MainLink } from "~/components/main-link";
import { usePrefersReducedMotion } from "~/features/motion/use-prefers-reduced-motion";
import { HEADER_NAV_LINKS, LABELS, NAV_LINKS, SOCIAL_LINKS } from "~/features/site/nav";
import { useHeaderTheme } from "~/features/site/use-header-theme";
import { cx } from "~/features/style/utils";
import { getPathname, usePathname } from "~/i18n/navigation";
import { type Locale, routing } from "~/i18n/routing";

type MenuState = "closed" | "open" | "closing";

const MENU_ANIMATION_MS = 350;

// Entrance: each nav element rises from behind an overflow-hidden mask, left to right.
const REVEAL_EASE = [0.23, 1, 0.32, 1] as const;

const revealContainerVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.09 } },
};

const revealItemVariants = {
  hidden: { y: "100%" },
  visible: { y: "0%", transition: { duration: 0.7, ease: REVEAL_EASE } },
};

/** Masks `children` with `overflow-hidden` and rises them into place as part of the header's entrance stagger. */
function HeaderRevealItem({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <span className={cx("block overflow-hidden", className)}>
      <motion.span className="block" variants={revealItemVariants}>
        {children}
      </motion.span>
    </span>
  );
}

// Scrolled past roughly the header's own height before it may hide; below this it stays pinned.
const HEADER_HIDE_AFTER = 80;
// Ignore sub-pixel scroll jitter so the direction flip doesn't make the header flicker.
const HEADER_SCROLL_DELTA = 4;

function getLocaleSwitchHref(pathname: string, locale: Locale): string {
  const localizedHref = getPathname({ href: pathname, locale });

  if (locale !== routing.defaultLocale) {
    return localizedHref;
  }

  return pathname === "/" ? `/${locale}` : `/${locale}${pathname}`;
}

export function SiteHeader() {
  const t = useTranslations();
  const locale = useLocale();
  const pathname = usePathname();
  const otherLocale = locale === "fr" ? "en" : "fr";
  // Locale switch changes the [locale] segment (full layout re-render), so do a plain
  // navigation rather than a View Transition — the latter would stall on the re-render.
  const switchHref = getLocaleSwitchHref(pathname, otherLocale);

  const isInverted = useHeaderTheme();
  const reduceMotion = usePrefersReducedMotion();
  const [menu, setMenu] = React.useState<MenuState>("closed");
  const [mounted, setMounted] = React.useState(false);
  const [hidden, setHidden] = React.useState(false);

  const menuVisible = menu !== "closed";

  React.useEffect(() => setMounted(true), []);

  const reducedMotion = useReducedMotion();
  const prevScrollRef = React.useRef(0);

  useLenis(
    ({ scroll }) => {
      const delta = scroll - prevScrollRef.current;

      if (Math.abs(delta) < HEADER_SCROLL_DELTA) {
        return;
      }

      prevScrollRef.current = scroll;

      if (reducedMotion || scroll < HEADER_HIDE_AFTER) {
        setHidden(false);
        return;
      }

      setHidden(delta > 0);
    },
    [reducedMotion]
  );

  const closeMenu = React.useCallback(() => {
    setMenu((s) => (s === "open" ? "closing" : "closed"));
  }, []);

  React.useEffect(() => {
    if (menu !== "closing") {
      return;
    }

    const timeout = window.setTimeout(() => setMenu("closed"), MENU_ANIMATION_MS);

    return () => window.clearTimeout(timeout);
  }, [menu]);

  // Escape closes the menu.
  React.useEffect(() => {
    if (!menuVisible) {
      return;
    }
    const onKeydown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        closeMenu();
      }
    };
    window.addEventListener("keydown", onKeydown);
    return () => window.removeEventListener("keydown", onKeydown);
  }, [menuVisible, closeMenu]);

  return (
    <>
      <header
        className={cx(
          "fixed inset-x-0 top-0 z-50 transition-transform-color duration-500 ease-out",
          "motion-reduce:transition-none",
          hidden && !menuVisible ? "-translate-y-full" : "translate-y-0",
          isInverted && menu === "closed" ? "text-surface" : "text-ink"
        )}
      >
        <motion.div
          className="flex h-80 items-center justify-between px-20 lg:px-40"
          variants={revealContainerVariants}
          initial={reduceMotion ? false : "hidden"}
          animate="visible"
        >
          <HeaderRevealItem>
            <Link
              href={getPathname({ href: "/", locale })}
              className="cursor-pointer"
              aria-label={LABELS.homeAria}
              onClick={closeMenu}
            >
              <MyHandlerWordmark aria-hidden className="h-16 w-auto" />
            </Link>
          </HeaderRevealItem>

          {/* Mobile menu toggle. Placed right after the logo (not after the desktop nav below) so its
              stagger slot is second, not last — on mobile it's the only other visible element, and the
              desktop nav's `hidden` items would otherwise eat stagger slots nobody sees. Both this and
              the desktop nav below are hidden (not unmounted) at the other breakpoint via CSS, so this
              reorder doesn't change layout at either size. */}
          <HeaderRevealItem className="lg:hidden">
            <MainLink
              type="button"
              className="cursor-pointer"
              aria-expanded={menuVisible}
              aria-controls="mobile-menu"
              aria-label={menuVisible ? "Close navigation menu" : "Open navigation menu"}
              onClick={() => setMenu((s) => (s === "closed" ? "open" : "closing"))}
            >
              {menuVisible ? t("header.close") : t("header.menu")}
            </MainLink>
          </HeaderRevealItem>

          {/* Desktop center nav */}
          <nav className="hidden gap-20 lg:flex">
            {HEADER_NAV_LINKS.map((link) => (
              <HeaderRevealItem key={link.path}>
                <MainLink to={link.path}>{t(link.i18nKey)}</MainLink>
              </HeaderRevealItem>
            ))}
          </nav>

          {/* Desktop right nav */}
          <nav className="hidden items-center gap-20 lg:flex">
            <HeaderRevealItem>
              <MainLink href={switchHref} aria-label="Switch language">
                {t("header.switchLang")}
              </MainLink>
            </HeaderRevealItem>
            <HeaderRevealItem>
              <MainLink to="/contact">{t("nav.contact")}</MainLink>
            </HeaderRevealItem>
          </nav>
        </motion.div>
      </header>

      {/* Mobile fullscreen */}
      {mounted &&
        menuVisible &&
        createPortal(
          <div id="mobile-menu" className="fixed inset-0 z-40 text-ink lg:hidden">
            <div
              className={cx(
                "absolute inset-0 bg-surface",
                menu === "open" ? "animate-menu-surface-in" : "animate-menu-surface-out"
              )}
              aria-hidden
            />
            <div
              className={cx(
                "layout-grid relative flex h-full flex-col justify-between p-20",
                menu === "open" ? "animate-menu-in" : "animate-menu-out"
              )}
              onAnimationEnd={() => {
                if (menu === "closing") {
                  setMenu("closed");
                }
              }}
            >
              <nav className="col-span-3 col-start-1 mt-160 flex flex-col gap-20" aria-label="Primary navigation">
                {NAV_LINKS.map((link) => (
                  <MainLink key={link.path} to={link.path} tone="ink" size="mobileLarge" onClick={closeMenu}>
                    {t(link.i18nKey)}
                  </MainLink>
                ))}
              </nav>

              <nav className="col-span-3 col-start-1 flex flex-col gap-4" aria-label="Social links">
                {SOCIAL_LINKS.map((link) => (
                  <MainLink key={link.href} href={link.href} target="_blank" rel="noopener noreferrer" tone="ink">
                    {link.label}
                  </MainLink>
                ))}
              </nav>

              <div className="flex justify-between">
                <MainLink to="/legal" tone="ink" onClick={closeMenu}>
                  {t("footer.legal")}
                </MainLink>
                <MainLink href={switchHref} tone="ink" aria-label="Switch language" onClick={closeMenu}>
                  {t("header.switchLang")}
                </MainLink>
              </div>
            </div>
          </div>,
          document.body
        )}
    </>
  );
}
