"use client";

import { useWindowEvent } from "@mantine/hooks";
import { useLenis } from "lenis/react";
import * as React from "react";
import { cx } from "~/features/style/utils";

type StickyStep = {
  id: string;
  eyebrow: string;
  title: string;
  body: string;
  image: string;
  alt: string;
};

const DEFAULT_STEPS: StickyStep[] = [
  {
    id: "consultancy",
    eyebrow: "Step One",
    title: "Consultancy",
    body: "We begin by listening. Strategic and creative guidance turns an early idea into a clear, considered direction with intent behind every choice.",
    image: "https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=900&q=80",
    alt: "Strategic consultancy session",
  },
  {
    id: "design",
    eyebrow: "Step Two",
    title: "Direction",
    body: "Concepts take shape. We define the creative direction, set the tone, and align every detail around a single, coherent vision.",
    image: "https://images.unsplash.com/photo-1464366400600-7168b8af9bc3?w=900&q=80",
    alt: "Creative direction and planning",
  },
  {
    id: "production",
    eyebrow: "Step Three",
    title: "Production",
    body: "Vision becomes reality. Production, logistics, and execution are handled with precision so the experience unfolds seamlessly.",
    image: "https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?w=900&q=80",
    alt: "On-site production and execution",
  },
  {
    id: "delivery",
    eyebrow: "Step Four",
    title: "Delivery",
    body: "The final step. Discreet, dedicated support that anticipates needs and elevates every moment, long after the work is done.",
    image: "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=900&q=80",
    alt: "Dedicated concierge support",
  },
];

type StepStatus = "before" | "active" | "after";

type StickyStepsProps = {
  steps?: StickyStep[];
  className?: string;
};

export function StickySteps({ steps = DEFAULT_STEPS, className }: StickyStepsProps) {
  const [activeIndex, setActiveIndex] = React.useState(0);
  const anchorRefs = React.useRef<(HTMLDivElement | null)[]>([]);

  // Pick the step whose anchor sits closest to the vertical center of the viewport.
  const updateActiveStep = React.useCallback(() => {
    const viewportCenter = window.innerHeight / 2;
    let minDistance = Number.POSITIVE_INFINITY;
    let nearest = 0;

    anchorRefs.current.forEach((el, index) => {
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

    // setState bails out when `nearest` is unchanged, so running this per scroll frame is fine.
    setActiveIndex(nearest);
  }, []);

  // The page scrolls inside the Lenis wrapper, not the window — subscribe to Lenis' scroll.
  useLenis(updateActiveStep);
  useWindowEvent("resize", updateActiveStep);

  React.useEffect(() => {
    updateActiveStep();
  }, [updateActiveStep]);

  if (!steps.length) {
    return null;
  }

  return (
    <section className={cx("relative min-h-dvh overflow-clip text-ink", className)}>
      <div className="section-px mx-auto max-w-[74rem]">
        <div className="relative flex min-h-dvh">
          <div className="flex flex-1 flex-col gap-120 py-160 lg:gap-[30dvh] lg:py-[calc(50dvh-7.5rem)]">
            {steps.map((step, index) => {
              const status: StepStatus = index < activeIndex ? "before" : index > activeIndex ? "after" : "active";
              const isVisible = status === "before" || status === "active";
              const isActive = status === "active";

              return (
                // Item is intentionally NOT positioned: the media below is `absolute` against the
                // `relative` collection wrapper, so every media column stacks in the right half across
                // the full section height and its inner `sticky` element pins while the text scrolls.
                <div key={step.id}>
                  {/* Anchor — the NON-sticky measurement point for this step. */}
                  <div
                    ref={(el) => {
                      anchorRefs.current[index] = el;
                    }}
                    className={cx(
                      "flex flex-col gap-32 pb-80 transition-opacity duration-500 ease-in-out motion-reduce:transition-none",
                      "lg:ml-auto lg:w-1/2 lg:pr-0 lg:pb-0 lg:pl-96",
                      isActive ? "lg:opacity-100" : "lg:opacity-25"
                    )}
                  >
                    <span className="type-eyebrow text-accent opacity-50">{step.eyebrow}</span>
                    <h2 className="type-h2">{step.title}</h2>
                    <p className="type-body opacity-60">{step.body}</p>
                  </div>

                  {/* Media — sticky on desktop, pinned while this step is in view. */}
                  <div className="relative w-full lg:absolute lg:top-0 lg:left-0 lg:h-full lg:w-1/2 lg:pr-48">
                    <div className="relative flex w-full items-center lg:sticky lg:top-0 lg:min-h-dvh">
                      <div
                        className={cx(
                          "relative aspect-3/4 w-full overflow-hidden rounded-[500px] bg-body/10",
                          "transition-[opacity,visibility] duration-500 ease-in-out motion-reduce:transition-none",
                          isVisible ? "lg:visible lg:opacity-100" : "lg:invisible lg:opacity-0"
                        )}
                      >
                        <img
                          src={step.image}
                          alt={step.alt}
                          width={900}
                          height={1200}
                          loading="lazy"
                          className="absolute inset-0 h-full w-full rounded-[inherit] object-cover"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
