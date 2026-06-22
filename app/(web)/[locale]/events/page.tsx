import { setRequestLocale } from "next-intl/server";
import { DynamicTextCursor } from "~/features/dom/dynamic-text-cursor";
import { EventsTable } from "~/features/sections/events-table";
import { PageIntroSection } from "~/features/sections/page-intro-section";
import { SiteShell } from "~/features/site/site-shell";

export default async function EventsPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);

  return (
    <SiteShell>
      <div className="min-h-dvh-1">
        <PageIntroSection title="EVENTS" ariaLabel="Events" />
        <EventsTable />
      </div>
      <DynamicTextCursor />
    </SiteShell>
  );
}
