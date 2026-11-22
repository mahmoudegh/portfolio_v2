import type { Metadata } from "next";
import localFont from "next/font/local";
import { notFound } from "next/navigation";
import type { ReactNode } from "react";
import { RouteTransition } from "@/src/components/route-transition";
import { FloatingNav } from "@/src/components/floating-nav";
import { isLocale, locales, site } from "@/src/data/site";
import "@/app/globals.css";

const inter = localFont({
  src: "../../src/fonts/inter-latin.woff2",
  weight: "300 600",
  variable: "--font-inter",
  display: "swap",
});
const cairo = localFont({
  src: "../../src/fonts/cairo-arabic.woff2",
  weight: "400 700",
  variable: "--font-cairo",
  display: "swap",
});

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale: rawLocale } = await params;
  if (!isLocale(rawLocale)) notFound();

  const isArabic = rawLocale === "ar";
  const ownerName = isArabic ? "محمود جلال" : site.name;

  return {
    metadataBase: new URL(site.url),
    title: {
      default: isArabic ? "محمود جلال — مطور واجهات ويب" : "Mahmoud Galal — Frontend Web Developer",
      template: `%s | ${ownerName}`,
    },
    applicationName: isArabic ? `${ownerName} — معرض الأعمال` : "Mahmoud Galal Portfolio",
    creator: ownerName,
    publisher: ownerName,
    robots: process.env.VERCEL_ENV === "production"
      ? { index: true, follow: true }
      : { index: false, follow: false },
    icons: { icon: "/favicon.ico" },
  };
}

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();

  return (
    <html
      lang={locale}
      dir={locale === "ar" ? "rtl" : "ltr"}
      suppressHydrationWarning
      className={`${inter.variable} ${cairo.variable} min-h-full antialiased`}
    >
      <body className="min-h-screen bg-background font-sans text-foreground">
        <RouteTransition>{children}</RouteTransition>
        <FloatingNav locale={locale} />
      </body>
    </html>
  );
}
