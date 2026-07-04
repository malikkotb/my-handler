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
