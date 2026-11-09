"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Reveal = void 0;
const jsx_runtime_1 = require("react/jsx-runtime");
const brand_1 = require("../config/brand");
const animate_1 = require("../lib/animate");
const composition_1 = require("../lib/composition");
const CinematicText_1 = require("../components/CinematicText");
const primitives_1 = require("../components/primitives");
/** Hero plate is 1206×763; at full bleed it is 683 tall. */
const BAND_W = 1080;
const BAND_H = 683;
const BAND_Y = 800;
const Reveal = ({ publicDir, line1, line2, fps = 30 }) => {
    const frame = (0, composition_1.useCurrentFrame)();
    const total = 6 * fps; // 180
    const outStart = total - 20;
    // Opens tight on the man, pulls back over the whole hold — one continuous
    // move, no second beat. This is the "slow cinematic camera motion".
    const pull = (0, animate_1.interpolate)(frame, [0, total], [1.16, 1.0], {
        easing: animate_1.Easing.drape,
    });
    const rise = (0, animate_1.interpolate)(frame, [0, total], [26, -8], {
        easing: animate_1.Easing.cosine,
    });
    // A very slow lateral drift, opposite the pull, to add parallax life.
    const drift = (0, animate_1.interpolate)(frame, [0, total], [-16, 14], {
        easing: animate_1.Easing.cosine,
    });
    const bandIn = (0, animate_1.interpolate)(frame, [0, 18], [0, 1], { easing: animate_1.Easing.out });
    const body = (0, animate_1.fade)(frame, 0, 3, outStart, 20, animate_1.Easing.linear);
    return ((0, jsx_runtime_1.jsxs)(primitives_1.Canvas, { name: "reveal", background: brand_1.BRAND.ink, children: [(0, jsx_runtime_1.jsxs)("defs", { children: [(0, jsx_runtime_1.jsxs)("linearGradient", { id: "rv-edge", x1: "0", y1: "0", x2: "0", y2: "1", children: [(0, jsx_runtime_1.jsx)("stop", { offset: "0", stopColor: brand_1.BRAND.ink, stopOpacity: "0.98" }), (0, jsx_runtime_1.jsx)("stop", { offset: "0.11", stopColor: brand_1.BRAND.ink, stopOpacity: "0.15" }), (0, jsx_runtime_1.jsx)("stop", { offset: "0.86", stopColor: brand_1.BRAND.ink, stopOpacity: "0.05" }), (0, jsx_runtime_1.jsx)("stop", { offset: "1", stopColor: brand_1.BRAND.ink, stopOpacity: "1" })] }), (0, jsx_runtime_1.jsxs)("radialGradient", { id: "rv-vig", cx: "0.5", cy: "0.5", r: "0.74", children: [(0, jsx_runtime_1.jsx)("stop", { offset: "0.4", stopColor: brand_1.BRAND.ink, stopOpacity: "0" }), (0, jsx_runtime_1.jsx)("stop", { offset: "1", stopColor: brand_1.BRAND.ink, stopOpacity: "0.78" })] }), (0, jsx_runtime_1.jsxs)("linearGradient", { id: "rv-rule", x1: "0", y1: "0", x2: "1", y2: "0", children: [(0, jsx_runtime_1.jsx)("stop", { offset: "0", stopColor: brand_1.BRAND.red, stopOpacity: "1" }), (0, jsx_runtime_1.jsx)("stop", { offset: "0.82", stopColor: brand_1.BRAND.red, stopOpacity: "1" }), (0, jsx_runtime_1.jsx)("stop", { offset: "1", stopColor: brand_1.BRAND.red, stopOpacity: "0" })] })] }), (0, jsx_runtime_1.jsxs)("g", { opacity: body, children: [(0, jsx_runtime_1.jsxs)("g", { opacity: bandIn, children: [(0, jsx_runtime_1.jsx)(primitives_1.CameraGroup, { zoom: pull, y: rise, x: drift, children: (0, jsx_runtime_1.jsx)(primitives_1.Plate, { src: "images/rv-plate.png", publicDir: publicDir, x: 0, y: BAND_Y, width: BAND_W, height: BAND_H }) }), (0, jsx_runtime_1.jsx)("rect", { x: 0, y: BAND_Y, width: BAND_W, height: BAND_H, fill: "url(#rv-vig)" }), (0, jsx_runtime_1.jsx)("rect", { x: 0, y: BAND_Y, width: BAND_W, height: BAND_H, fill: "url(#rv-edge)" })] }), (0, jsx_runtime_1.jsx)("rect", { x: brand_1.SAFE.inset, y: BAND_Y - 46, width: brand_1.SAFE.inset > 0 ? 152 * (0, animate_1.interpolate)(frame, [24, 52], [0, 1], { easing: animate_1.Easing.out }) : 0, height: 2, fill: "url(#rv-rule)" }), (0, jsx_runtime_1.jsx)(CinematicText_1.TrackedLabel, { x: brand_1.SAFE.inset, y: 300, frame: frame, start: 10, fontSize: 22, trackingEm: 0.4, opacity: 0.62, children: "COLLECTION C\u00C9R\u00C9MONIE" }), (0, jsx_runtime_1.jsx)(CinematicText_1.HeadlineLockup, { id: "rv", line1: line1, line2: line2, x: brand_1.SAFE.inset, y: 472, fontSize: 100, frame: frame, start: 18, stagger: 8, opacity: (0, animate_1.interpolate)(frame, [0, 1], [0, 1]) }), (0, jsx_runtime_1.jsx)("text", { x: brand_1.SAFE.inset, y: 622, fontFamily: "Noto Serif Light", fontStyle: "italic", fontSize: 32, fill: brand_1.BRAND.white, fillOpacity: 0.72, opacity: (0, animate_1.interpolate)(frame, [42, 66], [0, 1], { easing: animate_1.Easing.out }), children: "Soyez le protagoniste de votre \u00E9v\u00E9nement." }), (0, jsx_runtime_1.jsx)("text", { x: brand_1.SAFE.inset, y: brand_1.SAFE.bottom, fontFamily: "Inter Display Light", fontSize: 19, fill: brand_1.BRAND.white, letterSpacing: 3.2, opacity: 0.5 * (0, animate_1.interpolate)(frame, [30, 50], [0, 1], { easing: animate_1.Easing.out }), children: "04 \u2014 THE REVEAL" }), (0, jsx_runtime_1.jsx)(primitives_1.Grain, { id: "rv-grain", frame: frame, opacity: 0.048 })] })] }));
};
exports.Reveal = Reveal;
