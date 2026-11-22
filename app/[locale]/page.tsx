import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { WorkListing } from "@/src/components/work-listing";
import { getVisibleProjects, isLocale, site } from "@/src/data/site";

type PageProps = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { locale: rawLocale } = await params;
  if (!isLocale(rawLocale)) notFound();
  const locale = rawLocale;
  const isArabic = locale === "ar";
  const ownerName = isArabic ? "محمود جلال" : site.name;
  const title = isArabic ? "الأعمال" : "Selected Work";
  const description = isArabic
    ? "مجموعة من مشاريع محمود جلال في تطوير واجهات الويب باستخدام تقنيات حديثة"
    : "Selected frontend projects by Mahmoud Galal, built with modern web technologies.";

  return {
    title,
    description,
    alternates: {
      canonical: `/${locale}`,
      languages: { en: "/en", ar: "/ar" },
    },
    openGraph: {
      type: "website",
      url: `${site.url}/${locale}`,
      title: `${title} | ${ownerName}`,
      description,
      locale: isArabic ? "ar_EG" : "en_US",
      alternateLocale: isArabic ? ["en_US"] : ["ar_EG"],
      images: [{ url: "/images/site_sharing.jpg", alt: isArabic ? "معرض أعمال محمود جلال" : "Mahmoud Galal portfolio" }],
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

export default async function HomePage({ params }: PageProps) {
  const { locale: rawLocale } = await params;
  if (!isLocale(rawLocale)) notFound();
  const locale = rawLocale;
  const visibleProjects = getVisibleProjects().map(({ id, slug, title, category, status, images }) => ({ id, slug, title, category, status, images }));

  const websiteJsonLd = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: site.name,
    url: `${site.url}/${locale}`,
    inLanguage: locale,
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteJsonLd).replace(/</g, "\\u003c") }} />
      <WorkListing
        locale={locale}
        projects={visibleProjects}
      />
    </>
  );
}
