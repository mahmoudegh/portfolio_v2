import { defineConfig, devices } from "@playwright/test";

const environment = process.env.AUDIT_ENVIRONMENT;
const device = process.env.AUDIT_DEVICE;
const baseURL = process.env.AUDIT_BASE_URL;

if (!(["local", "live"].includes(environment ?? "")) || !(["desktop", "mobile"].includes(device ?? "")) || !baseURL) {
  throw new Error("Run Playwright audits through scripts/audit/run-playwright.mjs.");
}

const deviceOptions = device === "mobile" ? devices["Pixel 7"] : devices["Desktop Chrome"];
const reportDirectory = `.audit-reports/playwright/${environment}/${device}`;

export default defineConfig({
  testDir: "./tests/audit",
  testMatch: "routes.spec.ts",
  fullyParallel: false,
  workers: 1,
  timeout: 45000,
  expect: { timeout: 10000 },
  outputDir: `${reportDirectory}/test-results`,
  reporter: [
    ["list"],
    ["html", { outputFolder: `${reportDirectory}/html`, open: "never" }],
  ],
  use: {
    ...deviceOptions,
    browserName: "chromium",
    baseURL,
    actionTimeout: 10000,
    navigationTimeout: 30000,
  },
});
