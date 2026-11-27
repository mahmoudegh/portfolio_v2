import { createHash } from "node:crypto";
import { existsSync } from "node:fs";
import { mkdir, readFile, readdir, rm, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import sharp from "sharp";
import {
  cardPhoneWidths,
  cardWidths,
  largestEntry,
  nileSlug,
  nileTabletCardRatio,
  planWidths,
  projectsPath,
  sourceNames,
  sourceRoot,
  toSrcSet,
} from "./project-image-config.mjs";

const root = process.cwd();
const outputDirectory = join(root, "public", "images", "project-card-thumbnails");
const manifestPath = join(root, "src", "data", "project-card-image-manifest.json");
const phoneCardRatios = [1 / 2, 2 / 3, 3 / 4, 4 / 5, 5 / 6, 1, 6 / 5, 4 / 3];

const source = JSON.parse(await readFile(projectsPath, "utf8"));
const projects = source.projects.filter((project) => project.isVisible);
const manifest = { projects: {} };
const written = new Set();

await mkdir(outputDirectory, { recursive: true });

async function findSource(slug, preferredNames) {
  for (const name of preferredNames) {
    const path = join(sourceRoot, slug, `${name}.webp`);
    if (existsSync(path)) return path;
  }
  return null;
}

async function createCrop(slug, variant, label, sourcePath, metadata, ratio, ladder) {
  const entries = [];

  for (const { width, height } of planWidths({
    sourceWidth: metadata.width,
    sourceHeight: metadata.height,
    ratio,
    ladder,
    maxWidth: ladder[ladder.length - 1],
  })) {
    const buffer = await sharp(sourcePath)
      .resize(width, height, { fit: "cover", position: "left top" })
      .webp({ quality: 86, effort: 6, smartSubsample: true })
      .toBuffer();
    const hash = createHash("sha256").update(buffer).digest("hex").slice(0, 12);
    const filename = `${slug}-${variant}-${label}-${width}-${hash}.webp`;
    await writeFile(join(outputDirectory, filename), buffer);
    written.add(filename);
    entries.push({ width, height, src: `/images/project-card-thumbnails/${filename}` });
  }

  const largest = largestEntry(entries);
  return {
    src: largest.src,
    srcSet: toSrcSet(entries),
    width: largest.width,
    height: largest.height,
  };
}

for (const project of projects) {
  const imageSet = { mobile: null, tablet: null, phone: [] };

  const mobilePath = await findSource(project.slug, sourceNames.mobile);
  const tabletPath = await findSource(project.slug, sourceNames.tablet);

  if (mobilePath) {
    const metadata = await sharp(mobilePath).metadata();
    if (metadata.width && metadata.height) {
      imageSet.mobile = await createCrop(project.slug, "mobile", "card", mobilePath, metadata, 4 / 5, cardWidths);

      // The desktop card shows the phone view, cropped only to portrait card ratios so the layout stays masonry.
      for (const [ratioIndex, ratio] of phoneCardRatios.entries()) {
        imageSet.phone.push(
          await createCrop(project.slug, "mobile", `phone-${ratioIndex}`, mobilePath, metadata, ratio, cardPhoneWidths),
        );
      }
    }
  }

  if (tabletPath) {
    const metadata = await sharp(tabletPath).metadata();
    if (metadata.width && metadata.height) {
      const ratio = project.slug === nileSlug ? nileTabletCardRatio : 4 / 5;
      imageSet.tablet = await createCrop(project.slug, "tablet", "card", tabletPath, metadata, ratio, cardWidths);
    }
  }

  manifest.projects[project.slug] = imageSet;
}

for (const file of await readdir(outputDirectory)) {
  if (file.endsWith(".webp") && !written.has(file)) {
    await rm(join(outputDirectory, file));
  }
}

await mkdir(dirname(manifestPath), { recursive: true });
await writeFile(manifestPath, `${JSON.stringify(manifest, null, 2)}\n`);
console.log(`Generated ${written.size} responsive card images for ${projects.length} visible projects.`);
