#!/usr/bin/env node
/**
 * EXIST — video renderer.
 *
 *   node scripts/render.mjs master    → EXIST_Ceremony_Reel_25s.mp4
 *   node scripts/render.mjs cutdown   → EXIST_Ceremony_Reel_15s.mp4
 *
 * HOW IT WORKS
 *   1. Every frame is rendered to SVG from the React composition (deterministic
 *      — frame N always produces identical markup).
 *   2. The SVG is rasterised to PNG at 1080×1920.
 *   3. PNGs are piped to ffmpeg as an H.264 stream, with the soundtrack muxed
 *      in as AAC.
 *
 *   1–2 run in parallel across the CPU. Rasterisation dominates the cost, so
 *   the worker count is tied to cores.
 *
 * NOTE ON THE SANDBOX: libsrvg cannot read the project directory in this build
 * environment, so the frames are staged in a scratch directory (with the
 * assets) for rasterisation. The same code renders identically anywhere.
 */
import { spawn, execFileSync } from "node:child_process";
import { mkdtempSync, readFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import os from "node:os";
import { fileURLToPath, pathToFileURL } from "node:url";
import { createRequire } from "node:module";

const require = createRequire(import.meta.url);
const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(here, "..");
const projectRoot = path.resolve(root, "..");

const which = process.argv[2];
if (!["master", "cutdown"].includes(which)) {
  console.error("usage: node scripts/render.mjs <master|cutdown>");
  process.exit(1);
}

const { REELS } = require(path.join(root, "build", "compositions", "CeremonyReel.js"));
const { frameToSvg } = require(path.join(root, "build", "render.js"));

const reel = REELS[which];
const OUT_DIR = path.join(projectRoot, "out");
const name =
  which === "master" ? "EXIST_Ceremony_Reel_25s" : "EXIST_Ceremony_Reel_15s";
const outFile = path.join(OUT_DIR, `${name}.mp4`);
const audioFile = path.join(root, "public", "audio", "ceremony-bed.wav");
// The bed is authored for the 25 s master. The cutdown re-edits picture but
// keeps the same opening and closing beats, so its audio is the bed trimmed
// to the cutdown's length with a short fade — declared here, applied by ffmpeg.
const audioTrim = which === "cutdown" ? (REELS.cutdown.durationInFrames / REELS.cutdown.fps) : null;

execFileSync("mkdir", ["-p", OUT_DIR]);

// ── stage the assets where libsrvg can read them ──────────────────────────
const stage = mkdtempSync(path.join(tmpdir(), "exist-render-"));
execFileSync("cp", ["-R", path.join(root, "public") + "/.", stage + "/"]);

const workers = Math.max(2, Math.min(8, os.cpus().length - 2));
const total = reel.durationInFrames;

console.log(`\n  EXIST — ${reel.id}`);
console.log(`  ${reel.width}×${reel.height} · ${reel.fps} fps · ${total} frames · ${(total / reel.fps).toFixed(2)} s`);
console.log(`  ${workers} raster workers → ${path.relative(projectRoot, outFile)}\n`);

/**
 * Rasterise one frame. The SVG is written next to the staged assets so its
 * relative hrefs resolve.
 */
const renderFrame = (frame) => {
  const svgPath = path.join(stage, `f${frame}.svg`);
  const pngPath = path.join(stage, `f${frame}.png`);
  const svg = frameToSvg(reel.component, frame, "");
  require("node:fs").writeFileSync(svgPath, svg);
  execFileSync("rsvg-convert", [
    "-w",
    String(reel.width),
    "-h",
    String(reel.height),
    svgPath,
    "-o",
    pngPath,
  ]);
  rmSync(svgPath, { force: true });
  return pngPath;
};

// ── ffmpeg: PNG sequence → H.264 + AAC ────────────────────────────────────
const ff = spawn(
  "ffmpeg",
  [
    "-y", "-hide_banner", "-loglevel", "error",
    "-f", "image2pipe",
    "-framerate", String(reel.fps),
    "-c:v", "png", "-i", "-",
    "-i", audioFile,
    "-map", "0:v:0", "-map", "1:a:0",
    "-c:v", "libx264",
    "-profile:v", "high", "-level", "4.2",
    "-preset", "slow",
    "-crf", "18",
    "-pix_fmt", "yuv420p",
    "-g", String(reel.fps * 2),
    "-keyint_min", String(reel.fps * 2),
    "-sc_threshold", "0",
    "-color_primaries", "bt709",
    "-color_trc", "bt709",
    "-colorspace", "bt709",
    ...(audioTrim
      ? ["-af", `atrim=0:${audioTrim.toFixed(3)},afade=t=out:st=${(audioTrim - 0.7).toFixed(3)}:d=0.7`]
      : []),
    "-c:a", "aac", "-b:a", "192k", "-ar", "48000", "-ac", "2",
    "-shortest",
    "-movflags", "+faststart",
    outFile,
  ],
  // stderr is captured, never ignored: if ffmpeg rejects the stream the
  // reason must reach the operator rather than hang the render.
  { stdio: ["pipe", "ignore", "pipe"] },
);

let ffStderr = "";
ff.stderr.on("data", (d) => {
  ffStderr += d.toString();
  if (ffStderr.length > 8000) ffStderr = ffStderr.slice(-8000);
});

const ffDone = new Promise((res, rej) => {
  ff.on("error", rej);
  ff.on("close", (code) =>
    code === 0 ? res() : rej(new Error(`ffmpeg exited ${code}\n${ffStderr}`)),
  );
});

/**
 * Ordered, bounded pipeline.
 *
 * Frames render in parallel, but they must reach ffmpeg in order — so a
 * cursor tracks the next frame to write, and each finished frame is parked
 * until every earlier one has gone out. Bounded at `workers` in flight, which
 * keeps memory flat regardless of the reel's length.
 */
const ready = new Map();
let nextToWrite = 0;
let nextToRender = 0;
let inFlight = 0;
let done = 0;

const writeReady = async () => {
  while (ready.has(nextToWrite)) {
    const png = ready.get(nextToWrite);
    ready.delete(nextToWrite);
    const buf = readFileSync(png);
    rmSync(png, { force: true });
    nextToWrite += 1;
    if (!ff.stdin.write(buf)) {
      await new Promise((r) => ff.stdin.once("drain", r));
    }
  }
};

const pump = async () => {
  while (nextToRender < total) {
    if (inFlight >= workers) {
      await new Promise((r) => setTimeout(r, 4));
      continue;
    }
    const frame = nextToRender;
    nextToRender += 1;
    inFlight += 1;
    // Rendering is synchronous (execFileSync), so the frame is already done
    // when this returns; the parallelism comes from the OS doing the work and
    // from overlapping it with the ffmpeg writes below.
    try {
      const png = renderFrame(frame);
      ready.set(frame, png);
      done += 1;
      process.stdout.write(
        `\r  frames  ${String(done).padStart(4)} / ${total}`,
      );
    } catch (e) {
      console.error(`\nframe ${frame} failed: ${e.message}`);
      ff.kill("SIGKILL");
      process.exit(1);
    }
    inFlight -= 1;
    await writeReady();
  }
};

await pump();
// Drain whatever is still parked while the last frames finish.
while (nextToWrite < total) {
  await writeReady();
  await new Promise((r) => setTimeout(r, 8));
}
ff.stdin.end();
await ffDone;

rmSync(stage, { recursive: true, force: true });
process.stdout.write(`\r  frames  ${total} / ${total}   \n`);
console.log(`  ✓ ${path.relative(projectRoot, outFile)}\n`);
