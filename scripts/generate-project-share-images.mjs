import { existsSync } from "node:fs";
import { mkdir, readFile, readdir, rm, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import sharp from "sharp";
import { projectsPath, sourceNames, sourceRoot } from "./project-image-config.mjs";

const root = process.cwd();
const outputDirectory = join(root, "public", "images", "project-share");
const manifestPath = join(root, "src", "data", "project-share-image-manifest.json");
const shareWidth = 1200;
const shareHeight = 630;

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

for (const project of projects) {
  const imagePath = await findSource(project.slug, sourceNames.largeDesktop);
  if (!imagePath) continue;

  const filename = `${project.slug}.jpg`;
  const buffer = await sharp(imagePath)
    .resize(shareWidth, shareHeight, { fit: "cover", position: "left top" })
    .jpeg({ quality: 88, mozjpeg: true, chromaSubsampling: "4:4:4" })
    .toBuffer();

  await writeFile(join(outputDirectory, filename), buffer);
  written.add(filename);
  manifest.projects[project.slug] = `/images/project-share/${filename}`;
}

for (const file of await readdir(outputDirectory)) {
  if (file.endsWith(".jpg") && !written.has(file)) {
    await rm(join(outputDirectory, file));
  }
}

await mkdir(dirname(manifestPath), { recursive: true });
await writeFile(manifestPath, `${JSON.stringify(manifest, null, 2)}\n`);
console.log(`Generated ${written.size} project share images for ${projects.length} visible projects.`);
