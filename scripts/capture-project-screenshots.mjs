import { mkdir, readFile, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { chromium } from "playwright";
import sharp from "sharp";

const root = process.cwd();
const projectsPath = join(root, "content", "projects.json");
const outputRoot = join(root, "content", "project-screenshots");

const captureHeight = 2600;

const variants = {
  mobile: { width: 390, height: 844, isMobile: true, scale: 3 },
  tablet: { width: 834, height: 1112, isMobile: false, scale: 2 },
  desktop: { width: 1280, height: 800, isMobile: false, scale: 2 },
  largeDesktop: { width: 1440, height: 900, isMobile: false, scale: 2 },
};

const sourceFileName = {
  mobile: "mobile.webp",
  tablet: "tablet.webp",
  desktop: "desktop.webp",
  largeDesktop: "large-desktop.webp",
};

const requestedSlug = process.argv[2] === "all" ? undefined : process.argv[2];
const requestedVariant = process.argv[3];
const selectedVariants = requestedVariant
  ? Object.entries(variants).filter(([variant]) => variant === requestedVariant)
  : Object.entries(variants);

if (!selectedVariants.length) {
  console.error(`Unknown variant "${requestedVariant}". Use one of: ${Object.keys(variants).join(", ")}.`);
  process.exit(1);
}

const data = JSON.parse(await readFile(projectsPath, "utf8"));
const projects = data.projects.filter(
  (project) => project.isVisible && (!requestedSlug || project.slug === requestedSlug),
);

if (!projects.length) {
  console.error(requestedSlug ? `No visible project matched "${requestedSlug}".` : "No visible projects found.");
  process.exit(1);
}

const browser = await chromium.launch();
const failures = [];

for (const project of projects) {
  const url = project.links?.find((link) => link.label === "Preview")?.url;
  if (!url) {
    console.warn(`skip ${project.slug}: no Preview link`);
    failures.push({ slug: project.slug, variant: "all", reason: "no Preview link" });
    continue;
  }

  const directory = join(outputRoot, project.slug);
  await mkdir(directory, { recursive: true });

  for (const [variant, viewport] of selectedVariants) {
    const context = await browser.newContext({
      viewport: { width: viewport.width, height: viewport.height },
      deviceScaleFactor: viewport.scale,
      isMobile: viewport.isMobile,
      hasTouch: viewport.isMobile,
      locale: "en-US",
      reducedMotion: "reduce",
      colorScheme: "light",
    });
    const page = await context.newPage();

    try {
      await page.goto(url, { waitUntil: "load", timeout: 60_000 });
      await page.waitForLoadState("networkidle", { timeout: 8_000 }).catch(() => {});
      await page.evaluate(() => document.fonts.ready).catch(() => {});

      // Nudge IntersectionObserver-based lazy content above the fold, then settle back to the top.
      await page.evaluate(() => window.scrollTo(0, 900)).catch(() => {});
      await page.waitForTimeout(700);
      await page.evaluate(() => window.scrollTo(0, 0)).catch(() => {});
      await page.waitForTimeout(500);

      const documentHeight = await page.evaluate(() =>
        Math.max(document.documentElement.scrollHeight, document.body?.scrollHeight ?? 0),
      );
      const height = Math.max(1, Math.min(documentHeight || captureHeight, captureHeight));

      const png = await page.screenshot({
        clip: { x: 0, y: 0, width: viewport.width, height },
        type: "png",
        animations: "disabled",
      });
      const webp = await sharp(png).webp({ quality: 90, effort: 6 }).toBuffer();
      const target = join(directory, sourceFileName[variant]);
      await writeFile(target, webp);

      const metadata = await sharp(webp).metadata();
      console.log(
        `ok   ${project.slug.padEnd(22)} ${variant.padEnd(13)} ${metadata.width}x${metadata.height}  ${(webp.length / 1024).toFixed(0)}KB`,
      );
    } catch (error) {
      console.error(`fail ${project.slug.padEnd(22)} ${variant.padEnd(13)} ${error.message.split("\n")[0]}`);
      failures.push({ slug: project.slug, variant, reason: error.message.split("\n")[0] });
    } finally {
      await context.close();
    }
  }
}

await browser.close();

if (failures.length) {
  console.error(`\n${failures.length} capture(s) failed:`);
  for (const failure of failures) console.error(` - ${failure.slug}/${failure.variant}: ${failure.reason}`);
  process.exitCode = 1;
} else {
  console.log(`\nCaptured ${projects.length} project(s) into content/project-screenshots/.`);
}
