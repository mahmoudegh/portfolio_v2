"use client";

import { useEffect, useRef, useState } from "react";
import { contact, site, type Locale } from "@/src/data/site";
import { getMessages } from "@/src/data/translations";
import { Icon, type IconName } from "@/src/components/icon";

type ContactMethodsProps = { locale: Locale; compact?: boolean };

export function ContactMethods({ locale, compact = false }: ContactMethodsProps) {
  const text = getMessages(locale);
  const whatsappHref = `${contact.whatsappHref}?text=${encodeURIComponent(`we need to get in touch: ${site.url}/en`)}`;
  const [phoneCopied, setPhoneCopied] = useState(false);
  const noticeTimer = useRef<number | undefined>(undefined);
  const links: { label: string; href: string; icon: IconName; external?: boolean }[] = [
    { label: contact.email, href: `mailto:${contact.email}`, icon: "mail" },
    { label: text.whatsapp, href: whatsappHref, icon: "whatsapp", external: true },
    { label: text.linkedin, href: contact.linkedin, icon: "linkedin", external: true },
    { label: text.github, href: contact.github, icon: "github", external: true },
  ];

  useEffect(() => () => {
    if (noticeTimer.current !== undefined) window.clearTimeout(noticeTimer.current);
  }, []);

  async function copyPhoneNumber() {
    try {
      await navigator.clipboard.writeText(contact.phone);
    } catch {
      return;
    }

    setPhoneCopied(true);
    if (noticeTimer.current !== undefined) window.clearTimeout(noticeTimer.current);
    noticeTimer.current = window.setTimeout(() => setPhoneCopied(false), 1500);
  }

  return (
    <div className={compact ? "contact-methods contact-methods-compact" : "contact-methods"}>
      <ul className="contact-list">
        {links.map((link) => (
          <li key={link.label}>
            <a
              href={link.href}
              target={link.external ? "_blank" : undefined}
              rel={link.external ? "noopener noreferrer" : undefined}
              onClick={link.href === contact.phoneHref ? () => void copyPhoneNumber() : undefined}
            >
              <Icon name={link.icon} size={14} />
              <span>{link.label}</span>
            </a>
          </li>
        ))}
        <li className="contact-phone-item">
          <Icon name="phone" size={14} />
          <span className="contact-phone-number">{contact.phone}</span>
          <div className="contact-phone-actions">
            <button type="button" className="contact-phone-action contact-phone-copy cursor-pointer" onClick={() => void copyPhoneNumber()}>
              {phoneCopied ? text.copied : text.copy}
            </button>
            <a className="contact-phone-action cursor-pointer" href={contact.phoneHref}>
              {text.call}
            </a>
          </div>
        </li>
      </ul>
    </div>
  );
}
