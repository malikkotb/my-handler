import { getTranslations } from "next-intl/server";
import { Button } from "~/components/button";
import { MainLink } from "~/components/main-link";
import { AnimatedSanityRichText } from "~/features/rich-text";
import { sanityFetch } from "~/features/sanity/client";
import { SanityLink } from "~/features/sanity/link";
import { SiteErrorQ } from "~/features/site/site-error/query";
import { SiteShell } from "~/features/site/site-shell";
import { SANITY_SINGLETON_SITE_ID } from "~/sanity/constants";
import type { SiteErrorQResult } from "~/sanity/types";

export async function SiteError() {
  const t = await getTranslations("notFound");
  const site = await sanityFetch<SiteErrorQResult>({
    query: SiteErrorQ,
    options: { next: { tags: [SANITY_SINGLETON_SITE_ID] } },
  });

  const { text, link, showHeader, showFooter } = site?.notFound ?? {};

  return (
    <SiteShell showHeader={showHeader} showFooter={showFooter}>
      <div className="mx-auto flex w-full max-w-1200 overflow-hidden bg-black px-16 py-64 text-white lg:gap-120 lg:px-48 lg:py-96">
        <div className="flex min-h-0 flex-1 flex-col gap-72">
          <div className="flex justify-between gap-48 px-16 pt-16 lg:px-48 lg:pt-48">
            <div className="flex max-w-600 flex-col gap-32">
              {text ? (
                <AnimatedSanityRichText value={text} viewport={false} />
              ) : (
                <>
                  <h1 className="type-h2">{t("title")}</h1>
                  <p className="type-body">{t("body")}</p>
                  <MainLink to="/">{t("home")}</MainLink>
                </>
              )}
              {link?.href && (
                <Button asChild>
                  <SanityLink link={link}>{link.text}</SanityLink>
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>
    </SiteShell>
  );
}
