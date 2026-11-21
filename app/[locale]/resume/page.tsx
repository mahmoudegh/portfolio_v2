import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Header } from "@/src/components/header";
import { isLocale, site } from "@/src/data/site";
import { getMessages } from "@/src/data/translations";

type PageProps = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { locale: rawLocale } = await params;
  if (!isLocale(rawLocale)) notFound();
  const title = rawLocale === "ar" ? "السيرة الذاتية" : "Resume";
  const description = rawLocale === "ar"
    ? "عرض وتحميل السيرة الذاتية لمحمود جلال بصيغة PDF."
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
      title: `${title} | ${site.name}`,
      description,
      locale: rawLocale === "ar" ? "ar_EG" : "en_US",
      alternateLocale: rawLocale === "ar" ? ["en_US"] : ["ar_EG"],
    },
  };
}

export default async function ResumePage({ params }: PageProps) {
  const { locale: rawLocale } = await params;
  if (!isLocale(rawLocale)) notFound();
  const text = getMessages(rawLocale);
  const pdfUrl = "/mahmoud_galal_frontend_web_developer_cv.pdf";

  return (
    <>
      <Header locale={rawLocale} path="/resume" />
      <main className="page-transition min-h-screen bg-background px-4 pb-32 pt-20 sm:px-6">
        <h1 className="sr-only">{text.resume}</h1>
        <div className="mx-auto flex min-h-[calc(100vh-8rem)] w-full max-w-5xl items-center justify-center">
          <iframe
            src={`${pdfUrl}#view=FitH`}
            title={`${site.name} — ${text.resume}`}
            className="resume-pdf-preview w-full rounded-xl border bg-white shadow-lg"
            style={{ height: "min(78vh, 64rem)", minHeight: "24rem" }}
          />
        </div>
      </main>
      <a
        href="/download-cv"
        download="mahmoud_galal_frontend_web_developer_cv.pdf"
        className="resume-download fixed bottom-24 right-4 z-[60] inline-flex items-center justify-center rounded-full bg-foreground px-5 py-3 text-sm font-medium text-background shadow-lg transition-opacity hover:opacity-80 sm:bottom-6 sm:right-6"
      >
        {text.downloadCv}
      </a>
    </>
  );
}
