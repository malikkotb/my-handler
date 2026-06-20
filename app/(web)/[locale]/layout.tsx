import "~/features/style/tailwind.css";
import { draftMode } from "next/headers";
import { notFound } from "next/navigation";
import { hasLocale, NextIntlClientProvider } from "next-intl";
import { getMessages, setRequestLocale } from "next-intl/server";
import type * as React from "react";
import type { WebPage, WebSite, WithContext } from "schema-dts";
import { SharedWebLayout } from "~/app/shared-web-layout";
import { env } from "~/env";
import { sanityFetch } from "~/features/sanity/client";
import { SiteQuery } from "~/features/site/query";
import { routing } from "~/i18n/routing";
import { SANITY_SINGLETON_SITE_ID } from "~/sanity/constants";
import type { SiteQueryResult } from "~/sanity/types";

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export default async function Layout(props: { children: React.ReactNode; params: Promise<{ locale: string }> }) {
  const { locale } = await props.params;

  if (!hasLocale(routing.locales, locale)) {
    notFound();
  }

  setRequestLocale(locale);

  // Load messages for the actual route locale and hand them to the client provider
  // explicitly — server-side `requestLocale` is unreliable behind the custom proxy.
  const messages = await getMessages({ locale });

  const { isEnabled: isDraft } = await draftMode();

  const site = await sanityFetch<SiteQueryResult>({
    query: SiteQuery,
    options: {
      next: {
        tags: [SANITY_SINGLETON_SITE_ID],
      },
    },
  });

  const siteName = site?.name ?? "The Content Architecture";
  const description = site?.seoMetadata?.description;

  const websiteJsonLd: WithContext<WebSite> = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "@id": `${env.NEXT_PUBLIC_URL}/#website`,
    url: env.NEXT_PUBLIC_URL,
    name: siteName,
    description,
    inLanguage: locale,
  };

  const webpageJsonLd: WithContext<WebPage> = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    "@id": `${env.NEXT_PUBLIC_URL}/#webpage`,
    url: env.NEXT_PUBLIC_URL,
    name: siteName,
    description,
    isPartOf: {
      "@id": `${env.NEXT_PUBLIC_URL}/#website`,
    },
    inLanguage: locale,
  };

  return (
    <SharedWebLayout
      isDraft={isDraft}
      locale={locale}
      bodyStart={
        <>
          <script
            type="application/ld+json"
            // biome-ignore lint/security/noDangerouslySetInnerHtml: safe
            dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteJsonLd) }}
          />
          <script
            type="application/ld+json"
            // biome-ignore lint/security/noDangerouslySetInnerHtml: safe
            dangerouslySetInnerHTML={{ __html: JSON.stringify(webpageJsonLd) }}
          />
        </>
      }
    >
      <NextIntlClientProvider locale={locale} messages={messages}>
        {props.children}
      </NextIntlClientProvider>
    </SharedWebLayout>
  );
}
