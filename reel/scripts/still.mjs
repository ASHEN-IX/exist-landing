#!/usr/bin/env node
/**
 * Render a single frame of the reel to PNG, for visual inspection.
 *
 *   node scripts/still.mjs <frame> [out.png] [--comp=master|cutdown]
 *
 * The SVG is produced by the compiled composition and rasterised with
 * rsvg-convert, which is the same path the video renderer takes — so a still
 * is a faithful sample of the final picture, not an approximation.
 */
import { execFileSync } from "node:child_process";
import { mkdtempSync, writeFileSync, mkdirSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { createRequire } from "node:module";

// The composition is compiled to CommonJS so both this script and the renderer
// can load it synchronously.
const require = createRequire(import.meta.url);

const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(here, "..");

const args = process.argv.slice(2);
const opts = new Map(
  args.filter((a) => a.startsWith("--")).map((a) => {
    const [k, v = "true"] = a.replace(/^--/, "").split("=");
    return [k, v];
  }),
);
const positional = args.filter((a) => !a.startsWith("--"));
const frame = Number(positional[0] ?? 0);
const out = positional[1]
  ? path.resolve(positional[1])
  : path.join(root, "..", "out", `still-${frame}.png`);
const comp = opts.get("comp") ?? "master";

const { REELS } = require(path.join(root, "build", "compositions", "CeremonyReel.js"));
const { frameToSvg } = require(path.join(root, "build", "render.js"));

const reel = REELS[comp];
if (!reel) {
  console.error(`unknown composition "${comp}" — expected master or cutdown`);
  process.exit(1);
}

if (frame < 0 || frame >= reel.durationInFrames) {
  console.error(`frame ${frame} outside 0…${reel.durationInFrames - 1}`);
  process.exit(1);
}

// This build sandbox blocks libsrvg from reading the project directory, so the
// frame and the assets it references are staged in a scratch directory the
// rasteriser can read. Paths inside the SVG stay relative, so the same
// document renders correctly anywhere it is staged.
const tmp = mkdtempSync(path.join(tmpdir(), "exist-frame-"));
execFileSync("cp", ["-R", path.join(root, "public") + "/.", tmp + "/"]);
const svg = frameToSvg(reel.component, frame, "");
const svgPath = path.join(tmp, "frame.svg");
writeFileSync(svgPath, svg);

mkdirSync(path.dirname(out), { recursive: true });
execFileSync("rsvg-convert", ["-w", "1080", "-h", "1920", svgPath, "-o", out]);
console.log(out);
