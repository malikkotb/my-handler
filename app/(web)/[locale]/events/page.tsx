import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { DynamicTextCursor } from "~/features/dom/dynamic-text-cursor";
import { EventsTable } from "~/features/sections/events-table";
import { PageIntroSection } from "~/features/sections/page-intro-section";
import { SiteShell } from "~/features/site/site-shell";

type EventsPageProps = {
  params: Promise<{ locale: string }>;
};

export async function generateMetadata({ params }: EventsPageProps): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "events" });

  return { title: t("heading") };
}

export default async function EventsPage({ params }: EventsPageProps) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: "events" });

  return (
    <SiteShell>
      <div className="min-h-dvh-1">
        <PageIntroSection title={t("heading").toUpperCase()} ariaLabel="Events" />
        <EventsTable />
      </div>
      <DynamicTextCursor />
    </SiteShell>
  );
}
