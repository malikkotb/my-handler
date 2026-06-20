"use client";

import { useTranslations } from "next-intl";

const VALUE_KEYS = ["loyalty", "goodwill", "boldness", "beauty"] as const;

export function AboutTextColumns() {
  const t = useTranslations("about");

  return (
    <section className="section-padding bg-surface py-0 text-ink" aria-labelledby="about-philosophy-heading">
      <div className="layout-grid">
        <div className="col-span-6 col-start-5 flex flex-col gap-32 lg:col-span-3 lg:col-start-5">
          <h2 id="about-philosophy-heading" className="type-eyebrow">
            {t("philosophy.heading")}
          </h2>
          <div className="flex flex-col gap-32">
            <p className="type-body">{t("philosophy.firstParagraph")}</p>
            <p className="type-body">{t("philosophy.secondParagraph")}</p>
          </div>
        </div>

        <div className="col-span-6 col-start-5 mt-64 flex flex-col gap-32 lg:col-span-3 lg:col-start-8 lg:mt-0">
          <h2 className="type-eyebrow">{t("values.heading")}</h2>
          <dl className="flex flex-col gap-32">
            {VALUE_KEYS.map((key) => (
              <div key={key} className="flex flex-col gap-12">
                <dt className="type-eyebrow-lowercase">{t(`values.${key}.title`)}</dt>
                <dd className="type-body">{t(`values.${key}.body`)}</dd>
              </div>
            ))}
          </dl>
        </div>
      </div>
    </section>
  );
}
