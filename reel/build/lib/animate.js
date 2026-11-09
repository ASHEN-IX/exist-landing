"use strict";
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
Object.defineProperty(exports, "__esModule", { value: true });
exports.pushIn = exports.camera = exports.jitter = exports.rand = exports.fade = exports.interpolateSegments = exports.progress = exports.interpolate = exports.Easing = void 0;
exports.Easing = {
    linear: ((t) => t),
    /** Standard ease-out. Decelerates into rest — the default for entrances. */
    out: ((t) => 1 - Math.pow(1 - t, 3)),
    /** Softer deceleration for camera moves that should feel weighted. */
    outQuad: ((t) => 1 - (1 - t) * (1 - t)),
    in: ((t) => t * t * t),
    inOut: ((t) => t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2),
    /** Raised cosine — starts and ends at zero velocity. For loopable motion. */
    cosine: ((t) => (1 - Math.cos(Math.PI * t)) / 2),
    /** A slow luxury "drape": lots of hold at the top, long soft settle. */
    drape: ((t) => 1 - Math.pow(1 - t, 5)),
    /** Overshoots very slightly then settles. Use sparingly — one or two per reel. */
    softSpring: ((t) => {
        if (t <= 0)
            return 0;
        if (t >= 1)
            return 1;
        const c = 1.12;
        return 1 + (c + 1) * Math.pow(t - 1, 3) + c * Math.pow(t - 1, 2);
    }),
};
const clamp01 = (t) => (t < 0 ? 0 : t > 1 ? 1 : t);
/**
 * Map `frame` from one range to another.
 *
 * `input` is a list of frame stops, `output` the matching values. With more
 * than two stops the easing applies per segment, which is how a two-stage
 * reveal (in, hold, out) is expressed.
 */
const interpolate = (frame, input, output, options = {}) => {
    const { easing = exports.Easing.linear, clamp = true } = options;
    if (input.length !== output.length) {
        throw new Error("interpolate: input and output must be the same length");
    }
    if (input.length < 2)
        return output[0] ?? 0;
    // Find the segment the frame falls in.
    let i = 0;
    while (i < input.length - 2 && frame > input[i + 1])
        i += 1;
    const a = input[i];
    const b = input[i + 1];
    let t = b === a ? 0 : (frame - a) / (b - a);
    if (clamp)
        t = clamp01(t);
    // Below the first stop / above the last stop, clamp to the end value.
    if (clamp && frame <= input[0])
        return output[0];
    if (clamp && frame >= input[input.length - 1])
        return output[output.length - 1];
    return output[i] + (output[i + 1] - output[i]) * easing(t);
};
exports.interpolate = interpolate;
/** 0 → 1 over `duration` frames starting at `start`. */
const progress = (frame, start, duration, easing = exports.Easing.linear) => (0, exports.interpolate)(frame, [start, start + duration], [0, 1], { easing });
exports.progress = progress;
/**
 * A three-segment interpolate with a different easing per segment.
 *
 * `interpolate` applies one easing to the whole curve; fades need two (ease-out
 * on the way in, ease-in on the way out), so this walks the stops itself.
 */
const interpolateSegments = (frame, input, output, easings) => {
    let i = 0;
    while (i < input.length - 2 && frame > input[i + 1])
        i += 1;
    const a = input[i];
    const b = input[i + 1];
    const t = clamp01(b === a ? 0 : (frame - a) / (b - a));
    const ease = easings[i] ?? exports.Easing.linear;
    if (frame <= input[0])
        return output[0];
    if (frame >= input[input.length - 1])
        return output[output.length - 1];
    return output[i] + (output[i + 1] - output[i]) * ease(t);
};
exports.interpolateSegments = interpolateSegments;
/**
 * A fade-in / hold / fade-out envelope.
 *
 * Used for every caption: `fade(frame, 0, 18, total - 24, 24)` reads as
 * "18 frames in, hold until 24 frames before the end, 24 frames out".
 */
const fade = (frame, inStart, inDur, outStart, outDur, easing = exports.Easing.out) => (0, exports.interpolateSegments)(frame, [inStart, inStart + inDur, outStart, outStart + outDur], [0, 1, 1, 0], [easing, exports.Easing.linear, exports.Easing.in]);
exports.fade = fade;
/**
 * Deterministic pseudo-random in [0,1). A hash, not Math.random — two renders
 * of the same frame produce identical numbers.
 */
const rand = (seed) => {
    const x = Math.sin(seed * 12.9898) * 43758.5453123;
    return x - Math.floor(x);
};
exports.rand = rand;
/** Deterministic jitter in [-amount, amount]. */
const jitter = (seed, amount = 1) => ((0, exports.rand)(seed) * 2 - 1) * amount;
exports.jitter = jitter;
const camera = (partial = {}) => ({
    zoom: 1,
    x: 0,
    y: 0,
    rotate: 0,
    ...partial,
});
exports.camera = camera;
/** A slow push-in that never reaches its end value — reads as a live camera. */
const pushIn = (frame, start, duration, from, to, easing = exports.Easing.cosine) => (0, exports.interpolate)(frame, [start, start + duration], [from, to], { easing });
exports.pushIn = pushIn;
