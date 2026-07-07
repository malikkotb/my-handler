import { MaskTextReveal } from "~/components/mask-text-reveal";

type PageIntroSectionProps = {
  title: string;
  body?: string;
  ariaLabel?: string;
};

/** Page title block used at the top of inner pages (Events, About, Services). */
export function PageIntroSection({ title, body, ariaLabel = "Intro" }: PageIntroSectionProps) {
  return (
    <section className={`section-padding pt-80 lg:pt-120 bg-surface text-ink${!body ? "pb-40" : ""}`} aria-label={ariaLabel}>
      <MaskTextReveal splitType="letters" immediate><h1 className="type-h1 col-span-full -ml-[0.07em] uppercase lg:col-span-6">{title}</h1></MaskTextReveal>
      {body && (
        <div className="layout-grid">
          <MaskTextReveal splitType="lines" immediate><h3 className="type-h3 lg:type-h3 col-span-full mt-32 lg:mt-32">{body}</h3></MaskTextReveal>
        </div>
      )}
    </section>
  );
}
