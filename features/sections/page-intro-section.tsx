type PageIntroSectionProps = {
  title: string;
  body?: string;
  ariaLabel?: string;
};

/** Page title block used at the top of inner pages (Events, About, Services). */
export function PageIntroSection({ title, body, ariaLabel = "Intro" }: PageIntroSectionProps) {
  return (
    <section className={`section-padding pt-80 bg-surface text-ink${!body ? "pb-40" : ""}`} aria-label={ariaLabel}>
      <h1 className="type-h1 col-span-full -indent-[0.07em] uppercase md:col-span-6">{title}</h1>
      {body && (
        <div className="layout-grid">
          <h3 className="type-h3 lg:type-h3 col-span-full mt-16 lg:mt-8">{body}</h3>
        </div>
      )}
    </section>
  );
}
