"use client";

import { useTranslations } from "next-intl";
import * as React from "react";
// import { CURSOR_REFRESH_EVENT } from "~/features/dom/dynamic-text-cursor";
import { useDragScroll } from "~/features/dom/use-drag-scroll";
import { loadGsap } from "~/features/motion/gsap";
import { SanityRichText } from "~/features/rich-text";
import { cx } from "~/features/style/utils";
import type { EventImage, EventItem } from "./events-data";

type GsapBundle = Awaited<ReturnType<typeof loadGsap>>;

export function EventsTable({ events }: { events: EventItem[] }) {
  const t = useTranslations("eventsTable");
  const [activeId, setActiveId] = React.useState<string | null>(null);
  const detailRefs = React.useRef(new Map<string, HTMLDivElement>());
  const gsapRef = React.useRef<GsapBundle | null>(null);
  const reduceMotionRef = React.useRef(false);

  React.useEffect(() => {
    reduceMotionRef.current = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    let active = true;
    loadGsap().then((bundle) => {
      if (!active) {
        return;
      }
      if (!bundle.CustomEase.get("eventReveal")) {
        bundle.CustomEase.create("eventReveal", "0.36, 0.33, 0, 1");
      }
      if (!bundle.CustomEase.get("eventRevealOpen")) {
        bundle.CustomEase.create("eventRevealOpen", "0.625, 0.05, 0, 1");
      }
      if (!bundle.CustomEase.get("eventContentReveal")) {
        bundle.CustomEase.create("eventContentReveal", "0.5, 0, 1, 0.55");
      }
      gsapRef.current = bundle;
    });

    const refs = detailRefs.current;
    return () => {
      active = false;
      const bundle = gsapRef.current;
      if (bundle) {
        for (const el of refs.values()) {
          bundle.gsap.killTweensOf(el);
          if (el.firstElementChild instanceof HTMLElement) {
            bundle.gsap.killTweensOf(el.firstElementChild);
          }
        }
      }
    };
  }, []);

  // Toggling a row swaps its `data-cursor-text` ("View Project" ⇄ "Close") without the
  // pointer moving. Nudge the dynamic cursor to re-read once the new value is committed.
  // React.useEffect(() => {
  //   window.dispatchEvent(new Event(CURSOR_REFRESH_EVENT));
  // }, [activeId]);

  const animateDetails = React.useCallback((element: HTMLElement, open: boolean) => {
    const bundle = gsapRef.current;
    const content = element.firstElementChild instanceof HTMLElement ? element.firstElementChild : null;

    if (!bundle || reduceMotionRef.current) {
      // Instant fallback (also covers reduced motion).
      element.style.height = open ? "auto" : "0px";
      if (content) {
        content.style.opacity = open ? "1" : "0";
      }
      return;
    }

    bundle.gsap.killTweensOf(element);
    if (content) {
      bundle.gsap.killTweensOf(content);
    }

    if (!open) {
      if (content) {
        bundle.gsap.to(content, { opacity: 0, duration: 0.42, ease: "none" });
      }
      bundle.gsap.to(element, {
        height: 0,
        duration: 0.48,
        ease: "eventReveal",
      });
    } else {
      if (content) {
        content.style.opacity = "0";
        bundle.gsap.to(content, { opacity: 1, duration: 0.28, delay: 0.03, ease: "eventContentReveal" });
      }
      bundle.gsap.to(element, { height: "auto", duration: 0.6, ease: "eventRevealOpen" });
    }
  }, []);

  const toggleEvent = React.useCallback(
    (eventId: string) => {
      setActiveId((prev) => {
        const next = prev === eventId ? null : eventId;

        if (prev !== null) {
          const prevEl = detailRefs.current.get(prev);
          if (prevEl) {
            animateDetails(prevEl, false);
          }
        }

        if (next !== null) {
          const nextEl = detailRefs.current.get(next);
          if (nextEl) {
            animateDetails(nextEl, true);
          }
        }

        return next;
      });
    },
    [animateDetails]
  );

  return (
    <section className="section-padding overflow-clip pt-0" aria-label="Events">
      <table className="w-full table-fixed border-collapse text-ink">
        <colgroup>
          <col className="w-3/5 lg:w-3/5" />
          {/* <col className="w-2/5 lg:w-1/5" /> */}
          <col className="w-2/5" />
        </colgroup>
        <thead>
          <tr className="border-rule border-b">
            <th scope="col" className="type-eyebrow pb-8 text-left font-normal">
              {t("clientHeader")}
            </th>
            {/* <th scope="col" className="type-eyebrow pb-8 text-right font-normal lg:text-left">
              Type
            </th> */}
            <th scope="col" className="type-eyebrow pb-8 text-right font-normal">
              {t("locationHeader")}
            </th>
          </tr>
        </thead>
        <tbody>
          {events.map((event) => {
            const isOpen = activeId === event.id;
            return (
              <React.Fragment key={event.id}>
                <tr
                  className="group relative cursor-pointer [clip-path:inset(0)]"
                  onClick={() => toggleEvent(event.id)}
                  // data-cursor-hover
                  // data-cursor-text={isOpen ? t("cursorClose") : t("cursorView")}
                >
                  <th
                    scope="row"
                    className="type-h5 whitespace-nowrap p-0 py-10 text-left align-middle font-normal uppercase lg:py-12"
                  >
                    <div
                      aria-hidden="true"
                      className="pointer-events-none absolute -inset-px bg-ink opacity-0 transition-opacity duration-[850ms] ease-custom-easing group-hover:opacity-100 group-hover:duration-[650ms]"
                    />
                    <button
                      type="button"
                      className="relative z-10 w-full cursor-pointer whitespace-nowrap text-left uppercase transition-colors duration-[450ms] ease-[cubic-bezier(0.83,0,0.17,1)] focus-visible:outline focus-visible:outline-offset-8 group-hover:text-surface motion-safe:transition-[padding-left] motion-safe:duration-[850ms] motion-safe:ease-custom-easing motion-safe:group-hover:pl-10 motion-safe:group-hover:duration-[650ms]"
                      aria-expanded={isOpen}
                      aria-controls={`event-details-${event.id}`}
                    >
                      <span className="lg:hidden">
                        {event.client.length > 30 ? `${event.client.slice(0, 30)}…` : event.client}
                      </span>
                      <span className="hidden lg:inline">{event.client}</span>
                    </button>
                  </th>
                  {/* <td className="type-eyebrow-xs p-0 text-right align-middle motion-safe:transition-[padding-left] motion-safe:duration-service motion-safe:ease-service motion-safe:group-hover:pl-12 lg:text-left">{event.type}</td> */}
                  <td className="type-eyebrow-xs relative z-10 p-0 text-right align-middle transition-colors duration-[450ms] ease-[cubic-bezier(0.83,0,0.17,1)] group-hover:text-surface motion-safe:transition-[padding-right] motion-safe:duration-[850ms] motion-safe:ease-custom-easing motion-safe:group-hover:pr-10 motion-safe:group-hover:duration-[650ms]">
                    {event.location}
                  </td>
                </tr>
                <tr className="border-rule border-b">
                  <td colSpan={2} className="p-0">
                    <div
                      id={`event-details-${event.id}`}
                      ref={(el) => {
                        if (el) {
                          detailRefs.current.set(event.id, el);
                        } else {
                          detailRefs.current.delete(event.id);
                        }
                      }}
                      className="h-0 overflow-hidden"
                      aria-hidden={!isOpen}
                    >
                      <div className="pt-12 pb-20 opacity-0 lg:pb-28">
                        {event.descriptionRichText ? (
                          <SanityRichText value={event.descriptionRichText} className="type-body max-w-xl" tone="light" />
                        ) : (
                          <p className="type-body max-w-xl">{event.description}</p>
                        )}
                        <EventImageStrip images={event.images} />
                      </div>
                    </div>
                  </td>
                </tr>
              </React.Fragment>
            );
          })}
        </tbody>
      </table>
    </section>
  );
}

/** Horizontal image strip: native wheel/trackpad scroll plus click-and-drag, scrollbar hidden. */
function EventImageStrip({ images }: { images: EventImage[] }) {
  const scrollRef = useDragScroll<HTMLDivElement>();

  if (images.length === 0) {
    return null;
  }

  return (
    <div
      ref={scrollRef}
      className="scrollbar-invisible mt-20 flex cursor-grab items-end gap-8 overflow-x-auto data-dragging:cursor-grabbing lg:gap-12"
    >
      {images.map((image) => (
        <img
          key={image.src}
          src={image.src}
          alt={image.alt}
          className={cx(
            "h-192 max-h-288 w-auto shrink-0 select-none object-cover lg:h-288",
            image.orientation === "landscape" ? "aspect-3/2" : "aspect-service-card"
          )}
          width={image.orientation === "landscape" ? 1200 : 960}
          height={image.orientation === "landscape" ? 800 : 1200}
          loading="lazy"
          draggable={false}
        />
      ))}
    </div>
  );
}
