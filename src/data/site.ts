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

const imageDimensions: Record<string, { width: number; height: number }> = {
  "images/works/21.jpeg": { width: 825, height: 400 },
  "images/works/22.jpeg": { width: 837, height: 400 },
};

export type ProjectImage = { src: string; alt: string; width: number; height: number };

function getProjectImage(
  image: { src: string | null; width: number | null; height: number | null },
  fallbackPath: string | null,
  alt: string,
): ProjectImage | null {
  const imagePath = image.src ?? fallbackPath;
  if (!imagePath) return null;
  const dimensions = imageDimensions[imagePath] ?? { width: 800, height: 400 };
  return {
    src: `/${imagePath}`,
    alt,
    width: image.width ?? dimensions.width,
    height: image.height ?? dimensions.height,
  };
}

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
  images: Record<"lg" | "md" | "sm", ProjectImage | null>;
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
    images: {
      lg: getProjectImage(project.images.lg, project.fallbackImage, project.alt),
      md: getProjectImage(project.images.md, project.fallbackImage, project.alt),
      sm: getProjectImage(project.images.sm, project.fallbackImage, project.alt),
    },
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
