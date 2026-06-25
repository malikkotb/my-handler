import { ClientSection } from "~/features/sections/client-section";
import { FeaturedEvents } from "~/features/sections/featured-events";
import { Hero } from "~/features/sections/hero";
import { IntroSection } from "~/features/sections/intro-section";
import { ServicesGrid } from "~/features/sections/services-grid";
import { SiteShell } from "~/features/site/site-shell";

export function HomePage() {
  return (
    <SiteShell>
      <Hero />
      <IntroSection />
      <FeaturedEvents />
      <ServicesGrid />
      <ClientSection />
    </SiteShell>
  );
}
