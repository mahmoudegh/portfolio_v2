import { createHash } from "node:crypto";
import { existsSync } from "node:fs";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import sharp from "sharp";

const root = process.cwd();
const projectDataPath = join(root, "content", "projects.json");
const outputDirectory = join(root, "public", "images", "project-card-thumbnails");
const manifestPath = join(root, "src", "data", "project-card-image-manifest.json");
const widths = [320, 640, 960];
const ratios = [4 / 5, 3 / 4, 4 / 3, 1, 5 / 4, 2 / 3];
const sourceNames = {
  mobile: ["mobile", "tablet", "desktop", "large-desktop"],
  tablet: ["tablet", "mobile", "desktop", "large-desktop"],
  desktop: ["desktop", "tablet", "large-desktop", "mobile"],
  largeDesktop: ["large-desktop", "desktop", "tablet", "mobile"],
};

const source = JSON.parse(await readFile(projectDataPath, "utf8"));
const projects = source.projects.filter((project) => project.isVisible);
const manifest = { projects: {} };
await mkdir(outputDirectory, { recursive: true });

async function findSource(slug, preferredNames) {
  for (const name of preferredNames) {
    const path = join(root, "public", "images", "projects", slug, `${name}.webp`);
    if (existsSync(path)) return path;
  }
  return null;
}

async function createCrop(slug, variant, ratioIndex, sourcePath, ratio) {
  if (!sourcePath) return null;
  const metadata = await sharp(sourcePath).metadata();
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
    const buffer = await sharp(sourcePath)
      .resize(width, height, { fit: "cover", position: "top", withoutEnlargement: true })
      .webp({ quality: 74, effort: 5, smartSubsample: true })
      .toBuffer();
    const hash = createHash("sha256").update(buffer).digest("hex").slice(0, 12);
    const filename = `${slug}-${variant}-${ratioIndex}-${width}-${hash}.webp`;
    await writeFile(join(outputDirectory, filename), buffer);
    entries.push({ width, src: `/images/project-card-thumbnails/${filename}` });
  }

  const largest = entries[entries.length - 1];
  return {
    src: largest.src,
    srcSet: entries.map((entry) => `${entry.src} ${entry.width}w`).join(", "),
  };
}

for (const project of projects) {
  const imageSet = {};
  for (const [variant, fallbackNames] of Object.entries(sourceNames)) {
    const imagePath = await findSource(project.slug, fallbackNames);
    if (variant === "mobile" || variant === "tablet") {
      imageSet[variant] = await createCrop(project.slug, variant, 0, imagePath, 4 / 5);
      continue;
    }

    const selectedPath = await findSource(project.slug, fallbackNames);
    imageSet[variant] = [];
    for (const [ratioIndex, ratio] of ratios.entries()) {
      imageSet[variant].push(await createCrop(project.slug, variant, ratioIndex, selectedPath, ratio));
    }
  }
  manifest.projects[project.slug] = imageSet;
}

await mkdir(dirname(manifestPath), { recursive: true });
await writeFile(manifestPath, `${JSON.stringify(manifest, null, 2)}\n`);
console.log(`Generated responsive card images for ${projects.length} visible projects.`);
