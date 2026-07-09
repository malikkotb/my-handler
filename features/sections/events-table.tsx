"use client";

import { useTranslations } from "next-intl";
import * as React from "react";
// import { CURSOR_REFRESH_EVENT } from "~/features/dom/dynamic-text-cursor";
import { useDragScroll } from "~/features/dom/use-drag-scroll";
import { SanityRichText } from "~/features/rich-text";
import { cx } from "~/features/style/utils";
import type { EventImage, EventItem } from "./events-data";

export function EventsTable({ events }: { events: EventItem[] }) {
  const t = useTranslations("eventsTable");
  const [activeId, setActiveId] = React.useState<string | null>(null);
  const detailRefs = React.useRef(new Map<string, HTMLDivElement>());

  // Toggling a row swaps its `data-cursor-text` ("View Project" ⇄ "Close") without the
  // pointer moving. Nudge the dynamic cursor to re-read once the new value is committed.
  // React.useEffect(() => {
  //   window.dispatchEvent(new Event(CURSOR_REFRESH_EVENT));
  // }, [activeId]);

  // Height animates via a CSS transition (see the row's Tailwind classes). We measure
  // scrollHeight on open and set an explicit px height so the transition has a target;
  // closing sets it back to 0. Same easing/duration for both directions.
  const setBodyHeight = React.useCallback((id: string, open: boolean) => {
    const el = detailRefs.current.get(id);
    if (!el) {
      return;
    }
    el.style.height = open ? `${el.scrollHeight}px` : "0px";
  }, []);

  const toggleEvent = React.useCallback(
    (eventId: string) => {
      setActiveId((prev) => {
        const next = prev === eventId ? null : eventId;

        if (prev !== null) {
          setBodyHeight(prev, false);
        }

        if (next !== null) {
          setBodyHeight(next, true);
        }

        return next;
      });
    },
    [setBodyHeight]
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
                      className="pointer-events-none absolute -inset-px bg-ink opacity-0 transition-opacity duration-850 ease-custom-easing group-hover:opacity-100 group-hover:duration-650"
                    />
                    <button
                      type="button"
                      className="relative z-10 w-full cursor-pointer whitespace-nowrap text-left uppercase transition-colors duration-450 ease-[cubic-bezier(0.83,0,0.17,1)] focus-visible:outline focus-visible:outline-offset-8 group-hover:text-surface motion-safe:transition-[padding-left] motion-safe:duration-850 motion-safe:ease-custom-easing motion-safe:group-hover:pl-14 motion-safe:group-hover:duration-650"
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
                  <td className="type-eyebrow-xs relative z-10 p-0 text-right align-middle transition-colors duration-450 ease-[cubic-bezier(0.83,0,0.17,1)] group-hover:text-surface motion-safe:transition-[padding-right] motion-safe:duration-850 motion-safe:ease-custom-easing motion-safe:group-hover:pr-14 motion-safe:group-hover:duration-650">
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
                      className="h-0 overflow-hidden transition-[height] duration-600 ease-[cubic-bezier(0.625,0.05,0,1)]"
                      aria-hidden={!isOpen}
                    >
                      <div className="pt-12 pb-20 lg:pb-28">
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
