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
      <IntroSection />
      <FeaturedEvents events={page?.featuredEvents} />
      <ServicesGrid services={page?.services} />
      <ClientSection />
    </SiteShell>
  );
}
