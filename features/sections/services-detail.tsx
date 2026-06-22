import { CtaButton } from "~/components/cta-button";

type ServiceItem = {
  title: string;
  body: string;
};

const SERVICE_ITEMS: ServiceItem[] = [
  {
    title: "CONSULTANCY",
    body: "We provide strategic and creative guidance to transform ideas into clear, impactful experiences. From concept development to project positioning, we help our clients define direction, uncover opportunities, and bring ambitious visions to life with clarity and purpose.",
  },
  {
    title: "EVENTS",
    body: "We create and produce exceptional events designed with precision and intention. From private celebrations to brand activations and exclusive gatherings, we oversee every stage — creative direction, production, logistics, and execution — to ensure a seamless and memorable experience.",
  },
  {
    title: "TRAVEL",
    body: "We curate tailor-made travel experiences shaped around each client's lifestyle, preferences, and expectations. Every itinerary is thoughtfully designed to combine exclusivity, comfort, and effortless organization, with access to unique destinations and carefully selected experiences.",
  },
  {
    title: "CONCIERGERIE",
    body: "Our conciergerie service offers dedicated, discreet, and highly personalized assistance. From everyday arrangements to exceptional requests, we anticipate needs, manage details, and provide seamless support designed to simplify and elevate every aspect of our clients' lives.",
  },
];

export function ServicesDetail() {
  return (
    <section className="layout-grid section-padding">
      <div className="col-span-3 md:col-span-3 lg:sticky lg:top-80 lg:self-start">
        <div className="aspect-3/2 overflow-hidden bg-body/10">
          {/* biome-ignore lint/performance/noImgElement: remote Unsplash sample image, not a Sanity asset */}
          <img
            src="https://images.unsplash.com/photo-1600880292203-757bb62b4baf?w=800&q=80"
            alt="My Handler — bespoke lifestyle management"
            width={800}
            height={533}
            className="h-full w-full object-cover"
          />
        </div>
      </div>

      <div className="col-span-5 col-start-5 flex flex-col">
        <h3 className="type-h3-alt pb-120">
          Whether shaping a brand experience, producing a private event, curating a journey, or managing day-to-day requests, our
          approach remains the same: thoughtful, fluid, and entirely bespoke.
        </h3>
        <div id="services" className="flex flex-col gap-40">
          {SERVICE_ITEMS.map((service) => (
            <article key={service.title} className="flex flex-col gap-20">
              <h2 className="type-h4 uppercase">{service.title}</h2>
              <p className="type-body">{service.body}</p>
            </article>
          ))}
          <CtaButton to="/events">Découvrez nos campagnes</CtaButton>
        </div>
      </div>
    </section>
  );
}
