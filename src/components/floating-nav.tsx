"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import type { Locale } from "@/src/data/site";
import { ContactMethods } from "@/src/components/contact-methods";
import { getMessages } from "@/src/data/translations";

type FloatingNavProps = { locale: Locale };

export function FloatingNav({ locale }: FloatingNavProps) {
  const text = getMessages(locale);
  const pathname = usePathname();
  const path = pathname === `/${locale}`
    ? "/"
    : pathname.startsWith(`/${locale}/`)
      ? pathname.slice(locale.length + 1)
      : "/";
  const workActive = path === "/";
  const [contactState, setContactState] = useState({ pathname, open: false });
  const contactOpen = contactState.pathname === pathname && contactState.open;
  const contactPanelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function closeOnOutsideClick(event: PointerEvent) {
      if (!contactPanelRef.current?.contains(event.target as Node)) setContactState({ pathname, open: false });
    }
    function closeOnEscape(event: KeyboardEvent) {
      if (event.key === "Escape") setContactState({ pathname, open: false });
    }

    document.addEventListener("pointerdown", closeOnOutsideClick);
    document.addEventListener("keydown", closeOnEscape);
    return () => {
      document.removeEventListener("pointerdown", closeOnOutsideClick);
      document.removeEventListener("keydown", closeOnEscape);
    };
  }, [pathname]);

  return (
    <nav aria-label={locale === "ar" ? "تنقل الصفحات" : "Page navigation"} className="floating-nav fixed bottom-6 left-1/2 z-50 -translate-x-1/2">
      <div className="floating-nav-inner flex items-center gap-1 rounded-full p-1.5 backdrop-blur-md">
        <Link href={`/${locale}`} aria-current={workActive ? "page" : undefined} className={`floating-link rounded-full px-2 py-2 text-xs font-medium transition-all duration-300 sm:px-5 sm:text-sm ${workActive ? "floating-link-active" : ""}`}>
          {text.work}
        </Link>
        <Link href={`/${locale}/about`} aria-current={path === "/about" ? "page" : undefined} className={`floating-link rounded-full px-2 py-2 text-xs font-medium transition-all duration-300 sm:px-5 sm:text-sm ${path === "/about" ? "floating-link-active" : ""}`}>
          {text.about}
        </Link>
        <Link href={`/${locale}/resume`} aria-current={path === "/resume" ? "page" : undefined} className={`floating-link rounded-full px-2 py-2 text-xs font-medium transition-all duration-300 sm:px-5 sm:text-sm ${path === "/resume" ? "floating-link-active" : ""}`}>
          {text.resume}
        </Link>
        <div ref={contactPanelRef} className={`contact-disclosure relative ${contactOpen ? "is-open" : ""}`}>
          <button type="button" aria-haspopup="dialog" aria-expanded={contactOpen} aria-controls="contact-popover" onClick={() => setContactState({ pathname, open: !contactOpen })} className="floating-link cursor-pointer rounded-full px-2 py-2 text-xs font-medium transition-all duration-300 sm:px-5 sm:text-sm">
            {text.contact}
          </button>
          <div id="contact-popover" role="dialog" aria-label={text.contact} hidden={!contactOpen} className="contact-popover absolute bottom-[calc(100%+0.75rem)] left-1/2 w-72 max-w-[calc(100vw-1.5rem)] -translate-x-1/2 rounded-2xl border p-4 shadow-xl" style={{ width: "min(18rem, calc(100vw - 1.5rem))" }}>
            <p className="popover-title mb-3 text-xs uppercase tracking-widest">{text.contact}</p>
            <ContactMethods locale={locale} compact />
          </div>
        </div>
      </div>
    </nav>
  );
}
