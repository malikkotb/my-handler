"use client";

import { useTranslations } from "next-intl";
import * as React from "react";
// import { CURSOR_REFRESH_EVENT } from "~/features/dom/dynamic-text-cursor";
import { useDragScroll } from "~/features/dom/use-drag-scroll";
import { loadGsap } from "~/features/motion/gsap";
import { usePrefersReducedMotion } from "~/features/motion/use-prefers-reduced-motion";
import { SanityRichText } from "~/features/rich-text";
import { cx } from "~/features/style/utils";
import type { EventImage, EventItem } from "./events-data";

/** Duplicate of the standard `EventsTable` (same markup/behavior), with its own `id`
 * namespace so both can coexist on the page, plus the `EventsTableDuplicate` scroll reveal:
 * per row the separator line grows left -> right while its cells rise from behind a clip mask,
 * staggered left -> right, together per row. */
export function EventsTable2({ events }: { events: EventItem[] }) {
  const t = useTranslations("eventsTable");
  const [activeId, setActiveId] = React.useState<string | null>(null);
  const detailRefs = React.useRef(new Map<string, HTMLDivElement>());
  const containerRef = React.useRef<HTMLTableElement>(null);
  const prefersReducedMotion = usePrefersReducedMotion();

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

  // Scroll-in reveal (mirrors EventsTableDuplicate): per row, the separator line grows
  // left -> right while its cells rise from behind a clip mask, staggered left -> right,
  // together per row. Rows already on screen at load cascade one-by-one; the rest animate
  // as they scroll into view.
  React.useEffect(() => {
    const table = containerRef.current;
    if (!table) {
      return;
    }

    const lines = Array.from(table.querySelectorAll<HTMLElement>("[data-reveal-line]"));

    // Text-bearing movers only (skips empty cells); grouped per row for the stagger.
    const movers = (root: ParentNode) =>
      Array.from(root.querySelectorAll<HTMLElement>("[data-reveal-cell]")).filter(
        (el) => (el.textContent?.trim().length ?? 0) > 0
      );

    if (prefersReducedMotion) {
      for (const mover of table.querySelectorAll<HTMLElement>("[data-reveal-cell]")) {
        mover.style.transform = "none";
      }
      for (const line of lines) {
        line.style.width = "100%";
      }
      return;
    }

    let cleanup: (() => void) | undefined;

    loadGsap().then(({ gsap, ScrollTrigger }) => {
      if (!containerRef.current) {
        return;
      }

      const timelines: ReturnType<typeof gsap.timeline>[] = [];

      // `delay` offsets the reveal so groups already on screen at load cascade one-by-one
      // instead of all firing together; groups revealed later on scroll use 0.
      const buildGroup = (trigger: Element, cells: HTMLElement[], line: HTMLElement | undefined, delay: number) => {
        const tl = gsap.timeline({
          scrollTrigger: { trigger, start: "top 95%", once: true },
        });
        if (cells.length > 0) {
          // `y: 0` clears the pixel offset GSAP decodes from the CSS `translateY(100%)` matrix;
          // without it the leftover px `y` keeps cells shifted down (clipped) even at yPercent 0.
          tl.fromTo(cells, { yPercent: 100, y: 0 }, { yPercent: 0, duration: 0.7, ease: "mainLink", stagger: 0.06 }, delay);
        }
        if (line) {
          tl.fromTo(line, { width: 0 }, { width: "100%", duration: 0.7, ease: "mainLink" }, delay);
        }
        timelines.push(tl);
      };

      // Groups in DOM order: the header (labels + header line), then each row paired with the
      // separator line directly below it (lines[0] is the header line, lines[i + 1] the rows').
      const groups: Array<{ trigger: Element; cells: HTMLElement[]; line: HTMLElement | undefined }> = [];
      const thead = table.querySelector("thead");
      if (thead) {
        groups.push({ trigger: thead, cells: movers(thead), line: lines[0] });
      }
      const rows = Array.from(table.querySelectorAll<HTMLElement>("[data-reveal-row]"));
      rows.forEach((row, index) => {
        groups.push({ trigger: row, cells: movers(row), line: lines[index + 1] });
      });

      // Cascade only the groups already visible at load; each gets the next step of delay so
      // they reveal top-to-bottom one at a time. Off-screen groups animate on scroll (delay 0).
      // The 95% cutoff must match the ScrollTrigger `start: "top 95%"` below: a row whose top
      // has already crossed that line at load fires immediately regardless of this check, so
      // using a smaller cutoff here would leave it out of the cascade while GSAP still fires it
      // at delay 0 — same moment as the first group, breaking the stagger for that row.
      const CASCADE_STEP = 0.12;
      const START_DELAY = 0.3;
      const viewportHeight = window.innerHeight;
      let visibleIndex = 0;
      for (const group of groups) {
        const rect = group.trigger.getBoundingClientRect();
        const initiallyInView = rect.top < viewportHeight * 0.95 && rect.bottom > 0;
        const delay = START_DELAY + (initiallyInView ? visibleIndex * CASCADE_STEP : 0);
        if (initiallyInView) {
          visibleIndex += 1;
        }
        buildGroup(group.trigger, group.cells, group.line, delay);
      }

      ScrollTrigger.refresh();

      cleanup = () => {
        for (const tl of timelines) {
          (tl.scrollTrigger as InstanceType<typeof ScrollTrigger> | undefined)?.kill();
          tl.kill();
        }
      };
    });

    return () => cleanup?.();
  }, [prefersReducedMotion]);

  return (
    <section className="section-padding overflow-clip pt-0" aria-label="Events (copy)">
      <table ref={containerRef} className="w-full table-fixed border-collapse text-ink">
        <colgroup>
          <col className="w-3/5 lg:w-3/5" />
          <col className="w-2/5" />
        </colgroup>
        <thead>
          <tr>
            <th scope="col" className="type-eyebrow pb-8 text-left font-normal">
              <RevealCell>{t("clientHeader")}</RevealCell>
            </th>
            <th scope="col" className="type-eyebrow pb-8 text-right font-normal">
              <RevealCell>{t("locationHeader")}</RevealCell>
            </th>
          </tr>
        </thead>
        <tbody>
          {/* Header separator line (was the thead bottom border). */}
          <tr>
            <td colSpan={2} className="p-0">
              <div aria-hidden="true" data-reveal-line className="h-px w-0 bg-rule" />
            </td>
          </tr>
          {events.map((event) => {
            const isOpen = activeId === event.id;
            return (
              <React.Fragment key={event.id}>
                <tr
                  data-reveal-row
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
                    {/* `align-bottom`: the RevealCell's `overflow-hidden` clip mask moves this
                        inline-block button's baseline to its bottom edge, so the default
                        `vertical-align: baseline` reserves the font's descender space below it and
                        makes the row taller than the plain-text EventsTable. A non-baseline align
                        collapses that gap so heights match. */}
                    <button
                      type="button"
                      className="relative z-10 w-full cursor-pointer whitespace-nowrap text-left align-bottom uppercase transition-colors duration-450 ease-[cubic-bezier(0.83,0,0.17,1)] focus-visible:outline focus-visible:outline-offset-8 group-hover:text-surface motion-safe:transition-[padding-left] motion-safe:duration-850 motion-safe:ease-custom-easing motion-safe:group-hover:pl-14 motion-safe:group-hover:duration-650"
                      aria-expanded={isOpen}
                      aria-controls={`event-details-2-${event.id}`}
                    >
                      <RevealCell>
                        <span className="lg:hidden">
                          {event.client.length > 30 ? `${event.client.slice(0, 30)}…` : event.client}
                        </span>
                        <span className="hidden lg:inline">{event.client}</span>
                      </RevealCell>
                    </button>
                  </th>
                  <td className="type-eyebrow-xs relative z-10 p-0 text-right align-middle transition-colors duration-450 ease-[cubic-bezier(0.83,0,0.17,1)] group-hover:text-surface motion-safe:transition-[padding-right] motion-safe:duration-850 motion-safe:ease-custom-easing motion-safe:group-hover:pr-14 motion-safe:group-hover:duration-650">
                    <RevealCell>{event.location}</RevealCell>
                  </td>
                </tr>
                <tr>
                  <td colSpan={2} className="p-0">
                    <div
                      id={`event-details-2-${event.id}`}
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
                        {event.descriptionRichText && (
                          <SanityRichText value={event.descriptionRichText} className="type-body lg:max-w-[40vw]" tone="light" />
                        )}
                        {event.pressLink && (
                          <a
                            href={event.pressLink}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="type-body group mt-8 inline-block w-fit uppercase"
                          >
                            <span className="relative inline-block leading-none">
                              {t("pressLink")}
                              <span className="pointer-events-none absolute inset-x-0 -bottom-[0.025em] h-[0.0625em]">
                                <span className="relative block h-full w-full">
                                  <span
                                    className={cx(
                                      "absolute inset-0 origin-left scale-x-100 bg-current transition-transform delay-300 duration-[735ms] ease-[cubic-bezier(0.625,0.05,0,1)]",
                                      "group-hover:origin-right group-hover:scale-x-0 group-hover:delay-0",
                                      "motion-reduce:transition-none"
                                    )}
                                  />
                                  <span
                                    className={cx(
                                      "absolute inset-0 origin-right scale-x-0 bg-current transition-transform delay-0 duration-[735ms] ease-[cubic-bezier(0.625,0.05,0,1)]",
                                      "group-hover:origin-left group-hover:scale-x-100 group-hover:delay-300",
                                      "motion-reduce:transition-none"
                                    )}
                                  />
                                </span>
                              </span>
                            </span>
                          </a>
                        )}
                        <EventImageStrip images={event.images} />
                      </div>
                    </div>
                    {/* Row separator line (was the tr bottom border). */}
                    <div aria-hidden="true" data-reveal-line className="h-px w-0 bg-rule" />
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

/** Clip mask for the scroll reveal: children sit below the clip edge and GSAP rises the inner
 * `[data-reveal-cell]` element up into view. Only the text is clipped; cell padding stays
 * outside so nothing peeks through. */
function RevealCell({ children }: { children: React.ReactNode }) {
  return (
    <span className="block overflow-hidden">
      <span data-reveal-cell className="block will-change-transform [transform:translateY(100%)]">
        {children}
      </span>
    </span>
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
