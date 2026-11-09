/**
 * 01 · THE INVITATION — 00:00–00:04
 *
 * The hook. A man in a dark interior, already dressed, caught in a moment of
 * decision. The frame opens on him rather than on a title card, because the
 * first second is what decides whether a Reel is watched at all.
 *
 * Composition: the still is treated as a 16:10 cinematic band over black —
 * a film strip inside the vertical frame, not a stretched wallpaper. Caption
 * sits above the picture so it is read before the eye drops into the image.
 */
import React from "react";
import { BRAND, SAFE } from "../config/brand";
import { Easing, fade, interpolate } from "../lib/animate";
import { useCurrentFrame } from "../lib/composition";
import { CaptionCard, TrackedLabel } from "../components/CinematicText";
import { CameraGroup, Canvas, Grain, Plate } from "../components/primitives";

export type SceneProps = { publicDir: string };

/** Source is 1206×763; at full frame width the band is 683 tall. */
const BAND_W = 1080;
const BAND_H = 683;
const BAND_Y = 742;

export const Invitation: React.FC<SceneProps & { line1: string; line2?: string; fps?: number }> = ({
  publicDir,
  line1,
  line2,
  fps = 30,
}) => {
  const frame = useCurrentFrame();

  // A 4 s scene: 120 frames. Exit begins 18 frames before the cut.
  const outStart = 4 * fps - 18;

  // Slow dolly push with a whisper of upward drift — cosine so it starts and
  // ends at zero velocity and reads as a camera, not an animation.
  const push = interpolate(frame, [0, 4 * fps], [1.0, 1.075], {
    easing: Easing.cosine,
  });
  const drift = interpolate(frame, [0, 4 * fps], [0, -14], {
    easing: Easing.cosine,
  });

  // The picture arrives just behind the black, so the first frame is not empty.
  const bandIn = interpolate(frame, [0, 22], [0, 1], { easing: Easing.out });

  // A red hairline that draws itself above the caption — the scene's one accent.
  const ruleP = interpolate(frame, [2, 30], [0, 1], { easing: Easing.out });

  const exit = fade(frame, 0, 1, outStart, 18, Easing.in);

  return (
    <Canvas name="invitation">
      <defs>
        <radialGradient id="inv-vig" cx="0.5" cy="0.42" r="0.78">
          <stop offset="0.34" stopColor={BRAND.ink} stopOpacity="0" />
          <stop offset="1" stopColor={BRAND.ink} stopOpacity="0.86" />
        </radialGradient>
        {/* Feathered top and bottom so the band dissolves into black. */}
        <linearGradient id="inv-edge" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={BRAND.ink} stopOpacity="0.95" />
          <stop offset="0.16" stopColor={BRAND.ink} stopOpacity="0" />
          <stop offset="0.84" stopColor={BRAND.ink} stopOpacity="0" />
          <stop offset="1" stopColor={BRAND.ink} stopOpacity="0.98" />
        </linearGradient>
        <linearGradient id="inv-rule" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor={BRAND.red} stopOpacity="1" />
          <stop offset="0.8" stopColor={BRAND.red} stopOpacity="0.95" />
          <stop offset="1" stopColor={BRAND.red} stopOpacity="0" />
        </linearGradient>
      </defs>

      <g opacity={exit}>
        {/* ── picture ─────────────────────────────────────────────── */}
        <g opacity={bandIn}>
          <CameraGroup zoom={push} y={drift}>
            <Plate
              src="images/rv-plate.png"
              publicDir={publicDir}
              x={(BAND_W - BAND_W * 1) / 2}
              y={BAND_Y}
              width={BAND_W}
              height={BAND_H}
            />
          </CameraGroup>
          <rect x={0} y={BAND_Y} width={BAND_W} height={BAND_H} fill="url(#inv-vig)" />
          <rect x={0} y={BAND_Y} width={BAND_W} height={BAND_H} fill="url(#inv-edge)" />
        </g>

        {/* ── caption ─────────────────────────────────────────────── */}
        <TrackedLabel
          x={SAFE.inset}
          y={352}
          frame={frame}
          start={6}
          fontSize={22}
          trackingEm={0.4}
          fill={BRAND.white}
          opacity={0.66}
        >
          COLLECTION CÉRÉMONIE
        </TrackedLabel>

        <rect
          x={SAFE.inset}
          y={392}
          width={190 * ruleP}
          height={2}
          fill="url(#inv-rule)"
        />

        <CaptionCard
          id="inv"
          line1={line1}
          line2={line2}
          x={SAFE.inset}
          y={626}
          fontSize={94}
          frame={frame}
          inStart={14}
          outStart={outStart}
          outDur={16}
          ruleWidth={0}
        />

        {/* ── index ───────────────────────────────────────────────── */}
        <g opacity={interpolate(frame, [26, 46], [0, 1], { easing: Easing.out }) * 0.5}>
          <text
            x={SAFE.inset}
            y={SAFE.bottom}
            fontFamily="Inter Display Medium"
            fontSize={19}
            fill={BRAND.white}
            letterSpacing={3.2}
          >
            01
          </text>
          <text
            x={SAFE.inset + 46}
            y={SAFE.bottom}
            fontFamily="Inter Display Light"
            fontSize={19}
            fill={BRAND.white}
            letterSpacing={3.2}
          >
            — THE INVITATION
          </text>
        </g>

        <Grain id="inv-grain" frame={frame} opacity={0.05} />
      </g>
    </Canvas>
  );
};
