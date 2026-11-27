import { createHash } from "node:crypto";
import { existsSync } from "node:fs";
import { mkdir, readFile, readdir, rm, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import sharp from "sharp";
import {
  heroRatios,
  heroWidths,
  largestEntry,
  nileSlug,
  planWidths,
  projectsPath,
  sourceNames,
  sourceRoot,
  toSrcSet,
} from "./project-image-config.mjs";

const root = process.cwd();
const outputDirectory = join(root, "public", "images", "project-detail-hero");
const manifestPath = join(root, "src", "data", "project-detail-hero-image-manifest.json");
const nileLargeDesktopRatio = 1600 / 703;

const data = JSON.parse(await readFile(projectsPath, "utf8"));
const projects = data.projects.filter((project) => project.isVisible);
const manifest = { projects: {} };
const written = new Set();

await mkdir(outputDirectory, { recursive: true });

async function findSource(slug, names) {
  for (const name of names) {
    const path = join(sourceRoot, slug, `${name}.webp`);
    if (existsSync(path)) return path;
  }
  return null;
}

async function createResponsiveCrop(slug, variant, imagePath, metadata, ratio) {
  const entries = [];

  for (const { width, height } of planWidths({
    sourceWidth: metadata.width,
    sourceHeight: metadata.height,
    ratio,
    ladder: heroWidths,
    maxWidth: heroWidths[heroWidths.length - 1] + 320,
  })) {
    const buffer = await sharp(imagePath)
      .resize(width, height, { fit: "cover", position: "left top" })
      .webp({ quality: 88, effort: 6, smartSubsample: true })
      .toBuffer();
    const hash = createHash("sha256").update(buffer).digest("hex").slice(0, 12);
    const filename = `${slug}-${variant}-${width}-${hash}.webp`;
    await writeFile(join(outputDirectory, filename), buffer);
    written.add(filename);
    entries.push({ width, src: `/images/project-detail-hero/${filename}` });
  }

  const largest = largestEntry(entries);
  return { src: largest.src, srcSet: toSrcSet(entries) };
}

for (const project of projects) {
  const variants = {};

  for (const [variant, names] of Object.entries(sourceNames)) {
    const imagePath = await findSource(project.slug, names);
    if (!imagePath) {
      variants[variant] = null;
      continue;
    }

    const metadata = await sharp(imagePath).metadata();
    if (!metadata.width || !metadata.height) {
      variants[variant] = null;
      continue;
    }

    const ratio = project.slug === nileSlug && variant === "largeDesktop"
      ? nileLargeDesktopRatio
      : heroRatios[variant];
    variants[variant] = await createResponsiveCrop(project.slug, variant, imagePath, metadata, ratio);
  }

  manifest.projects[project.slug] = variants;
}

for (const file of await readdir(outputDirectory)) {
  if (file.endsWith(".webp") && !written.has(file)) {
    await rm(join(outputDirectory, file));
  }
}

await mkdir(dirname(manifestPath), { recursive: true });
await writeFile(manifestPath, `${JSON.stringify(manifest, null, 2)}\n`);
console.log(`Generated ${written.size} responsive detail hero images for ${projects.length} visible projects.`);
