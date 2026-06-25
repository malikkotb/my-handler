"use client";

import * as React from "react";
import { loadGsap } from "~/features/motion/gsap";
import { WordmarkPaths } from "./wordmark";

/**
 * The footer wordmark. On scroll the glyphs bend down from the edges toward a
 * settled baseline (scrubbed). Honors `prefers-reduced-motion` by rendering flat.
 */
export function AnimatedWordmark(props: React.ComponentProps<"svg">) {
  const ref = React.useRef<SVGSVGElement>(null);

  React.useEffect(() => {
    const svg = ref.current;
    if (!svg) {
      return;
    }

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      return;
    }

    let cleanup: (() => void) | undefined;

    loadGsap().then(({ gsap }) => {
      if (!ref.current) {
        return;
      }

      const pathEntries = gsap.utils
        .toArray<SVGPathElement>(svg.querySelectorAll("path"))
        .map((path, originalIndex) => ({ path, originalIndex }))
        .sort((a, b) => a.path.getBBox().x - b.path.getBBox().x);
      const paths = pathEntries.map(({ path }) => path);

      const boxes = paths.map((path) => path.getBBox());
      const left = Math.min(...boxes.map((box) => box.x));
      const right = Math.max(...boxes.map((box) => box.x + box.width));
      const center = left + (right - left) / 2;
      const maxDistance = Math.max(...boxes.map((box) => Math.abs(box.x + box.width / 2 - center)));
      const anchoredOriginalPathIndexes = new Set([1, 2, 9]);
      const barMotionSourcePathIndexes = new Map([
        [12, 11],
        [7, 5],
      ]);
      const bendDepth = 170;
      const bendByOriginalIndex = new Map<number, { y: number; yPercent: number }>();

      pathEntries.forEach(({ path, originalIndex }, index) => {
        const box = boxes[index];
        if (!box) {
          return;
        }
        const pathCenter = box.x + box.width / 2;
        const distanceRatio = maxDistance === 0 ? 0 : Math.abs(pathCenter - center) / maxDistance;
        const yPercent = anchoredOriginalPathIndexes.has(originalIndex) ? 0 : bendDepth * distanceRatio;
        const y = box.height * (yPercent / 100);

        bendByOriginalIndex.set(originalIndex, { y, yPercent });
        gsap.set(path, { yPercent });
      });

      barMotionSourcePathIndexes.forEach((sourceIndex, barIndex) => {
        const barPath = pathEntries.find(({ originalIndex }) => originalIndex === barIndex)?.path;
        const sourceBend = bendByOriginalIndex.get(sourceIndex);

        if (!barPath || !sourceBend) {
          return;
        }

        gsap.set(barPath, { y: sourceBend.y, yPercent: 0 });
      });

      const animation = gsap.timeline({
        scrollTrigger: { trigger: svg, start: "top 100%", end: "bottom bottom", scrub: 0.6 },
      });

      animation.to(paths, { y: 0, yPercent: 0, ease: "none" });

      cleanup = () => {
        animation.scrollTrigger?.kill();
        animation.kill();
        gsap.set(paths, { clearProps: "all" });
      };
    });

    return () => cleanup?.();
  }, []);

  return (
    <svg
      ref={ref}
      width="212"
      height="24"
      viewBox="0 0 212 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-label="My Handler"
      role="img"
      {...props}
    >
      <WordmarkPaths />
    </svg>
  );
}
