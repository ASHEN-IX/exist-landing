"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Invitation = void 0;
const jsx_runtime_1 = require("react/jsx-runtime");
const brand_1 = require("../config/brand");
const animate_1 = require("../lib/animate");
const composition_1 = require("../lib/composition");
const CinematicText_1 = require("../components/CinematicText");
const primitives_1 = require("../components/primitives");
/** Source is 1206×763; at full frame width the band is 683 tall. */
const BAND_W = 1080;
const BAND_H = 683;
const BAND_Y = 742;
const Invitation = ({ publicDir, line1, line2, fps = 30, }) => {
    const frame = (0, composition_1.useCurrentFrame)();
    // A 4 s scene: 120 frames. Exit begins 18 frames before the cut.
    const outStart = 4 * fps - 18;
    // Slow dolly push with a whisper of upward drift — cosine so it starts and
    // ends at zero velocity and reads as a camera, not an animation.
    const push = (0, animate_1.interpolate)(frame, [0, 4 * fps], [1.0, 1.075], {
        easing: animate_1.Easing.cosine,
    });
    const drift = (0, animate_1.interpolate)(frame, [0, 4 * fps], [0, -14], {
        easing: animate_1.Easing.cosine,
    });
    // The picture arrives just behind the black, so the first frame is not empty.
    const bandIn = (0, animate_1.interpolate)(frame, [0, 22], [0, 1], { easing: animate_1.Easing.out });
    // A red hairline that draws itself above the caption — the scene's one accent.
    const ruleP = (0, animate_1.interpolate)(frame, [2, 30], [0, 1], { easing: animate_1.Easing.out });
    const exit = (0, animate_1.fade)(frame, 0, 1, outStart, 18, animate_1.Easing.in);
    return ((0, jsx_runtime_1.jsxs)(primitives_1.Canvas, { name: "invitation", children: [(0, jsx_runtime_1.jsxs)("defs", { children: [(0, jsx_runtime_1.jsxs)("radialGradient", { id: "inv-vig", cx: "0.5", cy: "0.42", r: "0.78", children: [(0, jsx_runtime_1.jsx)("stop", { offset: "0.34", stopColor: brand_1.BRAND.ink, stopOpacity: "0" }), (0, jsx_runtime_1.jsx)("stop", { offset: "1", stopColor: brand_1.BRAND.ink, stopOpacity: "0.86" })] }), (0, jsx_runtime_1.jsxs)("linearGradient", { id: "inv-edge", x1: "0", y1: "0", x2: "0", y2: "1", children: [(0, jsx_runtime_1.jsx)("stop", { offset: "0", stopColor: brand_1.BRAND.ink, stopOpacity: "0.95" }), (0, jsx_runtime_1.jsx)("stop", { offset: "0.16", stopColor: brand_1.BRAND.ink, stopOpacity: "0" }), (0, jsx_runtime_1.jsx)("stop", { offset: "0.84", stopColor: brand_1.BRAND.ink, stopOpacity: "0" }), (0, jsx_runtime_1.jsx)("stop", { offset: "1", stopColor: brand_1.BRAND.ink, stopOpacity: "0.98" })] }), (0, jsx_runtime_1.jsxs)("linearGradient", { id: "inv-rule", x1: "0", y1: "0", x2: "1", y2: "0", children: [(0, jsx_runtime_1.jsx)("stop", { offset: "0", stopColor: brand_1.BRAND.red, stopOpacity: "1" }), (0, jsx_runtime_1.jsx)("stop", { offset: "0.8", stopColor: brand_1.BRAND.red, stopOpacity: "0.95" }), (0, jsx_runtime_1.jsx)("stop", { offset: "1", stopColor: brand_1.BRAND.red, stopOpacity: "0" })] })] }), (0, jsx_runtime_1.jsxs)("g", { opacity: exit, children: [(0, jsx_runtime_1.jsxs)("g", { opacity: bandIn, children: [(0, jsx_runtime_1.jsx)(primitives_1.CameraGroup, { zoom: push, y: drift, children: (0, jsx_runtime_1.jsx)(primitives_1.Plate, { src: "images/rv-plate.png", publicDir: publicDir, x: (BAND_W - BAND_W * 1) / 2, y: BAND_Y, width: BAND_W, height: BAND_H }) }), (0, jsx_runtime_1.jsx)("rect", { x: 0, y: BAND_Y, width: BAND_W, height: BAND_H, fill: "url(#inv-vig)" }), (0, jsx_runtime_1.jsx)("rect", { x: 0, y: BAND_Y, width: BAND_W, height: BAND_H, fill: "url(#inv-edge)" })] }), (0, jsx_runtime_1.jsx)(CinematicText_1.TrackedLabel, { x: brand_1.SAFE.inset, y: 352, frame: frame, start: 6, fontSize: 22, trackingEm: 0.4, fill: brand_1.BRAND.white, opacity: 0.66, children: "COLLECTION C\u00C9R\u00C9MONIE" }), (0, jsx_runtime_1.jsx)("rect", { x: brand_1.SAFE.inset, y: 392, width: 190 * ruleP, height: 2, fill: "url(#inv-rule)" }), (0, jsx_runtime_1.jsx)(CinematicText_1.CaptionCard, { id: "inv", line1: line1, line2: line2, x: brand_1.SAFE.inset, y: 626, fontSize: 94, frame: frame, inStart: 14, outStart: outStart, outDur: 16, ruleWidth: 0 }), (0, jsx_runtime_1.jsxs)("g", { opacity: (0, animate_1.interpolate)(frame, [26, 46], [0, 1], { easing: animate_1.Easing.out }) * 0.5, children: [(0, jsx_runtime_1.jsx)("text", { x: brand_1.SAFE.inset, y: brand_1.SAFE.bottom, fontFamily: "Inter Display Medium", fontSize: 19, fill: brand_1.BRAND.white, letterSpacing: 3.2, children: "01" }), (0, jsx_runtime_1.jsx)("text", { x: brand_1.SAFE.inset + 46, y: brand_1.SAFE.bottom, fontFamily: "Inter Display Light", fontSize: 19, fill: brand_1.BRAND.white, letterSpacing: 3.2, children: "\u2014 THE INVITATION" })] }), (0, jsx_runtime_1.jsx)(primitives_1.Grain, { id: "inv-grain", frame: frame, opacity: 0.05 })] })] }));
};
exports.Invitation = Invitation;
