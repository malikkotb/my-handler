export function OurTeam() {
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
          <div>
            What defines our team is not only our complementary backgrounds, but the way we collaborate. We combine creativity
            with precision, intuition with organization, and strategic thinking with genuine human connection. This
            multidisciplinary approach allows us to adapt to every project with flexibility, sensitivity, and attention to detail.
          </div>
          <div>
            Above all, we believe exceptional experiences begin with understanding people. We listen, anticipate, and build
            relationships grounded in trust, care, and discretion. By bringing together our expertise, we transform ideas into
            carefully crafted realities designed to exceed expectations.
          </div>
        </div>
      </div>
    </section>
  );
}
