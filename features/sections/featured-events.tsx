"use client";

import { useLenis } from "lenis/react";
import { useTranslations } from "next-intl";
import * as React from "react";
import { CtaButton } from "~/components/cta-button";

type FeaturedCard = {
  id: string;
  name: string;
  type: string;
  image: string;
};

const FEATURED: FeaturedCard[] = [
  { id: "1", name: "Rabanne for Beyoncé", type: "Luxury", image: "/img1.avif" },
  { id: "2", name: "BNP Paribas", type: "Corporate", image: "/img2.avif" },
  { id: "3", name: "Theodora – Mugler", type: "Luxury", image: "/img3.avif" },
  { id: "4", name: "Ruinart", type: "Luxury", image: "/img4.avif" },
];

export function FeaturedEvents() {
  const t = useTranslations("cta");
  const [activeIndex, setActiveIndex] = React.useState(0);
  const figureRefs = React.useRef<(HTMLElement | null)[]>([]);

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

  const active = FEATURED[activeIndex];

  return (
    <div>
      {/* Desktop: sticky titles over a scrolling image column */}
      <section className="relative hidden text-ink lg:block" aria-label="Featured events">
        <div className="layout-grid section-px pointer-events-none sticky top-0 z-10 h-dvh-1 items-center">
          <span className="type-eyebrow col-span-2 col-start-1 overflow-visible whitespace-nowrap">{active?.name}</span>
          <span className="type-eyebrow col-span-2 col-start-9 overflow-visible whitespace-nowrap text-right">
            {active?.type}
          </span>
        </div>

        <div className="layout-grid section-px -mt-dvh-1">
          <div className="featured-images-gap col-span-4 col-start-4 mt-320 mb-160 grid">
            {FEATURED.map((event, i) => (
              <figure
                key={event.id}
                ref={(el) => {
                  figureRefs.current[i] = el;
                }}
                className="w-full bg-body/10"
              >
                {/* biome-ignore lint/performance/noImgElement: local static asset */}
                <img src={event.image} alt={event.name} width={960} height={640} className="aspect-3/2 w-full object-cover" />
              </figure>
            ))}

            <CtaButton to="/events" className="cta-pt pointer-events-auto pb-40">
              {t("viewAllEvents")}
            </CtaButton>
          </div>
        </div>
      </section>

      {/* Mobile: stacked cards */}
      <section className="layout-grid section-padding featured-images-gap text-ink lg:hidden" aria-label="Featured events">
        {FEATURED.map((event) => (
          <article key={event.id} className="col-span-full grid gap-8">
            <div className="w-full bg-body/10">
              {/* biome-ignore lint/performance/noImgElement: local static asset */}
              <img src={event.image} alt={event.name} width={960} height={640} className="aspect-3/2 w-full object-cover" />
            </div>
            <div className="flex justify-between gap-16">
              <span className="type-eyebrow overflow-visible whitespace-nowrap">{event.name}</span>
              <span className="type-eyebrow overflow-visible whitespace-nowrap text-right">{event.type}</span>
            </div>
          </article>
        ))}

        <CtaButton to="/events" className="cta-pt col-span-full">
          {t("viewAllEvents")}
        </CtaButton>
      </section>
    </div>
  );
}
