/**
 * Browser verification for the EXIST landing page.
 *
 * Runs a real Chromium (Playwright), at desktop / mobile, and with reduced
 * motion, and asserts on things a screenshot can lie about: layout overflow,
 * video state, computed opacity of animated content, CTA destinations,
 * keyboard access, and the WebGL crash that used to take the page down.
 *
 *   node scripts/verify.mjs                 # all three contexts
 *   node scripts/verify.mjs --visual        # also write screenshots
 *   node scripts/verify.mjs --only=mobile
 *
 * Exit code is non-zero if any check fails, so it can gate a release.
 */

import { createRequire } from "node:module";
import { mkdirSync } from "node:fs";
import path from "node:path";

const require = createRequire(import.meta.url);
// The project has no local Playwright (the registry is not reachable here),
// so resolve the CLI's copy — same library version, same browsers.
const { chromium } = require(
  "/home/ashenix/.local/share/mise/installs/node/24.20.0/lib/node_modules/@playwright/cli/node_modules/playwright",
);

const BASE = process.env.BASE_URL || "http://localhost:3000";
const args = process.argv.slice(2);
const only = args.find((a) => a.startsWith("--only="))?.split("=")[1];
const visual = args.includes("--visual");
const SHOTS = path.join(process.cwd(), "docs", "screenshots");

const CONTEXTS = [
  {
    name: "desktop",
    viewport: { width: 1440, height: 900 },
    deviceScaleFactor: 1,
    isMobile: false,
    hasTouch: false,
    reducedMotion: "no-preference",
  },
  {
    name: "mobile",
    viewport: { width: 390, height: 844 },
    deviceScaleFactor: 2,
    isMobile: true,
    hasTouch: true,
    reducedMotion: "no-preference",
    userAgent:
      "Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1",
  },
  {
    name: "reduced",
    viewport: { width: 1440, height: 900 },
    deviceScaleFactor: 1,
    isMobile: false,
    hasTouch: false,
    reducedMotion: "reduce",
  },
];

