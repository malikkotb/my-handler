"use client";

import { useTranslations } from "next-intl";
import { HighlightText } from "~/features/motion/highlight-text";

export function IntroSection() {
  const t = useTranslations("intro");

  return (
    <section className="section-padding lg:pb-0 bg-surface text-ink" aria-label="Intro">
      <div id="intro-text-wrap" className="layout-grid">
        <HighlightText as="h3" className="type-h3 col-span-full">{t("tagline")}</HighlightText>
      </div>
    </section>
  );
}
