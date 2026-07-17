"use client";

import { useWindowEvent } from "@mantine/hooks";
import { useLenis } from "lenis/react";
import { motion } from "motion/react";
import { useTranslations } from "next-intl";
import * as React from "react";
import { AnimatedText } from "~/components/animated-text";
import { CtaButton } from "~/components/cta-button";
import { useBreakpoint } from "~/features/dom/use-breakpoint";
import { usePrefersReducedMotion } from "~/features/motion/use-prefers-reduced-motion";
import { cx } from "~/features/style/utils";

const REVEAL_EASE = [0.23, 1, 0.32, 1] as const;

type ServiceItem = {
  title: string;
  body: string;
  image: string;
  alt: string;
  objectPosition?: string;
};

const SERVICE_IMAGES_STATIC = [
  { key: "consultancy" as const, image: "/services-page-images/9EED0276-5138-4121-9A25-0D9F5886DDCF 2.avif" },
  { key: "events" as const, image: "/services-page-images/07771994-233A-4D3B-A1E9-DB3A83660138 2.avif" },
  { key: "travel" as const, image: "/services-page-images/chauffeur.avif", objectPosition: "50% 35%" },
  { key: "conciergerie" as const, image: "/services-page-images/concierge.avif" },
];

type StepStatus = "before" | "active" | "after";

export function ServicesDetail() {
  const t = useTranslations("services.items");
  const tCta = useTranslations("cta");
  const isDesktop = useBreakpoint("lg");
  const [activeIndex, setActiveIndex] = React.useState(0);
  const reduceMotion = usePrefersReducedMotion();

  const serviceItems: ServiceItem[] = SERVICE_IMAGES_STATIC.map(({ key, image, objectPosition }) => ({
    title: t(`${key}.title`),
    body: t(`${key}.body`),
    image,
    alt: t(`${key}.alt`),
    objectPosition,
  }));

  const serviceImages: Array<Pick<ServiceItem, "title" | "image" | "alt" | "objectPosition">> = [
    ...serviceItems.map(({ title, image, alt, objectPosition }) => ({ title, image, alt, objectPosition })),
  ];
  const serviceRefs = React.useRef<(HTMLElement | null)[]>([]);

  const updateActiveService = React.useCallback(() => {
    if (!isDesktop) {
      setActiveIndex(0);
      return;
    }

    const crossedCount = serviceRefs.current.reduce((count, el) => {
      if (!el) {
        return count;
      }

      const rect = el.getBoundingClientRect();
      const articleCenter = rect.top + rect.height / 2;

      return articleCenter <= 0 ? count + 1 : count;
    }, 0);

    setActiveIndex(Math.min(crossedCount, serviceImages.length - 1));
  }, [isDesktop, serviceImages.length]);

  useLenis(updateActiveService);
  useWindowEvent("resize", updateActiveService);

  React.useEffect(() => {
    updateActiveService();
  }, [updateActiveService]);

  return (
    <section className="layout-grid section-padding pt-20 gap-y-40 overflow-clip">
      <div className="col-span-full lg:sticky lg:top-80 lg:col-span-3 lg:self-start">
        <div className="relative aspect-3/2">
          {serviceImages.map((service, index) => {
            const status: StepStatus = index < activeIndex ? "before" : index > activeIndex ? "after" : "active";
            const isVisible = status === "before" || status === "active";

            return (
              <div
                key={service.title}
                className={cx(
                  "h-full w-full overflow-hidden",
                  "transition-[opacity,visibility] duration-500 ease-in-out motion-reduce:transition-none",
                  index === 0 ? "relative" : "hidden lg:block",
                  "lg:absolute lg:inset-0",
                  isVisible ? "lg:visible lg:opacity-100" : "lg:invisible lg:opacity-0"
                )}
              >
                <motion.div
                  className="h-full w-full"
                  initial={reduceMotion ? undefined : { opacity: 0, y: 24 }}
                  whileInView={reduceMotion ? undefined : { opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "0px 0px -10% 0px" }}
                  transition={{ duration: 0.8, ease: REVEAL_EASE }}
                >
                  {/* biome-ignore lint/performance/noImgElement: local static assets */}
                  <img
                    src={service.image}
                    alt={service.alt}
                    width={900}
                    height={1200}
                    className="h-full w-full object-cover"
                    style={service.objectPosition ? { objectPosition: service.objectPosition } : undefined}
                  />
                </motion.div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="col-span-full flex flex-col lg:col-span-4 lg:col-start-5">
        {/* <h3 className="type-h3-alt pb-120">
          Whether shaping a brand experience, producing a private event, curating a journey, or managing day-to-day requests, our
          approach remains the same: thoughtful, fluid, and entirely bespoke.
        </h3> */}
        <div id="services" className="flex flex-col gap-40 lg:gap-120">
          {serviceItems.map((service, index) => (
            <article
              key={service.title}
              ref={(el) => {
                serviceRefs.current[index] = el;
              }}
              className="relative flex flex-col gap-20"
            >
              <h2 className="type-h4 uppercase">
                <AnimatedText as="span">{service.title}</AnimatedText>
              </h2>
              <p className="type-body">
                <AnimatedText as="span">{service.body}</AnimatedText>
              </p>
            </article>
          ))}
        </div>
        <CtaButton className="pt-60 lg:pt-120" to="/events">
          {tCta("discoverCampaigns")}
        </CtaButton>
      </div>
    </section>
  );
}
