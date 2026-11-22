import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ContactMethods } from "@/src/components/contact-methods";
import { Header } from "@/src/components/header";
import { Icon } from "@/src/components/icon";
import { experience } from "@/src/data/experience";
import { certificates, contact, isLocale, site, skills } from "@/src/data/site";
import { getMessages } from "@/src/data/translations";

type PageProps = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { locale: rawLocale } = await params;
  if (!isLocale(rawLocale)) notFound();
  const isArabic = rawLocale === "ar";
  const ownerName = isArabic ? "محمود جلال" : site.name;
  const title = isArabic ? "نبذة عني" : "About";
  const description = isArabic
    ? "تعرف على محمود جلال وخبرته ومهاراته وشهاداته وطرق التواصل معه"
    : "Learn about Mahmoud Galal, his experience, skills, certificates, and contact details.";

  return {
    title,
    description,
    alternates: {
      canonical: `/${rawLocale}/about`,
      languages: { en: "/en/about", ar: "/ar/about" },
    },
    openGraph: {
      type: "profile",
      url: `${site.url}/${rawLocale}/about`,
      title: `${title} | ${ownerName}`,
      description,
      locale: isArabic ? "ar_EG" : "en_US",
      alternateLocale: isArabic ? ["en_US"] : ["ar_EG"],
      images: ["/images/site_sharing.jpg"],
    },
    robots: process.env.VERCEL_ENV === "production" ? { index: true, follow: true } : { index: false, follow: false },
    twitter: {
      card: "summary_large_image",
      title: `${title} | ${ownerName}`,
      description,
      images: ["/images/site_sharing.jpg"],
    },
  };
}

export default async function AboutPage({ params }: PageProps) {
  const { locale: rawLocale } = await params;
  if (!isLocale(rawLocale)) notFound();
  const locale = rawLocale;
  const text = getMessages(locale);
  const personJsonLd = {
    "@context": "https://schema.org",
    "@type": "Person",
    name: contact.fullName,
    jobTitle: contact.title,
    url: `${site.url}/${locale}/about`,
    email: contact.email,
    telephone: contact.phone,
    sameAs: [contact.linkedin, contact.github],
    knowsAbout: skills,
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(personJsonLd).replace(/</g, "\\u003c") }} />
      <Header locale={locale} path="/about" />
      <main className="about-page-transition min-h-screen bg-background">
        <section className="about-hero flex min-h-[60svh] flex-col justify-center px-6 pb-6 pt-20 sm:px-8 sm:pb-8 sm:pt-20">
          <div className="about-intro-from-right w-full max-w-5xl">
            <h1 className="font-display text-4xl leading-[1.1] sm:text-5xl md:text-6xl lg:text-7xl">{text.introHeading}</h1>
            <p className="mt-5 max-w-4xl text-lg leading-relaxed text-muted-foreground md:text-xl">{text.introParagraph}</p>
          </div>
        </section>

        <section id="contact" className="about-columns-section about-columns-transition px-6 pb-32">
          <div className="about-columns grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-4 lg:gap-12">
            <section className="about-column">
              <h2 className="about-column-title">{text.skills}</h2>
              <ul className="plain-list skills-list">
                {skills.map((skill) => <li key={skill}>{skill}</li>)}
              </ul>
            </section>

            <section className="about-column">
              <h2 className="about-column-title">{text.certificates}</h2>
              <ul className="plain-list certificate-list">
                {certificates.map((certificate) => (
                  <li key={certificate.name}>
                    <a href={certificate.href} target="_blank" rel="noopener noreferrer" className="certificate-link">
                      <span>{certificate.name}</span>
                      <span className="certificate-meta">{certificate.issuer} · {text.udacityYear}<Icon name="external" size={12} /></span>
                    </a>
                  </li>
                ))}
              </ul>
              <div className="education-note">
                <h3>{text.education}</h3>
                <p>{text.educationText}</p>
              </div>
            </section>

            <section className="about-column">
              <h2 className="about-column-title">{text.experience}</h2>
              <ul className="plain-list experience-list">
                {experience.map((item) => (
                  <li key={item.company} className="experience-item">
                    {item.url ? (
                      <a href={item.url} target="_blank" rel="noopener noreferrer" className="experience-company">{item.company}</a>
                    ) : (
                      <span className="experience-company">{item.company}</span>
                    )}
                    <span className="experience-period">{item.dates[locale]}</span>
                    <span className="experience-type">{item.type === "remote" ? text.remote : text.freelance}</span>
                  </li>
                ))}
              </ul>
            </section>

            <section className="about-column">
              <h2 className="about-column-title">{text.contact}</h2>
              <ContactMethods locale={locale} />
            </section>
          </div>
        </section>
      </main>
    </>
  );
}
