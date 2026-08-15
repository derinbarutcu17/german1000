import { access, cp, mkdir, readFile, rm, writeFile } from "node:fs/promises";
import path from "node:path";
import process from "node:process";
import { spawn } from "node:child_process";

const projectRoot = path.resolve(import.meta.dirname, "..");
const vinext = path.join(projectRoot, "node_modules", ".bin", "vinext");
const clientDirectory = path.join(projectRoot, "dist", "client");
const outputDirectory = path.join(projectRoot, "pages-dist");
const basePath = normalizeBasePath(process.env.GITHUB_PAGES_BASE_PATH ?? "/german1000-design-audit");
const port = process.env.PAGES_PORT ?? "4173";
const origin = `http://127.0.0.1:${port}`;
const routes = ["/", "/explore/", "/exercises/"];

function normalizeBasePath(value) {
  const trimmed = value.trim();
  if (!trimmed || trimmed === "/") {
    return "";
  }

  return `/${trimmed.replace(/^\/+|\/+$/g, "")}`;
}

function run(command, args, extraEnvironment = {}) {
  return new Promise((resolve, reject) => {
    const child = spawn(command, args, {
      cwd: projectRoot,
      env: { ...process.env, ...extraEnvironment },
      stdio: "inherit",
    });

    child.once("error", reject);
    child.once("exit", (code, signal) => {
      if (code === 0) {
        resolve();
        return;
      }

      reject(new Error(`${command} exited with ${signal ? `signal ${signal}` : `code ${code}`}`));
    });
  });
}

function startServer() {
  const child = spawn(vinext, ["start", "-p", port], {
    cwd: projectRoot,
    env: {
      ...process.env,
      GITHUB_PAGES: "1",
      GITHUB_PAGES_BASE_PATH: basePath || "/",
      GITHUB_PAGES_EXPORT: "0",
    },
    stdio: ["ignore", "pipe", "pipe"],
  });

  let logs = "";
  child.stdout.on("data", (chunk) => {
    logs += chunk.toString();
  });
  child.stderr.on("data", (chunk) => {
    logs += chunk.toString();
  });

  return { child, getLogs: () => logs };
}

async function waitForServer(url, getLogs) {
  for (let attempt = 0; attempt < 80; attempt += 1) {
    try {
      const response = await fetch(url, { headers: { accept: "text/html" } });
      if (response.ok) {
        return;
      }
    } catch {
      // The production server can take a moment to bind after the process starts.
    }

    await new Promise((resolve) => setTimeout(resolve, 250));
  }

  throw new Error(`Vinext production server did not become ready.\n${getLogs()}`);
}

function prefixRootAssets(html) {
  const root = basePath;
  if (!root) {
    return html;
  }

  const assetPath = new RegExp(`([\"'(=])/(assets|favicon\\.svg|file\\.svg|globe\\.svg|window\\.svg)`, "g");
  return html
    .replace(assetPath, `$1${root}/$2`)
    .replace(/<meta name="codex-preview" content="development"\/>/g, "");
}

function outputPathForRoute(route) {
  if (route === "/") {
    return path.join(outputDirectory, "index.html");
  }

  return path.join(outputDirectory, route.replace(/^\/+|\/+$/g, ""), "index.html");
}

async function snapshotRoute(route) {
  const url = `${origin}${basePath}${route}`;
  const response = await fetch(url, { headers: { accept: "text/html" } });
  if (!response.ok) {
    throw new Error(`Could not snapshot ${route}: HTTP ${response.status}`);
  }

  const html = prefixRootAssets(await response.text());
  if (!html.includes("German 1000")) {
    throw new Error(`Snapshot for ${route} did not contain the German 1000 document.`);
  }

  const target = outputPathForRoute(route);
  await mkdir(path.dirname(target), { recursive: true });
  await writeFile(target, html);
  console.log(`Snapshotted ${route} → ${path.relative(projectRoot, target)}`);
}

async function main() {
  if (!process.env.GITHUB_PAGES_BASE_PATH) {
    process.env.GITHUB_PAGES_BASE_PATH = "/german1000-design-audit";
  }

  await run(vinext, ["build"], {
    GITHUB_PAGES: "1",
    GITHUB_PAGES_BASE_PATH: basePath || "/",
    GITHUB_PAGES_EXPORT: "0",
  });

  await rm(outputDirectory, { recursive: true, force: true });
  await cp(clientDirectory, outputDirectory, { recursive: true });
  await rm(path.join(outputDirectory, ".vite"), { recursive: true, force: true });
  await rm(path.join(outputDirectory, ".assetsignore"), { force: true });
  await rm(path.join(outputDirectory, "_headers"), { force: true });
  await writeFile(path.join(outputDirectory, ".nojekyll"), "");

  const server = startServer();
  try {
    await waitForServer(`${origin}${basePath}/`, server.getLogs);
    for (const route of routes) {
      await snapshotRoute(route);
    }
  } finally {
    server.child.kill("SIGTERM");
  }

  const htmlFiles = routes.map(outputPathForRoute);
  const assetReferences = new Set();
  for (const htmlFile of htmlFiles) {
    const html = await readFile(htmlFile, "utf8");
    for (const match of html.matchAll(/(?:src|href)="([^"]+)"/g)) {
      assetReferences.add(match[1]);
    }
  }

  const unprefixedAssets = [...assetReferences].filter((asset) => asset.startsWith("/assets/") || asset === "/favicon.svg");
  if (unprefixedAssets.length > 0) {
    throw new Error(`Found unprefixed GitHub Pages assets: ${unprefixedAssets.join(", ")}`);
  }

  for (const asset of assetReferences) {
    if (!asset.startsWith(`${basePath}/`)) {
      continue;
    }

    const relativeAsset = asset.slice(basePath.length + 1).split(/[?#]/, 1)[0];
    const localAsset = path.join(outputDirectory, relativeAsset);
    try {
      await access(localAsset);
    } catch {
      throw new Error(`Missing static asset referenced by the Pages HTML: ${asset}`);
    }
  }

  console.log(`GitHub Pages artifact ready in ${path.relative(projectRoot, outputDirectory)}.`);
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
});
