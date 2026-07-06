import { getTranslations } from "next-intl/server";
import { MyHandlerMonogram } from "~/components/brand/monogram";
import { Button } from "~/components/button";
import { CtaButton } from "~/components/cta-button";
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

  const { text, link, showHeader } = site?.notFound ?? {};

  return (
    <SiteShell showHeader={showHeader} showFooter={false}>
      <div
        data-inverted
        className="flex min-h-dvh-1 flex-col items-center justify-center gap-64 bg-ink px-16 py-64 text-center text-surface"
      >
        <div className="flex max-w-600 px-32 flex-col items-center gap-24">
          {text ? (
            <AnimatedSanityRichText value={text} viewport={false} />
          ) : (
            <>
              <h1 className="type-h4 uppercase">{t("title")}</h1>
              <p className="type-body text-surface">{t("body")}</p>
              <p className="type-body text-surface">{t("bodySecondary")}</p>
            </>
          )}

          {link?.href ? (
            <Button asChild>
              <SanityLink link={link}>{link.text}</SanityLink>
            </Button>
          ) : (
            <CtaButton to="/" className="text-surface">
              {t("home")}
            </CtaButton>
          )}
        </div>

        <MyHandlerMonogram aria-label="My Handler logo" className="w-auto h-[50vw] lg:h-[25vw]" />
      </div>
    </SiteShell>
  );
}
