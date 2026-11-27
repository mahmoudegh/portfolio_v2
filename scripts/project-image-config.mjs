import { join } from "node:path";

export const root = process.cwd();
export const projectsPath = join(root, "content", "projects.json");
export const sourceRoot = join(root, "content", "project-screenshots");

export const sourceNames = {
  mobile: ["mobile", "tablet", "desktop", "large-desktop"],
  tablet: ["tablet", "mobile", "desktop", "large-desktop"],
  desktop: ["desktop", "tablet", "large-desktop", "mobile"],
  largeDesktop: ["large-desktop", "desktop", "tablet", "mobile"],
};

export const cardWidths = [320, 480, 640, 960, 1280, 1600];
export const cardPhoneWidths = [320, 480, 640, 960, 1280];
export const heroWidths = [480, 768, 1024, 1440, 1920, 2560];

export const heroRatios = {
  mobile: 1,
  tablet: 4 / 3,
  desktop: 16 / 9,
  largeDesktop: 2,
};

export const nileSlug = "nile-sun-cruises";
export const nileTabletCardRatio = 1277 / 790;

export function planWidths({ sourceWidth, sourceHeight, ratio, ladder, maxWidth }) {
  const maxFittingWidth = Math.floor(sourceHeight * ratio);
  const limit = Math.max(1, Math.min(sourceWidth, maxFittingWidth, maxWidth ?? Infinity));
  const usable = ladder.filter((width) => width <= limit);
  const widths = new Set(usable);

  const largest = usable.length ? usable[usable.length - 1] : 0;
  if (limit > largest * 1.05) widths.add(limit);

  return [...widths]
    .sort((a, b) => a - b)
    .map((width) => ({ width, height: Math.max(1, Math.round(width / ratio)) }));
}

export function toSrcSet(entries) {
  return entries.map((entry) => `${entry.src} ${entry.width}w`).join(", ");
}

export function largestEntry(entries) {
  return entries[entries.length - 1];
}
