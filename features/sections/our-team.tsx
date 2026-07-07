import { useTranslations } from "next-intl";
import { AnimatedText } from "~/components/animated-text";

export function OurTeam() {
  const t = useTranslations("about");
  return (
    <section className="section-padding">
      <div className="layout-grid">
        <div className="col-span-full aspect-service-card w-full md:col-span-4">
          {/* biome-ignore lint/performance/noImgElement: local static asset */}
          <img src="/about/Edouard.avif" alt="" className="h-full w-full object-cover" loading="eager" />
          <div className="flex flex-col gap-2 pt-8">
            <span className="type-eyebrow-alt">EDOUARD JANICKI</span>
            <span className="type-eyebrow-xs">CEO &amp; FOUNDER</span>
          </div>
        </div>

        <div className="type-body col-span-full flex flex-col gap-40 py-20 md:col-span-3 md:py-0">
          <AnimatedText as="div">{t("teamBody1")}</AnimatedText>
          <AnimatedText as="div" animationDelay={0.1}>
            {t("teamBody2")}
          </AnimatedText>
        </div>
      </div>
    </section>
  );
}
