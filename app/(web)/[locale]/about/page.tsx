import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { AboutIntroSection } from "~/features/sections/about-intro-section";
import { AboutTextColumns } from "~/features/sections/about-text-columns";
import { ClientSection } from "~/features/sections/client-section";
import { OurTeam } from "~/features/sections/our-team";
import { PageIntroSection } from "~/features/sections/page-intro-section";
import { SiteShell } from "~/features/site/site-shell";

type AboutPageProps = {
  params: Promise<{ locale: string }>;
};

export async function generateMetadata({ params }: AboutPageProps): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "nav" });

  return { title: t("about") };
}

export default async function AboutPage({ params }: AboutPageProps) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: "about" });

  return (
    <SiteShell>
      <div>
        <PageIntroSection
          title={t("introTitle").toUpperCase()}
          ariaLabel="About"
          body={t("introBody")}
        />
        <AboutIntroSection />
        <OurTeam />
        <AboutTextColumns />
        <ClientSection />
      </div>
    </SiteShell>
  );
}
