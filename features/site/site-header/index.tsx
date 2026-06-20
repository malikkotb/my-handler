"use client";

import { useLenis } from "lenis/react";
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

type MenuState = "closed" | "open" | "closing";

export function SiteHeader() {
  const t = useTranslations();
  const locale = useLocale();
  const pathname = usePathname();
  const otherLocale = locale === "fr" ? "en" : "fr";
  // Locale switch changes the [locale] segment (full layout re-render), so do a plain
  // navigation rather than a View Transition — the latter would stall on the re-render.
  const switchHref = getPathname({ href: pathname, locale: otherLocale });

  const isInverted = useHeaderTheme();
  const lenis = useLenis();
  const [menu, setMenu] = React.useState<MenuState>("closed");
  const [mounted, setMounted] = React.useState(false);

  const menuVisible = menu !== "closed";

  React.useEffect(() => setMounted(true), []);

  const closeMenu = React.useCallback(() => {
    setMenu((s) => (s === "open" ? "closing" : "closed"));
  }, []);

  // Lock Lenis while the overlay is visible.
  React.useEffect(() => {
    if (!lenis) {
      return;
    }
    if (menuVisible) {
      lenis.stop();
    } else {
      lenis.start();
    }
    return () => lenis.start();
  }, [lenis, menuVisible]);

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
          isInverted && menu === "closed" ? "text-surface" : "text-ink"
        )}
      >
        <div className="flex h-80 items-center justify-between px-20 lg:px-40">
          <Link
            href={getPathname({ href: "/", locale })}
            className="cursor-pointer"
            aria-label={LABELS.homeAria}
            onClick={closeMenu}
          >
            <MyHandlerWordmark aria-hidden className="h-16 w-auto" />
          </Link>

          {/* Desktop center nav */}
          <nav className="hidden gap-16 lg:flex">
            {HEADER_NAV_LINKS.map((link) => (
              <MainLink key={link.path} to={link.path}>
                {t(link.i18nKey)}
              </MainLink>
            ))}
          </nav>

          {/* Desktop right nav */}
          <nav className="hidden items-center gap-16 lg:flex">
            <MainLink href={switchHref} aria-label="Switch language">
              {t("header.switchLang")}
            </MainLink>
            <MainLink to="/contact">{t("nav.contact")}</MainLink>
          </nav>

          {/* Mobile menu toggle */}
          <MainLink
            type="button"
            className="cursor-pointer lg:hidden"
            aria-expanded={menuVisible}
            aria-controls="mobile-menu"
            aria-label={menuVisible ? "Close navigation menu" : "Open navigation menu"}
            onClick={() => setMenu((s) => (s === "closed" ? "open" : "closing"))}
          >
            {menuVisible ? t("header.close") : t("header.menu")}
          </MainLink>
        </div>
      </header>

      {/* Mobile fullscreen menu */}
      {mounted &&
        menuVisible &&
        createPortal(
          <div
            id="mobile-menu"
            className={cx(
              "layout-grid fixed inset-0 z-40 flex flex-col justify-between bg-surface p-20 text-ink lg:hidden",
              menu === "open" ? "animate-menu-in" : "animate-menu-out"
            )}
            onAnimationEnd={() => {
              if (menu === "closing") {
                setMenu("closed");
              }
            }}
          >
            <nav className="col-span-3 col-start-1 mt-160 flex flex-col gap-16" aria-label="Primary navigation">
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
          </div>,
          document.body
        )}
    </>
  );
}
