#!/usr/bin/env node

import { chromium } from "patchright";
import { mkdir, writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";

const targetUrl = process.argv[2];
if (!targetUrl) {
  console.error("Usage: npm run probe:patchright-page -- <url> [output-json]");
  process.exit(2);
}

const outputPath = resolve(process.argv[3] || "patchright-page-dom-probe-report.json");
const storageStatePath = resolve(
  process.env.PATCHRIGHT_STORAGE_STATE || "auth/patchright-page-storage-state.json"
);
const userDataDir = resolve(process.env.PATCHRIGHT_USER_DATA_DIR || "auth/patchright-page-profile");
const maxRows = Number.parseInt(process.env.PATCHRIGHT_PROBE_MAX_ROWS || "20", 10);
const timeoutMs = Number.parseInt(process.env.PATCHRIGHT_PROBE_TIMEOUT_MS || "45000", 10);
const settleMs = Number.parseInt(process.env.PATCHRIGHT_SETTLE_MS || "3000", 10);
const channel = process.env.PATCHRIGHT_BROWSER_CHANNEL || "chrome";
const headless = process.env.PATCHRIGHT_HEADLESS === "1";

await mkdir(dirname(outputPath), { recursive: true });
await mkdir(dirname(storageStatePath), { recursive: true });
await mkdir(userDataDir, { recursive: true });

const context = await chromium.launchPersistentContext(userDataDir, {
  channel,
  headless,
  viewport: headless ? { width: 1280, height: 800 } : null,
  locale: "en-US"
});

const page = context.pages()[0] || (await context.newPage());
const consoleMessages = [];

page.on("console", (message) => {
  if (consoleMessages.length >= 50) return;
  consoleMessages.push({
    type: message.type(),
    text: message.text().slice(0, 500)
  });
});

let navigation = null;
let error = null;

try {
  navigation = await page.goto(targetUrl, {
    waitUntil: "domcontentloaded",
    timeout: timeoutMs
  });
  await page.waitForLoadState("networkidle", { timeout: 10000 }).catch(() => {});
  await page.waitForTimeout(settleMs);
} catch (err) {
  error = String(err);
}

await context.storageState({ path: storageStatePath }).catch(() => {});

const pageData = await page.evaluate((limit) => {
  const clean = (value) => (value || "").replace(/\s+/g, " ").trim();
  const attr = (selector, name) => document.querySelector(selector)?.getAttribute(name) || "";
  const text = (selector) => clean(document.querySelector(selector)?.textContent || "");

  const meta = Array.from(document.querySelectorAll("meta"))
    .map((node) => ({
      name: node.getAttribute("name") || node.getAttribute("property") || node.getAttribute("itemprop") || "",
      content: node.getAttribute("content") || ""
    }))
    .filter((row) => row.name && row.content)
    .slice(0, 80);

  const jsonLd = Array.from(document.querySelectorAll('script[type="application/ld+json"]'))
    .map((node) => node.textContent || "")
    .filter(Boolean)
    .slice(0, 20);

  const links = [];
  const seenLinks = new Set();
  for (const link of document.querySelectorAll("a[href]")) {
    if (!link.href || seenLinks.has(link.href)) continue;
    seenLinks.add(link.href);
    links.push({ text: clean(link.textContent).slice(0, 160), href: link.href });
    if (links.length >= limit) break;
  }

  const productLike = Array.from(
    document.querySelectorAll(
      '[data-product-id], [data-productid], [data-testid*="product"], [class*="product"], [id*="product"]'
    )
  )
    .map((node) => ({
      tag: node.tagName.toLowerCase(),
      id: node.id || "",
      className: typeof node.className === "string" ? node.className.slice(0, 160) : "",
      productId:
        node.getAttribute("data-product-id") ||
        node.getAttribute("data-productid") ||
        node.getAttribute("data-id") ||
        "",
      text: clean(node.textContent).slice(0, 500)
    }))
    .filter((row) => row.text || row.productId)
    .slice(0, limit);

  return {
    title: document.title,
    canonical_url: attr('link[rel="canonical"]', "href"),
    h1: text("h1"),
    meta,
    json_ld_count: jsonLd.length,
    json_ld_start: jsonLd.map((value) => value.slice(0, 1500)),
    visible_text_start: clean(document.body?.innerText || "").slice(0, 1500),
    candidate_links: links,
    product_like_nodes: productLike
  };
}, maxRows).catch((err) => ({
  extraction_error: String(err)
}));

const screenshotPath = outputPath.replace(/\.json$/i, ".png");
await page.screenshot({ path: screenshotPath, fullPage: false }).catch(() => {});
const finalUrl = page.url();
await context.close();

const blocked = /access denied|you don't have access|captcha|verify you are human/i.test(
  `${pageData.title || ""} ${pageData.visible_text_start || ""}`
);

const report = {
  target_url: targetUrl,
  final_url: finalUrl,
  status: navigation ? navigation.status() : null,
  error,
  page_only: true,
  api_endpoint_discovery: false,
  replay_attempted: false,
  blocked,
  dom: pageData,
  console_messages: consoleMessages,
  evidence: {
    screenshot: screenshotPath
  },
  source_access: {
    class: "owned_session",
    is_publishable_as_public_result: false,
    storage_state_generated: true,
    storage_state_path_recorded: "[redacted-local-path]",
    user_data_dir_recorded: "[redacted-local-path]"
  },
  bounds: {
    max_rows: maxRows,
    timeout_ms: timeoutMs,
    settle_ms: settleMs,
    browser_channel: channel,
    headless
  }
};

await writeFile(outputPath, `${JSON.stringify(report, null, 2)}\n`, "utf8");
console.log(JSON.stringify(report, null, 2));
