/**
 * Central GSAP loader. Plugins are imported dynamically (browser-only) so the
 * module is safe to reference from client components that still SSR-render.
 * Registration + the shared `mainLink` ease happen once, then the resolved
 * bundle is memoized for every caller.
 */
let gsapPromise: Promise<typeof import("gsap").gsap> | null = null;

type GsapBundle = {
  gsap: typeof import("gsap").gsap;
  ScrollTrigger: typeof import("gsap/ScrollTrigger").ScrollTrigger;
  CustomEase: typeof import("gsap/CustomEase").CustomEase;
};

let bundlePromise: Promise<GsapBundle> | null = null;

export function loadGsap(): Promise<GsapBundle> {
  if (!bundlePromise) {
    bundlePromise = (async () => {
      const [{ gsap }, { ScrollTrigger }, { CustomEase }] = await Promise.all([
        import("gsap"),
        import("gsap/ScrollTrigger"),
        import("gsap/CustomEase"),
      ]);

      gsap.registerPlugin(ScrollTrigger, CustomEase);

      if (!CustomEase.get("mainLink")) {
        CustomEase.create("mainLink", "0.625, 0.05, 0, 1");
      }

      if (!CustomEase.get("ctaBlur")) {
        CustomEase.create("ctaBlur", "0.16, 1, 0.35, 1");
      }

      // Piecewise-linear bounce, converted from a CSS `linear()` timing function into
      // straight-line SVG segments for CustomEase — x must be normalized to 0-1 (not %),
      // since CustomEase treats path x as the raw progress fraction with no rescaling.
      if (!CustomEase.get("ctaBounce")) {
        CustomEase.create(
          "ctaBounce",
          "M0,0 L0.02,0.0025 L0.04,0.0092 L0.06,0.0198 L0.08,0.0344 L0.1,0.054 L0.12,0.08 L0.14,0.1284 L0.16,0.1946 L0.18,0.2786 L0.2,0.3788 L0.22,0.491 L0.24,0.6102 L0.26,0.7312 L0.28,0.85 L0.3,0.9337 L0.32,0.9927 L0.34,1.0343 L0.36,1.0626 L0.38,1.0803 L0.4,1.0892 L0.42,1.0904 L0.44,1.085 L0.46,1.0716 L0.48,1.0561 L0.5,1.0423 L0.52,1.0302 L0.54,1.0199 L0.56,1.0114 L0.58,1.0047 L0.6,0.9997 L0.62,0.9965 L0.64,0.995 L0.66,0.9951 L0.68,0.9968 L0.7,1 L0.72,1.0035 L0.74,1.006 L0.76,1.0077 L0.78,1.0086 L0.8,1.0089 L0.82,1.0086 L0.84,1.008 L0.86,1.007 L0.88,1.0058 L0.9,1.0044 L0.92,1.0031 L0.94,1.0019 L0.96,1.0009 L0.98,1.0002 L1,1"
        );
      }

      // Lenis scrolls its own wrapper element (`.lenis`), not the window. Point every
      // ScrollTrigger at that scroller by default so scroll-driven animations fire.
      // Set before any component creates a trigger (all of them await loadGsap first).
      const scroller = document.querySelector<HTMLElement>(".lenis");
      if (scroller) {
        ScrollTrigger.defaults({ scroller });
      }

      return { gsap, ScrollTrigger, CustomEase };
    })();
  }

  return bundlePromise;
}

/** Convenience for callers that only need the core instance. */
export function loadGsapCore() {
  if (!gsapPromise) {
    gsapPromise = loadGsap().then((b) => b.gsap);
  }
  return gsapPromise;
}
