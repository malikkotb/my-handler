import { setRequestLocale } from "next-intl/server";
import { AboutIntroSection } from "~/features/sections/about-intro-section";
import { AboutTextColumns } from "~/features/sections/about-text-columns";
import { ClientSection } from "~/features/sections/client-section";
import { OurTeam } from "~/features/sections/our-team";
import { PageIntroSection } from "~/features/sections/page-intro-section";
import { SiteShell } from "~/features/site/site-shell";

export default async function AboutPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);

  return (
    <SiteShell>
      <div>
        <PageIntroSection
          title="OUR TEAM"
          ariaLabel="About"
          body="My Handler brings together a collective of professionals from diverse industries and creative disciplines — including hospitality, luxury services, marketing, music, production, logistics, communication, and event management."
        />
        <AboutIntroSection />
        <OurTeam />
        <AboutTextColumns />
        <ClientSection />
      </div>
    </SiteShell>
  );
}
