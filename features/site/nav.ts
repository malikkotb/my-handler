/**
 * Site navigation + chrome labels.
 *
 * NOTE: strings are inline English for now. Phase 5 (next-intl) will replace
 * `label`/`LABELS` lookups with `useTranslations()` keyed by `i18nKey`.
 */

export type NavLink = {
  /** Translation key, e.g. `nav.about` — used once next-intl lands. */
  i18nKey: string;
  label: string;
  path: string;
};

export const NAV_LINKS: NavLink[] = [
  { i18nKey: "nav.about", label: "About", path: "/about" },
  { i18nKey: "nav.services", label: "Services", path: "/services" },
  { i18nKey: "nav.events", label: "Events", path: "/events" },
  { i18nKey: "nav.contact", label: "Contact", path: "/contact" },
];

/** Header center nav (order differs from the mobile/footer list). */
export const HEADER_NAV_LINKS: NavLink[] = [
  { i18nKey: "nav.events", label: "Events", path: "/events" },
  { i18nKey: "nav.about", label: "About", path: "/about" },
  { i18nKey: "nav.services", label: "Services", path: "/services" },
];

export type SocialLink = {
  label: string;
  href: string;
};

// TODO: replace with real social URLs.
export const SOCIAL_LINKS: SocialLink[] = [
  { label: "Instagram", href: "https://instagram.com" },
  { label: "Facebook", href: "https://facebook.com" },
  { label: "LinkedIn", href: "https://linkedin.com" },
];

export const LABELS = {
  homeAria: "My Handler — home",
} as const;
