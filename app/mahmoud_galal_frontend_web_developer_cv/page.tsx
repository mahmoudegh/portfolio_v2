import type { Metadata } from "next";
import { site } from "@/src/data/site";
import { DownloadCvRedirect } from "@/src/components/download-cv-redirect";

const title = "Download Mahmoud Galal’s CV";
const description = "Download Mahmoud Galal’s frontend web developer CV.";

export const metadata: Metadata = {
  title,
  description,
  alternates: { canonical: "/mahmoud_galal_frontend_web_developer_cv" },
  openGraph: {
    type: "website",
    url: `${site.url}/mahmoud_galal_frontend_web_developer_cv`,
    title,
    description,
    images: [{ url: "/images/cv_link.jpg", alt: "Download Mahmoud Galal’s CV" }],
  },
  twitter: { card: "summary_large_image", title, description, images: ["/images/cv_link.jpg"] },
};

export default function DownloadCvPage() {
  return <DownloadCvRedirect />;
}
