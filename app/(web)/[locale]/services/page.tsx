import { setRequestLocale } from "next-intl/server";
import { PageIntroSection } from "~/features/sections/page-intro-section";
import { ServicesDetail } from "~/features/sections/services-detail";
import { SiteShell } from "~/features/site/site-shell";

export default async function ServicesPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);

  return (
    <SiteShell>
      <PageIntroSection
        title="SERVICES"
        ariaLabel="Services"
        body="At My Handler, expertise is defined by the art of anticipation. We design tailored experiences where every element is carefully considered, seamlessly orchestrated, and executed with precision. Blending strategic thinking, operational excellence, and a refined creative sensibility, we support our clients through projects that demand discretion, adaptability, and uncompromising attention to detail."
      />
      <ServicesDetail />
    </SiteShell>
  );
}
