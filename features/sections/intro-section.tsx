"use client";

import { useTranslations } from "next-intl";

export function IntroSection() {
  const t = useTranslations("intro");

  return (
    <section className="section-padding pb-0 bg-surface text-ink" aria-label="Intro">
      <div className="layout-grid">
        <h3 className="type-h3 col-span-full">{t("tagline")}</h3>

       {/*  <div className="col-span-8 col-start-3 mt-40 lg:col-span-2 lg:col-start-5 lg:mt-60">
          <p className="type-eyebrow mb-10">{t("missionEyebrow")}</p>
          <p className="type-body">{t("missionBody")}</p>
        </div>

        <div className="col-span-8 col-start-3 mt-40 lg:col-span-2 lg:col-start-8 lg:mt-60">
          <p className="type-eyebrow mb-10">{t("commitmentEyebrow")}</p>
          <p className="type-body">{t("commitmentBody")}</p>
        </div> */}
      </div>
    </section>
  );
}
