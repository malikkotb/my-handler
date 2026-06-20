"use client";

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
    image: "https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=800&q=80",
    alt: "Strategic consultancy meeting",
  },
  {
    title: "EVENTS",
    body: "We create and produce exceptional events designed with precision and intention. From private celebrations to brand activations and exclusive gatherings, we oversee every stage — creative direction, production, logistics, and execution — to ensure a seamless and memorable experience.",
    image: "https://images.unsplash.com/photo-1464366400600-7168b8af9bc3?w=800&q=80",
    alt: "Elegant private event production",
  },
  {
    title: "TRAVEL",
    body: "We curate tailor-made travel experiences shaped around each client's lifestyle, preferences, and expectations. Every itinerary is thoughtfully designed to combine exclusivity, comfort, and effortless organization, with access to unique destinations and carefully selected experiences.",
    image: "https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?w=800&q=80",
    alt: "Bespoke luxury travel destination",
  },
  {
    title: "CONCIERGERIE",
    body: "Our conciergerie service offers dedicated, discreet, and highly personalized assistance. From everyday arrangements to exceptional requests, we anticipate needs, manage details, and provide seamless support designed to simplify and elevate every aspect of our clients' lives.",
    image: "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800&q=80",
    alt: "Luxury concierge hotel service",
  },
];

export function ServicesDetail() {
  const [activeIndex, setActiveIndex] = React.useState(0);
  const [direction, setDirection] = React.useState<"down" | "up">("down");
  const articleRefs = React.useRef<(HTMLElement | null)[]>([]);
  const activeIndexRef = React.useRef(0);

  React.useEffect(() => {
    const visibleSet = new Set<number>();

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          const index = articleRefs.current.findIndex((el) => el === entry.target);
          if (index === -1) {
            continue;
          }
          if (entry.isIntersecting) {
            visibleSet.add(index);
          } else {
            visibleSet.delete(index);
          }
        }

        if (visibleSet.size > 0) {
          const next = Math.min(...visibleSet);
          setDirection(next > activeIndexRef.current ? "down" : "up");
          activeIndexRef.current = next;
          setActiveIndex(next);
        }
      },
      { threshold: 0.1 }
    );

    for (const el of articleRefs.current) {
      if (el) {
        observer.observe(el);
      }
    }

    return () => observer.disconnect();
  }, []);

  const current = SERVICE_ITEMS[activeIndex];

  return (
    <section className="layout-grid section-padding">
      <div className="col-span-3 md:col-span-3 lg:sticky lg:top-80 lg:self-start">
        <div className="relative aspect-3/2 overflow-hidden bg-body/10">
          {/* biome-ignore lint/performance/noImgElement: remote Unsplash sample images, not Sanity assets */}
          <img
            key={activeIndex}
            src={current?.image}
            alt={current?.alt ?? ""}
            width={800}
            height={533}
            className={cx(
              "absolute inset-0 z-10 h-full w-full object-cover",
              direction === "down" ? "animate-slide-up-in" : "animate-slide-down-in"
            )}
          />
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
                articleRefs.current[index] = el;
              }}
              className="flex flex-col gap-20"
            >
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
