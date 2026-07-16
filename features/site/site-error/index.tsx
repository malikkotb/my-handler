import { getTranslations } from "next-intl/server";
import { AnimatedText } from "~/components/animated-text";
import { Button } from "~/components/button";
import { CtaButton } from "~/components/cta-button";
import { AnimatedSanityRichText } from "~/features/rich-text";
import { sanityFetch } from "~/features/sanity/client";
import { SanityLink } from "~/features/sanity/link";
import { HeroModel } from "~/features/sections/hero/hero-model";
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
        data-hero-model-boundary
        className="relative left-1/2 flex min-h-dvh-1 w-screen -translate-x-1/2 flex-col items-center justify-center gap-64 overflow-hidden bg-ink px-16 py-64 text-center text-surface"
      >
        <div className="absolute inset-0 translate-y-[25vh]">
          <div className="hero-model-frame">
            <HeroModel src="/model.glb" ariaLabel="My Handler logo" pivotScale={0.6} />
          </div>
        </div>

        <div className="relative z-10 flex max-w-600 -translate-y-[25vh] flex-col items-center gap-24 px-32">
          {text ? (
            <AnimatedSanityRichText value={text} viewport={false} />
          ) : (
            <>
              <h1 className="type-h4 uppercase">
                <AnimatedText as="span">{t("title")}</AnimatedText>
              </h1>
              <p className="type-body text-surface">
                <AnimatedText as="span">{t("body")}</AnimatedText>
              </p>
              <p className="type-body text-surface">
                <AnimatedText as="span">{t("bodySecondary")}</AnimatedText>
              </p>
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
      </div>
    </SiteShell>
  );
}
