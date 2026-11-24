import { spawn } from "node:child_process";
import { createServer } from "node:net";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";
import { createRequire } from "node:module";

const scriptDirectory = dirname(fileURLToPath(import.meta.url));
const root = resolve(scriptDirectory, "../..");
const require = createRequire(import.meta.url);
const { LIVE_ORIGIN, loadEligibleRoutes } = require("./lhci.shared.cjs");
const [environment, device, ...extraArguments] = process.argv.slice(2);

if (extraArguments.length || !["local", "live"].includes(environment) || !["desktop", "mobile"].includes(device)) {
  console.error("Usage: node scripts/audit/run-playwright.mjs <local|live> <desktop|mobile>");
  process.exit(2);
}

const routes = loadEligibleRoutes();
const env = {
  ...process.env,
  AUDIT_ENVIRONMENT: environment,
  AUDIT_DEVICE: device,
  AUDIT_ROUTES_JSON: JSON.stringify(routes),
};
let activeChild;
let server;
let serverStopPromise;
let interrupted = false;

function run(command, args, options = {}) {
  return new Promise((resolveRun, rejectRun) => {
    const isWindowsNpm = process.platform === "win32" && command === "npm";
    const launchCommand = isWindowsNpm ? (process.env.ComSpec ?? "cmd.exe") : command;
    const launchArguments = isWindowsNpm ? ["/d", "/s", "/c", `npm.cmd ${args.join(" ")}`] : args;
    const child = spawn(launchCommand, launchArguments, {
      cwd: root,
      env,
      stdio: "inherit",
      shell: false,
      detached: process.platform !== "win32",
      ...options,
    });
    activeChild = child;
    child.once("error", rejectRun);
    child.once("exit", (code, signal) => {
      if (activeChild === child) activeChild = undefined;
      resolveRun(code ?? (signal ? 1 : 0));
    });
  });
}

async function terminateProcessTree(child) {
  if (child.exitCode !== null) return;
  if (process.platform === "win32") {
    await new Promise((resolveKill) => {
      const killer = spawn("taskkill", ["/pid", String(child.pid), "/T", "/F"], { stdio: "ignore" });
      killer.once("exit", resolveKill);
      killer.once("error", resolveKill);
    });
  } else {
    try {
      process.kill(-child.pid, "SIGTERM");
    } catch {
      child.kill("SIGTERM");
    }
  }
  await Promise.race([
    new Promise((resolveExit) => child.once("exit", resolveExit)),
    new Promise((resolveTimeout) => setTimeout(resolveTimeout, 5000)),
  ]);
  if (child.exitCode === null) {
    if (process.platform === "win32") {
      await new Promise((resolveKill) => {
        const killer = spawn("taskkill", ["/pid", String(child.pid), "/T", "/F"], { stdio: "ignore" });
        killer.once("exit", resolveKill);
        killer.once("error", resolveKill);
      });
    } else {
      try {
        process.kill(-child.pid, "SIGKILL");
      } catch {
        child.kill("SIGKILL");
      }
    }
  }
}

async function findAvailablePort() {
  const server = createServer();
  await new Promise((resolveListen, rejectListen) => {
    server.once("error", rejectListen);
    server.listen(0, "127.0.0.1", resolveListen);
  });
  const address = server.address();
  if (!address || typeof address === "string") throw new Error("Could not select a local audit port.");
  const { port } = address;
  await new Promise((resolveClose, rejectClose) => server.close((error) => error ? rejectClose(error) : resolveClose()));
  return port;
}

async function waitForServer(child, url) {
  const deadline = Date.now() + 120000;
  while (Date.now() < deadline) {
    if (child.auditSpawnError) throw child.auditSpawnError;
    if (child.exitCode !== null) throw new Error(`Production server exited with code ${child.exitCode}.`);
    try {
      const response = await fetch(url, { signal: AbortSignal.timeout(3000) });
      if (response.status < 500) return;
    } catch {
      // The production server may need several seconds to bind its selected port.
    }
    await new Promise((resolveWait) => setTimeout(resolveWait, 500));
  }
  throw new Error(`Production server did not become ready at ${url} within 120 seconds.`);
}

async function stopServer(child) {
  await terminateProcessTree(child);
}

function stopStartedServer() {
  if (!server) return Promise.resolve();
  if (!serverStopPromise) serverStopPromise = stopServer(server);
  return serverStopPromise;
}

async function handleSignal(signal) {
  interrupted = true;
  if (activeChild) await terminateProcessTree(activeChild);
  await stopStartedServer();
  process.exitCode = signal === "SIGINT" ? 130 : 143;
}

process.once("SIGINT", () => { void handleSignal("SIGINT"); });
process.once("SIGTERM", () => { void handleSignal("SIGTERM"); });

let exitCode = 1;

try {
  if (environment === "local") {
    const buildCode = await run("npm", ["run", "build"]);
    if (buildCode !== 0) exitCode = buildCode;
    else {
      const port = await findAvailablePort();
      const baseUrl = `http://127.0.0.1:${port}`;
      env.AUDIT_BASE_URL = baseUrl;
      const serverArguments = ["run", "start", "--", "--hostname", "127.0.0.1", "--port", String(port)];
      const isWindows = process.platform === "win32";
      server = spawn(
        isWindows ? (process.env.ComSpec ?? "cmd.exe") : "npm",
        isWindows ? ["/d", "/s", "/c", `npm.cmd ${serverArguments.join(" ")}`] : serverArguments,
        {
        cwd: root,
        env,
        stdio: "inherit",
        shell: false,
        detached: process.platform !== "win32",
        },
      );
      server.once("error", (error) => { server.auditSpawnError = error; });
      await waitForServer(server, new URL("/en", baseUrl));
      exitCode = await run(process.execPath, [resolve(root, "node_modules/@playwright/test/cli.js"), "test", "-c", resolve(root, "playwright.config.ts")]);
    }
  } else {
    env.AUDIT_BASE_URL = LIVE_ORIGIN;
    exitCode = await run(process.execPath, [resolve(root, "node_modules/@playwright/test/cli.js"), "test", "-c", resolve(root, "playwright.config.ts")]);
  }
} catch (error) {
  console.error(`Playwright audit setup failed: ${error.message}`);
  exitCode = 1;
} finally {
  await stopStartedServer();
}

process.exitCode = interrupted ? process.exitCode : exitCode;
