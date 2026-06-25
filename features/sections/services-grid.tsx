"use client";

import { useTranslations } from "next-intl";
import * as React from "react";
import { CtaButton } from "~/components/cta-button";
import { loadGsap } from "~/features/motion/gsap";

type GsapBundle = Awaited<ReturnType<typeof loadGsap>>;

const SERVICES = [
  {
    id: "1",
    labelKey: "eventManagement",
    image: "/img1.avif",
  },
  {
    id: "2",
    labelKey: "conciergeServices",
    image: "/img2.avif",
  },
  {
    id: "3",
    labelKey: "travelArrangements",
    image: "/img3.avif",
  },
  {
    id: "4",
    labelKey: "transportation",
    image: "/img4.avif",
  },
] as const;

const CLIP_HIDDEN = "inset(50% 50% 50% 50%)";
const CLIP_VISIBLE = "inset(0% 0% 0% 0%)";
const DURATION = 0.48;

export function ServicesGrid() {
  const t = useTranslations();
  const imageRefs = React.useRef<Record<string, HTMLImageElement | null>>({});
  const gsapRef = React.useRef<GsapBundle | null>(null);
  const activeIdRef = React.useRef<string | null>(null);
  const zCounter = React.useRef(1);

  React.useEffect(() => {
    let active = true;
    loadGsap().then((bundle) => {
      if (active) {
        gsapRef.current = bundle;
      }
    });
    return () => {
      active = false;
    };
  }, []);

  const reducedMotion = () => window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  const collapse = React.useCallback((el: HTMLImageElement) => {
    const bundle = gsapRef.current;
    if (!bundle) {
      return;
    }
    bundle.gsap.to(el, { clipPath: CLIP_HIDDEN, duration: reducedMotion() ? 0 : DURATION, ease: "power3.out" });
  }, []);

  const onEnter = React.useCallback(
    (id: string) => {
      activeIdRef.current = id;
      const bundle = gsapRef.current;
      const el = imageRefs.current[id];
      if (!bundle || !el) {
        return;
      }

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
            // Mouse already moved away before the reveal finished → collapse now.
            if (activeIdRef.current !== id) {
              collapse(el);
            }
          },
        }
      );
    },
    [collapse]
  );

  const onListLeave = React.useCallback(() => {
    activeIdRef.current = null;
    const bundle = gsapRef.current;
    if (!bundle) {
      return;
    }
    for (const { id } of SERVICES) {
      const el = imageRefs.current[id];
      if (el && !bundle.gsap.isTweening(el)) {
        collapse(el);
      }
    }
  }, [collapse]);

  return (
    <section className="section-padding lg:-mt-80 lg:pt-0 border-accent border-t bg-surface text-ink" aria-label="Services">
      <div className="layout-grid">
        <h1 className="type-h1 col-span-full uppercase lg:text-right">{t("services.heading")}</h1>
      </div>

      <div className="layout-grid relative">
        {/* biome-ignore lint/a11y/useKeyWithMouseEvents: hover-only progressive enhancement; list links remain keyboard-reachable */}
        <ul className="col-span-full m-0 list-none border-rule border-t p-0" onMouseLeave={onListLeave}>
          {SERVICES.map((service) => (
            // biome-ignore lint/a11y/useKeyWithMouseEvents: decorative hover reveal only
            <li
              key={service.id}
              className="group layout-grid-row cursor-pointer border-rule border-b py-20 lg:py-28"
              onMouseEnter={() => onEnter(service.id)}
            >
              <h4 className="type-h4 col-span-full uppercase motion-safe:transition-transform motion-safe:duration-service motion-safe:ease-service motion-safe:group-hover:translate-x-12">
                {t(`services.${service.labelKey}`)}
              </h4>
            </li>
          ))}
        </ul>

        <div className="pointer-events-none absolute inset-0 hidden items-center justify-end pr-80 lg:flex" aria-hidden="true">
          <div className="relative aspect-service-card h-services-preview rotate-10">
            {SERVICES.map((service) => (
              <img
                key={service.id}
                ref={(el) => {
                  imageRefs.current[service.id] = el;
                }}
                src={service.image}
                alt=""
                width={480}
                height={600}
                className="clip-hidden absolute inset-0 h-full w-full object-cover"
                loading="eager"
              />
            ))}
          </div>
        </div>
      </div>

      <div className="layout-grid pt-40">
        <CtaButton to="/services" className="col-span-full text-right">
          {t("cta.exploreServices")}
        </CtaButton>
      </div>
    </section>
  );
}
