"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.REELS = void 0;
const jsx_runtime_1 = require("react/jsx-runtime");
const copy_1 = require("../config/copy");
const timeline_1 = require("../config/timeline");
const composition_1 = require("../lib/composition");
const BrandOutro_1 = require("../scenes/BrandOutro");
const Details_1 = require("../scenes/Details");
const Invitation_1 = require("../scenes/Invitation");
const Reveal_1 = require("../scenes/Reveal");
const Transformation_1 = require("../scenes/Transformation");
/**
 * A scene's absolute start, in frames, taken from the timeline rather than
 * from a hand-written offset — so a duration change propagates everywhere.
 */
const at = (scene) => (0, timeline_1.f)(scene.from);
const lengths = (scenes) => scenes.map((s) => (0, timeline_1.f)(s.duration));
/**
 * The master cut.
 *
 * The cuts are hard — this is a fashion film, and a dissolve between a macro
 * and a garment would read as a template. What joins the scenes instead is
 * the match: each section ends on darkness or on a full-bleed fabric surface,
 * and the next opens on the same value.
 */
const MasterReel = ({ publicDir }) => {
    const [inv, det, tr, rv, br] = timeline_1.MASTER;
    const len = lengths(timeline_1.MASTER);
    return ((0, jsx_runtime_1.jsxs)("g", { children: [(0, jsx_runtime_1.jsx)(composition_1.Sequence, { from: at(inv), durationInFrames: len[0], children: (0, jsx_runtime_1.jsx)(Invitation_1.Invitation, { publicDir: publicDir, line1: copy_1.MASTER_COPY.invitation.line1, line2: copy_1.MASTER_COPY.invitation.line2 }) }), (0, jsx_runtime_1.jsx)(composition_1.Sequence, { from: at(det), durationInFrames: len[1], children: (0, jsx_runtime_1.jsx)(Details_1.Details, { publicDir: publicDir, caption: copy_1.MASTER_COPY.details.line1, caption2: copy_1.MASTER_COPY.details.line2 }) }), (0, jsx_runtime_1.jsx)(composition_1.Sequence, { from: at(tr), durationInFrames: len[2], children: (0, jsx_runtime_1.jsx)(Transformation_1.Transformation, { publicDir: publicDir, line1: copy_1.MASTER_COPY.transformation.line1, line2: copy_1.MASTER_COPY.transformation.line2 }) }), (0, jsx_runtime_1.jsx)(composition_1.Sequence, { from: at(rv), durationInFrames: len[3], children: (0, jsx_runtime_1.jsx)(Reveal_1.Reveal, { publicDir: publicDir, line1: copy_1.MASTER_COPY.reveal.line1, line2: copy_1.MASTER_COPY.reveal.line2 }) }), (0, jsx_runtime_1.jsx)(composition_1.Sequence, { from: at(br), durationInFrames: len[4], children: (0, jsx_runtime_1.jsx)(BrandOutro_1.BrandOutro, { publicDir: publicDir, message1: copy_1.MASTER_COPY.brand.line1, message2: copy_1.MASTER_COPY.brand.line2, cta: copy_1.MASTER_COPY.brand.cta, url: copy_1.CAMPAIGN.url, footnote: copy_1.CAMPAIGN.disclaimer, durationInFrames: len[4] }) })] }));
};
/**
 * The 15 s cutdown.
 *
 * Every section is shorter for a reason the edit can defend:
 *  - the hook is one 2 s push instead of a 4 s hold, because a Reel viewer
 *    decides in the first second;
 *  - details drop to a single 3 s beat with one line, not two;
 *  - the transformation cuts in sooner but keeps its full impact;
 *  - the reveal is the *longest* section proportionally — it is the payoff;
 *  - the outro loses the long build but keeps logo, message and CTA intact.
 */
const CutdownReel = ({ publicDir }) => {
    const [inv, det, tr, rv, br] = timeline_1.CUTDOWN;
    const len = lengths(timeline_1.CUTDOWN);
    return ((0, jsx_runtime_1.jsxs)("g", { children: [(0, jsx_runtime_1.jsx)(composition_1.Sequence, { from: at(inv), durationInFrames: len[0], children: (0, jsx_runtime_1.jsx)(Invitation_1.Invitation, { publicDir: publicDir, line1: copy_1.CUTDOWN_COPY.invitation.line1, line2: copy_1.CUTDOWN_COPY.invitation.line2 }) }), (0, jsx_runtime_1.jsx)(composition_1.Sequence, { from: at(det), durationInFrames: len[1], children: (0, jsx_runtime_1.jsx)(Details_1.Details, { publicDir: publicDir, caption: copy_1.CUTDOWN_COPY.details.caption ?? "", caption2: undefined }) }), (0, jsx_runtime_1.jsx)(composition_1.Sequence, { from: at(tr), durationInFrames: len[2], children: (0, jsx_runtime_1.jsx)(Transformation_1.Transformation, { publicDir: publicDir, line1: copy_1.CUTDOWN_COPY.transformation.line1, line2: copy_1.CUTDOWN_COPY.transformation.line2 }) }), (0, jsx_runtime_1.jsx)(composition_1.Sequence, { from: at(rv), durationInFrames: len[3], children: (0, jsx_runtime_1.jsx)(Reveal_1.Reveal, { publicDir: publicDir, line1: copy_1.CUTDOWN_COPY.reveal.line1, line2: copy_1.CUTDOWN_COPY.reveal.line2 }) }), (0, jsx_runtime_1.jsx)(composition_1.Sequence, { from: at(br), durationInFrames: len[4], children: (0, jsx_runtime_1.jsx)(BrandOutro_1.BrandOutro, { publicDir: publicDir, message1: copy_1.CUTDOWN_COPY.brand.line1, message2: copy_1.CUTDOWN_COPY.brand.line2, cta: copy_1.CUTDOWN_COPY.brand.cta, url: copy_1.CAMPAIGN.url, footnote: copy_1.CAMPAIGN.disclaimer, durationInFrames: len[4] }) })] }));
};
exports.REELS = {
    master: {
        id: "master",
        width: timeline_1.WIDTH,
        height: timeline_1.HEIGHT,
        fps: timeline_1.FPS,
        durationInFrames: timeline_1.MASTER_FRAMES,
        scenes: timeline_1.MASTER,
        component: MasterReel,
    },
    cutdown: {
        id: "cutdown",
        width: timeline_1.WIDTH,
        height: timeline_1.HEIGHT,
        fps: timeline_1.FPS,
        durationInFrames: timeline_1.CUTDOWN_FRAMES,
        scenes: timeline_1.CUTDOWN,
        component: CutdownReel,
    },
};
