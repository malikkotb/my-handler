import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { SiteShell } from "~/features/site/site-shell";

type LegalPageProps = {
  params: Promise<{ locale: string }>;
};

export async function generateMetadata({ params }: LegalPageProps): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "legal" });

  return { title: t("title") };
}

export default async function LegalPage({ params }: LegalPageProps) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: "legal" });

  return (
    <SiteShell>
      <section className="section-padding flex min-h-dvh items-center">
        <div className="flex max-w-800 flex-col gap-32">
          <h1 className="type-h2">{t("title")}</h1>
          <p className="type-body">{t("body")}</p>
        </div>
      </section>
    </SiteShell>
  );
}
