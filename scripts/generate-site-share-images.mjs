import { mkdir, writeFile } from "node:fs/promises";
import { join } from "node:path";
import sharp from "sharp";

const root = process.cwd();
const sourceRoot = join(root, "content", "source", "share");
const outputRoot = join(root, "public", "images");
const width = 1200;
const height = 630;

const images = [
  { source: "site-sharing-source.jpg", output: "site_sharing.jpg", enhance: true },
  { source: "cv-link-source.jpg", output: "cv_link.jpg", enhance: false },
];

await mkdir(outputRoot, { recursive: true });

for (const image of images) {
  let pipeline = sharp(join(sourceRoot, image.source));

  if (image.enhance) {
    // The source is a low-quality JPEG; upscale + sharpen before downscaling to recover perceived detail.
    pipeline = pipeline
      .resize(width * 2, height * 2, { fit: "cover", position: "centre", kernel: "lanczos3" })
      .sharpen({ sigma: 1.2 })
      .resize(width, height, { fit: "cover", position: "centre", kernel: "lanczos3" });
  } else {
    pipeline = pipeline.resize(width, height, { fit: "cover", position: "centre", kernel: "lanczos3" });
  }

  const buffer = await pipeline
    .jpeg({ quality: 95, mozjpeg: true, chromaSubsampling: "4:4:4" })
    .toBuffer();

  await writeFile(join(outputRoot, image.output), buffer);
  console.log(`${image.output} ${width}x${height} ${(buffer.length / 1024).toFixed(0)}KB`);
}
