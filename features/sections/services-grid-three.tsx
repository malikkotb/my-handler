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
  if (typeof image === "string") {
    return image;
  }
  if (image?._id) {
    return getImageSrc(image, { width: 480, height: 600, fit: "crop" });
  }
  return null;
}

// Image preview cursor follower (Osmo Supply pattern): a fixed cursor tracks the
// pointer via gsap.quickTo, and each hovered row clones its source image into the
// follower, sliding the incoming image up or down (depending on whether the newly
// hovered row is below or above the previously hovered one) to layer on top of the
// previous image, which stays put underneath instead of translating away.
const SLIDE_OFFSET = 100;
const SLIDE_DURATION = 0.5;
const SLIDE_EASE = "power2.inOut";
const FOLLOW_DURATION = 0.6;
const FOLLOW_EASE = "power3";

export function ServicesGridThree({ services: servicesInput }: { services?: ServiceInput[] | null }) {
  const t = useTranslations();
  const locale = useLocale();
  const services: Service[] = servicesInput?.length
    ? servicesInput.map((service, index) => ({
        id: service.id ?? String(index),
        name: (locale === "fr" ? service.nameFrench : null) ?? service.name ?? "",
        image: service.image ?? null,
      }))
    : SERVICES;

  const [hoveredIndex, setHoveredIndex] = React.useState<number | null>(null);

  const followerRef = React.useRef<HTMLDivElement>(null);
  const followerInnerRef = React.useRef<HTMLDivElement>(null);
  const visualRefs = React.useRef<(HTMLImageElement | null)[]>([]);
  const gsapRef = React.useRef<GsapBundle | null>(null);
  const enabledRef = React.useRef(false);
  const reducedMotionRef = React.useRef(false);
  const prevIndexRef = React.useRef<number | null>(null);
  const firstEntryRef = React.useRef(true);
  const topZIndexRef = React.useRef(0);

  React.useEffect(() => {
    enabledRef.current = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
    reducedMotionRef.current = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let active = true;

    loadGsap().then((bundle) => {
      if (!active) {
        return;
      }
      gsapRef.current = bundle;

      const follower = followerRef.current;
      if (!follower || !enabledRef.current) {
        return;
      }

      if (reducedMotionRef.current) {
        return;
      }

      bundle.gsap.set(follower, { xPercent: -50, yPercent: -50 });

      const xTo = bundle.gsap.quickTo(follower, "x", { duration: FOLLOW_DURATION, ease: FOLLOW_EASE });
      const yTo = bundle.gsap.quickTo(follower, "y", { duration: FOLLOW_DURATION, ease: FOLLOW_EASE });
      const onMove = (event: MouseEvent) => {
        xTo(event.clientX);
        yTo(event.clientY);
      };
      window.addEventListener("mousemove", onMove);
      return () => window.removeEventListener("mousemove", onMove);
    });

    return () => {
      active = false;
    };
  }, []);

  const handleItemEnter = React.useCallback((service: Service, index: number) => {
    setHoveredIndex(index);

    const bundle = gsapRef.current;
    const followerInner = followerInnerRef.current;
    const sourceImg = visualRefs.current[index];
    if (!bundle || !followerInner || !sourceImg || !enabledRef.current || reducedMotionRef.current) {
      return;
    }

    const src = resolveImageSrc(service.image);
    if (!src) {
      return;
    }

    const forward = prevIndexRef.current === null || index > prevIndexRef.current;
    prevIndexRef.current = index;

    // Drop any layers older than the immediately-previous one; that one stays put,
    // covered by the incoming layer, instead of translating away.
    const existingLayers = Array.from(followerInner.querySelectorAll("img"));
    while (existingLayers.length > 1) {
      const stale = existingLayers.shift();
      if (!stale) {
        break;
      }
      bundle.gsap.killTweensOf(stale);
      stale.remove();
    }

    const clone = sourceImg.cloneNode(true) as HTMLImageElement;
    clone.className = "absolute inset-0 h-full w-full object-cover";
    topZIndexRef.current += 1;
    bundle.gsap.set(clone, { zIndex: topZIndexRef.current });
    followerInner.appendChild(clone);

    if (!firstEntryRef.current) {
      bundle.gsap.fromTo(
        clone,
        { yPercent: forward ? SLIDE_OFFSET : -SLIDE_OFFSET },
        { yPercent: 0, duration: SLIDE_DURATION, ease: SLIDE_EASE, overwrite: "auto" }
      );
    } else {
      firstEntryRef.current = false;
    }
  }, []);

  const handleCollectionLeave = React.useCallback(() => {
    setHoveredIndex(null);

    const bundle = gsapRef.current;
    const followerInner = followerInnerRef.current;
    if (!bundle || !followerInner) {
      return;
    }

    for (const el of Array.from(followerInner.querySelectorAll("img"))) {
      bundle.gsap.killTweensOf(el);
      bundle.gsap.delayedCall(SLIDE_DURATION, () => el.remove());
    }
    firstEntryRef.current = true;
    prevIndexRef.current = null;
    topZIndexRef.current = 0;
  }, []);

  const isActive = hoveredIndex !== null;

  return (
    <section className="section-padding bg-surface text-ink lg:-mt-80 lg:pt-0" aria-label="Services">
      <div className="layout-grid">
        <MaskTextReveal splitType="letters">
          <h1 className="type-h1 col-span-full pb-20 uppercase lg:text-right">{t("services.heading")}</h1>
        </MaskTextReveal>
      </div>

      <div className="layout-grid relative">
        <ul className="col-span-full m-0 list-none border-rule border-t p-0" onMouseLeave={handleCollectionLeave}>
          {services.map((service, index) => (
            <li
              key={service.id}
              className="group layout-grid-row cursor-pointer border-rule border-b py-20 lg:py-28"
              style={{
                transition: "opacity 0.2s ease",
                opacity: isActive && hoveredIndex !== index ? 0.5 : 1,
              }}
              onMouseEnter={() => handleItemEnter(service, index)}
            >
              <h4 className="type-h4 col-span-full uppercase motion-safe:transition-transform motion-safe:duration-650 motion-safe:ease-custom-easing motion-safe:group-hover:translate-x-12">
                {service.name || (service.labelKey ? t(`services.${service.labelKey}`) : "")}
              </h4>

              {/* Hidden source image used only as the clone target for the cursor follower. */}
              <img
                ref={(el) => {
                  visualRefs.current[index] = el;
                }}
                src={resolveImageSrc(service.image) ?? undefined}
                alt=""
                width={480}
                height={600}
                loading="lazy"
                className="hidden"
                aria-hidden="true"
              />
            </li>
          ))}
        </ul>
      </div>

      {/* Fixed cursor follower: tracks the pointer and shows the hovered row's image. */}
      <div
        ref={followerRef}
        className="pointer-events-none fixed top-0 left-0 z-50 hidden aspect-service-card h-[30vh] overflow-hidden rounded-lg lg:block"
        aria-hidden="true"
      >
        <div
          ref={followerInnerRef}
          className="relative h-full w-full"
          style={{
            opacity: isActive ? 1 : 0,
            transform: isActive ? "scale(1)" : "scale(0)",
            transition: "opacity 0.1s ease, transform 0.6s cubic-bezier(0.65, 0.1, 0, 1)",
          }}
        />
      </div>

      <div className="flex justify-end pt-40">
        <CtaButton to="/services" className="text-right">
          {t("cta.exploreServices")}
        </CtaButton>
      </div>
    </section>
  );
}
