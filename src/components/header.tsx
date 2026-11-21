"use client";

import Link from "next/link";
import { useEffect, useState, useSyncExternalStore } from "react";
import type { Locale } from "@/src/data/site";
import { Icon } from "@/src/components/icon";
import { getMessages } from "@/src/data/translations";

export type CategoryFilter = "all" | "completed" | "development" | "practice-projects";

function subscribeToTheme(onChange: () => void) {
  window.addEventListener("portfolio-theme-change", onChange);
  return () => window.removeEventListener("portfolio-theme-change", onChange);
}

function getThemeSnapshot() {
  return document.documentElement.classList.contains("dark");
}

function getThemeServerSnapshot() {
  return false;
}

type HeaderProps = {
  locale: Locale;
  path: string;
  category?: CategoryFilter;
  onCategoryChange?: (category: CategoryFilter) => void;
};

export function Header({ locale, path, category, onCategoryChange }: HeaderProps) {
  const [isScrolled, setIsScrolled] = useState(false);
  const isDark = useSyncExternalStore(subscribeToTheme, getThemeSnapshot, getThemeServerSnapshot);
  const text = getMessages(locale);

  useEffect(() => {
    const updateScroll = () => setIsScrolled(window.scrollY > 50);
    updateScroll();
    window.addEventListener("scroll", updateScroll, { passive: true });
    return () => window.removeEventListener("scroll", updateScroll);
  }, []);

  function toggleTheme() {
    const nextDark = !document.documentElement.classList.contains("dark");
    document.documentElement.classList.toggle("dark", nextDark);
    window.localStorage.setItem("portfolio-theme", nextDark ? "dark" : "light");
    window.dispatchEvent(new Event("portfolio-theme-change"));
  }

  const categories: { id: CategoryFilter; label: string }[] = [
    { id: "all", label: text.allProjects },
    { id: "completed", label: text.completedProjects },
    { id: "development", label: text.developmentProjects },
    { id: "practice-projects", label: text.practiceProjects },
  ];
  const alternateLocale: Locale = locale === "en" ? "ar" : "en";
  const alternateHref = `/${alternateLocale}${path === "/" ? "" : path}`;

  return (
    <>
      <header className={`site-header fixed inset-x-0 top-0 z-40 transition-colors duration-500 ${isScrolled ? "is-scrolled" : ""}`}>
        <nav aria-label={locale === "ar" ? "التنقل الرئيسي" : "Main navigation"} className="flex h-16 items-center justify-between px-6">
          <Link href={`/${locale}`} className="site-logo shrink-0 whitespace-nowrap text-lg font-medium tracking-tight transition-opacity hover:opacity-70">
            {locale === "ar" ? "محمود جلال" : "Mahmoud Galal"}
          </Link>

          {onCategoryChange && category && (
            <div
              role="group"
              tabIndex={0}
              aria-label={locale === "ar" ? "تصفية المشاريع" : "Filter projects"}
              className="scrollbar-hide hidden min-w-0 flex-1 overflow-x-auto md:block"
            >
              <div className="flex w-max min-w-full items-center justify-center gap-1">
                {categories.map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    aria-pressed={category === item.id}
                    onClick={() => onCategoryChange(item.id)}
                    className={`category-button shrink-0 whitespace-nowrap rounded-full px-3 py-1.5 text-sm transition-all duration-300 ${category === item.id ? "category-selected" : ""}`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className="flex shrink-0 items-center gap-2">
            <Link href={alternateHref} lang={alternateLocale} hrefLang={alternateLocale} dir={alternateLocale === "ar" ? "rtl" : "ltr"} aria-label={text.switchLanguageLabel} className="locale-link rounded-full px-2 py-1 text-xs transition-opacity hover:opacity-70 sm:px-3 sm:text-sm">
              {text.switchLanguage}
            </Link>
            <button type="button" onClick={toggleTheme} className="icon-button cursor-pointer py-2 transition-opacity hover:opacity-70" aria-label={locale === "ar" ? "تبديل المظهر" : "Toggle theme"}>
              <Icon name={isDark ? "sun" : "moon"} size={20} />
            </button>
          </div>
        </nav>
      </header>

      {onCategoryChange && category && (
        <div className="mobile-categories fixed inset-x-0 top-16 z-30 md:hidden">
          <div
            role="group"
            tabIndex={0}
            aria-label={locale === "ar" ? "تصفية المشاريع" : "Filter projects"}
            className="scrollbar-hide flex w-full min-w-0 gap-2 overflow-x-auto px-6 py-3"
          >
            {categories.map((item) => (
              <button
                key={item.id}
                type="button"
                aria-pressed={category === item.id}
                onClick={() => onCategoryChange(item.id)}
                className={`category-button shrink-0 whitespace-nowrap rounded-full px-4 py-2 text-sm transition-all duration-300 ${category === item.id ? "category-selected" : "category-muted"}`}
              >
                {item.label}
              </button>
            ))}
          </div>
        </div>
      )}
    </>
  );
}
