import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { AnimatedText } from "~/components/animated-text";
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

  const fields = [
    { label: t("publisherLabel"), value: t("publisher") },
    { label: t("legalFormLabel"), value: t("legalForm") },
    { label: t("addressLabel"), value: t("address") },
    { label: t("siretLabel"), value: t("siret") },
    { label: t("vatLabel"), value: t("vat") },
    { label: t("emailLabel"), value: t("email") },
    { label: t("directorLabel"), value: t("director") },
  ];

  return (
    <SiteShell>
      <section className="section-padding flex min-h-dvh items-center">
        <div className="flex max-w-800 flex-col gap-48 pt-60">
          <h1 className="type-h2">
            <AnimatedText as="span" viewport={false}>
              {t("title")}
            </AnimatedText>
          </h1>
          <dl className="flex flex-col gap-16">
            {fields.map(({ label, value }) => (
              <div key={label} className="flex flex-col gap-4">
                <dt className="type-eyebrow">{label}</dt>
                <dd className="type-body">{value}</dd>
              </div>
            ))}
          </dl>
          <p className="type-body">{t("copyright")}</p>
        </div>
      </section>
    </SiteShell>
  );
}
