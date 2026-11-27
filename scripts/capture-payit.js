const { chromium } = require('playwright');
const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

(async function() {
  const variants = [
    { name: 'mobile', width: 390, height: 844, scale: 3, isMobile: true },
    { name: 'tablet', width: 834, height: 1112, scale: 2, isMobile: false },
    { name: 'desktop', width: 1280, height: 800, scale: 2, isMobile: false },
    { name: 'largeDesktop', width: 1440, height: 900, scale: 2, isMobile: false },
  ];
  const url = 'https://letsgo.payit.ae/en/letsgocard';
  const outDir = 'content/project-screenshots/payit-card';
  fs.mkdirSync(outDir, { recursive: true });
  const fileNames = { mobile: 'mobile.webp', tablet: 'tablet.webp', desktop: 'desktop.webp', largeDesktop: 'large-desktop.webp' };
  const browser = await chromium.launch();
  for (const v of variants) {
    const ctx = await browser.newContext({ viewport: { width: v.width, height: v.height }, deviceScaleFactor: v.scale, isMobile: v.isMobile, hasTouch: v.isMobile, locale: 'en-US', reducedMotion: 'reduce', colorScheme: 'light' });
    const page = await ctx.newPage();
    await page.goto(url, { waitUntil: 'load', timeout: 60000 });
    await page.waitForLoadState('networkidle', { timeout: 8000 }).catch(function(){});
    await page.evaluate(function(){ return document.fonts.ready; }).catch(function(){});
    await page.evaluate(function() {
      var ids = ['4ebce53', 'dd01ff6'];
      for (var i = 0; i < ids.length; i++) {
        var el = document.querySelector('[data-id="' + ids[i] + '"]');
        if (el) el.style.display = 'none';
      }
    });
    await page.waitForTimeout(500);
    const png = await page.screenshot({ fullPage: true, type: 'png', animations: 'disabled' });
    const meta = await sharp(png).metadata();
    const cropH = Math.min(1200 * v.scale, meta.height);
    const cropped = await sharp(png).extract({ left: 0, top: 0, width: meta.width, height: cropH }).toBuffer();
    const webp = await sharp(cropped).webp({ quality: 90, effort: 6 }).toBuffer();
    fs.writeFileSync(path.join(outDir, fileNames[v.name]), webp);
    const m = await sharp(webp).metadata();
    console.log(v.name, '->', m.width + 'x' + m.height, (webp.length/1024).toFixed(0) + 'KB');
    await ctx.close();
  }
  await browser.close();
  console.log('DONE');
})();