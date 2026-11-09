/**
 * EXIST — deterministic animation primitives.
 *
 * Everything here is a pure function of the frame number. No `Date.now()`,
 * no CSS transitions, no Math.random() without a fixed seed: the same frame
 * always renders the same pixels, which is what makes the render reproducible
 * and the two deliverables frame-exact.
 *
 * The API deliberately mirrors Remotion's (`interpolate`, `Easing`, `spring`)
 * so scenes read the same as they would inside a Remotion composition.
 */

export type Easing = (t: number) => number;

export const Easing = {
  linear: ((t) => t) as Easing,

  /** Standard ease-out. Decelerates into rest — the default for entrances. */
  out: ((t) => 1 - Math.pow(1 - t, 3)) as Easing,

  /** Softer deceleration for camera moves that should feel weighted. */
  outQuad: ((t) => 1 - (1 - t) * (1 - t)) as Easing,

  in: ((t) => t * t * t) as Easing,

  inOut: ((t) =>
    t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2) as Easing,

  /** Raised cosine — starts and ends at zero velocity. For loopable motion. */
  cosine: ((t) => (1 - Math.cos(Math.PI * t)) / 2) as Easing,

  /** A slow luxury "drape": lots of hold at the top, long soft settle. */
  drape: ((t) => 1 - Math.pow(1 - t, 5)) as Easing,

  /** Overshoots very slightly then settles. Use sparingly — one or two per reel. */
  softSpring: ((t) => {
    if (t <= 0) return 0;
    if (t >= 1) return 1;
    const c = 1.12;
    return 1 + (c + 1) * Math.pow(t - 1, 3) + c * Math.pow(t - 1, 2);
  }) as Easing,
};

const clamp01 = (t: number): number => (t < 0 ? 0 : t > 1 ? 1 : t);

export type InterpolateOptions = {
  easing?: Easing;
  /** Clamp the input before easing. Default: true (no extrapolation). */
  clamp?: boolean;
};

/**
 * Map `frame` from one range to another.
 *
 * `input` is a list of frame stops, `output` the matching values. With more
 * than two stops the easing applies per segment, which is how a two-stage
 * reveal (in, hold, out) is expressed.
 */
export const interpolate = (
  frame: number,
  input: readonly number[],
  output: readonly number[],
  options: InterpolateOptions = {},
): number => {
  const { easing = Easing.linear, clamp = true } = options;
  if (input.length !== output.length) {
    throw new Error("interpolate: input and output must be the same length");
  }
  if (input.length < 2) return output[0] ?? 0;

  // Find the segment the frame falls in.
  let i = 0;
  while (i < input.length - 2 && frame > input[i + 1]) i += 1;

  const a = input[i];
  const b = input[i + 1];
  let t = b === a ? 0 : (frame - a) / (b - a);
  if (clamp) t = clamp01(t);

  // Below the first stop / above the last stop, clamp to the end value.
  if (clamp && frame <= input[0]) return output[0];
  if (clamp && frame >= input[input.length - 1]) return output[output.length - 1];

  return output[i] + (output[i + 1] - output[i]) * easing(t);
};

/** 0 → 1 over `duration` frames starting at `start`. */
export const progress = (
  frame: number,
  start: number,
  duration: number,
  easing: Easing = Easing.linear,
): number => interpolate(frame, [start, start + duration], [0, 1], { easing });

/**
 * A three-segment interpolate with a different easing per segment.
 *
 * `interpolate` applies one easing to the whole curve; fades need two (ease-out
 * on the way in, ease-in on the way out), so this walks the stops itself.
 */
export const interpolateSegments = (
  frame: number,
  input: readonly number[],
  output: readonly number[],
  easings: readonly Easing[],
): number => {
  let i = 0;
  while (i < input.length - 2 && frame > input[i + 1]) i += 1;
  const a = input[i];
  const b = input[i + 1];
  const t = clamp01(b === a ? 0 : (frame - a) / (b - a));
  const ease = easings[i] ?? Easing.linear;
  if (frame <= input[0]) return output[0];
  if (frame >= input[input.length - 1]) return output[output.length - 1];
  return output[i] + (output[i + 1] - output[i]) * ease(t);
};

/**
 * A fade-in / hold / fade-out envelope.
 *
 * Used for every caption: `fade(frame, 0, 18, total - 24, 24)` reads as
 * "18 frames in, hold until 24 frames before the end, 24 frames out".
 */
export const fade = (
  frame: number,
  inStart: number,
  inDur: number,
  outStart: number,
  outDur: number,
  easing: Easing = Easing.out,
): number =>
  interpolateSegments(
    frame,
    [inStart, inStart + inDur, outStart, outStart + outDur],
    [0, 1, 1, 0],
    [easing, Easing.linear, Easing.in],
  );

/**
 * Deterministic pseudo-random in [0,1). A hash, not Math.random — two renders
 * of the same frame produce identical numbers.
 */
export const rand = (seed: number): number => {
  const x = Math.sin(seed * 12.9898) * 43758.5453123;
  return x - Math.floor(x);
};

/** Deterministic jitter in [-amount, amount]. */
export const jitter = (seed: number, amount = 1): number =>
  (rand(seed) * 2 - 1) * amount;

/**
 * A camera rig: a crop window over the frame.
 *
 * Scenes animate `zoom` (1 = the plate exactly fills the crop) and `x`/`y`
 * (pan in source pixels), plus `rotate` in degrees. Keeping this a plain
 * object makes every shot's move readable in one line and easy to reuse
 * between the master and the cutdown.
 */
export type Camera = {
  zoom: number;
  /** Horizontal offset in final-frame pixels. Positive moves the plate right. */
  x: number;
  /** Vertical offset in final-frame pixels. */
  y: number;
  /** Degrees of rotation about the crop centre. */
  rotate: number;
};

export const camera = (partial: Partial<Camera> = {}): Camera => ({
  zoom: 1,
  x: 0,
  y: 0,
  rotate: 0,
  ...partial,
});

/** A slow push-in that never reaches its end value — reads as a live camera. */
export const pushIn = (
  frame: number,
  start: number,
  duration: number,
  from: number,
  to: number,
  easing: Easing = Easing.cosine,
): number =>
  interpolate(frame, [start, start + duration], [from, to], { easing });
