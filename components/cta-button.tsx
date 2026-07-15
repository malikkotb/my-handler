"use client";

import { motion } from "motion/react";
import { useLocale } from "next-intl";
import { Link } from "~/components/link";
import { useDraftMode } from "~/features/draft-mode/context";
import { usePrefersReducedMotion } from "~/features/motion/use-prefers-reduced-motion";
import { useViewportEnteredForGate } from "~/features/motion/use-viewport-entered";
import type { MotionViewportInput } from "~/features/motion/viewport";
import { cx } from "~/features/style/utils";
import { useContentReady } from "~/features/use-content-ready";
import { getPathname } from "~/i18n/navigation";

const REVEAL_EASE = [0.23, 1, 0.32, 1] as const;
const STAGGER_DELAY = 0.08;

type CtaButtonProps = {
  to: string;
  children: string;
  className?: string;
  /** Passed to Motion's `viewport` on the wrapper (same API as `motion.div`). Defaults to the shared reveal viewport. Pass `false` to skip viewport gating. */
  viewport?: MotionViewportInput;
};

export function CtaButton({ to, children, className, viewport }: CtaButtonProps) {
  const locale = useLocale();
  const href = getPathname({ href: to, locale });
  const isDraft = useDraftMode();
  const contentReady = useContentReady().isComplete;
  const reduceMotion = usePrefersReducedMotion();
  const { enteredForGate, vpResolved, viewportDisabled, onViewportEnter, onViewportLeave } = useViewportEnteredForGate(viewport);

  const isVisible = isDraft || reduceMotion || (contentReady && enteredForGate);

  const container = {
    hidden: {},
    visible: { transition: { staggerChildren: STAGGER_DELAY } },
  };

  const reveal = reduceMotion
    ? { hidden: { opacity: 1, y: 0 }, visible: { opacity: 1, y: 0 } }
    : {
        hidden: { opacity: 0, y: "100%" },
        visible: { opacity: 1, y: "0%", transition: { duration: 0.6, ease: REVEAL_EASE } },
      };

  const lineReveal = reduceMotion
    ? { hidden: { scaleX: 1 }, visible: { scaleX: 1 } }
    : {
        hidden: { scaleX: 0 },
        visible: { scaleX: 1, transition: { duration: 0.6, ease: REVEAL_EASE } },
      };

  return (
    <motion.span
      initial="hidden"
      animate={isVisible ? "visible" : "hidden"}
      variants={container}
      viewport={viewportDisabled ? undefined : vpResolved}
      onViewportEnter={viewportDisabled ? undefined : onViewportEnter}
      onViewportLeave={viewportDisabled ? undefined : onViewportLeave}
      className="inline-block"
    >
      <Link href={href} className={cx("type-cta group inline-flex items-end justify-center gap-8 text-ink uppercase", className)}>
        <span className="relative inline-block">
          <span className="block overflow-hidden">
            <motion.span variants={reveal} className="block">
              {children}
            </motion.span>
          </span>
          <span className="pointer-events-none absolute inset-x-0 -bottom-[0.0625em] h-[0.0625em]">
            <motion.span variants={lineReveal} style={{ transformOrigin: "left" }} className="relative block h-full w-full">
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
            </motion.span>
          </span>
        </span>
        <span className="block translate-y-arrow overflow-hidden pl-8">
          <motion.span variants={reveal} aria-hidden="true" className="block">
            ↗
          </motion.span>
        </span>
      </Link>
    </motion.span>
  );
}
