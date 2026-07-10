"use client";

import { useLocale, useTranslations } from "next-intl";
import { CtaButton } from "~/components/cta-button";
import { MaskTextReveal } from "~/components/mask-text-reveal";
import type { ImageFragmentResult } from "~/features/sanity/media/fragment";

type Service = {
  id: string;
  name?: string;
  labelKey?: string;
};

type ServiceInput = {
  id?: string | null;
  name?: string | null;
  nameFrench?: string | null;
  image?: ImageFragmentResult | null;
};

const SERVICES = [
  { id: "1", labelKey: "eventManagement" },
  { id: "2", labelKey: "conciergeServices" },
  { id: "3", labelKey: "travelArrangements" },
  { id: "4", labelKey: "transportation" },
] satisfies Service[];

export function ServicesGridThree({ services: servicesInput }: { services?: ServiceInput[] | null }) {
  const t = useTranslations();
  const locale = useLocale();
  const services: Service[] = servicesInput?.length
    ? servicesInput.map((service, index) => ({
        id: service.id ?? String(index),
        name: (locale === "fr" ? service.nameFrench : null) ?? service.name ?? "",
      }))
    : SERVICES;

  return (
    <section className="section-padding bg-surface text-ink lg:-mt-80 lg:pt-0" aria-label="Services">
      <div className="layout-grid">
        <MaskTextReveal splitType="letters">
          <h1 className="type-h1 col-span-full pb-20 uppercase lg:text-right">{t("services.heading")}</h1>
        </MaskTextReveal>
      </div>

      <div className="layout-grid relative">
        <ul className="col-span-full m-0 list-none border-rule border-t p-0">
          {services.map((service) => (
            <li key={service.id} className="group layout-grid-row cursor-pointer border-rule border-b py-20 lg:py-28">
              <h4 className="type-h4 col-span-full uppercase motion-safe:transition-transform motion-safe:duration-650 motion-safe:ease-custom-easing motion-safe:group-hover:translate-x-12">
                {service.name || (service.labelKey ? t(`services.${service.labelKey}`) : "")}
              </h4>
            </li>
          ))}
        </ul>
      </div>

      <div className="flex justify-end pt-40">
        <CtaButton to="/services" className="text-right">
          {t("cta.exploreServices")}
        </CtaButton>
      </div>
    </section>
  );
}
