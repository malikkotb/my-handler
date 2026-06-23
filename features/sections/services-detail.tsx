"use client";

import { useWindowEvent } from "@mantine/hooks";
import { useLenis } from "lenis/react";
import * as React from "react";
import { CtaButton } from "~/components/cta-button";
import { cx } from "~/features/style/utils";

type ServiceItem = {
  title: string;
  body: string;
  image: string;
  alt: string;
};

const SERVICE_ITEMS: ServiceItem[] = [
  {
    title: "CONSULTANCY",
    body: "We provide strategic and creative guidance to transform ideas into clear, impactful experiences. From concept development to project positioning, we help our clients define direction, uncover opportunities, and bring ambitious visions to life with clarity and purpose.",
    image: "/img1.avif",
    alt: "My Handler event production",
  },
  {
    title: "EVENTS",
    body: "We create and produce exceptional events designed with precision and intention. From private celebrations to brand activations and exclusive gatherings, we oversee every stage — creative direction, production, logistics, and execution — to ensure a seamless and memorable experience.",
    image: "/img2.avif",
    alt: "Luxury event table prepared for guests",
  },
  {
    title: "TRAVEL",
    body: "We curate tailor-made travel experiences shaped around each client's lifestyle, preferences, and expectations. Every itinerary is thoughtfully designed to combine exclusivity, comfort, and effortless organization, with access to unique destinations and carefully selected experiences.",
    image: "/img3.avif",
    alt: "Private travel experience above the clouds",
  },
  {
    title: "CONCIERGERIE",
    body: "Our conciergerie service offers dedicated, discreet, and highly personalized assistance. From everyday arrangements to exceptional requests, we anticipate needs, manage details, and provide seamless support designed to simplify and elevate every aspect of our clients' lives.",
    image: "/img4.avif",
    alt: "Discreet luxury hotel concierge setting",
  },
];

type StepStatus = "before" | "active" | "after";

export function ServicesDetail() {
  const [activeIndex, setActiveIndex] = React.useState(0);
  const serviceRefs = React.useRef<(HTMLElement | null)[]>([]);

  const updateActiveService = React.useCallback(() => {
    const viewportCenter = window.innerHeight / 2;
    let minDistance = Number.POSITIVE_INFINITY;
    let nearest = 0;

    serviceRefs.current.forEach((el, index) => {
      if (!el) {
        return;
      }

      const rect = el.getBoundingClientRect();
      const distance = Math.abs(rect.top + rect.height / 2 - viewportCenter);
      if (distance < minDistance) {
        minDistance = distance;
        nearest = index;
      }
    });

    setActiveIndex(nearest);
  }, []);

  useLenis(updateActiveService);
  useWindowEvent("resize", updateActiveService);

  React.useEffect(() => {
    updateActiveService();
  }, [updateActiveService]);

  return (
    <section className="layout-grid section-padding overflow-clip">
      <div className="col-span-3 md:col-span-3 lg:sticky lg:top-80 lg:self-start">
        <div className="relative aspect-3/2">
          {SERVICE_ITEMS.map((service, index) => {
            const status: StepStatus = index < activeIndex ? "before" : index > activeIndex ? "after" : "active";
            const isVisible = status === "before" || status === "active";

            return (
              <div
                key={service.title}
                className={cx(
                  "h-full w-full overflow-hidden bg-body/10",
                  "transition-[opacity,visibility] duration-500 ease-in-out motion-reduce:transition-none",
                  index === 0 ? "relative" : "hidden lg:block",
                  "lg:absolute lg:inset-0",
                  isVisible ? "lg:visible lg:opacity-100" : "lg:invisible lg:opacity-0"
                )}
              >
                {/* biome-ignore lint/performance/noImgElement: local static assets */}
                <img src={service.image} alt={service.alt} width={900} height={1200} className="h-full w-full object-cover" />
              </div>
            );
          })}
        </div>
      </div>

      <div className="col-span-5 col-start-5 flex flex-col">
        <h3 className="type-h3-alt pb-120">
          Whether shaping a brand experience, producing a private event, curating a journey, or managing day-to-day requests, our
          approach remains the same: thoughtful, fluid, and entirely bespoke.
        </h3>
        <div id="services" className="flex flex-col gap-40">
          {SERVICE_ITEMS.map((service, index) => (
            <article
              key={service.title}
              ref={(el) => {
                serviceRefs.current[index] = el;
              }}
              className="relative flex flex-col gap-20"
            >
              <div
                className="pointer-events-none absolute top-0 left-1/2 z-50 h-8 w-screen -translate-x-1/2"
                style={{ backgroundColor: "#ff0000" }}
                aria-hidden="true"
              />
              <h2 className="type-h4 uppercase">{service.title}</h2>
              <p className="type-body">{service.body}</p>
            </article>
          ))}
          <CtaButton to="/events">Découvrez nos campagnes</CtaButton>
        </div>
      </div>
    </section>
  );
}
