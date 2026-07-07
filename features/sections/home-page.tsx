import { ClientSection } from "~/features/sections/client-section";
import { FeaturedEvents } from "~/features/sections/featured-events";
import { Hero } from "~/features/sections/hero";
import { IntroSection } from "~/features/sections/intro-section";
import { ServicesGrid } from "~/features/sections/services-grid";
import { TypographyTest } from "~/features/sections/typography-test";
import { SiteShell } from "~/features/site/site-shell";
import type { PageQResult } from "~/sanity/types";

export function HomePage({ page }: { page?: PageQResult }) {
  return (
    // TEMP: showHeader disabled here — <Hero /> renders its own <SiteHeader /> internally while
    // testing the header living inside (and parallaxing with) the hero section.
    <SiteShell showHeader={false}>
      <Hero />
      {/* Slides up over the hero (the -100dvh pulls it onto the hero's lower half, z-10 paints it
          above), so the pinned hero in <Hero /> parallaxes as this section covers it on scroll. */}
      <div className="relative z-10 -mt-dvh-1 bg-surface">
       {/*
          <TypographyTest />
          */}
        <IntroSection />
        <FeaturedEvents events={page?.featuredEvents} />
        <ServicesGrid services={page?.services} />
        <ClientSection isHomepage />
      </div>
    </SiteShell>
  );
}
