import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { SiteShell } from "~/features/site/site-shell";

type ContactPageProps = {
  params: Promise<{ locale: string }>;
};

export async function generateMetadata({ params }: ContactPageProps): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "nav" });

  return { title: t("contact") };
}

export default async function ContactPage({ params }: ContactPageProps) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: "contact" });

  return (
    <SiteShell>
      <div className="flex min-h-screen w-full flex-col items-center justify-center">
        <div className="flex flex-col gap-32">
          <h3 className="type-h4 text-center">
            {t("headline1")}
            <br />
            {t("headline2")}
          </h3>
          <a
            className="type-h2 text-center uppercase"
            href={`mailto:${t("email")}`}
          >
            {t("email")}
          </a>
        </div>
        <div className="type-eyebrow absolute bottom-32 left-1/2 flex -translate-x-1/2 gap-56">
          <p>{t("phone")}</p>
          <p>{t("city")}</p>
        </div>

        {/* <section className="section-padding" aria-label="Contact form">
        <div className="layout-grid">
          <div className="col-span-full rounded-16 bg-ink p-32 text-surface lg:col-span-6 lg:col-start-5">
            <ContactForm />
          </div>
        </div>
      </section> */}
      </div>
    </SiteShell>
  );
}
