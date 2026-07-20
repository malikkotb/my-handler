"use client";

import { useLenis } from "lenis/react";
import { useTranslations } from "next-intl";
import * as React from "react";
import { CtaButton } from "~/components/cta-button";
import { loadGsap } from "~/features/motion/gsap";
import type { ImageFragmentResult } from "~/features/sanity/media/fragment";
import { SanityImage } from "~/features/sanity/media/image";

type FeaturedCard = {
  id: string;
  name: string;
  type: string;
  image: ImageFragmentResult | string | null;
};

type FeaturedEventInput = {
  id?: string | null;
  name?: string | null;
  type?: string | null;
  image?: ImageFragmentResult | null;
};

const FALLBACK_FEATURED: FeaturedCard[] = [
  { id: "1", name: "Rabanne for Beyoncé", type: "Luxury", image: "/img1.avif" },
  { id: "2", name: "BNP Paribas", type: "Corporate", image: "/img2.avif" },
  { id: "3", name: "Theodora – Mugler", type: "Luxury", image: "/img3.avif" },
  { id: "4", name: "Ruinart", type: "Luxury", image: "/img4.avif" },
];

function FeaturedEventImage({ event }: { event: FeaturedCard }) {
  if (typeof event.image === "string") {
    return (
      // biome-ignore lint/performance/noImgElement: local static fallback asset
      <img src={event.image} alt={event.name} width={960} height={640} className="h-full w-full object-cover" loading="lazy" />
    );
  }

  return (
    <SanityImage
      image={event.image}
      alt={event.name}
      width={960}
      height={640}
      className="h-full w-full object-cover"
      builderOptions={{ width: 960, height: 640, fit: "crop" }}
    />
  );
}

function FeaturedEventParallaxFrame({
  children,
  frameRef,
  outerRef,
}: {
  children: React.ReactNode;
  frameRef: React.Ref<HTMLDivElement>;
  outerRef: React.Ref<HTMLDivElement>;
}) {
  return (
    <div ref={outerRef} className="aspect-3/2 overflow-hidden bg-body/10">
      <div
        ref={frameRef}
        className="-mx-[5%] h-full w-[110%] [&_img]:block [&_img]:h-full [&_img]:w-full [&_img]:scale-120 [&_img]:object-cover"
      >
        {children}
      </div>
    </div>
  );
}

// Parallax (image yPercent scrub) + reveal-on-scroll (opacity/y on the outer, non-clipped
// wrapper) for every rendered card, set up through a single shared gsap context instead of one
// per card — the desktop grid and mobile stack both mount all cards (CSS-hidden per breakpoint),
// so per-card contexts meant 2x the independent ScrollTrigger/DOM-measurement work on load.
function useFeaturedEventsParallax(
  frameRefs: React.RefObject<(HTMLDivElement | null)[]>,
  outerRefs: React.RefObject<(HTMLDivElement | null)[]>
) {
  React.useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      return;
    }

    let cleanup: (() => void) | undefined;

    loadGsap().then(({ gsap, CustomEase }) => {
      if (!CustomEase.get("featured-reveal")) {
        CustomEase.create("featured-reveal", "0.65, 0.05, 0.36, 1");
      }

      const ctx = gsap.context(() => {
        for (const el of frameRefs.current) {
          if (!el) {
            continue;
          }
          const images = el.querySelectorAll("img");
          if (!images.length) {
            continue;
          }
          gsap.fromTo(
            images,
            { yPercent: -20 },
            {
              yPercent: 20,
              ease: "none",
              scrollTrigger: { trigger: el, start: "top bottom", end: "bottom top", scrub: true },
            }
          );
        }

        for (const el of outerRefs.current) {
          if (!el) {
            continue;
          }
          gsap.fromTo(
            el,
            { opacity: 0, y: 20 },
            {
              opacity: 1,
              y: 0,
              duration: 0.64,
              ease: "featured-reveal",
              scrollTrigger: {
                trigger: el,
                start: "top 95%",
                toggleActions: "play none none reverse",
              },
            }
          );
        }
      });

      cleanup = () => ctx.revert();
    });

    return () => cleanup?.();
  }, [frameRefs, outerRefs]);
}

