import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Header } from "@/src/components/header";
import { isLocale, site } from "@/src/data/site";
import { getMessages } from "@/src/data/translations";

type PageProps = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { locale: rawLocale } = await params;
  if (!isLocale(rawLocale)) notFound();
  const isArabic = rawLocale === "ar";
  const ownerName = isArabic ? "محمود جلال" : site.name;
  const title = isArabic ? "السيرة الذاتية" : "Resume";
  const description = isArabic
    ? "تصفح أو حمل السيرة الذاتية بصيغة PDF لمحمود جلال"
    : "View or download Mahmoud Galal’s resume as a PDF.";

  return {
    title,
    description,
    alternates: {
      canonical: `/${rawLocale}/resume`,
      languages: { en: "/en/resume", ar: "/ar/resume" },
    },
    openGraph: {
      type: "profile",
      url: `${site.url}/${rawLocale}/resume`,
      title: `${title} | ${ownerName}`,
      description,
      images: [{ url: "/images/cv_link.jpg", alt: isArabic ? "تحميل السيرة الذاتية لمحمود جلال" : "Mahmoud Galal CV download" }],
      locale: rawLocale === "ar" ? "ar_EG" : "en_US",
      alternateLocale: rawLocale === "ar" ? ["en_US"] : ["ar_EG"],
    },
    twitter: { card: "summary_large_image", title: `${title} | ${ownerName}`, description, images: ["/images/cv_link.jpg"] },
  };
}

export default async function ResumePage({ params }: PageProps) {
  const { locale: rawLocale } = await params;
  if (!isLocale(rawLocale)) notFound();
  const text = getMessages(rawLocale);
  const pdfUrl = "/files/mahmoud_galal_frontend_web_developer_cv.pdf";

  return (
    <>
      <Header locale={rawLocale} path="/resume" />
      <main className="resume-page page-transition box-border min-h-screen w-full min-w-0 max-w-full overflow-x-clip bg-background px-4 pb-32 pt-20 sm:px-6">
        <h1 className="sr-only">{text.resume}</h1>
        <div className="mx-auto flex min-h-[calc(100vh-8rem)] w-full min-w-0 max-w-5xl items-center justify-center overflow-hidden">
          <iframe
            src={`${pdfUrl}#view=FitH`}
            title={`${site.name} — ${text.resume}`}
            className="resume-pdf-preview block box-border w-full min-w-0 max-w-full rounded-xl border bg-white shadow-lg"
            style={{ height: "min(78vh, 64rem)", minHeight: "24rem" }}
          />
        </div>
      </main>
      <a
        href="/cv-file"
        download="mahmoud_galal_frontend_web_developer_cv.pdf"
        className="resume-download fixed bottom-6 right-6 z-[60] rounded-full bg-foreground px-5 py-3 text-sm font-medium text-background shadow-lg transition-opacity hover:opacity-80"
      >
        {text.downloadCv}
      </a>
    </>
  );
}
