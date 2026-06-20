type PageIntroSectionProps = {
  title: string;
  body?: string;
  ariaLabel?: string;
};

/** Page title block used at the top of inner pages (Events, About, Services). */
export function PageIntroSection({ title, body, ariaLabel = "Intro" }: PageIntroSectionProps) {
  return (
    <section className="section-padding bg-surface pt-0 text-ink" aria-label={ariaLabel}>
      <h1 className="type-h1 col-span-full pt-80 uppercase md:col-span-6">{title}</h1>
      {body && (
        <div className="layout-grid">
          <h3 className="type-h3 col-span-full mt-8">{body}</h3>
        </div>
      )}
    </section>
  );
}
