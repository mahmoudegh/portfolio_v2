import { mkdir, writeFile } from "node:fs/promises";
import { join } from "node:path";
import sharp from "sharp";

const root = process.cwd();
const sourceRoot = join(root, "content", "source", "share");
const outputRoot = join(root, "public", "images");
const width = 1200;
const height = 630;

const images = [
  { source: "site-sharing-source.jpg", output: "site_sharing.jpg" },
  { source: "cv-link-source.jpg", output: "cv_link.jpg" },
];

await mkdir(outputRoot, { recursive: true });

for (const image of images) {
  const buffer = await sharp(join(sourceRoot, image.source))
    .resize(width, height, { fit: "cover", position: "centre" })
    .jpeg({ quality: 90, mozjpeg: true, chromaSubsampling: "4:4:4" })
    .toBuffer();

  await writeFile(join(outputRoot, image.output), buffer);
  console.log(`${image.output} ${width}x${height} ${(buffer.length / 1024).toFixed(0)}KB`);
}
