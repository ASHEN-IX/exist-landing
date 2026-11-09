"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.frameToSvg = void 0;
const jsx_runtime_1 = require("react/jsx-runtime");
const server_1 = require("react-dom/server");
const composition_1 = require("./lib/composition");
const SVG_NS = "http://www.w3.org/2000/svg";
/**
 * Wrap a scene in the SVG root and provide the absolute frame.
 *
 * The root is what carries the canvas size and the viewBox; scenes draw their
 * own background, so a scene can be letterboxed, full-bleed or black without
 * special-casing here.
 */
const frameToSvg = (scene, frame, publicDir, width = 1080, height = 1920) => {
    // JSX requires a capitalised binding, so the scene is aliased first.
    const Scene = scene;
    const body = (0, server_1.renderToStaticMarkup)((0, jsx_runtime_1.jsx)(composition_1.FrameProvider, { frame: frame, children: (0, jsx_runtime_1.jsx)(Scene, { publicDir: publicDir }) }));
    return [
        `<?xml version="1.0" encoding="UTF-8"?>`,
        `<svg xmlns="${SVG_NS}" xmlns:xlink="http://www.w3.org/1999/xlink"`,
        ` width="${width}" height="${height}"`,
        ` viewBox="0 0 ${width} ${height}"`,
        ` preserveAspectRatio="xMidYMid slice" data-frame="${frame}">`,
        body,
        `</svg>`,
    ].join("");
};
exports.frameToSvg = frameToSvg;
