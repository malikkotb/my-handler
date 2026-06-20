import type { Metadata } from "next";
import "~/features/style/tailwind.css";
import { draftMode } from "next/headers";
import { NextIntlClientProvider } from "next-intl";
import { getMessages, setRequestLocale } from "next-intl/server";
import { SharedWebLayout } from "~/app/shared-web-layout";
import { seo } from "~/features/site/seo/utils";
import { SiteError } from "~/features/site/site-error";
import { routing } from "~/i18n/routing";

export async function generateMetadata(): Promise<Metadata> {
  return await seo({ title: "Not Found", robots: "noindex, nofollow" });
}

export default async function GlobalNotFound() {
  // Rendered outside the `[locale]` segment, so establish the default locale + messages.
  setRequestLocale(routing.defaultLocale);
  const { isEnabled: isDraft } = await draftMode();
  const messages = await getMessages();

  return (
    <SharedWebLayout isDraft={isDraft} locale={routing.defaultLocale}>
      <NextIntlClientProvider locale={routing.defaultLocale} messages={messages}>
        <SiteError />
      </NextIntlClientProvider>
    </SharedWebLayout>
  );
}
