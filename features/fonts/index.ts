import localFont from "next/font/local";

/**
 * Brand fonts for My Handler. Loaded on `<html>` so the `--font-pp-museum-*` and
 * `--font-suisse-light` variables exist for the `.type-*` typography classes
 * (see `~/features/style/brand.css`).
 */
const ppMuseumLight = localFont({
  src: "../../public/fonts/PPMuseum-Light.woff2",
  weight: "300",
  style: "normal",
  display: "swap",
  variable: "--font-pp-museum-light",
});

const ppMuseumThin = localFont({
  src: "../../public/fonts/PPMuseum-Thin.woff2",
  weight: "100",
  style: "normal",
  display: "swap",
  variable: "--font-pp-museum-thin",
});

const suisseLight = localFont({
  src: "../../public/fonts/SuisseIntl-Light.woff2",
  weight: "300",
  style: "normal",
  display: "swap",
  variable: "--font-suisse-light",
});

export const fonts = [ppMuseumLight, ppMuseumThin, suisseLight];
