"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CaptionCard = exports.TrackedLabel = exports.HeadlineLockup = exports.MaskedLine = exports.tracking = void 0;
const jsx_runtime_1 = require("react/jsx-runtime");
const brand_1 = require("../config/brand");
const animate_1 = require("../lib/animate");
/** Letter-spacing given in em, converted to the px SVG actually wants. */
const tracking = (fontSize, em) => fontSize * em;
exports.tracking = tracking;
/**
 * A line that rises out from behind a mask.
 *
 * `reveal` is 0–1: at 0 the line is fully below the mask, at 1 it sits on its
 * baseline. The mask is per-line, so multi-line headings reveal line by line
 * instead of all at once.
 */
const MaskedLine = ({ id, children, x, y, fontSize, font = brand_1.TYPE.displayUltra, fill = brand_1.BRAND.white, italic = false, letterSpacing = 0, reveal, opacity = 1, anchor = "start", }) => {
    const r = Math.max(0, Math.min(1, reveal));
    // The line travels a bit more than its own cap height so the top of the
    // mask is cleared even for letters with tall ascenders.
    const lift = (1 - r) * fontSize * 1.28;
    const maskH = fontSize * 1.42;
    // Clipping rectangles cannot live inside <defs> and be reused per anchor,
    // so each line owns its own.
    const clipX = anchor === "middle" ? -540 : 0;
    return ((0, jsx_runtime_1.jsxs)(jsx_runtime_1.Fragment, { children: [(0, jsx_runtime_1.jsx)("defs", { children: (0, jsx_runtime_1.jsx)("clipPath", { id: `mask-${id}`, children: (0, jsx_runtime_1.jsx)("rect", { x: x + clipX, y: y - maskH + fontSize * 0.32, width: 1080, height: maskH }) }) }), (0, jsx_runtime_1.jsx)("g", { clipPath: `url(#mask-${id})`, children: (0, jsx_runtime_1.jsx)("text", { x: x, y: y + lift, fontFamily: font, fontSize: fontSize, fill: fill, letterSpacing: letterSpacing, textAnchor: anchor, fontStyle: italic ? "italic" : "normal", opacity: opacity, children: children }) })] }));
};
exports.MaskedLine = MaskedLine;
/**
 * The campaign headline lockup.
 *
 * Two lines, revealed in sequence: a light sans statement, then an italic
 * serif clause one beat later. The mix is the campaign's signature — the sans
 * states, the serif confides.
 */
const HeadlineLockup = ({ id, line1, line2, x, y, fontSize = 96, frame, start, stagger = 7, opacity = 1, anchor = "start", fill = brand_1.BRAND.white, }) => {
    const d = 26;
    const r1 = (0, animate_1.interpolate)(frame, [start, start + d], [0, 1], {
        easing: animate_1.Easing.drape,
    });
    const r2 = (0, animate_1.interpolate)(frame, [start + stagger, start + stagger + d], [0, 1], {
        easing: animate_1.Easing.drape,
    });
    const lineHeight = fontSize * 1.06;
    return ((0, jsx_runtime_1.jsxs)("g", { opacity: opacity, children: [(0, jsx_runtime_1.jsx)(exports.MaskedLine, { id: `${id}-a`, x: x, y: y, fontSize: fontSize, font: brand_1.TYPE.displayUltra, fill: fill, reveal: r1, anchor: anchor, letterSpacing: (0, exports.tracking)(fontSize, -0.018), children: line1 }), line2 ? ((0, jsx_runtime_1.jsx)(exports.MaskedLine, { id: `${id}-b`, x: x, y: y + lineHeight, fontSize: fontSize, font: brand_1.TYPE.serifLight, fill: fill, italic: true, reveal: r2, anchor: anchor, letterSpacing: (0, exports.tracking)(fontSize, -0.004), children: line2 })) : null] }));
};
exports.HeadlineLockup = HeadlineLockup;
/**
 * Tabular eyebrow — the collection name, scene label or CTA.
 *
 * Enters from a slightly wider track and settles. Deliberately quiet: it is
 * the least animated element on screen and that restraint is the point.
 */
const TrackedLabel = ({ children, x, y, frame, start, duration = 22, fontSize = 24, trackingEm = 0.34, fill = brand_1.BRAND.white, opacity = 1, anchor = "start", }) => {
    const p = (0, animate_1.interpolate)(frame, [start, start + duration], [0, 1], {
        easing: animate_1.Easing.out,
    });
    return ((0, jsx_runtime_1.jsx)("text", { x: x, y: y, fontFamily: brand_1.TYPE.displayMedium, fontSize: fontSize, fill: fill, textAnchor: anchor, opacity: p * opacity, letterSpacing: (0, exports.tracking)(fontSize, trackingEm + (1 - p) * 0.14), children: children }));
};
exports.TrackedLabel = TrackedLabel;
/**
 * A caption card: the two-line lockup plus its red rule, faded as a unit.
 *
 * Scenes use this so every card in the reel shares one entrance, one exit and
 * one vertical rhythm.
 */
const CaptionCard = ({ id, line1, line2, x, y, fontSize = 92, frame, inStart, outDur = 16, outStart, ruleWidth = 132, anchor = "start", }) => {
    const envelope = (0, animate_1.fade)(frame, inStart, 4, outStart, outDur, animate_1.Easing.linear);
    const ruleP = (0, animate_1.interpolate)(frame, [inStart, inStart + 20], [0, 1], {
        easing: animate_1.Easing.out,
    });
    const ruleX = anchor === "middle" ? x - ruleWidth / 2 : x;
    return ((0, jsx_runtime_1.jsxs)("g", { opacity: envelope, children: [(0, jsx_runtime_1.jsxs)("linearGradient", { id: `${id}-rule`, x1: "0", y1: "0", x2: "1", y2: "0", children: [(0, jsx_runtime_1.jsx)("stop", { offset: "0", stopColor: brand_1.BRAND.red, stopOpacity: "1" }), (0, jsx_runtime_1.jsx)("stop", { offset: "0.78", stopColor: brand_1.BRAND.red, stopOpacity: "1" }), (0, jsx_runtime_1.jsx)("stop", { offset: "1", stopColor: brand_1.BRAND.red, stopOpacity: "0" })] }), (0, jsx_runtime_1.jsx)("rect", { x: ruleX, y: y - fontSize - 46, width: ruleWidth * ruleP, height: 2, fill: `url(#${id}-rule)` }), (0, jsx_runtime_1.jsx)(exports.HeadlineLockup, { id: id, line1: line1, line2: line2, x: x, y: y, fontSize: fontSize, frame: frame, start: inStart + 4, anchor: anchor, opacity: 1 })] }));
};
exports.CaptionCard = CaptionCard;