export function FeaturedEvents({ events }: { events?: FeaturedEventInput[] | null }) {
  const t = useTranslations("cta");
  const featured = events?.length
    ? events.map((event, index) => ({
        id: event.id ?? String(index),
        name: event.name ?? "",
        type: event.type ?? "",
        image: event.image ?? null,
      }))
    : FALLBACK_FEATURED;
  const [activeIndex, setActiveIndex] = React.useState(0);
  const [isStuck, setIsStuck] = React.useState(false);
  const figureRefs = React.useRef<(HTMLElement | null)[]>([]);
  const stickySentinelRef = React.useRef<HTMLDivElement>(null);

  // Desktop grid and mobile stack each render every card (CSS-hidden per breakpoint), so the
  // shared parallax/reveal context needs a slot per rendered instance, not per event.
  const frameRefs = React.useRef<(HTMLDivElement | null)[]>(new Array(featured.length * 2).fill(null));
  const outerRefs = React.useRef<(HTMLDivElement | null)[]>(new Array(featured.length * 2).fill(null));
  useFeaturedEventsParallax(frameRefs, outerRefs);

  React.useEffect(() => {
    const sentinel = stickySentinelRef.current;
    if (!sentinel) {
      return;
    }

    // Fires isStuck a bit before the titles actually reach top:0, so the fade-in feels ahead of
    // the stick rather than exactly on it. rootMargin shrinks the root by STUCK_LEAD_PX from the
    // top, so the sentinel is considered "exited" that much earlier; the boundingClientRect check
    // is shifted to match, otherwise it'd only ever match the old (later) crossing point.
    const STUCK_LEAD_PX = 150;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry) {
          return;
        }
        setIsStuck(!entry.isIntersecting && entry.boundingClientRect.top < STUCK_LEAD_PX);
      },
      { rootMargin: `-${STUCK_LEAD_PX}px 0px 0px 0px` }
    );

    observer.observe(sentinel);
    return () => observer.disconnect();
  }, []);

  const updateActiveCard = React.useCallback(() => {
    const vpCenter = window.innerHeight / 2;
    let minDist = Number.POSITIVE_INFINITY;
    let nearest = 0;

    figureRefs.current.forEach((el, i) => {
      if (!el) {
        return;
      }
      const rect = el.getBoundingClientRect();
      const distance = Math.abs(rect.top + rect.height / 2 - vpCenter);
      if (distance < minDist) {
        minDist = distance;
        nearest = i;
      }
    });

    // setState bails out when `nearest` is unchanged, so running per scroll frame is fine.
    setActiveIndex(nearest);
  }, []);

  // The page scrolls inside the Lenis wrapper, not the window — subscribe to Lenis' scroll.
  useLenis(updateActiveCard);

  React.useEffect(() => {
    updateActiveCard();
    window.addEventListener("resize", updateActiveCard);
    return () => window.removeEventListener("resize", updateActiveCard);
  }, [updateActiveCard]);

  const active = featured[activeIndex];

  return (
    <div>
      {/* Desktop: sticky titles over a scrolling image column */}
      <section className="relative hidden text-ink lg:-mt-240 lg:block" aria-label="Featured events">
        <div ref={stickySentinelRef} aria-hidden="true" className="h-px" />
        <div
          id="sticky-titles-wrap"
          className="layout-grid section-px pointer-events-none sticky top-0 z-10 h-dvh-1 items-center"
        >
          <span
            className={`type-eyebrow col-span-2 col-start-1 overflow-visible whitespace-nowrap transition-opacity duration-500 ease-out ${isStuck ? "opacity-100" : "opacity-0"}`}
          >
            {active?.name}
          </span>
          <span
            className={`type-eyebrow col-span-2 col-start-9 overflow-visible whitespace-nowrap text-right transition-opacity duration-500 ease-out ${isStuck ? "opacity-100" : "opacity-0"}`}
          >
            {active?.type}
          </span>
        </div>

        <div className="layout-grid section-px -mt-dvh-1">
          <div className="featured-images-gap col-span-4 col-start-4 mt-320 mb-240 grid">
            {featured.map((event, i) => (
              <figure
                key={event.id}
                ref={(el) => {
                  figureRefs.current[i] = el;
                }}
                className={`transition-opacity duration-300 ${i === activeIndex ? "opacity-100" : "opacity-50"}`}
              >
                <FeaturedEventParallaxFrame
                  frameRef={(el) => {
                    frameRefs.current[i] = el;
                  }}
                  outerRef={(el) => {
                    outerRefs.current[i] = el;
                  }}
                >
                  <FeaturedEventImage event={event} />
                </FeaturedEventParallaxFrame>
              </figure>
            ))}

            <div className="cta-pt pointer-events-auto flex w-full items-center justify-center pb-40">
              <CtaButton to="/events">{t("viewAllEvents")}</CtaButton>
            </div>
          </div>
        </div>
      </section>

      {/* Mobile: stacked cards */}
      <section
        className="featured-images-gap section-px flex flex-col items-center py-40 text-ink lg:hidden"
        aria-label="Featured events"
      >
        {featured.map((event, i) => (
          <article key={event.id} className="flex flex-col gap-8">
            <FeaturedEventParallaxFrame
              frameRef={(el) => {
                frameRefs.current[featured.length + i] = el;
              }}
              outerRef={(el) => {
                outerRefs.current[featured.length + i] = el;
              }}
            >
              <FeaturedEventImage event={event} />
            </FeaturedEventParallaxFrame>
            <div className="flex justify-between gap-16">
              <span className="type-eyebrow overflow-visible whitespace-nowrap">{event.name}</span>
              <span className="type-eyebrow overflow-visible whitespace-nowrap text-right">{event.type}</span>
            </div>
          </article>
        ))}

        <CtaButton to="/events" className="self-start">
          {t("viewAllEvents")}
        </CtaButton>
      </section>
    </div>
  );
}
