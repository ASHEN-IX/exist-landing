"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BrandEndCard = exports.BrandLogo = void 0;
const jsx_runtime_1 = require("react/jsx-runtime");
const brand_1 = require("../config/brand");
const animate_1 = require("../lib/animate");
const LOGO_ASPECT = 35 / 167;
const BrandLogo = ({ id, publicDir, x, y, width, opacity = 1, frame, start = 0, duration = 24, settle = true, }) => {
    const height = width * LOGO_ASPECT;
    const p = frame === undefined
        ? 1
        : (0, animate_1.interpolate)(frame, [start, start + duration], [0, 1], {
            easing: animate_1.Easing.out,
        });
    // A 1.5% scale settle. Enough to feel alive, not enough to blur the mark.
    const scale = settle ? 1 + (1 - p) * 0.015 : 1;
    const cx = x + width / 2;
    const cy = y + height / 2;
    return ((0, jsx_runtime_1.jsx)("g", { opacity: opacity * p, transform: `translate(${cx} ${cy}) scale(${scale}) translate(${-cx} ${-cy})`, children: (0, jsx_runtime_1.jsx)("image", { id: id, href: publicDir ? `${publicDir}/brand/exist-logo-light.png` : "brand/exist-logo-light.png", x: x, y: y, width: width, height: height, preserveAspectRatio: "xMidYMid meet", style: { imageRendering: "auto" } }) }));
};
exports.BrandLogo = BrandLogo;
/**
 * The full brand lockup for the outro: logo, red rule, message, CTA.
 *
 * Kept in one component so both the 25 s master and the 15 s cutdown end on
 * a pixel-identical card.
 */
const BrandEndCard = ({ publicDir, frame, duration, url, message1, message2, cta, footnote }) => {
    // Timing is expressed as fractions of the card so the 25 s outro and the
    // re-cut 15 s outro share one rhythm instead of drifting apart.
    const logoStart = Math.round(duration * 0.10);
    const msgStart = Math.round(duration * 0.30);
    const ctaStart = Math.round(duration * 0.52);
    const step = (n) => Math.round(duration * n);
    const ruleP = (0, animate_1.interpolate)(frame, [step(0.24), step(0.24) + 22], [0, 1], {
        easing: animate_1.Easing.out,
    });
    const ctaP = (0, animate_1.interpolate)(frame, [ctaStart, ctaStart + 20], [0, 1], {
        easing: animate_1.Easing.out,
    });
    return ((0, jsx_runtime_1.jsxs)("g", { children: [(0, jsx_runtime_1.jsx)("ellipse", { cx: 540, cy: 878, rx: 340, ry: 215, fill: "url(#end-bloom)", opacity: (0, animate_1.interpolate)(frame, [0, 24], [0, 1], { easing: animate_1.Easing.out }) }), (0, jsx_runtime_1.jsx)(exports.BrandLogo, { id: "end-logo", publicDir: publicDir, x: 540 - 230, y: 826, width: 460, frame: frame, start: logoStart, duration: 26 }), (0, jsx_runtime_1.jsx)("rect", { x: 540 - 60, y: 938, width: 120 * ruleP, height: 2, fill: "url(#end-rule)" }), (0, jsx_runtime_1.jsx)("text", { x: 540, y: 1054, fontFamily: brand_1.TYPE.displayUltra, fontSize: 46, fill: brand_1.BRAND.white, textAnchor: "middle", opacity: (0, animate_1.interpolate)(frame, [msgStart, msgStart + 26], [0, 1], {
                    easing: animate_1.Easing.out,
                }), children: message1 }), (0, jsx_runtime_1.jsx)("text", { x: 540, y: 1114, fontFamily: brand_1.TYPE.serifLight, fontSize: 46, fontStyle: "italic", fill: brand_1.BRAND.white, textAnchor: "middle", opacity: (0, animate_1.interpolate)(frame, [msgStart + 8, msgStart + 34], [0, 1], {
                    easing: animate_1.Easing.out,
                }), children: message2 }), (0, jsx_runtime_1.jsxs)("g", { opacity: ctaP, children: [(0, jsx_runtime_1.jsx)("rect", { x: 540 - 222, y: 1200, width: 444, height: 84, fill: "none", stroke: brand_1.BRAND.white, strokeOpacity: 0.42, strokeWidth: 1.5 }), (0, jsx_runtime_1.jsx)("text", { x: 540, y: 1254, fontFamily: brand_1.TYPE.displayMedium, fontSize: 24, fill: brand_1.BRAND.white, textAnchor: "middle", letterSpacing: 2.2, children: cta.toUpperCase() })] }), (0, jsx_runtime_1.jsx)("text", { x: 540, y: 1352, fontFamily: brand_1.TYPE.displayLight, fontSize: 23, fill: brand_1.BRAND.white, fillOpacity: 0.52, textAnchor: "middle", letterSpacing: 1.6, opacity: (0, animate_1.interpolate)(frame, [ctaStart + 10, ctaStart + 30], [0, 1], {
                    easing: animate_1.Easing.out,
                }), children: url }), footnote ? ((0, jsx_runtime_1.jsx)("text", { x: 540, y: brand_1.SAFE.bottom, fontFamily: brand_1.TYPE.displayLight, fontSize: 17, fill: brand_1.BRAND.white, fillOpacity: 0.3, textAnchor: "middle", letterSpacing: 1.2, opacity: (0, animate_1.interpolate)(frame, [ctaStart + 18, ctaStart + 38], [0, 1], {
                    easing: animate_1.Easing.out,
                }), children: footnote })) : null] }));
};
exports.BrandEndCard = BrandEndCard;
