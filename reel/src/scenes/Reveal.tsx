/**
 * 04 · THE REVEAL — 00:14–00:20
 *
 * The payoff. This is the longest hold in the reel and the shot that has to
 * survive being screenshotted.
 *
 * The frame is built as a full-bleed picture with the headline sitting *in*
 * the photograph's own negative space rather than in a box over it: the band
 * is seated low, the copy sits in the black above, and the garment stays
 * completely unobstructed. Nothing is allowed to cross the lapels.
 */
import React from "react";
import { BRAND, SAFE } from "../config/brand";
import { Easing, fade, interpolate } from "../lib/animate";
import { useCurrentFrame } from "../lib/composition";
import { HeadlineLockup, TrackedLabel } from "../components/CinematicText";
import { CameraGroup, Canvas, Grain, Plate } from "../components/primitives";

export type SceneProps = { publicDir: string };

/** Hero plate is 1206×763; at full bleed it is 683 tall. */
const BAND_W = 1080;
const BAND_H = 683;
const BAND_Y = 800;

export const Reveal: React.FC<SceneProps & {
  line1: string;
  line2?: string;
  fps?: number;
}> = ({ publicDir, line1, line2, fps = 30 }) => {
  const frame = useCurrentFrame();
  const total = 6 * fps; // 180
  const outStart = total - 20;

  // Opens tight on the man, pulls back over the whole hold — one continuous
  // move, no second beat. This is the "slow cinematic camera motion".
  const pull = interpolate(frame, [0, total], [1.16, 1.0], {
    easing: Easing.drape,
  });
  const rise = interpolate(frame, [0, total], [26, -8], {
    easing: Easing.cosine,
  });

  // A very slow lateral drift, opposite the pull, to add parallax life.
  const drift = interpolate(frame, [0, total], [-16, 14], {
    easing: Easing.cosine,
  });

  const bandIn = interpolate(frame, [0, 18], [0, 1], { easing: Easing.out });
  const body = fade(frame, 0, 3, outStart, 20, Easing.linear);

  return (
    <Canvas name="reveal" background={BRAND.ink}>
      <defs>
        <linearGradient id="rv-edge" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={BRAND.ink} stopOpacity="0.98" />
          <stop offset="0.11" stopColor={BRAND.ink} stopOpacity="0.15" />
          <stop offset="0.86" stopColor={BRAND.ink} stopOpacity="0.05" />
          <stop offset="1" stopColor={BRAND.ink} stopOpacity="1" />
        </linearGradient>
        <radialGradient id="rv-vig" cx="0.5" cy="0.5" r="0.74">
          <stop offset="0.4" stopColor={BRAND.ink} stopOpacity="0" />
          <stop offset="1" stopColor={BRAND.ink} stopOpacity="0.78" />
        </radialGradient>
        <linearGradient id="rv-rule" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor={BRAND.red} stopOpacity="1" />
          <stop offset="0.82" stopColor={BRAND.red} stopOpacity="1" />
          <stop offset="1" stopColor={BRAND.red} stopOpacity="0" />
        </linearGradient>
      </defs>

      <g opacity={body}>
        {/* ── the picture ─────────────────────────────────────────── */}
        <g opacity={bandIn}>
          <CameraGroup zoom={pull} y={rise} x={drift}>
            <Plate
              src="images/rv-plate.png"
              publicDir={publicDir}
              x={0}
              y={BAND_Y}
              width={BAND_W}
              height={BAND_H}
            />
          </CameraGroup>
          <rect x={0} y={BAND_Y} width={BAND_W} height={BAND_H} fill="url(#rv-vig)" />
          <rect x={0} y={BAND_Y} width={BAND_W} height={BAND_H} fill="url(#rv-edge)" />
        </g>

        {/* A hairline red rule that ties the copy to the garment without
            crossing it — sits in the black above the band. */}
        <rect
          x={SAFE.inset}
          y={BAND_Y - 46}
          width={SAFE.inset > 0 ? 152 * interpolate(frame, [24, 52], [0, 1], { easing: Easing.out }) : 0}
          height={2}
          fill="url(#rv-rule)"
        />

        {/* ── the headline ────────────────────────────────────────── */}
        <TrackedLabel
          x={SAFE.inset}
          y={300}
          frame={frame}
          start={10}
          fontSize={22}
          trackingEm={0.4}
          opacity={0.62}
        >
          COLLECTION CÉRÉMONIE
        </TrackedLabel>

        <HeadlineLockup
          id="rv"
          line1={line1}
          line2={line2}
          x={SAFE.inset}
          y={472}
          fontSize={100}
          frame={frame}
          start={18}
          stagger={8}
          opacity={interpolate(frame, [0, 1], [0, 1])}
        />

        {/* The tagline, small, under the mark — the campaign's own line. */}
        <text
          x={SAFE.inset}
          y={622}
          fontFamily="Noto Serif Light"
          fontStyle="italic"
          fontSize={32}
          fill={BRAND.white}
          fillOpacity={0.72}
          opacity={interpolate(frame, [42, 66], [0, 1], { easing: Easing.out })}
        >
          Soyez le protagoniste de votre événement.
        </text>

        {/* ── index ───────────────────────────────────────────────── */}
        <text
          x={SAFE.inset}
          y={SAFE.bottom}
          fontFamily="Inter Display Light"
          fontSize={19}
          fill={BRAND.white}
          letterSpacing={3.2}
          opacity={0.5 * interpolate(frame, [30, 50], [0, 1], { easing: Easing.out })}
        >
          04 — THE REVEAL
        </text>

        <Grain id="rv-grain" frame={frame} opacity={0.048} />
      </g>
    </Canvas>
  );
};
