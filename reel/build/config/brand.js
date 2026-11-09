"use strict";
/**
 * EXIST — brand tokens.
 *
 * One source of truth for colour, type and spacing. Nothing in a scene should
 * hard-code a hex value or a font stack; everything reads from here so the
 * whole reel can be re-skinned from a single file.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.SAFE = exports.GRID = exports.TYPE = exports.BRAND = void 0;
exports.BRAND = {
    /** Brand black. Everything that is not the statement sits on or near this. */
    black: "#101010",
    /** Deeper black used for cinematic vignette falloff and letterbox. */
    ink: "#08080A",
    /** Statement white. */
    white: "#FFFFFF",
    /** Brand red accent — the "I" in EXIST. Used sparingly, never as a fill. */
    red: "#D72832",
    /** Dimmed white for secondary lines (captions, eyebrows). */
    mute: "rgba(255,255,255,0.62)",
    /** Hairline rule colour. */
    rule: "rgba(255,255,255,0.22)",
};
/**
 * Type faces.
 *
 * The reel ships with fonts it can license locally. These are the families
 * available on the build machine and chosen for the campaign:
 *  - "Inter Display" — a refined neo-grotesque for headline and utility copy.
 *  - "Noto Serif"    — an editorial serif used italic for the emotional line.
 *
 * NOTE: weights must be selected by the *family name that carries the weight*
 * (e.g. "Inter Display ExtraLight"), because the rasteriser resolves weight
 * from the family, not from font-weight. `display`/`serif` below are therefore
 * thin/regular variants and the heavier ones are explicit entries.
 */
exports.TYPE = {
    displayUltra: "Inter Display ExtraLight",
    displayLight: "Inter Display Light",
    display: "Inter Display",
    displayMedium: "Inter Display Medium",
    serif: "Noto Serif",
    serifLight: "Noto Serif Light",
};
/** Vertical rhythm — an 8px grid scaled for a 1080-wide canvas. */
exports.GRID = {
    margin: 88,
    gutter: 24,
};
/**
 * Where important content may live.
 *
 * Instagram Reels and Facebook Reels draw a top bar (~180px) and a lower block
 * of caption, account name and action buttons (~400px) over the picture. All
 * message copy is kept strictly between these two lines so nothing the viewer
 * needs is ever covered. `bottom` is the lowest baseline allowed.
 */
exports.SAFE = {
    top: 210,
    bottom: 1500,
    width: 1080,
    height: 1920,
    /** Left/right type margin. Slightly wider than GRID.margin for air. */
    inset: 92,
};
