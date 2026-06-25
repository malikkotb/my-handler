import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { PageIntroSection } from "~/features/sections/page-intro-section";
import { ServicesDetail } from "~/features/sections/services-detail";
import { SiteShell } from "~/features/site/site-shell";

type ServicesPageProps = {
  params: Promise<{ locale: string }>;
};

export async function generateMetadata({ params }: ServicesPageProps): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "services" });

  return { title: t("heading") };
}

export default async function ServicesPage({ params }: ServicesPageProps) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: "services" });

  return (
    <SiteShell>
      <PageIntroSection
        title={t("heading").toUpperCase()}
        ariaLabel="Services"
        body={t("introBody")}
      />
      <ServicesDetail />
    </SiteShell>
  );
}
