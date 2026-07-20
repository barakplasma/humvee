import { spawn } from "node:child_process";
import { mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";

const ROOT = path.resolve(import.meta.dirname, "..");
const HTTP_PORT = Number(process.env.PORT || 4173);
const CHROME =
  process.env.CHROME ||
  process.env.CHROME_PATH ||
  "/usr/bin/chromium";

const PIXEL_10_LANDSCAPE = {
  width: 980,
  height: 497,
  deviceScaleFactor: 2.5,
  mobile: true,
};

function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function spawnLogged(cmd, args, options = {}) {
  const child = spawn(cmd, args, {
    ...options,
    stdio: ["ignore", "pipe", "pipe"],
  });
  child.stdout.on("data", (data) => {
    if (process.env.VERBOSE) process.stdout.write(data);
  });
  return child;
}

async function waitForHttp(url, timeoutMs = 10_000) {
  const start = Date.now();
  while (Date.now() - start < timeoutMs) {
    try {
      const res = await fetch(url);
      if (res.ok) return;
    } catch {
      // Server is still starting.
    }
    await delay(100);
  }
  throw new Error(`Timed out waiting for ${url}`);
}

async function waitForDevToolsUrl(chrome, timeoutMs = 10_000) {
  let stderr = "";
  chrome.stderr.on("data", (data) => {
    stderr += data.toString();
  });

  const start = Date.now();
  while (Date.now() - start < timeoutMs) {
    const match = stderr.match(/DevTools listening on (ws:\/\/[^\s]+)/);
    if (match) return match[1];
    await delay(100);
  }
  throw new Error("Timed out waiting for Chrome DevTools endpoint");
}

async function cdp(wsUrl) {
  const ws = new WebSocket(wsUrl);
  await new Promise((resolve, reject) => {
    ws.addEventListener("open", resolve, { once: true });
    ws.addEventListener("error", reject, { once: true });
  });

  let id = 0;
  const pending = new Map();
  ws.addEventListener("message", (event) => {
    const data = JSON.parse(event.data);
    if (!data.id) return;
    const waiter = pending.get(data.id);
    if (!waiter) return;
    pending.delete(data.id);
    if (data.error) waiter.reject(new Error(data.error.message));
    else waiter.resolve(data.result);
  });

  return {
    send(method, params = {}) {
      const callId = ++id;
      ws.send(JSON.stringify({ id: callId, method, params }));
      return new Promise((resolve, reject) => {
        pending.set(callId, { resolve, reject });
      });
    },
    close() {
      ws.close();
    },
  };
}

async function evaluate(client, expression, timeout = 10_000) {
  const result = await client.send("Runtime.evaluate", {
    expression,
    awaitPromise: true,
    returnByValue: true,
    timeout,
  });
  if (result.exceptionDetails) {
    throw new Error(result.exceptionDetails.text || "Runtime.evaluate failed");
  }
  return result.result.value;
}

async function main() {
  const userDataDir = await mkdtemp(path.join(tmpdir(), "humvee-pixel10-"));
  const server = spawnLogged("python3", ["-m", "http.server", String(HTTP_PORT)], {
    cwd: ROOT,
  });

  let chrome;
  try {
    await waitForHttp(`http://127.0.0.1:${HTTP_PORT}/`);
    chrome = spawnLogged(CHROME, [
      "--headless=new",
      "--no-sandbox",
      "--disable-gpu",
      "--disable-dev-shm-usage",
      `--user-data-dir=${userDataDir}`,
      "--remote-debugging-port=0",
      "about:blank",
    ]);

    const browserWs = await waitForDevToolsUrl(chrome);
    const browser = await cdp(browserWs);
    const { targetId } = await browser.send("Target.createTarget", {
      url: `http://127.0.0.1:${HTTP_PORT}/`,
    });
    const { webSocketDebuggerUrl } = await (await fetch(`http://127.0.0.1:${browserWs.match(/:(\d+)\//)[1]}/json/list`))
      .json()
      .then((targets) => targets.find((target) => target.id === targetId));
    const page = await cdp(webSocketDebuggerUrl);

    await page.send("Page.enable");
    await page.send("Runtime.enable");
    await page.send("Emulation.setDeviceMetricsOverride", PIXEL_10_LANDSCAPE);
    await page.send("Emulation.setTouchEmulationEnabled", { enabled: true });
    await page.send("Page.navigate", { url: `http://127.0.0.1:${HTTP_PORT}/` });

    await evaluate(
      page,
      `new Promise((resolve, reject) => {
        const start = performance.now();
        const tick = () => {
          if (window.__HUMVEE_GAME__?.scene) resolve(true);
          else if (performance.now() - start > 10000) reject(new Error("game did not boot"));
          else requestAnimationFrame(tick);
        };
        tick();
      })`
    );

    const report = await evaluate(
      page,
      `new Promise((resolve, reject) => {
        const game = window.__HUMVEE_GAME__;
        const start = performance.now();
        game.scene.start("MenuScene");
        const tick = () => {
          const scene = game.scene.getScene("MenuScene");
          if (scene?.cardLayer && scene?.renderStagePage) {
            const pages = Math.ceil(10 / 4);
            const pageReports = [];
            for (let pageIndex = 0; pageIndex < pages; pageIndex += 1) {
              scene.page = pageIndex;
              scene.renderStagePage();
              const cards = scene.cardLayer.list.map((card) => {
                const b = card.getBounds();
                return { left: b.left, right: b.right, top: b.top, bottom: b.bottom };
              });
              pageReports.push({
                page: pageIndex + 1,
                cards,
                fits: cards.every((b) => b.left >= 0 && b.right <= 1280 && b.top >= 0 && b.bottom <= 720),
              });
            }
            const canvas = game.canvas.getBoundingClientRect();
            resolve({
              device: ${JSON.stringify(PIXEL_10_LANDSCAPE)},
              canvas: { x: canvas.x, y: canvas.y, width: canvas.width, height: canvas.height },
              documentOverflow: {
                x: document.documentElement.scrollWidth > window.innerWidth,
                y: document.documentElement.scrollHeight > window.innerHeight,
              },
              pages: pageReports,
            });
          } else if (performance.now() - start > 10000) {
            reject(new Error("MenuScene did not start"));
          } else {
            requestAnimationFrame(tick);
          }
        };
        tick();
      })`
    );

    const failures = report.pages.filter((pageReport) => !pageReport.fits);
    if (report.documentOverflow.x || report.documentOverflow.y || failures.length) {
      console.error(JSON.stringify(report, null, 2));
      throw new Error("Pixel 10 menu layout regression");
    }

    console.log(JSON.stringify(report, null, 2));
    page.close();
    browser.close();
  } finally {
    server.kill("SIGTERM");
    if (chrome) chrome.kill("SIGTERM");
    await rm(userDataDir, { recursive: true, force: true });
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
