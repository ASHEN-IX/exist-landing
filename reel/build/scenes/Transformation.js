"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Transformation = void 0;
const jsx_runtime_1 = require("react/jsx-runtime");
const brand_1 = require("../config/brand");
const timeline_1 = require("../config/timeline");
const animate_1 = require("../lib/animate");
const composition_1 = require("../lib/composition");
const CinematicText_1 = require("../components/CinematicText");
const primitives_1 = require("../components/primitives");
/** Frames from scene start to the impact cut. */
const CUT = Math.round((timeline_1.CUES.impact - 9) * 30); // 71 frames into the scene
const TOTAL = 150;
const Transformation = ({ publicDir, line1, line2, fps = 30 }) => {
    const frame = (0, composition_1.useCurrentFrame)();
    const isBefore = frame < CUT;
    const tBefore = Math.max(0, Math.min(1, frame / CUT));
    const tAfter = Math.max(0, Math.min(1, (frame - CUT) / (TOTAL - CUT)));
    // ── A. the approach ─────────────────────────────────────────────
    // The button-row macro pushes in hard, accelerating into the cut so the
    // fabric appears to be rushing at the lens.
    const aZoom = (0, animate_1.interpolate)(tBefore, [0, 1], [1.06, 1.62], { easing: animate_1.Easing.in });
    const aPan = (0, animate_1.interpolate)(tBefore, [0, 1], [34, -18], { easing: animate_1.Easing.in });
    const aLift = (0, animate_1.interpolate)(tBefore, [0, 1], [10, -34], { easing: animate_1.Easing.in });
    // A touch of smear as it accelerates — the shutter is open.
    const aBlur = (0, animate_1.interpolate)(tBefore, [0.72, 1], [0, 1], { easing: animate_1.Easing.in });
    // ── B/C. the suit ───────────────────────────────────────────────
    // Opens tight on the fabric, then pulls back to read the whole garment.
    const bZoom = (0, animate_1.interpolate)(tAfter, [0, 1], [1.34, 1.0], { easing: animate_1.Easing.drape });
    const bLift = (0, animate_1.interpolate)(tAfter, [0, 1], [-40, 0], { easing: animate_1.Easing.drape });
    // ── the impact ──────────────────────────────────────────────────
    // A single white flash and a bright bloom on the cut. Short — two frames of
    // exposure and a falloff. Longer than that looks like a transition effect.
    const sinceCut = frame - CUT;
    const flash = (0, animate_1.interpolate)(sinceCut, [0, 2, 12], [0, 0.42, 0], {
        easing: animate_1.Easing.out,
    });
    const bloom = (0, animate_1.interpolate)(sinceCut, [0, 1, 20], [0, 0.5, 0], {
        easing: animate_1.Easing.out,
    });
    const outStart = TOTAL - 16;
    const body = (0, animate_1.fade)(frame, 0, 4, outStart, 16, animate_1.Easing.linear);
    return ((0, jsx_runtime_1.jsxs)(primitives_1.Canvas, { name: "transformation", background: brand_1.BRAND.ink, children: [(0, jsx_runtime_1.jsxs)("defs", { children: [(0, jsx_runtime_1.jsxs)("radialGradient", { id: "tr-bloom", cx: "0.5", cy: "0.5", r: "0.62", children: [(0, jsx_runtime_1.jsx)("stop", { offset: "0", stopColor: brand_1.BRAND.red, stopOpacity: "0.85" }), (0, jsx_runtime_1.jsx)("stop", { offset: "0.55", stopColor: brand_1.BRAND.red, stopOpacity: "0.22" }), (0, jsx_runtime_1.jsx)("stop", { offset: "1", stopColor: brand_1.BRAND.red, stopOpacity: "0" })] }), (0, jsx_runtime_1.jsxs)("linearGradient", { id: "tr-scrim", x1: "0", y1: "0", x2: "0", y2: "1", children: [(0, jsx_runtime_1.jsx)("stop", { offset: "0", stopColor: brand_1.BRAND.ink, stopOpacity: "0.92" }), (0, jsx_runtime_1.jsx)("stop", { offset: "0.34", stopColor: brand_1.BRAND.ink, stopOpacity: "0" }), (0, jsx_runtime_1.jsx)("stop", { offset: "0.68", stopColor: brand_1.BRAND.ink, stopOpacity: "0" }), (0, jsx_runtime_1.jsx)("stop", { offset: "1", stopColor: brand_1.BRAND.ink, stopOpacity: "0.96" })] })] }), (0, jsx_runtime_1.jsxs)("g", { opacity: body, children: [isBefore ? ((0, jsx_runtime_1.jsxs)(jsx_runtime_1.Fragment, { children: [(0, jsx_runtime_1.jsx)(primitives_1.CameraGroup, { zoom: aZoom * (1 + aBlur * 0.05), x: aPan, y: aLift, children: (0, jsx_runtime_1.jsx)(primitives_1.Plate, { src: "images/fb-buttons.png", publicDir: publicDir, x: 0, y: 260, width: 1080, height: 1920 }) }), (0, jsx_runtime_1.jsx)("rect", { width: 1080, height: 1920, fill: "url(#tr-scrim)" })] })) : ((0, jsx_runtime_1.jsxs)(jsx_runtime_1.Fragment, { children: [(0, jsx_runtime_1.jsx)(primitives_1.CameraGroup, { zoom: bZoom, y: bLift, children: (0, jsx_runtime_1.jsx)(primitives_1.Plate, { src: "images/sp-suit.png", publicDir: publicDir, x: 0, y: 0, width: 1080, height: 1920 }) }), bloom > 0.001 ? ((0, jsx_runtime_1.jsx)("rect", { width: 1080, height: 1920, fill: "url(#tr-bloom)", opacity: bloom })) : null, (0, jsx_runtime_1.jsx)("rect", { width: 1080, height: 1920, fill: "url(#tr-scrim)" })] })), flash > 0.001 ? ((0, jsx_runtime_1.jsx)("rect", { width: 1080, height: 1920, fill: brand_1.BRAND.white, opacity: flash })) : null, (0, jsx_runtime_1.jsx)(CinematicText_1.CaptionCard, { id: "tr", line1: line1, line2: line2, x: brand_1.SAFE.inset, y: 1226, fontSize: 86, frame: frame, inStart: CUT + 30, outStart: outStart, outDur: 16, ruleWidth: 118 }), (0, jsx_runtime_1.jsx)("text", { x: brand_1.SAFE.inset, y: brand_1.SAFE.bottom, fontFamily: "Inter Display Light", fontSize: 19, fill: brand_1.BRAND.white, letterSpacing: 3.2, opacity: 0.5 * (0, animate_1.interpolate)(frame, [CUT + 10, CUT + 30], [0, 1], { easing: animate_1.Easing.out }), children: "03 \u2014 THE TRANSFORMATION" }), (0, jsx_runtime_1.jsx)(primitives_1.Grain, { id: "tr-grain", frame: frame, opacity: 0.05 })] })] }));
};
exports.Transformation = Transformation;
