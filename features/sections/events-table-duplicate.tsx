"use client";

import * as React from "react";
import { loadGsap } from "~/features/motion/gsap";
import { usePrefersReducedMotion } from "~/features/motion/use-prefers-reduced-motion";
import type { EventItem } from "./events-data";
import styles from "./events-table-duplicate.module.css";

/**
 * Layout duplicate of the events table using the project-list style
 * (Project / Category / Client / Year) with expandable project bodies.
 * Wired to the same `EventItem[]` data; fields absent from the data
 * (year, website, tags beyond `type`) are rendered only when present.
 */
export function EventsTableDuplicate({ events }: { events: EventItem[] }) {
  const [activeId, setActiveId] = React.useState<string | null>(null);
  const bodyRefs = React.useRef(new Map<string, HTMLDivElement>());
  const containerRef = React.useRef<HTMLElement>(null);
  const prefersReducedMotion = usePrefersReducedMotion();

  // Scroll-in reveal: as each row enters view its separator line grows left -> right (width)
  // while its cells rise up from behind a clip mask, staggered left -> right, together per row.
  React.useEffect(() => {
    const container = containerRef.current;
    if (!container) {
      return;
    }

    const lines = Array.from(container.querySelectorAll<HTMLElement>(`.${styles.line}`));

    // Text-bearing cells only: skips the empty "Year" cell, but keeps columns hidden at the
    // current breakpoint (they still get revealed, so a resize can't leave them stuck hidden).
    const groupCells = (root: Element) =>
      Array.from(root.querySelectorAll<HTMLElement>(`.${styles.cellInner}`)).filter(
        (el) => (el.textContent?.trim().length ?? 0) > 0
      );

    if (prefersReducedMotion) {
      for (const cell of container.querySelectorAll<HTMLElement>(`.${styles.cellInner}`)) {
        cell.style.transform = "none";
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

      const buildGroup = (trigger: Element, cells: HTMLElement[], line: HTMLElement | undefined) => {
        const tl = gsap.timeline({
          scrollTrigger: { trigger, start: "top 90%", once: true },
        });
        if (cells.length > 0) {
          // `y: 0` clears the pixel offset GSAP decodes from the CSS `translateY(100%)` matrix;
          // without it the leftover px `y` keeps cells shifted down (clipped) even at yPercent 0.
          tl.fromTo(cells, { yPercent: 100, y: 0 }, { yPercent: 0, duration: 0.7, ease: "mainLink", stagger: 0.06 }, 0);
        }
        if (line) {
          tl.fromTo(line, { width: 0 }, { width: "100%", duration: 0.7, ease: "mainLink" }, 0);
        }
        timelines.push(tl);
      };

      // Header group: its labels + the first line (the header/rows separator).
      const header = container.querySelector<HTMLElement>(`.${styles.header}`);
      if (header) {
        buildGroup(header, groupCells(header), lines[0]);
      }

      // Row groups: each row button pairs with the separator line directly below it.
      const buttons = Array.from(container.querySelectorAll<HTMLElement>(`.${styles.project}`));
      buttons.forEach((button, index) => {
        buildGroup(button, groupCells(button), lines[index + 1]);
      });

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

  const setBodyHeight = React.useCallback((id: string, open: boolean) => {
    const el = bodyRefs.current.get(id);
    if (!el) {
      return;
    }
    el.style.height = open ? `${el.scrollHeight}px` : "0px";
  }, []);

  const toggle = React.useCallback(
    (id: string) => {
      setActiveId((prev) => {
        const next = prev === id ? null : id;
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
    <section ref={containerRef} className={styles.projectContainer} aria-label="Events (duplicate)">
      <div className={styles.header}>
        <p>
          <span className={styles.cellInner}>Project</span>
        </p>
        <p>
          <span className={styles.cellInner}>Category</span>
        </p>
        <p>
          <span className={styles.cellInner}>Client</span>
        </p>
        <p>
          <span className={styles.cellInner}>Year</span>
        </p>
      </div>
      <div className={styles.line} />

      {events.map((event) => {
        const isOpen = activeId === event.id;
        const tags = event.type
          ? event.type
              .split(",")
              .map((tag) => tag.trim())
              .filter(Boolean)
          : [];

        return (
          <React.Fragment key={event.id}>
            <button
              type="button"
              className={styles.project}
              onClick={() => toggle(event.id)}
              aria-expanded={isOpen}
              aria-controls={`event-duplicate-${event.id}`}
            >
              <p>
                <span className={styles.cellInner}>{event.client}</span>
              </p>
              <p>
                <span className={styles.cellInner}>{event.type}</span>
              </p>
              <p>
                <span className={styles.cellInner}>{event.location}</span>
              </p>
              <p>
                <span className={styles.cellInner}>{""}</span>
              </p>
              <div className={styles.background} />
            </button>

            <div
              id={`event-duplicate-${event.id}`}
              className={styles.projectBody}
              ref={(el) => {
                if (el) {
                  bodyRefs.current.set(event.id, el);
                } else {
                  bodyRefs.current.delete(event.id);
                }
              }}
              aria-hidden={!isOpen}
            >
              <p>{event.description}</p>

              {tags.length > 0 && (
                <div className={styles.tags}>
                  {tags.map((tag) => (
                    <p key={tag}>{tag}</p>
                  ))}
                </div>
              )}

              {event.images.length > 0 && (
                <div className={styles.imagesContainer}>
                  {event.images.map((image) => (
                    <div key={image.src} className={styles.imageContainer}>
                      <div className={styles.imageWrapper}>
                        <img src={image.src} alt={image.alt} loading="lazy" decoding="async" />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className={styles.line} />
          </React.Fragment>
        );
      })}
    </section>
  );
}
