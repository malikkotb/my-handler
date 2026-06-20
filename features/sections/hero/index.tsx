"use client";

import { useTranslations } from "next-intl";
import { HeroModel } from "./hero-model";

export function Hero() {
  const t = useTranslations("hero");

  return (
    <section className="relative h-dvh bg-ink" aria-label="Hero" data-inverted>
      <HeroModel src="/model.glb" ariaLabel="My Handler hero model" />
      <h1 className="type-h2 absolute bottom-16 left-1/2 -translate-x-1/2 whitespace-nowrap text-center text-surface">
        <span className="block">{t("line1")}</span>
        <span className="block">{t("line2")}</span>
      </h1>
    </section>
  );
}
