import { createHash } from "node:crypto";
import { existsSync } from "node:fs";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import sharp from "sharp";

const root = process.cwd();
const sourcePath = join(root, "content", "projects.json");
const outputDirectory = join(root, "public", "images", "project-detail-hero");
const manifestPath = join(root, "src", "data", "project-detail-hero-image-manifest.json");
const widths = [320, 640, 960, 1440];
const ratios = {
  mobile: 1.06,
  tablet: 0.9,
  desktop: 1.6,
  largeDesktop: 2,
};
const sourceNames = {
  mobile: ["mobile", "tablet", "desktop", "large-desktop"],
  tablet: ["tablet", "mobile", "desktop", "large-desktop"],
  desktop: ["desktop", "tablet", "large-desktop", "mobile"],
  largeDesktop: ["large-desktop", "desktop", "tablet", "mobile"],
};

const data = JSON.parse(await readFile(sourcePath, "utf8"));
const projects = data.projects.filter((project) => project.isVisible);
const manifest = { projects: {} };
await mkdir(outputDirectory, { recursive: true });

async function findImage(slug, names) {
  for (const name of names) {
    const path = join(root, "public", "images", "projects", slug, `${name}.webp`);
    if (existsSync(path)) return path;
  }
  return null;
}

async function createResponsiveCrop(slug, variant, imagePath, ratio) {
  if (!imagePath) return null;
  const metadata = await sharp(imagePath).metadata();
  const sourceWidth = metadata.width;
  if (!sourceWidth || !metadata.height) return null;

  const outputWidths = widths.filter((width) => width <= sourceWidth);
  if (sourceWidth < widths[widths.length - 1] && !outputWidths.includes(sourceWidth)) {
    outputWidths.push(sourceWidth);
  }
  if (!outputWidths.length) outputWidths.push(sourceWidth);

  const entries = [];
  for (const width of outputWidths) {
    const height = Math.max(1, Math.round(width / ratio));
    const buffer = await sharp(imagePath)
      .resize(width, height, { fit: "cover", position: "top", withoutEnlargement: true })
      .webp({ quality: 78, effort: 5, smartSubsample: true })
      .toBuffer();
    const hash = createHash("sha256").update(buffer).digest("hex").slice(0, 12);
    const filename = `${slug}-${variant}-${width}-${hash}.webp`;
    await writeFile(join(outputDirectory, filename), buffer);
    entries.push({ width, src: `/images/project-detail-hero/${filename}` });
  }

  const largest = entries[entries.length - 1];
  return {
    src: largest.src,
    srcSet: entries.map((entry) => `${entry.src} ${entry.width}w`).join(", "),
  };
}

for (const project of projects) {
  const variants = {};
  for (const [variant, names] of Object.entries(sourceNames)) {
    const imagePath = await findImage(project.slug, names);
    variants[variant] = await createResponsiveCrop(project.slug, variant, imagePath, ratios[variant]);
  }
  manifest.projects[project.slug] = variants;
}

await mkdir(dirname(manifestPath), { recursive: true });
await writeFile(manifestPath, `${JSON.stringify(manifest, null, 2)}\n`);
console.log(`Generated responsive detail hero images for ${projects.length} visible projects.`);
