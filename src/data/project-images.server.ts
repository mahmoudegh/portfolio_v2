import "server-only";
import type { ProjectCardImageSet, ProjectDetailHeroImageSet } from "@/src/components/project-image";
import projectCardImageManifest from "@/src/data/project-card-image-manifest.json";
import projectDetailHeroImageManifest from "@/src/data/project-detail-hero-image-manifest.json";
import projectShareImageManifest from "@/src/data/project-share-image-manifest.json";

const cardImages = projectCardImageManifest.projects as unknown as Record<string, ProjectCardImageSet>;
const detailHeroImages = projectDetailHeroImageManifest.projects as unknown as Record<string, ProjectDetailHeroImageSet>;
const shareImages = projectShareImageManifest.projects as Record<string, string>;

export function getProjectCardImageSet(slug: string): ProjectCardImageSet | null {
  return cardImages[slug] ?? null;
}

export function getProjectDetailHeroImageSet(slug: string): ProjectDetailHeroImageSet | null {
  return detailHeroImages[slug] ?? null;
}

export function getProjectShareImage(slug: string): string | null {
  return shareImages[slug] ?? null;
}
