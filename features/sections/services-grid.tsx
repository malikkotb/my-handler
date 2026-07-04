"use client";

import { useLocale, useTranslations } from "next-intl";
import * as React from "react";
import { CtaButton } from "~/components/cta-button";
import { loadGsap } from "~/features/motion/gsap";
import type { ImageFragmentResult } from "~/features/sanity/media/fragment";
import { getImageSrc } from "~/features/sanity/media/image/utils";

type GsapBundle = Awaited<ReturnType<typeof loadGsap>>;

type Service = {
  id: string;
  name?: string;
  labelKey?: string;
  image: ImageFragmentResult | string | null;
};

type ServiceInput = {
  id?: string | null;
  name?: string | null;
  nameFrench?: string | null;
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

// Single-image cursor pop-up: one floating preview swaps `src` per hovered row,
// pops in centered on the pointer, tracks mousemove, and eases out on leave.
// Offsets are measured from the image's own rendered box (not hardcoded) so the
// centering math always matches its actual size (h-[30vh], same as before).
const ENTER_DURATION = 0.2;
const LEAVE_DURATION = 0.8;

export function ServicesGrid({ services: servicesInput }: { services?: ServiceInput[] | null }) {
  const t = useTranslations();
  const locale = useLocale();
  const services: Service[] = servicesInput?.length
    ? servicesInput.map((service, index) => ({
        id: service.id ?? String(index),
        name: (locale === "fr" ? service.nameFrench : null) ?? service.name ?? "",
        image: service.image ?? null,
      }))
    : SERVICES;

  const containerRef = React.useRef<HTMLDivElement>(null);
  const previewRef = React.useRef<HTMLDivElement>(null);
  const imageRef = React.useRef<HTMLImageElement>(null);
  const gsapRef = React.useRef<GsapBundle | null>(null);
  const enabledRef = React.useRef(false);
  const reducedMotionRef = React.useRef(false);
  const activeIdRef = React.useRef<string | null>(null);

  React.useEffect(() => {
    enabledRef.current = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
    reducedMotionRef.current = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let active = true;
    loadGsap().then((bundle) => {
      if (active) gsapRef.current = bundle;
    });
    return () => {
      active = false;
    };
  }, []);

  const onEnter = React.useCallback((service: Service, event: React.MouseEvent<HTMLLIElement>) => {
    const bundle = gsapRef.current;
    const preview = previewRef.current;
    const img = imageRef.current;
    const container = containerRef.current;
    if (!bundle || !preview || !img || !container || !enabledRef.current) return;

    const src = resolveImageSrc(service.image);
    if (!src) return;

    activeIdRef.current = service.id;
    if (img.getAttribute("src") !== src) img.src = src;

    const rect = container.getBoundingClientRect();
    bundle.gsap.set(preview, {
      x: event.clientX - rect.left - preview.offsetWidth / 2,
      y: event.clientY - rect.top - preview.offsetHeight / 2,
    });
    bundle.gsap.fromTo(
      preview,
      { autoAlpha: 0, scale: 0.8 },
      { scale: 1, autoAlpha: 1, duration: reducedMotionRef.current ? 0 : ENTER_DURATION, overwrite: true }
    );
  }, []);

  const onMove = React.useCallback((event: React.MouseEvent<HTMLDivElement>) => {
    const bundle = gsapRef.current;
    const preview = previewRef.current;
    const container = containerRef.current;
    if (!bundle || !preview || !container || !enabledRef.current || !activeIdRef.current || reducedMotionRef.current) {
      return;
    }

    const rect = container.getBoundingClientRect();
    bundle.gsap.set(preview, {
      x: event.clientX - rect.left - preview.offsetWidth / 2,
      y: event.clientY - rect.top - preview.offsetHeight / 2,
    });
  }, []);

  const onLeave = React.useCallback(() => {
    activeIdRef.current = null;
    const bundle = gsapRef.current;
    const preview = previewRef.current;
    if (!bundle || !preview) return;
    bundle.gsap.to(preview, {
      autoAlpha: 0,
      scale: 0.2,
      duration: reducedMotionRef.current ? 0 : LEAVE_DURATION,
      ease: "expo.out",
      onComplete: () => {
        bundle.gsap.set(preview, { autoAlpha: 0 });
      },
    });
  }, []);

  return (
    <section className="section-padding bg-surface text-ink lg:-mt-80 lg:pt-0" aria-label="Services">
      <div className="layout-grid">
        <h1 className="type-h1 col-span-full pb-20 uppercase lg:text-right">{t("services.heading")}</h1>
      </div>

      {/* biome-ignore lint/a11y/noStaticElementInteractions: hover-only progressive enhancement; list links remain keyboard-reachable */}
      <div ref={containerRef} className="layout-grid relative" onMouseMove={onMove} onMouseLeave={onLeave}>
        <ul className="col-span-full m-0 list-none border-rule border-t p-0">
          {services.map((service) => (
            // biome-ignore lint/a11y/useKeyWithMouseEvents: decorative hover reveal only
            <li
              key={service.id}
              className="group layout-grid-row cursor-pointer border-rule border-b py-20 lg:py-28"
              onMouseEnter={(event) => onEnter(service, event)}
            >
              <h4 className="type-h4 col-span-full uppercase motion-safe:transition-transform motion-safe:duration-[650ms] motion-safe:ease-custom-easing motion-safe:group-hover:translate-x-12">
                {service.name || (service.labelKey ? t(`services.${service.labelKey}`) : "")}
              </h4>
            </li>
          ))}
        </ul>

        {/* Single floating preview: swaps src per hovered row, pops in on the cursor. */}
        <div
          ref={previewRef}
          className="pointer-events-none invisible absolute top-0 left-0 z-10 hidden aspect-service-card h-[30vh] opacity-0 lg:block"
          style={{ willChange: "transform, opacity" }}
          aria-hidden="true"
        >
          <img ref={imageRef} alt="" width={480} height={600} className="h-full w-full object-cover" loading="eager" />
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
