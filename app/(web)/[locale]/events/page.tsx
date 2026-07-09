import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { defineQuery } from "next-sanity";
import { DynamicTextCursor } from "~/features/dom/dynamic-text-cursor";
import { RichTextFragment } from "~/features/rich-text/fragment";
import { sanityFetch } from "~/features/sanity/client";
import { ImageFragment } from "~/features/sanity/media/fragment";
import { getImageSrc } from "~/features/sanity/media/image/utils";
import type { EventItem } from "~/features/sections/events-data";
import { EventsTable } from "~/features/sections/events-table";
import { EventsTableDuplicate } from "~/features/sections/events-table-duplicate";
import { PageIntroSection } from "~/features/sections/page-intro-section";
import { SiteShell } from "~/features/site/site-shell";
import type { EventsQResult } from "~/sanity/types";

type EventsPageProps = {
  params: Promise<{ locale: string }>;
};

const EventsQ = defineQuery(`
  *[_type == "event"] | order(_createdAt desc) {
    _id,
    "client": select($locale == "fr" => coalesce(clientFrench, client), client),
    type,
    "location": select($locale == "fr" => coalesce(locationFrench, location), location),
    "description": select($locale == "fr" => coalesce(descriptionFrench, description), description),
    "descriptionRichText": select($locale == "fr" => descriptionFrenchRichText, descriptionRichText)[]{${RichTextFragment}},
    "images": images[defined(asset)]{
      ${ImageFragment}
    }
  }
`);

export async function generateMetadata({ params }: EventsPageProps): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "events" });

  return { title: t("heading") };
}

export default async function EventsPage({ params }: EventsPageProps) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: "events" });

  const raw = await sanityFetch<EventsQResult>({
    query: EventsQ,
    params: { locale },
    options: { next: { tags: ["event"] } },
  });

  const events: EventItem[] = (raw ?? []).map((e) => ({
    id: e._id,
    client: e.client ?? "",
    type: e.type ?? "",
    location: e.location ?? "",
    description: e.description ?? "",
    descriptionRichText: e.descriptionRichText?.length ? e.descriptionRichText : null,
    images: (e.images ?? []).map((img) => ({
      src: getImageSrc(img, { width: 1200 }),
      alt: img.altText ?? "",
      orientation: (img.dimensions?.aspectRatio ?? 1) >= 1 ? "landscape" : "portrait",
    })),
  }));

  return (
    <SiteShell>
      <div className="min-h-dvh-1">
        <PageIntroSection title={t("heading").toUpperCase()} ariaLabel="Events" />
        <EventsTable events={events} />
      </div>
      <DynamicTextCursor />
    </SiteShell>
  );
}
