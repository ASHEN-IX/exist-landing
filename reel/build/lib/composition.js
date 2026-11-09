"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Sequence = exports.useVideoConfig = exports.FrameProvider = exports.useCurrentFrame = void 0;
const jsx_runtime_1 = require("react/jsx-runtime");
/**
 * EXIST — composition runtime.
 *
 * A deliberately small subset of Remotion's model so the scenes are written in
 * the exact idiom a Remotion port expects:
 *
 *   <Sequence from={120} durationInFrames={150}> … </Sequence>
 *   const frame = useCurrentFrame();   // local to the sequence
 *
 * The difference is only the driver: Remotion seeks a browser tab; here the
 * renderer walks frame 0…N, renders each to SVG and pipes PNGs to ffmpeg. The
 * scene code is identical either way, which is what keeps the source portable.
 */
const react_1 = require("react");
/** The frame the current component should draw. */
const FrameContext = (0, react_1.createContext)(0);
const useCurrentFrame = () => (0, react_1.useContext)(FrameContext);
exports.useCurrentFrame = useCurrentFrame;
const FrameProvider = ({ frame, children }) => ((0, jsx_runtime_1.jsx)(FrameContext.Provider, { value: frame, children: children }));
exports.FrameProvider = FrameProvider;
/** Frames-per-second and canvas size, matching Remotion's `useVideoConfig()`. */
const useVideoConfig = () => ({ fps: 30, width: 1080, height: 1920 });
exports.useVideoConfig = useVideoConfig;
/**
 * A time window inside the composition.
 *
 * Children see a local frame starting at 0 on `from` and are not rendered at
 * all outside `[from, from + durationInFrames)`. Because children are simply
 * not in the tree outside the window, a scene never has to test its own
 * bounds — the same guarantee Remotion's `<Sequence>` gives.
 */
const Sequence = ({ from, durationInFrames, children }) => {
    const outer = (0, exports.useCurrentFrame)();
    const local = outer - from;
    if (local < 0)
        return null;
    if (durationInFrames !== undefined && local >= durationInFrames)
        return null;
    return ((0, jsx_runtime_1.jsx)(exports.FrameProvider, { frame: local, children: (0, jsx_runtime_1.jsx)("g", { "data-from": from, "data-frame": local, children: children }) }));
};
exports.Sequence = Sequence;
