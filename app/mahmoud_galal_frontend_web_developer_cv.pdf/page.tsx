import type { Metadata } from "next";
import { site } from "@/src/data/site";

const title = "Mahmoud Galal — Frontend Web Developer CV";
const description = "Preview Mahmoud Galal’s frontend web developer CV.";
const previewUrl = "/files/mahmoud_galal_frontend_web_developer_cv.pdf#view=FitH";

export const metadata: Metadata = {
  title,
  description,
  alternates: { canonical: "/mahmoud_galal_frontend_web_developer_cv.pdf" },
  openGraph: {
    type: "website",
    url: `${site.url}/mahmoud_galal_frontend_web_developer_cv.pdf`,
    title,
    description,
    images: [{ url: "/images/cv_link.jpg", alt: "Mahmoud Galal CV preview" }],
  },
  twitter: {
    card: "summary_large_image",
    title,
    description,
    images: [{ url: "/images/cv_link.jpg", alt: "Mahmoud Galal CV preview" }],
  },
};

export default function CvPreviewPage() {
  return (
    <main className="min-h-screen bg-background px-4 py-6 sm:px-6">
      <h1 className="sr-only">{title}</h1>
      <iframe
        src={previewUrl}
        title={title}
        className="mx-auto block h-[calc(100vh-3rem)] min-h-[24rem] w-full max-w-5xl rounded-xl border bg-white shadow-lg"
      />
    </main>
  );
}