const results = [];
const check = (ctx, name, pass, detail = "") => {
  results.push({ ctx, name, pass, detail });
  const mark = pass ? "PASS" : "FAIL";
  console.log(`  [${mark}] ${name}${detail ? ` — ${detail}` : ""}`);
};

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function runContext(browser, spec) {
  console.log(`\n── ${spec.name} ${spec.viewport.width}×${spec.viewport.height}${spec.reducedMotion === "reduce" ? " · reduced motion" : ""}`);
  const context = await browser.newContext({
    viewport: spec.viewport,
    deviceScaleFactor: spec.deviceScaleFactor,
    isMobile: spec.isMobile,
    hasTouch: spec.hasTouch,
    reducedMotion: spec.reducedMotion,
    userAgent: spec.userAgent,
  });
  const page = await context.newPage();

  const consoleErrors = [];
  const pageErrors = [];
  const requested = [];
  page.on("console", (m) => {
    if (m.type() === "error") consoleErrors.push(m.text());
  });
  page.on("pageerror", (e) => pageErrors.push(e.message));
  page.on("request", (r) => requested.push(r.url()));

  await page.goto(BASE, { waitUntil: "load" });
  // The intro is ~2.2 s; wait past it and let lazy media settle.
  await sleep(3200);

  // ---- 1. no runtime crashes --------------------------------------------
  check(spec.name, "no uncaught page errors", pageErrors.length === 0, pageErrors[0] || "");
  check(
    spec.name,
    "no console errors",
    consoleErrors.filter((e) => !/favicon|fonts\.googleapis/i.test(e)).length === 0,
    consoleErrors[0] || "",
  );
  check(
    spec.name,
    "no WebGL/THREE crash",
    !pageErrors.some((e) => /WebGL|THREE|Context/i.test(e)) &&
      !consoleErrors.some((e) => /WebGL|THREE/i.test(e)),
  );
  check(spec.name, "no Next.js error overlay", (await page.locator("nextjs-portal").count()) === 0);

  // ---- 2. content visible after the intro --------------------------------
  const h1 = await page.locator("h1").innerText();
  check(spec.name, "headline present", /Le Costume/i.test(h1), h1.replace(/\n/g, " / "));

  const heroOpacity = await page
    .locator("[data-hero-copy]")
    .evaluate((el) => Number(getComputedStyle(el).opacity));
  check(spec.name, "hero copy fully visible", heroOpacity > 0.95, `opacity ${heroOpacity}`);

  const curtain = await page
    .locator("[data-intro-curtain]")
    .evaluate((el) => Number(getComputedStyle(el).opacity));
  check(spec.name, "intro curtain lifted", curtain < 0.05, `opacity ${curtain}`);

  const lineVisible = await page.locator(".hero-title .line-inner").first().evaluate((el) => {
    const r = el.getBoundingClientRect();
    const mask = el.parentElement.getBoundingClientRect();
    return r.top >= mask.top - 2;
  });
  check(spec.name, "headline mask released", lineVisible);

  // ---- 3. media pipeline -------------------------------------------------
  const media = await page.evaluate(() => {
    const videos = [...document.querySelectorAll("video")];
    return {
      count: videos.length,
      playing: videos.filter((v) => !v.paused && v.readyState >= 2).length,
      srcs: videos.map((v) => v.currentSrc || v.src || null),
      posters: [...document.querySelectorAll(".cine-poster")].map((i) => ({
        src: i.getAttribute("src"),
        loaded: i.complete && i.naturalWidth > 0,
      })),
    };
  });

  check(spec.name, "every poster loaded", media.posters.every((p) => p.loaded), `${media.posters.length} posters`);
  check(
    spec.name,
    "only on-screen video is playing",
    media.playing <= 1,
    `${media.playing} of ${media.count} playing`,
  );

  if (spec.reducedMotion === "reduce") {
    check(spec.name, "reduced motion: no video element", media.count === 0, `${media.count} videos`);
    check(
      spec.name,
      "reduced motion: no video bytes requested",
      !requested.some((u) => u.endsWith(".mp4")),
    );
    const heroTransform = await page
      .locator("[data-hero-plate]")
      .evaluate((el) => getComputedStyle(el).transform);
    check(spec.name, "reduced motion: hero plate untransformed", heroTransform === "none", heroTransform);
  } else {
    check(spec.name, "hero clip is playing", media.playing >= 1, media.srcs[0] || "");
  }

  // ---- 4. no horizontal overflow -----------------------------------------
  const overflow = await page.evaluate(() => {
    const docW = document.documentElement.clientWidth;
    const offenders = [];
    document.querySelectorAll("body *").forEach((el) => {
      const r = el.getBoundingClientRect();
      if (r.width > 0 && (r.right > docW + 1.5 || r.left < -1.5)) {
        // Scrollers and deliberately full-bleed layers are allowed to clip.
        const cs = getComputedStyle(el);
        const decorated = el.closest("[data-hero-plate], .occasion-cards, .hero, .craft-media");
        if (cs.position === "fixed" || decorated) return;
        offenders.push(`${el.tagName.toLowerCase()}.${(el.className || "").toString().split(" ")[0] || ""} → ${Math.round(r.right)}`);
      }
    });
    return {
      docW,
      scrollW: document.documentElement.scrollWidth,
      offenders: offenders.slice(0, 6),
    };
  });
  check(
    spec.name,
    "no horizontal overflow",
    overflow.scrollW <= overflow.docW + 1,
    `scrollWidth ${overflow.scrollW} vs ${overflow.docW}${overflow.offenders.length ? " :: " + overflow.offenders.join(", ") : ""}`,
  );

  // ---- 5. CTAs are present, reachable, and correctly targeted ------------
  const ctas = await page.evaluate(() => {
    const list = [...document.querySelectorAll(".cta, .film-button")];
    return list.map((el) => {
      const r = el.getBoundingClientRect();
      const cs = getComputedStyle(el);
      return {
        text: (el.textContent || "").trim().slice(0, 40),
        href: el.getAttribute("href") || null,
        target: el.getAttribute("target") || null,
        rel: el.getAttribute("rel") || null,
        w: Math.round(r.width),
        h: Math.round(r.height),
        visible: cs.visibility !== "hidden" && Number(cs.opacity) > 0.1,
      };
    });
  });
  const primary = ctas.filter((c) => c.href === "https://www.exist.com.tn/221-costumes-blazers");
  check(spec.name, "product CTAs point at the official category", primary.length >= 2, `${primary.length} found`);
  check(spec.name, "external CTAs are safe", primary.every((c) => c.target === "_blank" && /noopener/.test(c.rel || "")));
  check(spec.name, "every CTA has a tap target ≥ 40px", ctas.every((c) => c.h >= 40), `min ${Math.min(...ctas.map((c) => c.h))}px`);

  // ---- 6. scroll choreography actually runs ------------------------------
  if (spec.reducedMotion !== "reduce") {
    await page.evaluate(() => window.scrollTo({ top: 700, behavior: "instant" }));
    await sleep(900);
    const after = await page.evaluate(() => ({
      plate: getComputedStyle(document.querySelector("[data-hero-plate]")).transform,
      veil: Number(getComputedStyle(document.querySelector("[data-hero-veil]")).opacity),
      headerScrolled: document.querySelector(".site-header").classList.contains("is-scrolled"),
    }));
    check(
      spec.name,
      "hero scales on scroll",
      after.plate !== "none" && after.plate !== "matrix(1, 0, 0, 1, 0, 0)",
      after.plate,
    );
    check(spec.name, "hero veil darkens on scroll", after.veil > 0.2, `opacity ${after.veil.toFixed(2)}`);
    check(spec.name, "header gains scrolled state", after.headerScrolled);

    // Reveals: after scrolling through the whole page, nothing may be left
    // stuck invisible — that is the classic ScrollTrigger regression.
    const height = await page.evaluate(() => document.body.scrollHeight);
    const step = Math.round(spec.viewport.height * 0.8);
    for (let y = 0; y < height; y += step) {
      await page.evaluate((top) => window.scrollTo({ top, behavior: "instant" }), y);
      await sleep(120);
    }
    await sleep(1400);
  }

  const hidden = await page.evaluate(() => {
    const stuck = [];
    document.querySelectorAll("[data-reveal], [data-reveal-soft], [data-stagger-kids]").forEach((el) => {
      const op = Number(getComputedStyle(el).opacity);
      const holder = el.matches("[data-stagger-kids]") ? el : el;
      if (op < 0.9) stuck.push(`${el.className.toString().split(" ")[0] || el.tagName} (${op.toFixed(2)})`);
      holder.querySelectorAll(":scope > *").forEach((kid) => {
        const kop = Number(getComputedStyle(kid).opacity);
        if (kop < 0.9) stuck.push(`kid ${kid.className.toString().split(" ")[0] || kid.tagName} (${kop.toFixed(2)})`);
      });
    });
    return stuck.slice(0, 8);
  });
  check(spec.name, "all revealed content is visible", hidden.length === 0, hidden.join(", "));

  // ---- 7. keyboard / accessibility ---------------------------------------
  await page.evaluate(() => window.scrollTo({ top: 0, behavior: "instant" }));
  await sleep(300);
  await page.keyboard.press("Tab");
  const firstFocus = await page.evaluate(() => {
    const el = document.activeElement;
    if (!el || el === document.body) return null;
    const cs = getComputedStyle(el);
    const r = el.getBoundingClientRect();
    return {
      tag: el.tagName.toLowerCase(),
      label: el.getAttribute("aria-label") || (el.textContent || "").trim().slice(0, 30),
      focusRing: cs.outlineStyle !== "none" && parseFloat(cs.outlineWidth) > 0,
      onScreen: r.top >= -2 && r.bottom <= window.innerHeight + 2,
    };
  });
  check(spec.name, "first Tab reaches a control", !!firstFocus, firstFocus ? `${firstFocus.tag} "${firstFocus.label}"` : "none");
  check(spec.name, "focus indicator is visible", !!firstFocus?.focusRing);

  const a11y = await page.evaluate(() => {
    const noName = [...document.querySelectorAll("button, a")].filter((el) => {
      const name =
        el.getAttribute("aria-label") ||
        (el.textContent || "").trim() ||
        el.getAttribute("title") ||
        el.getAttribute("alt");
      return !name;
    }).length;
    const imgsNoAlt = [...document.querySelectorAll("img")]
      .filter((i) => i.getAttribute("alt") === null).length;
    const headings = [...document.querySelectorAll("h1")].length;
    return { noName, imgsNoAlt, h1Count: headings, lang: document.documentElement.lang };
  });
  check(spec.name, "no unnamed controls", a11y.noName === 0, `${a11y.noName}`);
  check(spec.name, "every image has an alt attribute", a11y.imgsNoAlt === 0, `${a11y.imgsNoAlt}`);
  check(spec.name, "exactly one h1", a11y.h1Count === 1);
  check(spec.name, "document language is French", a11y.lang === "fr", a11y.lang);

  // ---- 8. the size-guide modal still works -------------------------------
  await page.evaluate(() => window.scrollTo({ top: 0, behavior: "instant" }));
  await sleep(400);
  const guideBtn = page.locator('button[aria-label="Ouvrir le guide des tailles"]');
  if (await guideBtn.count()) {
    if (spec.isMobile) {
      // mobile hides that icon; use the in-page CTA instead
      await page.locator("#fit .cta").scrollIntoViewIfNeeded();
      await page.locator("#fit .cta").click();
    } else {
      await guideBtn.click();
    }
    await sleep(700);
    const modalOpen = await page.locator('[role="dialog"][aria-modal="true"]').count();
    check(spec.name, "size guide opens", modalOpen === 1);
    const overflowLocked = await page.evaluate(() => getComputedStyle(document.body).overflow);
    check(spec.name, "background scroll locked", overflowLocked === "hidden", overflowLocked);
    await page.keyboard.press("Escape");
    await sleep(600);
    check(spec.name, "Escape closes the size guide", (await page.locator('[role="dialog"]').count()) === 0);
    check(
      spec.name,
      "scroll lock released",
      (await page.evaluate(() => getComputedStyle(document.body).overflow)) !== "hidden",
    );
  }

  // ---- 9. visual evidence ------------------------------------------------
  if (visual) {
    mkdirSync(SHOTS, { recursive: true });
    await page.evaluate(() => window.scrollTo({ top: 0, behavior: "instant" }));
    await sleep(600);
    await page.screenshot({ path: path.join(SHOTS, `${spec.name}-hero.png`) });
    await page.evaluate(() => window.scrollTo({ top: 2100, behavior: "instant" }));
    await sleep(900);
    await page.screenshot({ path: path.join(SHOTS, `${spec.name}-product.png`) });
    const craft = await page.evaluate(() => {
      const el = document.querySelector("[data-craft]");
      return el ? el.getBoundingClientRect().top + window.scrollY - 60 : 0;
    });
    await page.evaluate((top) => window.scrollTo({ top, behavior: "instant" }), craft);
    await sleep(1100);
    await page.screenshot({ path: path.join(SHOTS, `${spec.name}-craft.png`) });
    const closing = await page.evaluate(() => {
      const el = document.querySelector(".closing-section");
      return el ? el.getBoundingClientRect().top + window.scrollY - 40 : 0;
    });
    await page.evaluate((top) => window.scrollTo({ top, behavior: "instant" }), closing);
    await sleep(1100);
    await page.screenshot({ path: path.join(SHOTS, `${spec.name}-closing.png`) });
  }

  // ---- 10. performance signals -------------------------------------------
  const perf = await page.evaluate(() => {
    const nav = performance.getEntriesByType("navigation")[0];
    const paints = performance.getEntriesByType("paint");
    const lcp = performance.getEntriesByType("largest-contentful-paint");
    const resources = performance.getEntriesByType("resource");
    const weight = resources.reduce((sum, r) => sum + (r.transferSize || 0), 0);
    const videos = resources.filter((r) => r.name.endsWith(".mp4"));
    return {
      domContentLoaded: nav ? Math.round(nav.domContentLoadedEventEnd) : null,
      load: nav ? Math.round(nav.loadEventEnd) : null,
      fcp: Math.round(paints.find((p) => p.name === "first-contentful-paint")?.startTime || 0),
      lcp: lcp.length ? Math.round(lcp[lcp.length - 1].startTime) : null,
      requests: resources.length,
      weightKB: Math.round(weight / 1024),
      videoRequests: videos.map((v) => v.name.split("/").pop()),
      videoKB: Math.round(videos.reduce((s, v) => s + (v.transferSize || 0), 0) / 1024),
    };
  });
  console.log(
    `  · perf: FCP ${perf.fcp}ms · LCP ${perf.lcp ?? "n/a"}ms · load ${perf.load}ms · ${perf.requests} requests · ${perf.weightKB} KB · video ${perf.videoRequests.join(",") || "none"} (${perf.videoKB} KB)`,
  );
  check(spec.name, "first paint under 2.5 s", perf.fcp < 2500, `${perf.fcp}ms`);
  if (spec.reducedMotion === "reduce") {
    check(spec.name, "reduced motion loads no clip", perf.videoRequests.length === 0);
  }

  await context.close();
  return perf;
}

(async () => {
  const browser = await chromium.launch({
    executablePath:
      "/home/ashenix/.cache/ms-playwright/chromium-1252/chrome-linux64/chrome",
    args: ["--no-sandbox", "--disable-dev-shm-usage", "--autoplay-policy=no-user-gesture-required"],
  });

  const specs = only ? CONTEXTS.filter((c) => c.name === only) : CONTEXTS;
  const perfs = {};
  for (const spec of specs) perfs[spec.name] = await runContext(browser, spec);
  await browser.close();

  const failed = results.filter((r) => !r.pass);
  console.log(`\n${results.length - failed.length}/${results.length} checks passed`);
  if (failed.length) {
    console.log("\nFailures:");
    failed.forEach((f) => console.log(`  · [${f.ctx}] ${f.name} ${f.detail}`));
    process.exit(1);
  }
  console.log(JSON.stringify(perfs, null, 2));
})();
