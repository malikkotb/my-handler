"use client";

import * as React from "react";
import { loadGsap } from "~/features/motion/gsap";
import { cx } from "~/features/style/utils";
import { EVENTS } from "./events-data";

type GsapBundle = Awaited<ReturnType<typeof loadGsap>>;

export function EventsTable() {
  const [activeId, setActiveId] = React.useState<number | null>(null);
  const detailRefs = React.useRef(new Map<number, HTMLDivElement>());
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
      gsapRef.current = bundle;
    });

    const refs = detailRefs.current;
    return () => {
      active = false;
      const bundle = gsapRef.current;
      if (bundle) {
        for (const el of refs.values()) {
          bundle.gsap.killTweensOf(el);
        }
      }
    };
  }, []);

  const animateDetails = React.useCallback((element: HTMLElement, open: boolean) => {
    const bundle = gsapRef.current;

    if (!bundle || reduceMotionRef.current) {
      // Instant fallback (also covers reduced motion).
      element.style.height = open ? "auto" : "0px";
      element.style.opacity = open ? "1" : "0";
      return;
    }

    bundle.gsap.killTweensOf(element);
    bundle.gsap.to(element, {
      height: open ? "auto" : 0,
      opacity: open ? 1 : 0,
      duration: 0.48,
      ease: "eventReveal",
    });
  }, []);

  const toggleEvent = React.useCallback(
    (eventId: number) => {
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
    <section className="section-padding pt-0" aria-label="Events">
      <table className="w-full table-fixed border-collapse text-ink">
        <colgroup>
          <col className="w-3/5 lg:w-2/5" />
          <col className="w-2/5 lg:w-1/5" />
          <col className="hidden w-2/5 lg:table-column" />
        </colgroup>
        <thead>
          <tr className="border-rule border-b">
            <th scope="col" className="type-eyebrow pb-8 text-left font-normal">
              Client
            </th>
            <th scope="col" className="type-eyebrow pb-8 text-right font-normal lg:text-left">
              Type
            </th>
            <th scope="col" className="type-eyebrow hidden pb-8 text-right font-normal lg:table-cell">
              Location
            </th>
          </tr>
        </thead>
        <tbody>
          {EVENTS.map((event) => {
            const isOpen = activeId === event.id;
            return (
              <React.Fragment key={event.id}>
                <tr className="cursor-pointer" onClick={() => toggleEvent(event.id)}>
                  <th
                    scope="row"
                    className="type-h4 whitespace-nowrap p-0 py-10 text-left align-middle font-normal uppercase lg:py-12"
                  >
                    <button
                      type="button"
                      className="w-full whitespace-nowrap text-left uppercase focus-visible:outline focus-visible:outline-offset-8"
                      aria-expanded={isOpen}
                      aria-controls={`event-details-${event.id}`}
                    >
                      {event.client}
                    </button>
                  </th>
                  <td className="type-eyebrow-xs p-0 text-right align-middle lg:text-left">{event.type}</td>
                  <td className="type-eyebrow-xs hidden p-0 text-right align-middle lg:table-cell">{event.location}</td>
                </tr>
                <tr className="border-rule border-b">
                  <td colSpan={3} className="p-0">
                    <div
                      id={`event-details-${event.id}`}
                      ref={(el) => {
                        if (el) {
                          detailRefs.current.set(event.id, el);
                        } else {
                          detailRefs.current.delete(event.id);
                        }
                      }}
                      className="h-0 overflow-hidden opacity-0"
                      aria-hidden={!isOpen}
                    >
                      <div className="py-20 lg:py-28">
                        <p className="type-body max-w-xl">{event.description}</p>
                        <div className="mt-20 flex items-end gap-8 overflow-x-auto lg:gap-12">
                          {event.images.map((image) => (
                            // biome-ignore lint/performance/noImgElement: remote Unsplash sample images, not Sanity assets
                            <img
                              key={image.src}
                              src={image.src}
                              alt={image.alt}
                              className={cx(
                                "h-192 max-h-288 w-auto shrink-0 object-cover lg:h-288",
                                image.orientation === "landscape" ? "aspect-3/2" : "aspect-4/5"
                              )}
                              width={image.orientation === "landscape" ? 1200 : 960}
                              height={image.orientation === "landscape" ? 800 : 1200}
                              loading="lazy"
                            />
                          ))}
                        </div>
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
