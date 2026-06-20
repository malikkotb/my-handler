import { setRequestLocale } from "next-intl/server";
import { ContactForm } from "~/features/page-builder/sections/contact-form-section/contact-form";
import { PageIntroSection } from "~/features/sections/page-intro-section";
import { SiteShell } from "~/features/site/site-shell";

export default async function ContactPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);

  return (
    <SiteShell>
      <PageIntroSection
        title="CONTACT"
        ariaLabel="Contact"
        body="Tell us about your project. We respond to every enquiry with care and discretion."
      />
      <section className="section-padding" aria-label="Contact form">
        <div className="layout-grid">
          <div className="col-span-full rounded-16 bg-ink p-32 text-surface lg:col-span-6 lg:col-start-5">
            <ContactForm />
          </div>
        </div>
      </section>
    </SiteShell>
  );
}
