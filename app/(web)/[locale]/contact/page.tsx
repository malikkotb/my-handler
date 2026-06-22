import { setRequestLocale } from "next-intl/server";
import { ContactForm } from "~/features/page-builder/sections/contact-form-section/contact-form";
import { PageIntroSection } from "~/features/sections/page-intro-section";
import { SiteShell } from "~/features/site/site-shell";

export default async function ContactPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  return (
    <SiteShell>
      <div className='min-h-screen justify-center w-full flex flex-col items-center'>
        <div className='flex flex-col gap-32'>
          <h3 className='type-h4 text-center'>
            Let's make your event
            <br />
            unforgettable.
          </h3>
          <a
            className='type-h2 uppercase text-center'
            href='mailto:hello@myhandler.com'
          >
            hello@myhandler.com
          </a>
        </div>
        <div className='absolute bottom-32 left-1/2 -translate-x-1/2 flex gap-56 type-eyebrow'>
          <p>+000 000 000</p>
          <p>PARIS</p>
        </div>

        {/* <section className="section-padding" aria-label="Contact form">
        <div className="layout-grid">
          <div className="col-span-full rounded-16 bg-ink p-32 text-surface lg:col-span-6 lg:col-start-5">
            <ContactForm />
          </div>
        </div>
      </section> */}
      </div>
    </SiteShell>
  );
}
