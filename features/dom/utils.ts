import { type Screen, screens } from "./constants";

/**
 * `requestIdleCallback` isn't in Safari — fall back to a short timeout so callers still defer past
 * the initial paint. A `timeout` is always passed to `requestIdleCallback` too: pages with continuous
 * `requestAnimationFrame` loops (smooth scroll, GSAP ticker, WebGL render loops) can leave the main
 * thread with no true idle time for a long while, so an unbounded idle callback risks never firing.
 */
export function scheduleIdle(callback: () => void, timeout = 1000): number {
  if (typeof window.requestIdleCallback === "function") {
    return window.requestIdleCallback(callback, { timeout });
  }
  return window.setTimeout(callback, 200);
}

export function cancelIdle(id: number) {
  if (typeof window.cancelIdleCallback === "function") {
    window.cancelIdleCallback(id);
    return;
  }
  window.clearTimeout(id);
}

function parseRem(size: string) {
  return Number.parseFloat(size.replace("rem", ""));
}

/**
 * Parse a Tailwind className to split into responsive values.
 * @example
 * parseResponsiveValues("1 sm:4 lg:2")
 * // { DEFAULT: { value: 1 }, sm: { value: 4, resolvedWidth: "40rem" }, lg: { value: 2, resolvedWidth: "64rem" } }
 */
export function parseResponsiveValues(className: string) {
  const res = {} as Record<Screen | "DEFAULT", { value: string; resolvedWidth?: string }>;

  // Create a new regex pattern that matches all available screens.
  const bpRegexPattern = Object.keys(screens).join("|");
  const bpRegex = new RegExp(`^(${bpRegexPattern}):(.+)$`);

  // Split className string into parts and map to object.
  const parts = className.split(/\s+/);
  for (const part of parts) {
    const match = part.match(bpRegex);

    if (match) {
      const [, size, value] = match;

      if (value && size) {
        res[size as Screen] = { value, resolvedWidth: screens[size as Screen] };
      }
    } else {
      // No match means it's a default value.
      res.DEFAULT = { value: part };
    }
  }

  // Sort the result by media query value (largest first)
  // to mimic how the browser applies media query styles.
  const sortedEntries = Object.entries(res).sort(([, { resolvedWidth: sizeA }], [, { resolvedWidth: sizeB }]) => {
    if (!sizeA && !sizeB) {
      return 0;
    }

    if (!sizeA) {
      return 1;
    }

    if (!sizeB) {
      return -1;
    }

    return parseRem(sizeB) - parseRem(sizeA);
  });

  return Object.fromEntries(sortedEntries) as typeof res;
}
