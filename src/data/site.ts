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

export type ProjectCategory = "completed" | "development" | "practice-projects";

export const projects = projectsSource.projects.map((project) => {
  const preview = project.links.find((link) => link.label === "Preview")?.url;
  const source = project.links.find((link) => link.label === "Code")?.url;

  return {
    id: project.id,
    slug: project.slug,
    title: project.name,
    category: project.category as ProjectCategory,
    status: project.status,
    isVisible: project.isVisible,
    image: {
      src: `/${project.image}`,
      alt: project.alt,
      ...("images/works/21.jpeg" === project.image
        ? imageDimensions[project.image]
        : "images/works/22.jpeg" === project.image
          ? imageDimensions[project.image]
          : { width: 800, height: 400 }),
    },
    previewUrl: preview,
    sourceUrl: source,
  };
});

export type Project = (typeof projects)[number];

export function getVisibleProjects() {
  return projects.filter((project) => project.isVisible);
}

export function getProjectBySlug(slug: string) {
  return getVisibleProjects().find((project) => project.slug === slug);
}

export function isLocale(locale: string): locale is Locale {
  return locales.includes(locale as Locale);
}
