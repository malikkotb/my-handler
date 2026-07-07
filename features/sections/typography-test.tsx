// TEMP: scratch section for testing typography animations. Remove once animations are finalized.
export function TypographyTest() {
  return (
    <section className="section-padding bg-surface text-ink" aria-label="Typography test">
      <div className="layout-grid gap-y-20">
        <h1 className="type-h1 col-span-full uppercase">Heading</h1>
        <h2 className="type-h2 col-span-full">Heading two</h2>
        <h3 className="type-h3 col-span-full">Heading three</h3>
        <h4 className="type-h4 col-span-full">Heading four</h4>
        <p className="type-body col-span-full">
          It is a long established fact that a reader will be distracted by the readable content of a page when looking at its layout. The point of using Lorem Ipsum is that it has a more-or-less normal distribution of letters, as opposed to using 'Content here, content here', making it look like readable English.
        </p>
      </div>
    </section>
  );
}
