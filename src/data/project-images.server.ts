import "server-only";
import { existsSync } from "node:fs";
import { join } from "node:path";
import type { ProjectImageSet, ProjectImageVariant } from "@/src/data/site";

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
