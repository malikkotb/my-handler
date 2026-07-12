"use client";

import { useLocale, useTranslations } from "next-intl";
import * as React from "react";
import { CtaButton } from "~/components/cta-button";
import { MaskTextReveal } from "~/components/mask-text-reveal";
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

const LAYER_COUNT = 2;
const LAYER_TRANSITION_DURATION = 0.9;
const FIRST_REVEAL_DURATION = 0.6;
const LEAVE_DURATION = 0.7;
const FADE_EASE = "power2.out";
const COVERED_LAYER_OVERLAY_OPACITY = 0.5;
const INCOMING_LAYER_START_SCALE = 1.3;

// Cursor pop-up preview: a fixed pool of stacked image layers is reused round-robin
// per hovered row — each new hover slides its layer up from the bottom (yPercent
// 100 -> 0) and raises its z-index above the previous layer, so the incoming image
// covers the last one instead of swapping in place. The wrapper pops in centered on
// the pointer, tracks mousemove, and hides on leave. Offsets are measured from the
// preview's own rendered box (not hardcoded) so the centering math always matches
// its actual size (h-[30vh]).
export function ServicesGridDuplicate({ services: servicesInput }: { services?: ServiceInput[] | null }) {
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
  const layerRefs = React.useRef<(HTMLImageElement | null)[]>([]);
  const overlayRefs = React.useRef<(HTMLDivElement | null)[]>([]);
  const gsapRef = React.useRef<GsapBundle | null>(null);
  const enabledRef = React.useRef(false);
  const reducedMotionRef = React.useRef(false);
  const activeIdRef = React.useRef<string | null>(null);
  const activeLayerRef = React.useRef(-1);
  const topZIndexRef = React.useRef(0);

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
    const container = containerRef.current;
    if (!bundle || !preview || !container || !enabledRef.current) return;

    const src = resolveImageSrc(service.image);
    if (!src) return;

    const isFirstReveal = activeIdRef.current === null;
    const previousLayerIndex = activeLayerRef.current;
    const layerIndex = (previousLayerIndex + 1) % LAYER_COUNT;
    const img = layerRefs.current[layerIndex];
    const overlay = overlayRefs.current[layerIndex];
    if (!img) return;

    activeIdRef.current = service.id;
    activeLayerRef.current = layerIndex;
    if (img.getAttribute("src") !== src) img.src = src;

    topZIndexRef.current += 1;
    bundle.gsap.killTweensOf(img);
    bundle.gsap.set(img, { zIndex: topZIndexRef.current });
    if (overlay) {
      bundle.gsap.killTweensOf(overlay);
      bundle.gsap.set(overlay, { zIndex: topZIndexRef.current, opacity: 0 });
    }

    const rect = container.getBoundingClientRect();
    bundle.gsap.set(preview, {
      x: event.clientX - rect.left - preview.offsetWidth / 2,
      y: event.clientY - rect.top - preview.offsetHeight / 2,
    });

    if (reducedMotionRef.current) {
      bundle.gsap.set(img, { yPercent: 0, scale: 1 });
      bundle.gsap.set(preview, { autoAlpha: 1 });
    } else if (isFirstReveal) {
      bundle.gsap.set(img, { yPercent: 0, scale: 1 });
      bundle.gsap.set(preview, { autoAlpha: 0 });
      bundle.gsap.to(preview, { autoAlpha: 1, duration: FIRST_REVEAL_DURATION, ease: FADE_EASE, overwrite: true });
    } else {
      bundle.gsap.set(preview, { autoAlpha: 1 });
      bundle.gsap.set(img, { yPercent: 100, scale: INCOMING_LAYER_START_SCALE });
      bundle.gsap.to(img, {
        yPercent: 0,
        scale: 1,
        duration: LAYER_TRANSITION_DURATION,
        ease: "expo.out",
        overwrite: true,
      });

      const previousOverlay = overlayRefs.current[previousLayerIndex];
      if (previousOverlay) {
        bundle.gsap.to(previousOverlay, {
          opacity: COVERED_LAYER_OVERLAY_OPACITY,
          duration: LAYER_TRANSITION_DURATION,
          ease: FADE_EASE,
          overwrite: true,
        });
      }
    }
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
    const wasActive = activeIdRef.current !== null;
    activeIdRef.current = null;
    const bundle = gsapRef.current;
    const preview = previewRef.current;
    if (!bundle || !preview || !wasActive) return;

    const activeImg = layerRefs.current[activeLayerRef.current];

    if (reducedMotionRef.current) {
      bundle.gsap.set(preview, { autoAlpha: 0 });
      if (activeImg) bundle.gsap.set(activeImg, { yPercent: 0 });
      return;
    }

    bundle.gsap.to(preview, { autoAlpha: 0, duration: LEAVE_DURATION, ease: FADE_EASE, overwrite: true });
  }, []);

  return (
    <section className="section-padding bg-surface text-ink lg:-mt-80 lg:pt-0" aria-label="Services">
      <div className="layout-grid">
        <MaskTextReveal splitType="letters">
          <h1 className="type-h1 col-span-full pb-20 uppercase lg:text-right">{t("services.heading")}</h1>
        </MaskTextReveal>
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
              <h4 className="type-h4 col-span-full uppercase motion-safe:transition-transform motion-safe:duration-650 motion-safe:ease-custom-easing motion-safe:group-hover:translate-x-12">
                {service.name || (service.labelKey ? t(`services.${service.labelKey}`) : "")}
              </h4>
            </li>
          ))}
        </ul>

        {/* Floating preview: each hovered row's image slides up as a new layer stacked on top of the previous one. */}
        <div
          ref={previewRef}
          className="pointer-events-none invisible absolute top-0 left-0 z-10 hidden aspect-service-card h-[30vh] overflow-hidden opacity-0 lg:block"
          style={{ willChange: "transform, opacity" }}
          aria-hidden="true"
        >
          {Array.from({ length: LAYER_COUNT }, (_, index) => (
            // biome-ignore lint/suspicious/noArrayIndexKey: fixed-size layer pool, index is a stable slot id
            <React.Fragment key={index}>
              <img
                ref={(el) => {
                  layerRefs.current[index] = el;
                }}
                alt=""
                width={480}
                height={600}
                className="absolute inset-0 h-full w-full object-cover"
                loading="lazy"
              />
              <div
                ref={(el) => {
                  overlayRefs.current[index] = el;
                }}
                className="absolute inset-0 bg-black opacity-0"
              />
            </React.Fragment>
          ))}
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
