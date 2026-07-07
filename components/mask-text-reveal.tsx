"use client";

import * as React from "react";
import { loadGsap } from "~/features/motion/gsap";
import { usePrefersReducedMotion } from "~/features/motion/use-prefers-reduced-motion";

export type MaskTextRevealSplitType = "lines" | "words" | "letters";

type MaskTextRevealSplitTypeConfig = {
  duration: number;
  stagger: number;
};

/** Default duration/stagger per split granularity — finer splits animate faster with a tighter stagger. */
const SPLIT_TYPE_CONFIG: Record<MaskTextRevealSplitType, MaskTextRevealSplitTypeConfig> = {
  lines: { duration: 0.8, stagger: 0.08 },
  words: { duration: 0.6, stagger: 0.06 },
  letters: { duration: 0.8, stagger: 0.02 },
};

/** SplitText only needs to split as deep as the target unit — lines for "lines", lines+words for "words", etc. */
const SPLIT_TYPE_TO_GSAP_TYPE: Record<MaskTextRevealSplitType, string> = {
  lines: "lines",
  words: "lines, words",
  letters: "lines, words, chars",
};

export type MaskTextRevealProps = {
  /** A single host element (div, span, h1-h6, p, ...) to split and reveal. */
  children: React.ReactElement<{ style?: React.CSSProperties; ref?: React.Ref<HTMLElement> }>;
  /** Reveal granularity: whole lines, whole words, or individual letters. Default: "lines" */
  splitType?: MaskTextRevealSplitType;
  /** Overrides the default duration (seconds) for the chosen split type. */
  duration?: number;
  /** Overrides the default stagger (seconds) for the chosen split type. */
  stagger?: number;
  /** Delay before the reveal starts, in seconds. Default: 0 */
  delay?: number;
  /** GSAP ease. Default: "ease-custom-easing" */
  ease?: string;
  /** ScrollTrigger start position. Default: "clamp(top 80%)" */
  start?: string;
  /** Whether the ScrollTrigger only fires once. Default: true */
  once?: boolean;
  /** Outlines each mask element in red so you can verify the overflow-hidden masking is applied. Default: false */
  debug?: boolean;
};

export function MaskTextReveal({
  children,
  splitType = "lines",
  duration,
  stagger,
  delay = 0,
  ease = "ease-custom-easing",
  start = "clamp(top 80%)",
  once = true,
  debug = false,
}: MaskTextRevealProps) {
  const ref = React.useRef<HTMLElement | null>(null);
  const reduceMotion = usePrefersReducedMotion();
  const [isVisible, setIsVisible] = React.useState(false);

  React.useEffect(() => {
    const host = ref.current;

    if (!host) {
      return;
    }

    if (reduceMotion) {
      setIsVisible(true);
      return;
    }

    let cancelled = false;
    let split: { revert: () => void } | undefined;
    let scrollTrigger: { kill: () => void } | undefined;
    let tween: { kill: () => void } | undefined;

    void document.fonts.ready.then(() =>
      loadGsap().then(({ gsap, SplitText }) => {
        if (cancelled || !ref.current) {
          return;
        }

        const config = {
          duration: duration ?? SPLIT_TYPE_CONFIG[splitType].duration,
          stagger: stagger ?? SPLIT_TYPE_CONFIG[splitType].stagger,
        };

        split = SplitText.create(ref.current, {
          type: SPLIT_TYPE_TO_GSAP_TYPE[splitType],
          mask: "lines",
          autoSplit: true,
          onSplit(instance) {
            const targets = splitType === "lines" ? instance.lines : splitType === "words" ? instance.words : instance.chars;

            if (debug) {
              for (const mask of instance.masks) {
                (mask as HTMLElement).style.border = "1px solid red";
              }
            }

            setIsVisible(true);

            const revealTween = gsap.from(targets, {
              yPercent: 110,
              duration: config.duration,
              stagger: config.stagger,
              delay,
              ease,
              scrollTrigger: {
                trigger: host,
                start,
                once,
              },
            });

            tween = revealTween;
            scrollTrigger = revealTween.scrollTrigger ?? undefined;

            return revealTween;
          },
        });
      })
    );

    return () => {
      cancelled = true;
      scrollTrigger?.kill();
      tween?.kill();
      split?.revert();
    };
  }, [reduceMotion, splitType, duration, stagger, delay, ease, start, once, debug]);

  return React.cloneElement(children, {
    ref,
    style: {
      ...children.props.style,
      visibility: reduceMotion || isVisible ? "visible" : "hidden",
    },
  });
}
