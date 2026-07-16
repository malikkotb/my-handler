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
import { HEADER_NAV_LINKS, LABELS, NAV_LINKS, SOCIAL_LINKS } from "~/features/site/nav";
import { useHeaderTheme } from "~/features/site/use-header-theme";
import { cx } from "~/features/style/utils";
import { getPathname, usePathname } from "~/i18n/navigation";
import { type Locale, routing } from "~/i18n/routing";

type MenuState = "closed" | "open" | "closing";

const MENU_ANIMATION_MS = 350;

// Left-to-right entrance stagger step (seconds) for each header element's mount reveal.
const HEADER_STAGGER_STEP = 0.09;
const HEADER_REVEAL_EASE = [0.23, 1, 0.32, 1] as const;

type HeaderFadeItemProps = {
  children: React.ReactNode;
  delay: number;
  className?: string;
};

/** Fades and lifts `children` in on mount, left-to-right via `delay`. Used for every header
 * element — `MainLink` items manage their own hover DOM/listeners and can't go through
 * `AnimatedText`'s text splitting, so a plain opacity/y fade keeps the whole header consistent. */
function HeaderFadeItem({ children, delay, className }: HeaderFadeItemProps) {
  const reducedMotion = useReducedMotion();

  return (
    <motion.span
      className={className}
      initial={reducedMotion ? false : { opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: HEADER_REVEAL_EASE, delay }}
    >
      {children}
    </motion.span>
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
        data-site-header
        className={cx(
          "fixed inset-x-0 top-0 z-50 transition-transform-color",
          "motion-reduce:transition-none",
          // Direction-aware easing: accelerate away when hiding (ease-in, no initial
          // lurch), smooth expo deceleration when revealing.
          hidden && !menuVisible
            ? "-translate-y-full duration-700 ease-[cubic-bezier(0.5,0,0.75,0)]"
            : "translate-y-0 duration-700 ease-[cubic-bezier(0.16,1,0.3,1)]",
          isInverted && menu === "closed" ? "text-surface" : "text-ink"
        )}
      >
        <div className="container mx-auto flex h-80 items-center justify-between px-20 lg:px-40">
          <HeaderFadeItem delay={0}>
            <Link
              href={getPathname({ href: "/", locale })}
              className="cursor-pointer"
              aria-label={LABELS.homeAria}
              onClick={closeMenu}
            >
              <MyHandlerWordmark aria-hidden className="h-16 w-auto" />
            </Link>
          </HeaderFadeItem>

          <HeaderFadeItem className="lg:hidden" delay={HEADER_STAGGER_STEP}>
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
          </HeaderFadeItem>

          {/* Desktop center nav */}
          <nav className="hidden gap-20 lg:flex">
            {HEADER_NAV_LINKS.map((link, index) => (
              <HeaderFadeItem key={link.path} delay={HEADER_STAGGER_STEP * (index + 1)}>
                <MainLink to={link.path}>{t(link.i18nKey)}</MainLink>
              </HeaderFadeItem>
            ))}
          </nav>

          {/* Desktop right nav */}
          <nav className="hidden items-center gap-20 lg:flex">
            <HeaderFadeItem delay={HEADER_STAGGER_STEP * (HEADER_NAV_LINKS.length + 1)}>
              <MainLink href={switchHref} aria-label="Switch language">
                {t("header.switchLang")}
              </MainLink>
            </HeaderFadeItem>
            <HeaderFadeItem delay={HEADER_STAGGER_STEP * (HEADER_NAV_LINKS.length + 2)}>
              <MainLink to="/contact">{t("nav.contact")}</MainLink>
            </HeaderFadeItem>
          </nav>
        </div>
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
