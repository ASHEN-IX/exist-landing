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
import React, { createContext, useContext } from "react";

/** The frame the current component should draw. */
const FrameContext = createContext<number>(0);

export const useCurrentFrame = (): number => useContext(FrameContext);

export const FrameProvider: React.FC<{
  frame: number;
  children: React.ReactNode;
}> = ({ frame, children }) => (
  <FrameContext.Provider value={frame}>{children}</FrameContext.Provider>
);

/** Frames-per-second and canvas size, matching Remotion's `useVideoConfig()`. */
export const useVideoConfig = () => ({ fps: 30, width: 1080, height: 1920 });

/**
 * A time window inside the composition.
 *
 * Children see a local frame starting at 0 on `from` and are not rendered at
 * all outside `[from, from + durationInFrames)`. Because children are simply
 * not in the tree outside the window, a scene never has to test its own
 * bounds — the same guarantee Remotion's `<Sequence>` gives.
 */
export const Sequence: React.FC<{
  from: number;
  durationInFrames?: number;
  children: React.ReactNode;
}> = ({ from, durationInFrames, children }) => {
  const outer = useCurrentFrame();
  const local = outer - from;
  if (local < 0) return null;
  if (durationInFrames !== undefined && local >= durationInFrames) return null;
  return (
    <FrameProvider frame={local}>
      <g data-from={from} data-frame={local}>
        {children}
      </g>
    </FrameProvider>
  );
};
