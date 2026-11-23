import certificatesSource from "@/content/source/certificates.json";
import contactSource from "@/content/source/contact.json";
import skillsSource from "@/content/source/skills.json";
import projectsSource from "@/content/projects.json";

export type Locale = "en" | "ar";
export const locales: Locale[] = ["en", "ar"];

export const site = {
  url: "https://mahmoud-galal.vercel.app",
  name: "Mahmoud Galal",
  title: "Frontend Web Developer",
};

export const contact = {
  name: contactSource.displayName,
  fullName: contactSource.fullName,
  title: contactSource.jobTitle,
  email: contactSource.email,
  phone: contactSource.phoneE164,
  phoneDisplay: contactSource.phone,
  phoneHref: `tel:${contactSource.phoneE164}`,
  whatsappHref: `https://wa.me/${contactSource.phoneE164.replace(/\D/g, "")}`,
  linkedin: contactSource.linkedin,
  github: contactSource.github,
  location: contactSource.location,
};

export const skills = skillsSource.skills
  .filter((skill) => skill.published)
  .map((skill) => skill.name);

export const certificates = certificatesSource.certificates
  .filter((certificate) => certificate.issuer === "Udacity")
  .map((certificate) => ({
    name: certificate.name,
    issuer: certificate.issuer,
    href: certificate.url,
  }));

export type ProjectImageVariant = "mobile" | "tablet" | "desktop" | "largeDesktop";
export type ProjectImageSet = Record<ProjectImageVariant, string | null>;

export type ProjectCategory = "completed" | "development" | "practice-projects";

export type Project = {
  id: number;
  slug: string;
  title: string;
  category: ProjectCategory;
  status: string;
  isVisible: boolean;
  company: Record<Locale, string> | null;
  date: Record<Locale, string> | null;
  description: Record<Locale, string[] | null>;
  images: ProjectImageSet;
  imageAlt: string;
  previewUrl: string | undefined;
  sourceUrl: string | undefined;
};

export const projects: Project[] = projectsSource.projects.map((project) => {
  const preview = project.links.find((link) => link.label === "Preview")?.url;
  const source = project.links.find((link) => link.label === "Code")?.url;

  return {
    id: project.id,
    slug: project.slug,
    title: project.name,
    category: project.category as ProjectCategory,
    status: project.status,
    isVisible: project.isVisible,
    company: project.company,
    date: project.date,
    description: project.description,
    images: { mobile: null, tablet: null, desktop: null, largeDesktop: null },
    imageAlt: project.alt,
    previewUrl: preview,
    sourceUrl: source,
  };
});

export function getVisibleProjects() {
  return projects.filter((project) => project.isVisible);
}

export function getProjectBySlug(slug: string) {
  return getVisibleProjects().find((project) => project.slug === slug);
}

export function isLocale(locale: string): locale is Locale {
  return locales.includes(locale as Locale);
}
