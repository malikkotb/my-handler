import { AnimatedText } from "~/components/animated-text";
import { MaskTextReveal } from "~/components/mask-text-reveal";

// TEMP: scratch section for testing typography animations. Remove once animations are finalized.
export function TypographyTest() {
  return (
    <section className="section-padding bg-surface text-ink" aria-label="Typography test">
      <div className="layout-grid gap-y-20">
        <MaskTextReveal splitType="lines">
          <h1 className="type-h1 col-span-full uppercase">Heading</h1>
        </MaskTextReveal>
        <MaskTextReveal splitType="words">
          <h2 className="type-h2 col-span-full">Heading two words reveal test</h2>
        </MaskTextReveal>
        <MaskTextReveal splitType="letters">
          <h3 className="type-h3 col-span-full">Heading three letters</h3>
        </MaskTextReveal>
        <h4 className="type-h4 col-span-full">Heading four</h4>
        <AnimatedText as="div" className="type-body col-span-3">
          It is a long established fact that a reader will be distracted by the readable content of a page when looking at its
          layout.
        </AnimatedText>
        <AnimatedText as="div" className="type-body col-span-3 col-start-1">
          It is a long established fact that a reader will be distracted by the readable content of a page when looking at its
          layout.
        </AnimatedText>
        <AnimatedText as="div" className="type-body col-span-3 col-start-1">
          It is a long established fact that a reader will be distracted by the readable content of a page when looking at its
          layout.
        </AnimatedText>
      </div>
    </section>
  );
}
