/**
 * 03 · THE TRANSFORMATION — 00:09–00:14
 *
 * The hardest scene to do honestly. There is no true transformation footage
 * and no body-swap we would be right to fake, so the edit does what a
 * filmed campaign does: it uses the *garment* as the match.
 *
 *   A. The button row fills frame and pushes in until fabric is all there is.
 *   B. On the impact the frame cuts to the suit itself on its stand — dark
 *      fabric filling the screen on both sides of the cut, so the eye reads
 *      the two shots as one continuous move.
 *   C. The camera pulls back off the suit and the waistcoat lands, with the
 *      caption resolving over the held shot.
 *
 * The match is on texture and on darkness, never on a claim that a man was
 * transformed. On screen it is unmistakably an edit — which is the point:
 * a cut between two real images is honest, a generated body is not.
 */
import React from "react";
import { BRAND, SAFE } from "../config/brand";
import { CUES } from "../config/timeline";
import { Easing, fade, interpolate } from "../lib/animate";
import { useCurrentFrame } from "../lib/composition";
import { CaptionCard } from "../components/CinematicText";
import { CameraGroup, Canvas, Grain, Plate } from "../components/primitives";

export type SceneProps = { publicDir: string };

/** Frames from scene start to the impact cut. */
const CUT = Math.round((CUES.impact - 9) * 30); // 71 frames into the scene
const TOTAL = 150;

export const Transformation: React.FC<SceneProps & {
  line1: string;
  line2?: string;
  fps?: number;
}> = ({ publicDir, line1, line2, fps = 30 }) => {
  const frame = useCurrentFrame();

  const isBefore = frame < CUT;
  const tBefore = Math.max(0, Math.min(1, frame / CUT));
  const tAfter = Math.max(0, Math.min(1, (frame - CUT) / (TOTAL - CUT)));

  // ── A. the approach ─────────────────────────────────────────────
  // The button-row macro pushes in hard, accelerating into the cut so the
  // fabric appears to be rushing at the lens.
  const aZoom = interpolate(tBefore, [0, 1], [1.06, 1.62], { easing: Easing.in });
  const aPan = interpolate(tBefore, [0, 1], [34, -18], { easing: Easing.in });
  const aLift = interpolate(tBefore, [0, 1], [10, -34], { easing: Easing.in });
  // A touch of smear as it accelerates — the shutter is open.
  const aBlur = interpolate(tBefore, [0.72, 1], [0, 1], { easing: Easing.in });

  // ── B/C. the suit ───────────────────────────────────────────────
  // Opens tight on the fabric, then pulls back to read the whole garment.
  const bZoom = interpolate(tAfter, [0, 1], [1.34, 1.0], { easing: Easing.drape });
  const bLift = interpolate(tAfter, [0, 1], [-40, 0], { easing: Easing.drape });

  // ── the impact ──────────────────────────────────────────────────
  // A single white flash and a bright bloom on the cut. Short — two frames of
  // exposure and a falloff. Longer than that looks like a transition effect.
  const sinceCut = frame - CUT;
  const flash = interpolate(sinceCut, [0, 2, 12], [0, 0.42, 0], {
    easing: Easing.out,
  });
  const bloom = interpolate(sinceCut, [0, 1, 20], [0, 0.5, 0], {
    easing: Easing.out,
  });

  const outStart = TOTAL - 16;
  const body = fade(frame, 0, 4, outStart, 16, Easing.linear);

  return (
    <Canvas name="transformation" background={BRAND.ink}>
      <defs>
        <radialGradient id="tr-bloom" cx="0.5" cy="0.5" r="0.62">
          <stop offset="0" stopColor={BRAND.red} stopOpacity="0.85" />
          <stop offset="0.55" stopColor={BRAND.red} stopOpacity="0.22" />
          <stop offset="1" stopColor={BRAND.red} stopOpacity="0" />
        </radialGradient>
        <linearGradient id="tr-scrim" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={BRAND.ink} stopOpacity="0.92" />
          <stop offset="0.34" stopColor={BRAND.ink} stopOpacity="0" />
          <stop offset="0.68" stopColor={BRAND.ink} stopOpacity="0" />
          <stop offset="1" stopColor={BRAND.ink} stopOpacity="0.96" />
        </linearGradient>
      </defs>

      <g opacity={body}>
        {isBefore ? (
          <>
            {/* A — the button row, rushing in. */}
            <CameraGroup zoom={aZoom * (1 + aBlur * 0.05)} x={aPan} y={aLift}>
              <Plate
                src="images/fb-buttons.png"
                publicDir={publicDir}
                x={0}
                y={260}
                width={1080}
                height={1920}
              />
            </CameraGroup>
            <rect width={1080} height={1920} fill="url(#tr-scrim)" />
          </>
        ) : (
          <>
            {/* B — the suit, held dark, pulling back. */}
            <CameraGroup zoom={bZoom} y={bLift}>
              <Plate
                src="images/sp-suit.png"
                publicDir={publicDir}
                x={0}
                y={0}
                width={1080}
                height={1920}
              />
            </CameraGroup>

            {/* A red bloom under the garment — the impact's remaining heat. */}
            {bloom > 0.001 ? (
              <rect
                width={1080}
                height={1920}
                fill="url(#tr-bloom)"
                opacity={bloom}
              />
            ) : null}

            <rect width={1080} height={1920} fill="url(#tr-scrim)" />
          </>
        )}

        {/* White exposure hit on the cut. */}
        {flash > 0.001 ? (
          <rect width={1080} height={1920} fill={BRAND.white} opacity={flash} />
        ) : null}

        {/* ── caption — arrives after the garment resolves ─────────── */}
        <CaptionCard
          id="tr"
          line1={line1}
          line2={line2}
          x={SAFE.inset}
          y={1226}
          fontSize={86}
          frame={frame}
          inStart={CUT + 30}
          outStart={outStart}
          outDur={16}
          ruleWidth={118}
        />

        {/* ── index ───────────────────────────────────────────────── */}
        <text
          x={SAFE.inset}
          y={SAFE.bottom}
          fontFamily="Inter Display Light"
          fontSize={19}
          fill={BRAND.white}
          letterSpacing={3.2}
          opacity={0.5 * interpolate(frame, [CUT + 10, CUT + 30], [0, 1], { easing: Easing.out })}
        >
          03 — THE TRANSFORMATION
        </text>

        <Grain id="tr-grain" frame={frame} opacity={0.05} />
      </g>
    </Canvas>
  );
};
