"use client";

import { useTranslations } from "next-intl";
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

// — clipPath reveal (old approach) —
const CLIP_HIDDEN = "inset(50% 50% 50% 50%)";
const CLIP_VISIBLE = "inset(0% 0% 0% 0%)";
const DURATION = 0.48;

function ServiceImage({
  service,
  ref,
}: {
  service: Service;
  ref: React.RefCallback<HTMLImageElement>;
}) {
  const src = resolveImageSrc(service.image);
  if (!src) return null;
  return (
    <img
      ref={ref}
      src={src}
      alt=""
      width={480}
      height={600}
      className="clip-hidden absolute inset-0 h-full w-full object-cover"
      loading="eager"
    />
  );
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

  // — clipPath reveal state —
  const imageRefs = React.useRef<Record<string, HTMLImageElement | null>>({});
  const gsapRef = React.useRef<GsapBundle | null>(null);
  const activeIdRef = React.useRef<string | null>(null);
  const zCounter = React.useRef(1);

  React.useEffect(() => {
    let active = true;
    loadGsap().then((bundle) => {
      if (active) gsapRef.current = bundle;
    });
    return () => {
      active = false;
    };
  }, []);

  const reducedMotion = () => window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  const collapse = React.useCallback((el: HTMLImageElement) => {
    const bundle = gsapRef.current;
    if (!bundle) return;
    bundle.gsap.to(el, { clipPath: CLIP_HIDDEN, duration: reducedMotion() ? 0 : DURATION, ease: "power3.out" });
  }, []);

  const onEnter = React.useCallback(
    (id: string) => {
      activeIdRef.current = id;
      const bundle = gsapRef.current;
      const el = imageRefs.current[id];
      if (!bundle || !el) return;

      zCounter.current += 1;
      bundle.gsap.set(el, { zIndex: zCounter.current });
      bundle.gsap.fromTo(
        el,
        { clipPath: CLIP_HIDDEN },
        {
          clipPath: CLIP_VISIBLE,
          duration: reducedMotion() ? 0 : DURATION,
          ease: "power3.out",
          onComplete: () => {
            if (activeIdRef.current !== id) collapse(el);
          },
        }
      );
    },
    [collapse]
  );

  const onListLeave = React.useCallback(() => {
    activeIdRef.current = null;
    const bundle = gsapRef.current;
    if (!bundle) return;
    for (const { id } of services) {
      const el = imageRefs.current[id];
      if (el && !bundle.gsap.isTweening(el)) collapse(el);
    }
  }, [collapse, services]);

  // — translating preview (commented out) —
  // const containerRef = React.useRef<HTMLDivElement>(null);
  // const previewRef = React.useRef<HTMLDivElement>(null);
  // const imgRef = React.useRef<HTMLImageElement>(null);
  // const liRefs = React.useRef<(HTMLLIElement | null)[]>([]);
  // const baseTopRef = React.useRef(0);
  // const isDesktopRef = React.useRef(false);
  //
  // const relativeTop = React.useCallback((el: HTMLElement) => {
  //   const container = containerRef.current;
  //   if (!container) return 0;
  //   return el.getBoundingClientRect().top - container.getBoundingClientRect().top;
  // }, []);
  //
  // const updateBaseTop = React.useCallback(() => {
  //   const firstLi = liRefs.current[0];
  //   if (!firstLi) return;
  //   baseTopRef.current = relativeTop(firstLi);
  //   if (previewRef.current) previewRef.current.style.top = `${baseTopRef.current}px`;
  // }, [relativeTop]);
  //
  // const goToService = React.useCallback(
  //   (index: number) => {
  //     const li = liRefs.current[index];
  //     const preview = previewRef.current;
  //     const img = imgRef.current;
  //     const service = services[index];
  //     if (!li || !preview || !img || !service) return;
  //     const centerOffset = (li.offsetHeight - preview.offsetHeight) / 2;
  //     const translateY = relativeTop(li) - baseTopRef.current + centerOffset;
  //     preview.style.transform = `translateY(${translateY}px)`;
  //     const src = resolveImageSrc(service.image);
  //     if (src && img.getAttribute("src") !== src) img.src = src;
  //   },
  //   [relativeTop, services]
  // );
  //
  // const setTransition = React.useCallback(() => {
  //   const preview = previewRef.current;
  //   if (!preview) return;
  //   const rm = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  //   preview.style.transition = rm ? "none" : "transform 480ms cubic-bezier(0.17,0.84,0.44,1)";
  // }, []);
  //
  // React.useEffect(() => {
  //   const mq = window.matchMedia("(min-width: 1024px)");
  //   const onMqChange = (e: MediaQueryListEvent) => {
  //     isDesktopRef.current = e.matches;
  //     if (e.matches) updateBaseTop();
  //   };
  //   mq.addEventListener("change", onMqChange);
  //   isDesktopRef.current = mq.matches;
  //   updateBaseTop();
  //   setTransition();
  //   const firstSrc = resolveImageSrc(services[0]?.image ?? null);
  //   if (imgRef.current && firstSrc) imgRef.current.src = firstSrc;
  //   return () => mq.removeEventListener("change", onMqChange);
  // }, [updateBaseTop, setTransition, services]);
  //
  // const onEnterTranslate = (index: number) => {
  //   if (!isDesktopRef.current) return;
  //   setTransition();
  //   goToService(index);
  // };

  return (
    <section className="section-padding bg-surface text-ink lg:-mt-80 lg:pt-0" aria-label="Services">
      <div className="layout-grid">
        <h1 className="type-h1 pb-20 col-span-full uppercase lg:text-right">{t("services.heading")}</h1>
      </div>

      <div className="layout-grid relative">
        {/* biome-ignore lint/a11y/useKeyWithMouseEvents: hover-only progressive enhancement; list links remain keyboard-reachable */}
        <ul className="col-span-full m-0 list-none border-rule border-t p-0" onMouseLeave={onListLeave}>
          {services.map((service) => (
            // biome-ignore lint/a11y/useKeyWithMouseEvents: decorative hover reveal only
            <li
              key={service.id}
              className="group layout-grid-row cursor-pointer border-rule border-b py-20 lg:py-28"
              onMouseEnter={() => onEnter(service.id)}
            >
              <h4 className="type-h4 col-span-full uppercase motion-safe:transition-transform motion-safe:duration-300 motion-safe:ease-[ease] motion-safe:group-hover:translate-x-12">
                {service.name || (service.labelKey ? t(`services.${service.labelKey}`) : "")}
              </h4>
            </li>
          ))}
        </ul>

        {/* — clipPath reveal preview (rotated, fixed stack) — */}
        <div className="pointer-events-none absolute inset-0 hidden items-center justify-end pr-80 lg:flex" aria-hidden="true">
          <div className="relative aspect-service-card h-[30vh] rotate-10">
            {services.map((service) => (
              <ServiceImage
                key={service.id}
                service={service}
                ref={(el) => {
                  imageRefs.current[service.id] = el;
                }}
              />
            ))}
          </div>
        </div>

        {/* — translating preview (commented out) —
        <div
          ref={previewRef}
          className="aspect-service-card h-services-preview pointer-events-none absolute right-20 hidden overflow-hidden lg:block"
          aria-hidden="true"
        >
          <img ref={imgRef} alt="" width={480} height={600} className="h-full w-full object-cover" loading="eager" />
        </div>
        */}
      </div>

      <div className="flex justify-end pt-40">
        <CtaButton to="/services" className="text-right">
          {t("cta.exploreServices")}
        </CtaButton>
      </div>
    </section>
  );
}
