import { expect, test, type Page } from "@playwright/test";

type AuditRoute = {
  path: string;
  locale: "en" | "ar" | null;
  category: string;
};

const routes = JSON.parse(process.env.AUDIT_ROUTES_JSON ?? "[]") as AuditRoute[];
const baseURL = process.env.AUDIT_BASE_URL;
const excludedCvPreview = "/mahmoud_galal_frontend_web_developer_cv.pdf";

if (routes.length !== 27 || routes.some(({ path }) => path === excludedCvPreview || path === "/cv-file" || /\.pdf(?:$|[?#])/i.test(path))) {
  throw new Error("Playwright audit routes must contain the 27 eligible HTML routes and exclude CV resources.");
}

const discoveredLinks = new Map<string, Set<string>>();
const pageErrors = new Map<string, string[]>();

function routeUrl(routePath: string): string {
  if (!baseURL) throw new Error("AUDIT_BASE_URL is required.");
  return new URL(routePath, baseURL).href;
}

function isExcludedCvResource(url: URL): boolean {
  return url.pathname === "/cv-file"
    || url.pathname === excludedCvPreview
    || /\.pdf$/i.test(url.pathname);
}

async function collectLinks(page: Page, route: AuditRoute): Promise<void> {
  const links = await page.locator("a[href]").evaluateAll((anchors) => (
    anchors.map((anchor) => (anchor as HTMLAnchorElement).href)
  ));
  const targets = new Set<string>();

  for (const href of links) {
    const url = new URL(href);
    if (url.origin !== baseURL || isExcludedCvResource(url)) continue;
    url.hash = "";
    targets.add(url.href);
  }

  discoveredLinks.set(route.path, targets);
}

async function assertImagesLoad(page: Page, route: AuditRoute): Promise<void> {
  const images = page.locator("img");
  for (let index = 0; index < await images.count(); index += 1) {
    const image = images.nth(index);
    await image.scrollIntoViewIfNeeded();
    await expect.poll(() => image.evaluate((element: HTMLImageElement) => element.complete), {
      message: `Image ${index + 1} did not finish loading on ${route.path}`,
      timeout: 15000,
    }).toBe(true);
    const details = await image.evaluate((element: HTMLImageElement) => ({
      source: element.currentSrc || element.src,
      naturalWidth: element.naturalWidth,
    }));
    expect(details.naturalWidth, `Image failed on ${route.path}: ${details.source}`).toBeGreaterThan(0);
  }
}

for (const route of routes) {
  test(`audits ${route.path}`, async ({ page, request }) => {
    const errors: string[] = [];
    page.on("pageerror", (error) => errors.push(error.message));
    pageErrors.set(route.path, errors);

    if (route.category === "cv-download") {
      // The download interstitial intentionally sends users to the excluded /cv-file endpoint.
      const response = await request.get(routeUrl(route.path), { maxRedirects: 0 });
      expect(response.status(), `HTTP response for ${route.path}`).toBe(200);
      const html = await response.text();
      expect(html, `${route.path} should render the English document language`).toMatch(/<html[^>]*lang="en"/i);
      expect(html, `${route.path} should render left-to-right direction`).toMatch(/<html[^>]*dir="ltr"/i);
      return;
    }

    await page.route((url) => isExcludedCvResource(url), (requestRoute) => requestRoute.abort("blockedbyclient"));
    const expectedUrl = routeUrl(route.path);
    const response = await page.goto(expectedUrl, { waitUntil: "domcontentloaded" });
    expect(response, `No HTTP response for ${route.path}`).not.toBeNull();
    expect(response?.status(), `HTTP response for ${route.path}`).toBe(200);
    expect(page.url(), `Unexpected redirect from ${route.path}`).toBe(expectedUrl);

    await expect(page.locator("html")).toHaveAttribute("lang", route.locale ?? "en");
    await expect(page.locator("html")).toHaveAttribute("dir", route.locale === "ar" ? "rtl" : "ltr");
    await collectLinks(page, route);
    await assertImagesLoad(page, route);

    if (process.env.AUDIT_DEVICE === "mobile") {
      const overflow = await page.evaluate(() => ({
        viewport: document.documentElement.clientWidth,
        document: document.documentElement.scrollWidth,
        body: document.body.scrollWidth,
      }));
      expect(
        Math.max(overflow.document, overflow.body),
        `Horizontal overflow on ${route.path}: viewport=${overflow.viewport}, document=${overflow.document}, body=${overflow.body}`,
      ).toBeLessThanOrEqual(overflow.viewport + 1);
    }

    expect(errors, `Uncaught JavaScript errors on ${route.path}`).toEqual([]);
  });
}

test("all discovered internal destinations respond successfully", async ({ request }) => {
  const targets = new Set([...discoveredLinks.values()].flatMap((links) => [...links]));
  const failures: string[] = [];

  for (const target of [...targets].sort()) {
    const response = await request.get(target, { maxRedirects: 5 });
    if (!response.ok()) failures.push(`${target} returned HTTP ${response.status()}`);
  }

  expect(failures, "Broken internal destinations").toEqual([]);
});

test("localized routes preserve English LTR and Arabic RTL behavior", async () => {
  for (const route of routes.filter(({ locale }) => locale !== null)) {
    const pathLocale = route.path.split("/")[1];
    expect(pathLocale, `Route locale segment on ${route.path}`).toBe(route.locale);
    expect(pageErrors.get(route.path) ?? [], `Uncaught JavaScript errors on ${route.path}`).toEqual([]);
  }
});

if (process.env.AUDIT_DEVICE === "mobile") {
  test("resume container and preview fit common mobile widths", async ({ page }) => {
    await page.route((url) => isExcludedCvResource(url), (requestRoute) => requestRoute.abort("blockedbyclient"));
    await page.goto(routeUrl("/en/resume"), { waitUntil: "domcontentloaded" });

    for (const width of [320, 360, 375, 390, 412, 430]) {
      await page.setViewportSize({ width, height: 844 });
      const layout = await page.evaluate(() => {
        const main = document.querySelector(".resume-page");
        const container = main?.querySelector("div");
        const frame = main?.querySelector("iframe");
        if (!main || !container || !frame) throw new Error("Resume container or preview frame is missing.");
        const mainRect = main.getBoundingClientRect();
        const containerRect = container.getBoundingClientRect();
        const frameRect = frame.getBoundingClientRect();
        return {
          viewport: document.documentElement.clientWidth,
          document: document.documentElement.scrollWidth,
          body: document.body.scrollWidth,
          mainWidth: main.clientWidth,
          mainScrollWidth: main.scrollWidth,
          containerWidth: container.clientWidth,
          containerScrollWidth: container.scrollWidth,
          frameLeft: frameRect.left,
          frameRight: frameRect.right,
          containerLeft: containerRect.left,
          containerRight: containerRect.right,
          mainLeft: mainRect.left,
          mainRight: mainRect.right,
        };
      });

      expect(layout.document, `Document overflow at ${width}px: ${JSON.stringify(layout)}`).toBeLessThanOrEqual(width + 1);
      expect(layout.body, `Body overflow at ${width}px: ${JSON.stringify(layout)}`).toBeLessThanOrEqual(width + 1);
      expect(layout.mainScrollWidth, `Resume page container overflow at ${width}px: ${JSON.stringify(layout)}`).toBeLessThanOrEqual(layout.mainWidth + 1);
      expect(layout.containerScrollWidth, `Resume frame container overflow at ${width}px: ${JSON.stringify(layout)}`).toBeLessThanOrEqual(layout.containerWidth + 1);
      expect(layout.frameLeft, `Preview frame left edge outside its container at ${width}px`).toBeGreaterThanOrEqual(layout.containerLeft - 1);
      expect(layout.frameRight, `Preview frame right edge outside its container at ${width}px`).toBeLessThanOrEqual(layout.containerRight + 1);
      expect(layout.mainLeft, `Resume page left edge outside the viewport at ${width}px`).toBeGreaterThanOrEqual(-1);
      expect(layout.mainRight, `Resume page right edge outside the viewport at ${width}px`).toBeLessThanOrEqual(width + 1);
    }
  });
}
