"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Details = exports.DETAIL_SHOTS = void 0;
const jsx_runtime_1 = require("react/jsx-runtime");
const brand_1 = require("../config/brand");
const animate_1 = require("../lib/animate");
const composition_1 = require("../lib/composition");
const CinematicText_1 = require("../components/CinematicText");
const ShotSequence_1 = require("../components/ShotSequence");
const primitives_1 = require("../components/primitives");
/**
 * The shot list.
 *
 * 5 s at 30 fps = 150 frames. The grid is 18/30/24/30/24/24 so the cuts land
 * on a 150 BPM-equivalent pulse rather than on arbitrary frames.
 */
exports.DETAIL_SHOTS = [
    // 1 — woven wool. Full-bleed band, upper third: sets material and scale.
    {
        src: "images/fb-weave.png",
        frames: 28,
        layout: { x: 0, y: 190, width: 1080, height: 1010 },
        zoom: [1.06, 1.16],
        pan: [-34, 28],
        roll: -0.45,
    },
    // 2 — the tie. Contained panel, low and wide: the "getting dressed" beat.
    {
        src: "images/fb-tie.png",
        frames: 30,
        layout: { x: 96, y: 640, width: 888, height: 578, panel: true },
        zoom: [1.14, 1.04],
        pan: [22, -14],
        flare: 0.45,
    },
    // 3 — cufflink. Wide band, upper frame; the bright accent of the section.
    {
        src: "images/fb-cufflink.png",
        frames: 30,
        layout: { x: 0, y: 300, width: 1080, height: 786 },
        zoom: [1.05, 1.18],
        pan: [-24, 18],
        flare: 0.35,
    },
    // 4 — waistcoat button row. Full-bleed, low, heavy — lands on the last beat.
    {
        src: "images/fb-buttons.png",
        frames: 32,
        layout: { x: 0, y: 640, width: 1080, height: 851 },
        zoom: [1.08, 1.20],
        pan: [26, -22],
        roll: 0.5,
    },
    // 5 — the suit body: the breath before the impact.
    {
        src: "images/fb-suit.png",
        frames: 30,
        layout: { x: 0, y: 0, width: 1080, height: 1920 },
        zoom: [1.02, 1.10],
        pan: [-12, 8],
    },
];
const Details = ({ publicDir, fps = 30, caption = "Chaque détail", caption2, }) => {
    const frame = (0, composition_1.useCurrentFrame)();
    const total = (0, ShotSequence_1.shotsDuration)(exports.DETAIL_SHOTS);
    const outStart = total - 14;
    // Section-level fade so the hard cuts sit inside a soft envelope.
    const body = (0, animate_1.fade)(frame, 0, 5, outStart, 14, animate_1.Easing.linear);
    // The red rule draws under the label.
    const ruleP = (0, animate_1.interpolate)(frame, [46, 74], [0, 1], { easing: animate_1.Easing.out });
    return ((0, jsx_runtime_1.jsx)(primitives_1.Canvas, { name: "details", background: brand_1.BRAND.ink, children: (0, jsx_runtime_1.jsxs)("g", { opacity: body, children: [(0, jsx_runtime_1.jsx)(ShotSequence_1.ShotSequence, { shots: exports.DETAIL_SHOTS, local: frame, publicDir: publicDir, whip: 4 }), (0, jsx_runtime_1.jsxs)("linearGradient", { id: "det-scrim", x1: "0", y1: "0", x2: "0", y2: "1", children: [(0, jsx_runtime_1.jsx)("stop", { offset: "0", stopColor: brand_1.BRAND.ink, stopOpacity: "0" }), (0, jsx_runtime_1.jsx)("stop", { offset: "0.55", stopColor: brand_1.BRAND.ink, stopOpacity: "0.72" }), (0, jsx_runtime_1.jsx)("stop", { offset: "1", stopColor: brand_1.BRAND.ink, stopOpacity: "0.96" })] }), (0, jsx_runtime_1.jsx)("rect", { x: 0, y: 1180, width: 1080, height: 740, fill: "url(#det-scrim)", opacity: (0, animate_1.interpolate)(frame, [30, 52], [0, 1], { easing: animate_1.Easing.out }) }), (0, jsx_runtime_1.jsxs)("g", { opacity: (0, animate_1.interpolate)(frame, [54, 76], [0, 1], { easing: animate_1.Easing.out }), children: [(0, jsx_runtime_1.jsx)("rect", { x: brand_1.SAFE.inset, y: 1298, width: 150 * ruleP, height: 2, fill: "url(#det-rule)" }), (0, jsx_runtime_1.jsx)(CinematicText_1.TrackedLabel, { x: brand_1.SAFE.inset, y: 1382, frame: frame, start: 58, fontSize: 22, trackingEm: 0.4, opacity: 0.6, children: caption.toUpperCase() }), caption2 ? ((0, jsx_runtime_1.jsx)("text", { x: brand_1.SAFE.inset, y: 1442, fontFamily: "Noto Serif Light", fontStyle: "italic", fontSize: 40, fill: brand_1.BRAND.white, opacity: (0, animate_1.interpolate)(frame, [66, 88], [0, 1], { easing: animate_1.Easing.out }), children: caption2 })) : null] }), (0, jsx_runtime_1.jsx)("defs", { children: (0, jsx_runtime_1.jsxs)("linearGradient", { id: "det-rule", x1: "0", y1: "0", x2: "1", y2: "0", children: [(0, jsx_runtime_1.jsx)("stop", { offset: "0", stopColor: brand_1.BRAND.red, stopOpacity: "1" }), (0, jsx_runtime_1.jsx)("stop", { offset: "0.8", stopColor: brand_1.BRAND.red, stopOpacity: "1" }), (0, jsx_runtime_1.jsx)("stop", { offset: "1", stopColor: brand_1.BRAND.red, stopOpacity: "0" })] }) }), (0, jsx_runtime_1.jsx)("text", { x: brand_1.SAFE.inset, y: brand_1.SAFE.bottom, fontFamily: "Inter Display Light", fontSize: 19, fill: brand_1.BRAND.white, letterSpacing: 3.2, opacity: 0.5 * (0, animate_1.interpolate)(frame, [40, 60], [0, 1], { easing: animate_1.Easing.out }), children: "02 \u2014 THE DETAILS" }), (0, jsx_runtime_1.jsx)(primitives_1.Grain, { id: "det-grain", frame: frame, opacity: 0.045 })] }) }));
};
exports.Details = Details;
