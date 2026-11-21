import type { Locale } from "@/src/data/site";

type Experience = {
  company: string;
  url?: string;
  dates: Record<Locale, string>;
  type: "remote" | "freelance";
};

export const experience: Experience[] = [
  {
    company: "SEO Egypt",
    dates: { en: "July 2021 – November 2026", ar: "يوليو 2021 — نوفمبر 2026" },
    type: "remote",
  },
  {
    company: "Pencils",
    dates: { en: "November 2025 – May 2026", ar: "نوفمبر 2025 — مايو 2026" },
    type: "freelance",
  },
  {
    company: "Aswaq",
    dates: { en: "July 2022 – November 2022", ar: "يوليو 2022 — نوفمبر 2022" },
    type: "freelance",
  },
  {
    company: "Nitros",
    dates: { en: "June 2021 – August 2021", ar: "يونيو 2021 — أغسطس 2021" },
    type: "freelance",
  },
];
