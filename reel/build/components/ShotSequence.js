"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.shotsDuration = exports.ShotSequence = void 0;
const jsx_runtime_1 = require("react/jsx-runtime");
const brand_1 = require("../config/brand");
const animate_1 = require("../lib/animate");
const primitives_1 = require("./primitives");
const EDGE = 7;
const ShotSequence = ({ shots, local, publicDir, whip = 4 }) => {
    // Locate the live shot.
    let start = 0;
    let index = 0;
    for (let i = 0; i < shots.length; i += 1) {
        if (local < start + shots[i].frames) {
            index = i;
            break;
        }
        start += shots[i].frames;
        index = i;
    }
    const shot = shots[index];
    const t = Math.min(1, Math.max(0, (local - start) / Math.max(1, shot.frames - 1)));
    const eased = animate_1.Easing.cosine(t);
    const zoom = (0, animate_1.interpolate)(eased, [0, 1], shot.zoom);
    const pan = shot.pan ? (0, animate_1.interpolate)(eased, [0, 1], shot.pan) : 0;
    const lift = shot.lift ? (0, animate_1.interpolate)(eased, [0, 1], shot.lift) : 0;
    const roll = shot.roll ? (0, animate_1.interpolate)(t, [0, 1], [0, shot.roll]) : 0;
    // Whip into the cut.
    const framesLeft = start + shot.frames - local;
    const whipIn = whip > 0 && framesLeft <= whip && index < shots.length - 1
        ? 1 - framesLeft / whip
        : 0;
    const exitScale = 1 + whipIn * 0.05;
    const exitOpacity = 1 - whipIn * 0.5;
    // Reveal: panels wipe in from a hair above their resting place.
    const reveal = (0, animate_1.interpolate)(local - start, [0, 8], [0, 1], { easing: animate_1.Easing.out });
    const flare = shot.flare
        ? (0, animate_1.interpolate)(local - start, [0, 7], [shot.flare, 0], { easing: animate_1.Easing.out })
        : 0;
    const { x, y, width, height } = shot.layout;
    return ((0, jsx_runtime_1.jsxs)("g", { opacity: exitOpacity, children: [shot.layout.panel ? ((0, jsx_runtime_1.jsx)("rect", { x: 0, y: 0, width: 1080, height: 1920, fill: brand_1.BRAND.ink })) : null, (0, jsx_runtime_1.jsx)("defs", { children: (0, jsx_runtime_1.jsx)("clipPath", { id: `shot-${index}`, children: (0, jsx_runtime_1.jsx)("rect", { x: x, y: y + (1 - reveal) * 26, width: width, height: height }) }) }), (0, jsx_runtime_1.jsx)("g", { clipPath: `url(#shot-${index})`, children: (0, jsx_runtime_1.jsx)(primitives_1.CameraGroup, { zoom: zoom * exitScale, x: pan, y: lift, rotate: roll, children: (0, jsx_runtime_1.jsx)(primitives_1.Plate, { src: shot.src, publicDir: publicDir, x: x - EDGE, y: y + (1 - reveal) * 26 - EDGE, width: width + EDGE * 2, height: height + EDGE * 2 }) }) }), shot.layout.panel ? ((0, jsx_runtime_1.jsx)("rect", { x: x, y: y - 22, width: Math.max(0, 74 * reveal), height: 2, fill: brand_1.BRAND.white, fillOpacity: 0.5 })) : null, flare > 0 ? ((0, jsx_runtime_1.jsx)("rect", { width: 1080, height: 1920, fill: brand_1.BRAND.white, opacity: flare * 0.07 })) : null] }));
};
exports.ShotSequence = ShotSequence;
const shotsDuration = (shots) => shots.reduce((sum, s) => sum + s.frames, 0);
exports.shotsDuration = shotsDuration;
