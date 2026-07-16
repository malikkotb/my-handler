import { ClientSection } from "~/features/sections/client-section";
import { FeaturedEvents } from "~/features/sections/featured-events";
import { Hero } from "~/features/sections/hero";
import { IntroSection } from "~/features/sections/intro-section";
import { SiteShell } from "~/features/site/site-shell";
import type { PageQResult } from "~/sanity/types";
import { ServicesGridThree } from "./services-grid-three";

export function HomePage({ page }: { page?: PageQResult }) {
  return (
    <SiteShell>
      <Hero />
      {/* Slides up over the hero (the -100dvh pulls it onto the hero's lower half, z-10 paints it
          above), so the pinned hero in <Hero /> parallaxes as this section covers it on scroll. */}
      {/* Full-bleed via margin, not translate/left: a transformed ancestor would become the
          containing block for descendant `position: fixed` elements (e.g. ServicesGridThree's
          cursor-follower), breaking their viewport tracking. */}
      <div className="relative z-10 -mt-dvh-1 ml-[calc(50%-50vw)] w-screen bg-surface">
        <div className="container mx-auto">
          <IntroSection />
          <FeaturedEvents events={page?.featuredEvents} />
          <ServicesGridThree services={page?.services} />
          <ClientSection isHomepage />
        </div>
      </div>
    </SiteShell>
  );
}
