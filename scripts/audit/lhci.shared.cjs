/* eslint-disable @typescript-eslint/no-require-imports -- LHCI loads CommonJS config files with require(). */
const { spawnSync } = require("node:child_process");
const { resolve } = require("node:path");

const ROOT = resolve(__dirname, "../..");
const ROUTES_FILE = resolve(__dirname, "routes.json");
const LIVE_ORIGIN = "https://mahmoud-galal.vercel.app";
const EXPECTED_ROUTE_COUNT = 27;

function loadEligibleRoutes() {
  let inventory;

  try {
    inventory = JSON.parse(require("node:fs").readFileSync(ROUTES_FILE, "utf8"));
  } catch (error) {
    throw new Error(`Unable to load audit route inventory at ${ROUTES_FILE}: ${error.message}`);
  }

  if (!Array.isArray(inventory.routes)) {
    throw new Error("Audit route inventory is invalid: expected a routes array.");
  }

  const routes = inventory.routes.filter((route) => (
    route.type === "html"
    && route.category !== "cv-preview"
    && typeof route.path === "string"
    && route.path.startsWith("/")
    && route.path !== "/cv-file"
    && !/\.pdf(?:$|[?#])/i.test(route.path)
  ));

  if (routes.length !== EXPECTED_ROUTE_COUNT) {
    throw new Error(
      `Expected ${EXPECTED_ROUTE_COUNT} eligible HTML audit routes, found ${routes.length}.`,
    );
  }

  const paths = new Set();
  for (const route of routes) {
    if (paths.has(route.path)) throw new Error(`Duplicate audit route: ${route.path}`);
    paths.add(route.path);
  }

  return routes;
}

function getEphemeralPort() {
  const script = [
    "const net = require('node:net');",
    "const server = net.createServer();",
    "server.listen(0, '127.0.0.1', () => {",
    "  const address = server.address();",
    "  console.log(address.port);",
    "  server.close();",
    "});",
  ].join(" ");
  const result = spawnSync(process.execPath, ["-e", script], { encoding: "utf8" });
  const port = Number(result.stdout.trim());

  if (result.status !== 0 || !Number.isInteger(port) || port < 1) {
    throw new Error(`Unable to select a local audit port: ${result.stderr || result.error || "unknown error"}`);
  }

  return port;
}

function createConfig(environment, device) {
  if (!(["local", "live"].includes(environment)) || !(["desktop", "mobile"].includes(device))) {
    throw new Error(`Unsupported Lighthouse audit target: ${environment}/${device}.`);
  }

  const origin = environment === "live"
    ? LIVE_ORIGIN
    : `http://127.0.0.1:${getEphemeralPort()}`;
  const local = environment === "local";
  const settings = device === "desktop"
    ? {
      formFactor: "desktop",
      screenEmulation: {
        mobile: false,
        width: 1350,
        height: 940,
        deviceScaleFactor: 1,
        disabled: false,
      },
      emulatedUserAgent: true,
    }
    : {
      formFactor: "mobile",
      screenEmulation: {
        mobile: true,
        width: 412,
        height: 823,
        deviceScaleFactor: 1.75,
        disabled: false,
      },
      emulatedUserAgent: true,
    };

  return {
    ci: {
      collect: {
        url: loadEligibleRoutes().map(({ path }) => new URL(path, origin).href),
        numberOfRuns: 3,
        settings,
        ...(local ? {
          startServerCommand: `npm run start -- --hostname 127.0.0.1 --port ${new URL(origin).port}`,
          startServerReadyPattern: "Ready in|started server|listening",
          startServerReadyTimeout: 120000,
        } : {}),
      },
      upload: {
        target: "filesystem",
        outputDir: resolve(ROOT, ".audit-reports", "lighthouse", environment, device),
        reportFilenamePattern: "%%HOSTNAME%%%%PATHNAME%%-%%DATETIME%%.report.%%EXTENSION%%",
      },
    },
  };
}

module.exports = {
  EXPECTED_ROUTE_COUNT,
  LIVE_ORIGIN,
  ROOT,
  createConfig,
  loadEligibleRoutes,
};
