import { defineRouting } from "next-intl/routing";

/**
 * EN is the default and unprefixed (`/about`); FR is prefixed (`/fr/about`),
 * mirroring the legacy Nuxt `prefix_except_default` strategy.
 */
export const routing = defineRouting({
  locales: ["en", "fr"],
  defaultLocale: "en",
  localePrefix: "as-needed",
  // Applied to prevent automatic language switches from NEXT_LOCALE or Accept-Language.
  // Remove this if language detection should become preference-based again.
  localeDetection: false,
});

export type Locale = (typeof routing.locales)[number];
