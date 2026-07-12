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
// follower, revealing the incoming image with an upward-rising clip-path "curtain"
// (no actual translation) to layer on top of the previous image, which stays put
// underneath instead of translating away.
const CURTAIN_CLIP_HIDDEN = "inset(100% 0% 0% 0%)";
const CURTAIN_CLIP_VISIBLE = "inset(0% 0% 0% 0%)";
const SLIDE_DURATION = 0.5;
// Used instead of SLIDE_DURATION when this hover already has later ones queued behind it —
// it's being passed through on the way to wherever the cursor actually settled, so it plays
// fast to help the queue catch up instead of making every quick sweep feel laggy.
const SLIDE_DURATION_QUEUED = 0.25;
const SLIDE_EASE = "cubic-bezier(0.17, 0.84, 0.44, 1)";
const INCOMING_LAYER_START_SCALE = 1.2;
const FOLLOW_DURATION = 0.6;
const FOLLOW_EASE = "power3";
const COVERED_LAYER_OVERLAY_OPACITY = 0.5;
const OVERLAY_FADE_DURATION = 0.3;
const OVERLAY_FADE_EASE = "sine.out";
// Snappy but visible fade-out when the pointer leaves the hoverable list, instead of the
// layers just vanishing. Kept in sync with the follower wrapper's own opacity transition
// duration below so the wrapper doesn't hide the image before its own fade has a chance to play.
const LEAVE_FADE_DURATION = 0.22;
const LEAVE_FADE_EASE = "power2.out";

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
  const firstEntryRef = React.useRef(true);
  const topZIndexRef = React.useRef(0);
  const layersRef = React.useRef<
    { img: HTMLImageElement; overlay: HTMLDivElement; tween: ReturnType<GsapBundle["gsap"]["to"]> | null }[]
  >([]);
  // Hover targets are queued and drained one at a time so a fast sweep across rows never
  // interrupts a curtain reveal mid-flight (the previous bug: starting a new tween, or dimming
  // a layer, before its own reveal had finished). Each queued item plays to completion before
  // the next one starts, even if that means the visual lags a moment behind the cursor.
  const hoverQueueRef = React.useRef<{ service: Service; index: number }[]>([]);
  const isAnimatingRef = React.useRef(false);

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

  // Drains one queued hover target at a time. Only ever called when idle (queue was empty and
  // nothing animating) or from a tween's onComplete, so at most one curtain reveal runs at once.
  const processHoverQueue = React.useCallback(() => {
    const bundle = gsapRef.current;
    const followerInner = followerInnerRef.current;
    const next = hoverQueueRef.current.shift();
    if (!bundle || !followerInner || !next) {
      isAnimatingRef.current = false;
      return;
    }
    isAnimatingRef.current = true;

    const sourceImg = visualRefs.current[next.index];
    const src = resolveImageSrc(next.service.image);
    if (!sourceImg || !src) {
      processHoverQueue();
      return;
    }

    // The only layer that can still be here is the immediately-previous one — everything
    // older was already removed once its own reveal tween completed, since queue draining
    // is strictly sequential (never trims a layer mid-animation).
    while (layersRef.current.length > 1) {
      const stale = layersRef.current.shift();
      stale?.img.remove();
      stale?.overlay.remove();
    }

    const previousLayer = layersRef.current[0] ?? null;
    if (previousLayer) {
      bundle.gsap.killTweensOf(previousLayer.overlay);
      bundle.gsap.to(previousLayer.overlay, {
        opacity: COVERED_LAYER_OVERLAY_OPACITY,
        duration: OVERLAY_FADE_DURATION,
        ease: OVERLAY_FADE_EASE,
        overwrite: "auto",
      });
    }

    const clone = sourceImg.cloneNode(true) as HTMLImageElement;
    clone.className = "absolute inset-0 h-full w-full object-cover";
    topZIndexRef.current += 1;
    bundle.gsap.set(clone, { zIndex: topZIndexRef.current });
    followerInner.appendChild(clone);

    // Overlay shares the new image's z-index and paints right above it (later in
    // document order), so the dark dim only ever lands on the covered layer, never this one.
    const overlay = document.createElement("div");
    overlay.className = "absolute inset-0 bg-black";
    bundle.gsap.set(overlay, { zIndex: topZIndexRef.current, opacity: 0 });
    followerInner.appendChild(overlay);

    const layer = { img: clone, overlay, tween: null as ReturnType<GsapBundle["gsap"]["to"]> | null };
    layersRef.current.push(layer);

    if (!firstEntryRef.current) {
      // If more hovers are already queued behind this one, it's just being passed through —
      // speed it up so the queue catches up to wherever the cursor actually settled.
      const duration = hoverQueueRef.current.length > 0 ? SLIDE_DURATION_QUEUED : SLIDE_DURATION;
      layer.tween = bundle.gsap.fromTo(
        clone,
        { clipPath: CURTAIN_CLIP_HIDDEN, scale: INCOMING_LAYER_START_SCALE },
        {
          clipPath: CURTAIN_CLIP_VISIBLE,
          scale: 1,
          duration,
          ease: SLIDE_EASE,
          overwrite: "auto",
          onComplete: processHoverQueue,
        }
      );
    } else {
      firstEntryRef.current = false;
      processHoverQueue();
    }
  }, []);

  const handleItemEnter = React.useCallback(
    (service: Service, index: number) => {
      setHoveredIndex(index);

      if (!enabledRef.current || reducedMotionRef.current) {
        return;
      }
      const src = resolveImageSrc(service.image);
      if (!src) {
        return;
      }

      // Skip only true repeats (re-triggering the same row without leaving it) — every
      // genuinely different row hovered still gets queued and fully animated.
      const lastQueued = hoverQueueRef.current[hoverQueueRef.current.length - 1];
      if (lastQueued?.index === index) {
        return;
      }

      hoverQueueRef.current.push({ service, index });
      if (!isAnimatingRef.current) {
        processHoverQueue();
      }
    },
    [processHoverQueue]
  );

  const handleCollectionLeave = React.useCallback(() => {
    setHoveredIndex(null);

    // Leaving the whole section is a hard boundary, unlike hovering within it — clear the
    // queue and any in-flight tween immediately rather than letting it finish.
    hoverQueueRef.current = [];
    isAnimatingRef.current = false;

    const bundle = gsapRef.current;
    if (!bundle) {
      for (const layer of layersRef.current) {
        layer.img.remove();
        layer.overlay.remove();
      }
      layersRef.current = [];
      firstEntryRef.current = true;
      return;
    }

    // Detach the layers being removed rather than clearing them in place — the next hover
    // (processHoverQueue) should start from a clean slate immediately instead of waiting on
    // this fade. topZIndexRef is deliberately NOT reset here: these detached layers keep
    // fading out on their own, still at their old (high) z-index, so a fresh clone from the
    // next hover — stacked above them — never gets buried underneath a still-visible fade-out.
    const leavingLayers = layersRef.current;
    layersRef.current = [];
    firstEntryRef.current = true;

    for (const layer of leavingLayers) {
      bundle.gsap.killTweensOf([layer.img, layer.overlay]);
      bundle.gsap.to([layer.img, layer.overlay], {
        opacity: 0,
        duration: LEAVE_FADE_DURATION,
        ease: LEAVE_FADE_EASE,
        overwrite: "auto",
        onComplete: () => {
          layer.img.remove();
          layer.overlay.remove();
        },
      });
    }
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
            transition: `opacity ${LEAVE_FADE_DURATION}s ease-out, transform 0.6s cubic-bezier(0.65, 0.1, 0, 1)`,
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
