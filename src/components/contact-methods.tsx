"use client";

import { useEffect, useRef, useState, type CSSProperties } from "react";
import { contact, type Locale } from "@/src/data/site";
import { getMessages } from "@/src/data/translations";
import { Icon, type IconName } from "@/src/components/icon";

type ContactMethodsProps = { locale: Locale; compact?: boolean };

const phoneActionStyle: CSSProperties = {
  alignItems: "center",
  backgroundColor: "color-mix(in srgb, var(--muted) 82%, transparent)",
  border: 0,
  borderRadius: "9999px",
  color: "var(--muted-foreground)",
  cursor: "pointer",
  display: "inline-flex",
  fontSize: "0.68rem",
  justifyContent: "center",
  lineHeight: 1,
  minHeight: "1.5rem",
  padding: "0 0.5rem",
  textDecoration: "none",
  whiteSpace: "nowrap",
};

const phoneCopyStyle: CSSProperties = {
  ...phoneActionStyle,
  minWidth: "4.25rem",
};

const phoneNumberStyle: CSSProperties = {
  direction: "ltr",
  flex: "0 0 auto",
  fontSize: "0.76rem",
  overflowWrap: "normal",
  unicodeBidi: "isolate",
  whiteSpace: "nowrap",
};

export function ContactMethods({ locale, compact = false }: ContactMethodsProps) {
  const text = getMessages(locale);
  const [phoneCopied, setPhoneCopied] = useState(false);
  const noticeTimer = useRef<number | undefined>(undefined);
  const links: { label: string; href: string; icon: IconName; external?: boolean }[] = [
    { label: contact.email, href: `mailto:${contact.email}`, icon: "mail" },
    { label: text.whatsapp, href: contact.whatsappHref, icon: "whatsapp", external: true },
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
          <span className="contact-phone-number" style={phoneNumberStyle}>{contact.phone}</span>
          <div className="contact-phone-actions">
            <button type="button" className="contact-phone-action contact-phone-copy cursor-pointer" style={phoneCopyStyle} onClick={() => void copyPhoneNumber()}>
              {phoneCopied ? text.copied : text.copy}
            </button>
            <a className="contact-phone-action cursor-pointer" href={contact.phoneHref} style={phoneActionStyle}>
              {text.call}
            </a>
          </div>
        </li>
      </ul>
    </div>
  );
}
