import "server-only";
import { existsSync } from "node:fs";
import { join } from "node:path";
import type { ProjectImageSet, ProjectImageVariant } from "@/src/data/site";
import type { ProjectCardImageSet, ProjectDetailHeroImageSet } from "@/src/components/project-image";
import projectCardImageManifest from "@/src/data/project-card-image-manifest.json";
import projectDetailHeroImageManifest from "@/src/data/project-detail-hero-image-manifest.json";

const cardImages = projectCardImageManifest.projects as unknown as Record<string, ProjectCardImageSet>;
const detailHeroImages = projectDetailHeroImageManifest.projects as unknown as Record<string, ProjectDetailHeroImageSet>;

const projectImageFiles: Record<ProjectImageVariant, string> = {
  mobile: "mobile.webp",
  tablet: "tablet.webp",
  desktop: "desktop.webp",
  largeDesktop: "large-desktop.webp",
};

export function getProjectImageSet(slug: string): ProjectImageSet {
  const directory = join(process.cwd(), "public", "images", "projects", slug);

  return Object.fromEntries(
    Object.entries(projectImageFiles).map(([variant, filename]) => {
      const filePath = join(directory, filename);
      return [variant, existsSync(filePath) ? `/images/projects/${slug}/${filename}` : null];
    }),
  ) as ProjectImageSet;
}

export function getProjectCardImageSet(slug: string): ProjectCardImageSet | null {
  return cardImages[slug] ?? null;
}

export function getProjectDetailHeroImageSet(slug: string): ProjectDetailHeroImageSet | null {
  return detailHeroImages[slug] ?? null;
}
