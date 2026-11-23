import type { ReactNode } from "react";
import type { Metadata } from "next";
import { site } from "@/src/data/site";
import "@/app/globals.css";

export const metadata: Metadata = {
  metadataBase: new URL(site.url),
  icons: { icon: "/favicon.ico" },
};

export default function DownloadCvLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" dir="ltr" data-scroll-behavior="smooth">
      <body className="min-h-screen bg-background font-sans text-foreground">{children}</body>
    </html>
  );
}
