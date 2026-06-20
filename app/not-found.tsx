import type { Metadata } from "next";
import { NextIntlClientProvider } from "next-intl";
import { getMessages, setRequestLocale } from "next-intl/server";
import { seo } from "~/features/site/seo/utils";
import { SiteError } from "~/features/site/site-error";
import { ViewTransitions } from "~/features/view-transition/app-view-transitions";
import { ViewTransitionProvider } from "~/features/view-transition/context";
import { routing } from "~/i18n/routing";

export async function generateMetadata(): Promise<Metadata> {
  return await seo({ title: "Not Found", robots: "noindex, nofollow" });
}

export default async function NotFound() {
  setRequestLocale(routing.defaultLocale);
  const messages = await getMessages();

  // SiteError renders the brand chrome, whose links use the boilerplate transition
  // Link — so the view-transition providers must wrap it here too.
  return (
    <NextIntlClientProvider locale={routing.defaultLocale} messages={messages}>
      <ViewTransitions>
        <ViewTransitionProvider>
          <SiteError />
        </ViewTransitionProvider>
      </ViewTransitions>
    </NextIntlClientProvider>
  );
}
