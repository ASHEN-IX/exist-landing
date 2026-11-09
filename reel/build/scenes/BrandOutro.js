"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BrandOutro = void 0;
const jsx_runtime_1 = require("react/jsx-runtime");
const brand_1 = require("../config/brand");
const animate_1 = require("../lib/animate");
const composition_1 = require("../lib/composition");
const BrandLogo_1 = require("../components/BrandLogo");
const primitives_1 = require("../components/primitives");
const BrandOutro = ({ publicDir, fps = 30, message1, message2, cta, url, footnote, durationInFrames = 150, }) => {
    const frame = (0, composition_1.useCurrentFrame)();
    // The previous scene's picture is still falling away as this one opens:
    // a black wash that resolves over the first half-second so the cut to the
    // card feels like the image settling, not like a new slide.
    const settle = (0, animate_1.interpolate)(frame, [0, 16], [0.55, 0], { easing: animate_1.Easing.out });
    // A very slow red bloom pulse under the logo — reads as the sting ringing
    // out rather than as an animated graphic.
    const pulse = (0, animate_1.interpolate)(frame, [18, 46, 110, 150], [0, 0.62, 0.5, 0.44], {
        easing: animate_1.Easing.cosine,
    });
    return ((0, jsx_runtime_1.jsxs)(primitives_1.Canvas, { name: "brand", background: brand_1.BRAND.black, children: [(0, jsx_runtime_1.jsxs)("defs", { children: [(0, jsx_runtime_1.jsxs)("radialGradient", { id: "end-bloom", cx: "0.5", cy: "0.5", r: "0.5", children: [(0, jsx_runtime_1.jsx)("stop", { offset: "0", stopColor: brand_1.BRAND.red, stopOpacity: 0.20 * pulse }), (0, jsx_runtime_1.jsx)("stop", { offset: "0.55", stopColor: brand_1.BRAND.red, stopOpacity: 0.06 * pulse }), (0, jsx_runtime_1.jsx)("stop", { offset: "1", stopColor: brand_1.BRAND.red, stopOpacity: "0" })] }), (0, jsx_runtime_1.jsxs)("linearGradient", { id: "end-rule", x1: "0", y1: "0", x2: "1", y2: "0", children: [(0, jsx_runtime_1.jsx)("stop", { offset: "0", stopColor: brand_1.BRAND.red, stopOpacity: "0" }), (0, jsx_runtime_1.jsx)("stop", { offset: "0.2", stopColor: brand_1.BRAND.red, stopOpacity: "1" }), (0, jsx_runtime_1.jsx)("stop", { offset: "0.8", stopColor: brand_1.BRAND.red, stopOpacity: "1" }), (0, jsx_runtime_1.jsx)("stop", { offset: "1", stopColor: brand_1.BRAND.red, stopOpacity: "0" })] })] }), (0, jsx_runtime_1.jsx)(BrandLogo_1.BrandEndCard, { publicDir: publicDir, frame: frame, duration: durationInFrames, url: url, message1: message1, message2: message2, cta: cta, footnote: footnote }), (0, jsx_runtime_1.jsx)("rect", { width: 1080, height: 1920, fill: brand_1.BRAND.black, opacity: settle }), (0, jsx_runtime_1.jsx)(primitives_1.Grain, { id: "end-grain", frame: frame, opacity: 0.038 })] }));
};
exports.BrandOutro = BrandOutro;
