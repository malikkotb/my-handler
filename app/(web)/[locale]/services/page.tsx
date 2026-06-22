import { setRequestLocale } from "next-intl/server";
import { PageIntroSection } from "~/features/sections/page-intro-section";
import { ServicesDetail } from "~/features/sections/services-detail";
import { SiteShell } from "~/features/site/site-shell";

export default async function ServicesPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  return (
    <SiteShell>
      <PageIntroSection
        title='SERVICES'
        ariaLabel='Services'
        body='At My Handler, expertise is the art of anticipation. We design tailored experiences, carefully considered and executed with precision — blending strategic thinking, operational excellence, and creative sensibility to support clients through projects that demand discretion and uncompromising attention to detail.'
      />
      <ServicesDetail />
    </SiteShell>
  );
}
