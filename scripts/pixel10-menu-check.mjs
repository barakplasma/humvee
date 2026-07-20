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

const STAGE1_CLOSEUPS = [
  "closeup_gauges",
  "closeup_panel",
  "closeup_switch",
  "closeup_turn",
  "closeup_wipers",
  "closeup_steering",
  "closeup_horn",
  "closeup_shifters",
  "closeup_pbrake",
  "closeup_pedals",
];

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

function waitForExit(child, timeoutMs = 3_000) {
  if (child.exitCode !== null || child.signalCode !== null) return Promise.resolve();
  return new Promise((resolve) => {
    const timer = setTimeout(resolve, timeoutMs);
    child.once("exit", () => {
      clearTimeout(timer);
      resolve();
    });
  });
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
          const game = window.__HUMVEE_GAME__;
          if (game?.scene?.isActive?.("AboutScene")) resolve(true);
          else if (performance.now() - start > 10000) reject(new Error("game did not finish booting"));
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

    const stage1Dialog = await evaluate(
      page,
      `new Promise((resolve, reject) => {
        const game = window.__HUMVEE_GAME__;
        const start = performance.now();
        game.scene.start("Stage1Scene");
        const tick = () => {
          const scene = game.scene.getScene("Stage1Scene");
          if (scene?.dialog) {
            const dialog = scene.dialog.showCard({
              title: "Transmission Selector",
              body: "4-speed automatic: P (park), R (reverse), N (neutral), OD (overdrive, road cruising), D (drive), 2 and 1 (low gears for grades and control). For this HMMWV start-up drill, set N before starting.",
              imageKey: "closeup_shifters",
            });
            const panel = dialog.list.find((obj) => obj.type === "Rectangle" && obj.width === 860 && obj.height === 520);
            const texts = dialog.list.filter((obj) => obj.type === "Text");
            const body = texts.reduce((longest, obj) => (obj.text.length > longest.text.length ? obj : longest), texts[0]);
            const panelBounds = panel.getBounds();
            const bodyBounds = body.getBounds();
            resolve({
              panel: { left: panelBounds.left, right: panelBounds.right, top: panelBounds.top, bottom: panelBounds.bottom },
              body: { left: bodyBounds.left, right: bodyBounds.right, top: bodyBounds.top, bottom: bodyBounds.bottom },
              bodyStyle: { fontSize: body.style.fontSize, wordWrapWidth: body.style.wordWrapWidth },
              fits: bodyBounds.left >= panelBounds.left + 40 && bodyBounds.right <= panelBounds.right - 40 && bodyBounds.bottom <= panelBounds.bottom - 96,
            });
          } else if (performance.now() - start > 10000) {
            reject(new Error("Stage1Scene did not start"));
          } else {
            requestAnimationFrame(tick);
          }
        };
        tick();
      })`
    );

    const stage1Closeups = await evaluate(
      page,
      `(() => {
        const game = window.__HUMVEE_GAME__;
        const scene = game.scene.getScene("Stage1Scene");
        const ids = ${JSON.stringify(STAGE1_CLOSEUPS)};
        return ids.map((id) => {
          const texture = scene.textures.get(id);
          const source = texture?.source?.[0];
          return {
            id,
            exists: scene.textures.exists(id),
            width: source?.width || 0,
            height: source?.height || 0,
          };
        });
      })()`
    );

    const failures = report.pages.filter((pageReport) => !pageReport.fits);
    const missingCloseups = stage1Closeups.filter(
      (item) => !item.exists || item.width < 800 || item.height < 500
    );
    if (
      report.documentOverflow.x ||
      report.documentOverflow.y ||
      failures.length ||
      !stage1Dialog.fits ||
      missingCloseups.length
    ) {
      console.error(JSON.stringify({ menu: report, stage1Dialog, stage1Closeups }, null, 2));
      throw new Error("Pixel 10 layout regression");
    }

    console.log(JSON.stringify({ menu: report, stage1Dialog, stage1Closeups }, null, 2));
    page.close();
    browser.close();
  } finally {
    server.kill("SIGTERM");
    if (chrome) chrome.kill("SIGTERM");
    await Promise.all([waitForExit(server), chrome ? waitForExit(chrome) : Promise.resolve()]);
    await rm(userDataDir, { recursive: true, force: true, maxRetries: 3, retryDelay: 100 });
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
