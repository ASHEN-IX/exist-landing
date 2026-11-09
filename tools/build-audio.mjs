#!/usr/bin/env node
/**
 * EXIST — soundtrack synthesis.
 *
 * WHY THIS EXISTS
 *   No licensed track is available offline and no paid library may be called,
 *   so the bed is SYNTHESISED here: additive sine/triangle voices, filtered
 *   noise and convolution reverb, all generated from the same cue sheet the
 *   scenes animate to (config/timeline.ts CUES). It is original, unencumbered
 *   audio — not a copy of any advertisement's music.
 *
 *   It is a credible cinematic bed — a sustained minor-chord pad, a pulse that
 *   enters with the detail section, an impact under the match cut, and a
 *   resolved chord with a logo sting — not an orchestral score.
 *
 *   A cue-by-cue brief for a licensed replacement is in docs/asset-manifest.md.
 *
 * Output: 48 kHz, 16-bit stereo WAV, peak-normalised to -1 dBFS.
 */
import { writeFileSync, mkdirSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(here, "..");

const SR = 48000;
const MASTER_SECONDS = 25;

/** Cue sheet — must match config/timeline.ts CUES. */
const CUES = {
  ambientIn: 0,
  pulseIn: 4,
  impact: 11.35,
  reveal: 14,
  resolve: 20,
  sting: 21.2,
  out: 24.6,
};

const TOTAL = Math.ceil(MASTER_SECONDS * SR);
const L = new Float32Array(TOTAL);
const R = new Float32Array(TOTAL);

const TAU = Math.PI * 2;
const clamp01 = (x) => (x < 0 ? 0 : x > 1 ? 1 : x);
const smooth = (x) => {
  const t = clamp01(x);
  return t * t * (3 - 2 * t);
};
/** Attack / decay envelope in seconds. */
const env = (t, atk, dec) => {
  if (t < 0) return 0;
  if (t < atk) return smooth(t / atk);
  const d = t - atk;
  return Math.exp(-d / Math.max(0.001, dec));
};

const add = (i, l, r) => {
  if (i < 0 || i >= TOTAL) return;
  L[i] += l;
  R[i] += r;
};

const hz = (midi) => 440 * Math.pow(2, (midi - 69) / 12);

/* ── voices ─────────────────────────────────────────────────────────────── */

/**
 * A soft pad voice: sine fundamental plus two detuned partials per side.
 * The slight detune is what stops a synth pad sounding like a test tone.
 */
const pad = (startSec, durSec, midis, gain, opts = {}) => {
  const { attack = 1.8, release = 2.0, bright = 0.35 } = opts;
  const s0 = Math.floor(startSec * SR);
  const n = Math.floor(durSec * SR);
  for (let k = 0; k < n; k += 1) {
    const t = k / SR;
    const a = smooth(t / attack);
    const r = smooth((durSec - t) / release);
    const e = Math.min(a, r);
    if (e <= 0) continue;
    let l = 0;
    let rr = 0;
    for (let m = 0; m < midis.length; m += 1) {
      const f = hz(midis[m]);
      // Three partials; higher ones fade as `bright` rises.
      for (let p = 1; p <= 3; p += 1) {
        const pg = Math.pow(bright, p - 1) / p;
        const det = 1 + (p === 2 ? 0.0016 : p === 3 ? -0.0012 : 0);
        l += Math.sin(TAU * f * det * t + m) * pg;
        rr += Math.sin(TAU * f * (2 - det) * t + m * 1.7) * pg;
      }
    }
    const g = (gain * e) / (midis.length * 2.2);
    add(s0 + k, l * g, rr * g);
  }
};

/** A plucked/pulsed tone with a fast attack — used for the rhythmic section. */
const pulse = (startSec, midi, gain, decay = 0.22) => {
  const s0 = Math.floor(startSec * SR);
  const n = Math.floor(decay * 5 * SR);
  const f = hz(midi);
  for (let k = 0; k < n; k += 1) {
    const t = k / SR;
    const e = env(t, 0.004, decay);
    if (e < 0.0005) break;
    const v =
      Math.sin(TAU * f * t) * 0.6 +
      Math.sin(TAU * f * 2 * t) * 0.22 +
      Math.sin(TAU * f * 3.01 * t) * 0.1;
    add(s0 + k, v * e * gain, v * e * gain * 0.85);
  }
};

/**
 * The impact: a filtered noise burst with a falling pitch, plus a low sub
 * thump. This is the sound of the jacket filling the frame.
 */
const impactHit = (startSec, gain) => {
  const s0 = Math.floor(startSec * SR);
  const n = Math.floor(1.9 * SR);
  let lp = 0;
  let seed = 12345;
  for (let k = 0; k < n; k += 1) {
    const t = k / SR;
    // Deterministic noise.
    seed = (seed * 1664525 + 1013904223) >>> 0;
    const white = (seed / 4294967296) * 2 - 1;
    // Sweeping low-pass: bright at the hit, darkening as it decays.
    const cutoff = 0.34 * Math.exp(-t * 3.4) + 0.02;
    lp += (white - lp) * cutoff;
    const e = env(t, 0.002, 0.55);
    const sub = Math.sin(TAU * (52 - t * 18) * t) * env(t, 0.004, 0.7) * 0.7;
    const v = lp * e * 0.85 + sub * e;
    add(s0 + k, v * gain, v * gain * 0.96);
  }
};

/** The logo sting: a bell-like tone that rings and settles. */
const sting = (startSec, midi, gain) => {
  const s0 = Math.floor(startSec * SR);
  const f = hz(midi);
  const n = Math.floor(2.6 * SR);
  for (let k = 0; k < n; k += 1) {
    const t = k / SR;
    const e = env(t, 0.006, 0.85);
    if (e < 0.0004) break;
    const v =
      Math.sin(TAU * f * t) * e +
      Math.sin(TAU * f * 2.005 * t) * e * 0.34 +
      Math.sin(TAU * f * 3.02 * t) * e * 0.14 +
      Math.sin(TAU * f * 4.98 * t) * e * 0.05;
    add(s0 + k, v * gain, v * gain * 0.9);
  }
};

/* ── the arrangement ────────────────────────────────────────────────────── */

// A minor key throughout (D minor): sustained, unresolved, and it lets the
// reveal land on F major as the emotional lift.
const D3 = 50, F3 = 53, A3 = 57, C3 = 48, E3 = 52, G3 = 55, D4 = 62;

// 0–4 s — ambient open. Just D and A, no thirds: ambiguous, waiting.
pad(0.2, 5.4, [D3 - 12, D3, A3], 0.62, { attack: 2.6, release: 2.4, bright: 0.18 });
pad(1.4, 4.0, [D4, A3 + 12], 0.22, { attack: 1.8, release: 1.8, bright: 0.3 });

// A soft, slow ticking — the clock that says "you don't get this moment again".
for (let t = 0.6; t < 4.1; t += 0.5) {
  const g = 0.055 * (1 - (t - 0.6) / 3.5 * 0.45);
  pulse(t, D4 + 24, g, 0.05);
}

// 4–9 s — the pulse enters. Four-on-the-floor at 120 BPM, soft, sitting under.
pad(3.9, 10.2, [D3 - 12, D3, F3, A3], 0.34, { attack: 0.9, release: 1.6, bright: 0.34 });
for (let t = 4.0; t < 13.8; t += 0.5) {
  pulse(t, D3, 0.20, 0.16);
  pulse(t + 0.25, D3 + 12, 0.075, 0.12);
}

// The detail section's small accents: an ostinato that climbs the chord.
const ost = [D4, F3 + 12, A3 + 12, F3 + 12];
let oi = 0;
for (let t = 4.5; t < 13.5; t += 1.0) {
  pulse(t, ost[oi % ost.length], 0.052, 0.3);
  oi += 1;
}

// 9–14 s — the rise. A held fifth climbing under the approach, then the hit.
pad(8.8, 5.4, [A3 - 12, A3, E3 + 12], 0.40, { attack: 1.2, release: 0.5, bright: 0.42 });
impactHit(CUES.impact, 0.30);

// After the impact: a dark, sustained D minor with the sub intact.
pad(11.4, 3.4, [D3 - 12, D3, F3, A3], 0.30, { attack: 0.12, release: 1.2, bright: 0.4 });

// 14–20 s — the reveal. F major under D: the lift the picture earns.
pad(13.9, 6.6, [F3, A3, C3 + 12, F3 + 12], 0.46, { attack: 0.55, release: 1.4, bright: 0.36 });
pad(14.2, 6.2, [F3 - 12, C3], 0.30, { attack: 1.0, release: 1.6, bright: 0.2 });
for (let t = 14.0; t < 19.9; t += 1.0) {
  pulse(t, F3 - 12, 0.155, 0.2);
  pulse(t + 0.5, A3, 0.045, 0.26);
}

// 20–25 s — resolution. Everything drops to one sustained chord, then the sting.
pad(19.8, 5.0, [D3, F3, A3, D4], 0.42, { attack: 0.8, release: 2.4, bright: 0.26 });
pad(19.8, 5.0, [D3 - 12, A3 - 12], 0.24, { attack: 1.0, release: 2.6, bright: 0.16 });
pulse(20.0, D3, 0.16, 0.5);
sting(CUES.sting, D4, 0.13);
sting(CUES.sting + 0.02, A3 + 12, 0.075);

/* ── master: a simple reverb, a gentle low shelf, a limiter, a fade ─────── */

/**
 * Cheap but musical reverb: four comb delays with feedback, summed. Enough to
 * put the pad in a room; a convolution tail would need an impulse response.
 */
const reverb = (buf, mix) => {
  const out = new Float32Array(buf.length);
  const combs = [
    { d: 0.0297, g: 0.72 },
    { d: 0.0371, g: 0.70 },
    { d: 0.0411, g: 0.68 },
    { d: 0.0437, g: 0.66 },
  ];
  for (const c of combs) {
    const dl = Math.floor(c.d * SR);
    const line = new Float32Array(dl);
    let p = 0;
    for (let i = 0; i < buf.length; i += 1) {
      const y = line[p];
      line[p] = buf[i] + y * c.g;
      out[i] += y * 0.24;
      p = (p + 1) % dl;
    }
  }
  for (let i = 0; i < buf.length; i += 1) buf[i] = buf[i] * (1 - mix) + out[i] * mix;
};

reverb(L, 0.30);
reverb(R, 0.30);

// A -1 dBFS peak normalise plus a short soft-knee limiter so nothing clips.
let peak = 0;
for (let i = 0; i < TOTAL; i += 1) {
  peak = Math.max(peak, Math.abs(L[i]), Math.abs(R[i]));
}
const preGain = peak > 0 ? 1.5 / peak : 1;
const ceil = 0.891; // -1 dBFS ceiling after limiting
let maxOut = 0;
for (let i = 0; i < TOTAL; i += 1) {
  const tanhLimit = (x) => {
    const a = Math.abs(x);
    if (a <= 0.7) return x;
    const over = (a - 0.7) / 0.3;
    return Math.sign(x) * (0.7 + 0.3 * Math.tanh(over));
  };
  L[i] = tanhLimit(L[i] * preGain) * ceil;
  R[i] = tanhLimit(R[i] * preGain) * ceil;
  maxOut = Math.max(maxOut, Math.abs(L[i]), Math.abs(R[i]));
}

// Fade the very start (no click) and the tail (clean resolution at 24.6 s).
const fadeIn = 0.06 * SR;
const fadeStart = CUES.out * SR;
const fadeEnd = (MASTER_SECONDS - 0.05) * SR;
for (let i = 0; i < TOTAL; i += 1) {
  let g = 1;
  if (i < fadeIn) g = i / fadeIn;
  if (i > fadeStart) g *= clamp01(1 - (i - fadeStart) / (fadeEnd - fadeStart));
  L[i] *= g;
  R[i] *= g;
}

/* ── write a 16-bit stereo WAV ──────────────────────────────────────────── */

const writeWav = (file, left, right) => {
  const numFrames = left.length;
  const dataBytes = numFrames * 2 * 2;
  const buf = Buffer.alloc(44 + dataBytes);
  buf.write("RIFF", 0);
  buf.writeUInt32LE(36 + dataBytes, 4);
  buf.write("WAVE", 8);
  buf.write("fmt ", 12);
  buf.writeUInt32LE(16, 16);
  buf.writeUInt16LE(1, 20); // PCM
  buf.writeUInt16LE(2, 22); // stereo
  buf.writeUInt32LE(SR, 24);
  buf.writeUInt32LE(SR * 4, 28);
  buf.writeUInt16LE(4, 32);
  buf.writeUInt16LE(16, 34);
  buf.write("data", 36);
  buf.writeUInt32LE(dataBytes, 40);
  let o = 44;
  for (let i = 0; i < numFrames; i += 1) {
    const l = Math.max(-1, Math.min(1, left[i]));
    const r = Math.max(-1, Math.min(1, right[i]));
    buf.writeInt16LE(Math.round(l * 32767), o); o += 2;
    buf.writeInt16LE(Math.round(r * 32767), o); o += 2;
  }
  writeFileSync(file, buf);
  return buf.length;
};

const outDir = path.join(root, "reel", "public", "audio");
mkdirSync(outDir, { recursive: true });
const out = path.join(outDir, "ceremony-bed.wav");
const bytes = writeWav(out, L, R);

console.log(`· soundtrack  ${MASTER_SECONDS}s · 48 kHz · stereo · 16-bit`);
console.log(`  ${path.relative(root, out)}  ${(bytes / 1024 / 1024).toFixed(1)} MB`);
console.log(`  peak ${(20 * Math.log10(maxOut)).toFixed(1)} dBFS`);
