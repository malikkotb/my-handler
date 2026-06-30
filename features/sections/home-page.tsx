import { ClientSection } from "~/features/sections/client-section";
import { FeaturedEvents } from "~/features/sections/featured-events";
import { Hero } from "~/features/sections/hero";
import { IntroSection } from "~/features/sections/intro-section";
import { ServicesGrid } from "~/features/sections/services-grid";
import { SiteShell } from "~/features/site/site-shell";
import type { PageQResult } from "~/sanity/types";

export function HomePage({ page }: { page?: PageQResult }) {
  return (
    <SiteShell>
      <Hero />
      {/* Slides up over the hero at lg+ (the -100dvh pulls it onto the hero's lower half, z-10
          paints it above). Below lg there is no margin/z, so these sections stack normally. */}
      <div className="relative bg-surface lg:z-10 lg:-mt-dvh-1">
        <IntroSection />
        <FeaturedEvents events={page?.featuredEvents} />
        <ServicesGrid services={page?.services} />
        <ClientSection />
      </div>
    </SiteShell>
  );
}
