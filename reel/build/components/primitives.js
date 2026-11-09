"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CameraGroup = exports.Canvas = exports.Eyebrow = exports.Line = exports.RedRule = exports.Grain = exports.VignetteGradient = exports.GroundGradient = exports.Plate = void 0;
const jsx_runtime_1 = require("react/jsx-runtime");
const brand_1 = require("../config/brand");
/**
 * A photographic plate.
 *
 * `preserveAspectRatio="xMidYMid slice"` means the image fills the crop
 * without distortion — the scene's crop window, not the image, defines the
 * framing. That is what lets a 577px source behave like a long lens: you
 * never see the whole frame, only the part the camera is looking at.
 */
const Plate = ({ src, x = 0, y = 0, width = 1080, height = 1920, opacity = 1, publicDir, }) => ((0, jsx_runtime_1.jsx)("image", { href: publicDir ? `${publicDir}/${src}` : src, x: x, y: y, width: width, height: height, preserveAspectRatio: "xMidYMid slice", opacity: opacity }));
exports.Plate = Plate;
/* --------------------------------------------------------------------------
 * Cinematic grading
 * ----------------------------------------------------------------------- */
/** Letterbox-free top/bottom falloff that seats the picture in black. */
const GroundGradient = ({ id, top = 0.9, bottom = 0.95, mid = 0.42 }) => ((0, jsx_runtime_1.jsxs)("linearGradient", { id: id, x1: "0", y1: "0", x2: "0", y2: "1", children: [(0, jsx_runtime_1.jsx)("stop", { offset: "0", stopColor: brand_1.BRAND.ink, stopOpacity: top }), (0, jsx_runtime_1.jsx)("stop", { offset: mid, stopColor: brand_1.BRAND.ink, stopOpacity: 0 }), (0, jsx_runtime_1.jsx)("stop", { offset: "1", stopColor: brand_1.BRAND.ink, stopOpacity: bottom })] }));
exports.GroundGradient = GroundGradient;
/** Radial vignette. Pulls the eye to the centre without a hard edge. */
const VignetteGradient = ({ id, strength = 0.82, }) => ((0, jsx_runtime_1.jsxs)("radialGradient", { id: id, cx: "0.5", cy: "0.46", r: "0.72", children: [(0, jsx_runtime_1.jsx)("stop", { offset: "0.42", stopColor: brand_1.BRAND.ink, stopOpacity: 0 }), (0, jsx_runtime_1.jsx)("stop", { offset: "1", stopColor: brand_1.BRAND.ink, stopOpacity: strength })] }));
exports.VignetteGradient = VignetteGradient;
/**
 * Film grain.
 *
 * One turbulence field per frame, seeded by the frame number so the grain
 * crawls the way real emulsion does instead of sitting still. Kept very low
 * opacity: it should read as texture at 100%, not as noise.
 */
const Grain = ({ id, frame, opacity = 0.055, width = 1080, height = 1920 }) => ((0, jsx_runtime_1.jsxs)(jsx_runtime_1.Fragment, { children: [(0, jsx_runtime_1.jsxs)("filter", { id: id, x: "0", y: "0", width: "100%", height: "100%", children: [(0, jsx_runtime_1.jsx)("feTurbulence", { type: "fractalNoise", baseFrequency: "0.72", numOctaves: "3", seed: frame % 97, stitchTiles: "stitch" }), (0, jsx_runtime_1.jsx)("feColorMatrix", { type: "saturate", values: "0" }), (0, jsx_runtime_1.jsx)("feComponentTransfer", { children: (0, jsx_runtime_1.jsx)("feFuncA", { type: "linear", slope: opacity, intercept: "0" }) })] }), (0, jsx_runtime_1.jsx)("rect", { width: width, height: height, filter: `url(#${id})` })] }));
exports.Grain = Grain;
/**
 * Brand-red accent bar with a feathered leading edge.
 *
 * Drawn as a gradient rather than a solid rect so it reads as a light streak
 * rather than a UI element.
 */
const RedRule = ({ id, x, y, width, height = 2, opacity = 1, progress = 1 }) => {
    const w = Math.max(0.01, width * progress);
    return ((0, jsx_runtime_1.jsxs)(jsx_runtime_1.Fragment, { children: [(0, jsx_runtime_1.jsxs)("linearGradient", { id: id, x1: "0", y1: "0", x2: "1", y2: "0", children: [(0, jsx_runtime_1.jsx)("stop", { offset: "0", stopColor: brand_1.BRAND.red, stopOpacity: "1" }), (0, jsx_runtime_1.jsx)("stop", { offset: "0.72", stopColor: brand_1.BRAND.red, stopOpacity: "1" }), (0, jsx_runtime_1.jsx)("stop", { offset: "1", stopColor: brand_1.BRAND.red, stopOpacity: "0" })] }), (0, jsx_runtime_1.jsx)("rect", { x: x, y: y, width: w, height: height, fill: `url(#${id})`, opacity: opacity })] }));
};
exports.RedRule = RedRule;
/** A single typographic line. */
const Line = ({ children, x, y, font = brand_1.TYPE.displayLight, fontSize, fill = brand_1.BRAND.white, opacity = 1, letterSpacing = 0, anchor = "start", italic = false, }) => ((0, jsx_runtime_1.jsx)("text", { x: x, y: y, fontFamily: font, fontSize: fontSize, fill: fill, opacity: opacity, letterSpacing: letterSpacing, textAnchor: anchor, fontStyle: italic ? "italic" : "normal", dominantBaseline: "alphabetic", children: children }));
exports.Line = Line;
/**
 * Utility / eyebrow type — small, widely tracked, uppercase.
 *
 * This is the "editorial device" of the reel: collection name, scene labels
 * and the CTA all use it, which is what makes otherwise different scenes read
 * as one campaign.
 */
const Eyebrow = ({ letterSpacing = 0.34, ...rest }) => (0, jsx_runtime_1.jsx)(exports.Line, { ...rest, font: brand_1.TYPE.displayMedium, letterSpacing: letterSpacing });
exports.Eyebrow = Eyebrow;
/* --------------------------------------------------------------------------
 * Layout
 * ----------------------------------------------------------------------- */
/** The reel's frame, used to keep everything on one canvas. */
const Canvas = ({ children, background = brand_1.BRAND.black, name }) => ((0, jsx_runtime_1.jsxs)("svg", { xmlns: "http://www.w3.org/2000/svg", xmlnsXlink: "http://www.w3.org/1999/xlink", width: 1080, height: 1920, viewBox: "0 0 1080 1920", "data-scene": name, children: [(0, jsx_runtime_1.jsx)("rect", { width: "1080", height: "1920", fill: background }), children] }));
exports.Canvas = Canvas;
/**
 * A camera move applied to a group.
 *
 * Rather than moving the plate, we move and scale the whole group about the
 * frame centre — which is what a real dolly-in does, and it means the grain
 * and vignette move with the picture instead of sitting on top of it.
 */
const CameraGroup = ({ zoom = 1, x = 0, y = 0, rotate = 0, cx = 540, cy = 960, children, opacity = 1 }) => ((0, jsx_runtime_1.jsx)("g", { opacity: opacity, transform: `translate(${cx + x} ${cy + y}) rotate(${rotate}) scale(${zoom}) translate(${-cx} ${-cy})`, children: children }));
exports.CameraGroup = CameraGroup;
