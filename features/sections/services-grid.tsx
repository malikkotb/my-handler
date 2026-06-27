"use client";

import { useTranslations } from "next-intl";
import * as React from "react";
import { CtaButton } from "~/components/cta-button";
import type { ImageFragmentResult } from "~/features/sanity/media/fragment";
import { getImageSrc } from "~/features/sanity/media/image/utils";

type Service = {
  id: string;
  name?: string;
  labelKey?: string;
  image: ImageFragmentResult | string | null;
};

type ServiceInput = {
  id?: string | null;
  name?: string | null;
  image?: ImageFragmentResult | null;
};

const SERVICES = [
  { id: "1", labelKey: "eventManagement", image: "/img1.avif" },
  { id: "2", labelKey: "conciergeServices", image: "/img2.avif" },
  { id: "3", labelKey: "travelArrangements", image: "/img3.avif" },
  { id: "4", labelKey: "transportation", image: "/img4.avif" },
] satisfies Service[];

function resolveImageSrc(image: Service["image"]): string | null {
  if (typeof image === "string") return image;
  if (image?._id) return getImageSrc(image, { width: 480, height: 600, fit: "crop" });
  return null;
}

export function ServicesGrid({ services: servicesInput }: { services?: ServiceInput[] | null }) {
  const t = useTranslations();
  const services: Service[] = servicesInput?.length
    ? servicesInput.map((service, index) => ({
        id: service.id ?? String(index),
        name: service.name ?? "",
        image: service.image ?? null,
      }))
    : SERVICES;

  const containerRef = React.useRef<HTMLDivElement>(null);
  const previewRef = React.useRef<HTMLDivElement>(null);
  const imgRef = React.useRef<HTMLImageElement>(null);
  const liRefs = React.useRef<(HTMLLIElement | null)[]>([]);
  const baseTopRef = React.useRef(0);
  const isDesktopRef = React.useRef(false);

  const relativeTop = React.useCallback((el: HTMLElement) => {
    const container = containerRef.current;
    if (!container) return 0;
    return el.getBoundingClientRect().top - container.getBoundingClientRect().top;
  }, []);

  const updateBaseTop = React.useCallback(() => {
    const firstLi = liRefs.current[0];
    if (!firstLi) return;
    baseTopRef.current = relativeTop(firstLi);
    if (previewRef.current) {
      previewRef.current.style.top = `${baseTopRef.current}px`;
    }
  }, [relativeTop]);

  const goToService = React.useCallback(
    (index: number) => {
      const li = liRefs.current[index];
      const preview = previewRef.current;
      const img = imgRef.current;
      const service = services[index];
      if (!li || !preview || !img || !service) return;

      const centerOffset = (li.offsetHeight - preview.offsetHeight) / 2;
      const translateY = relativeTop(li) - baseTopRef.current + centerOffset;
      preview.style.transform = `translateY(${translateY}px)`;

      const src = resolveImageSrc(service.image);
      if (src && img.getAttribute("src") !== src) {
        img.src = src;
      }
    },
    [relativeTop, services]
  );

  const setTransition = React.useCallback(() => {
    const preview = previewRef.current;
    if (!preview) return;
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    preview.style.transition = reducedMotion ? "none" : "transform 480ms cubic-bezier(0.17,0.84,0.44,1)";
  }, []);

  React.useEffect(() => {
    const mq = window.matchMedia("(min-width: 1024px)");
    const onMqChange = (e: MediaQueryListEvent) => {
      isDesktopRef.current = e.matches;
      if (e.matches) updateBaseTop();
    };
    mq.addEventListener("change", onMqChange);
    isDesktopRef.current = mq.matches;

    updateBaseTop();
    setTransition();

    // Set initial image without triggering the src-equality guard
    const firstSrc = resolveImageSrc(services[0]?.image ?? null);
    if (imgRef.current && firstSrc) {
      imgRef.current.src = firstSrc;
    }

    return () => mq.removeEventListener("change", onMqChange);
  }, [updateBaseTop, setTransition, services]);

  const onEnter = (index: number) => {
    if (!isDesktopRef.current) return;
    setTransition();
    goToService(index);
  };


  return (
    <section className="section-padding bg-surface text-ink lg:-mt-80 lg:pt-0" aria-label="Services">
      <div className="layout-grid">
        <h1 className="type-h1 pb-20 col-span-full uppercase lg:text-right">{t("services.heading")}</h1>
      </div>

      <div ref={containerRef} className="layout-grid relative">
        {/* biome-ignore lint/a11y/useKeyWithMouseEvents: hover-only progressive enhancement; list links remain keyboard-reachable */}
        <ul className="col-span-full m-0 list-none border-rule border-t p-0">
          {services.map((service, index) => (
            // biome-ignore lint/a11y/useKeyWithMouseEvents: decorative hover reveal only
            <li
              key={service.id}
              ref={(el) => {
                liRefs.current[index] = el;
              }}
              className="group layout-grid-row cursor-text border-rule border-b py-20 lg:py-28"
              onMouseEnter={() => onEnter(index)}
            >
              <h4 className="type-h4 col-span-full uppercase motion-safe:transition-transform motion-safe:duration-service motion-safe:ease-service motion-safe:group-hover:translate-x-12">
                {service.name || (service.labelKey ? t(`services.${service.labelKey}`) : "")}
              </h4>
            </li>
          ))}
        </ul>

        <div
          ref={previewRef}
          className="aspect-service-card h-services-preview pointer-events-none absolute right-80 hidden overflow-hidden lg:block"
          aria-hidden="true"
        >
          {/* src is set imperatively on mount and on hover */}
          <img ref={imgRef} alt="" width={480} height={600} className="h-full w-full object-cover" loading="eager" />
        </div>
      </div>

      <div className="flex justify-end pt-40">
        <CtaButton to="/services" className="text-right">
          {t("cta.exploreServices")}
        </CtaButton>
      </div>
    </section>
  );
}
