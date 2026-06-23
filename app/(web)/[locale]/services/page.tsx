import { getTranslations, setRequestLocale } from "next-intl/server";
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
  const t = await getTranslations({ locale, namespace: "services" });

  return (
    <SiteShell>
      <PageIntroSection
        title={t("heading").toUpperCase()}
        ariaLabel='Services'
        body={t("introBody")}
      />
      <ServicesDetail />
    </SiteShell>
  );
}
