/**
 * 02 · THE DETAILS — 00:04–00:09
 *
 * Five macros, cut on the pulse: fabric, tie, cufflink, shirt, button row.
 * The section's job is to make the material feel expensive — so each shot is
 * a slow move at close range, never a zoom effect. Cuts land on the beat
 * grid so the picture reads as edited to the music even with sound off.
 *
 * The caption is deliberately small and bottom-anchored over the last shot:
 * at this point in a Reel the viewer is already looking, so the type steps
 * back and lets the fabric carry the frame.
 */
import React from "react";
import { BRAND, SAFE } from "../config/brand";
import { Easing, fade, interpolate } from "../lib/animate";
import { useCurrentFrame } from "../lib/composition";
import { TrackedLabel } from "../components/CinematicText";
import { Shot, ShotSequence, shotsDuration } from "../components/ShotSequence";
import { Canvas, Grain } from "../components/primitives";

export type SceneProps = { publicDir: string };

/**
 * The shot list.
 *
 * 5 s at 30 fps = 150 frames. The grid is 18/30/24/30/24/24 so the cuts land
 * on a 150 BPM-equivalent pulse rather than on arbitrary frames.
 */
export const DETAIL_SHOTS: readonly Shot[] = [
  // 1 — woven wool. Full-bleed band, upper third: sets material and scale.
  {
    src: "images/fb-weave.png",
    frames: 28,
    layout: { x: 0, y: 190, width: 1080, height: 1010 },
    zoom: [1.06, 1.16],
    pan: [-34, 28],
    roll: -0.45,
  },
  // 2 — the tie. Contained panel, low and wide: the "getting dressed" beat.
  {
    src: "images/fb-tie.png",
    frames: 30,
    layout: { x: 96, y: 640, width: 888, height: 578, panel: true },
    zoom: [1.14, 1.04],
    pan: [22, -14],
    flare: 0.45,
  },
  // 3 — cufflink. Wide band, upper frame; the bright accent of the section.
  {
    src: "images/fb-cufflink.png",
    frames: 30,
    layout: { x: 0, y: 300, width: 1080, height: 786 },
    zoom: [1.05, 1.18],
    pan: [-24, 18],
    flare: 0.35,
  },
  // 4 — waistcoat button row. Full-bleed, low, heavy — lands on the last beat.
  {
    src: "images/fb-buttons.png",
    frames: 32,
    layout: { x: 0, y: 640, width: 1080, height: 851 },
    zoom: [1.08, 1.20],
    pan: [26, -22],
    roll: 0.5,
  },
  // 5 — the suit body: the breath before the impact.
  {
    src: "images/fb-suit.png",
    frames: 30,
    layout: { x: 0, y: 0, width: 1080, height: 1920 },
    zoom: [1.02, 1.10],
    pan: [-12, 8],
  },
] as const;

export const Details: React.FC<SceneProps & { fps?: number; caption?: string; caption2?: string }> = ({
  publicDir,
  fps = 30,
  caption = "Chaque détail",
  caption2,
}) => {
  const frame = useCurrentFrame();
  const total = shotsDuration(DETAIL_SHOTS);
  const outStart = total - 14;

  // Section-level fade so the hard cuts sit inside a soft envelope.
  const body = fade(frame, 0, 5, outStart, 14, Easing.linear);
  // The red rule draws under the label.
  const ruleP = interpolate(frame, [46, 74], [0, 1], { easing: Easing.out });

  return (
    <Canvas name="details" background={BRAND.ink}>
      <g opacity={body}>
        <ShotSequence shots={DETAIL_SHOTS} local={frame} publicDir={publicDir} whip={4} />

        {/* A scrim across the lower third so the caption always has ground. */}
        <linearGradient id="det-scrim" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={BRAND.ink} stopOpacity="0" />
          <stop offset="0.55" stopColor={BRAND.ink} stopOpacity="0.72" />
          <stop offset="1" stopColor={BRAND.ink} stopOpacity="0.96" />
        </linearGradient>
        <rect
          x={0}
          y={1180}
          width={1080}
          height={740}
          fill="url(#det-scrim)"
          opacity={interpolate(frame, [30, 52], [0, 1], { easing: Easing.out })}
        />

        {/* ── caption ─────────────────────────────────────────────── */}
        <g opacity={interpolate(frame, [54, 76], [0, 1], { easing: Easing.out })}>
          <rect
            x={SAFE.inset}
            y={1298}
            width={150 * ruleP}
            height={2}
            fill="url(#det-rule)"
          />
          <TrackedLabel
            x={SAFE.inset}
            y={1382}
            frame={frame}
            start={58}
            fontSize={22}
            trackingEm={0.4}
            opacity={0.6}
          >
            {caption.toUpperCase()}
          </TrackedLabel>
          {caption2 ? (
            <text
              x={SAFE.inset}
              y={1442}
              fontFamily="Noto Serif Light"
              fontStyle="italic"
              fontSize={40}
              fill={BRAND.white}
              opacity={interpolate(frame, [66, 88], [0, 1], { easing: Easing.out })}
            >
              {caption2}
            </text>
          ) : null}
        </g>

        <defs>
          <linearGradient id="det-rule" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0" stopColor={BRAND.red} stopOpacity="1" />
            <stop offset="0.8" stopColor={BRAND.red} stopOpacity="1" />
            <stop offset="1" stopColor={BRAND.red} stopOpacity="0" />
          </linearGradient>
        </defs>

        {/* ── index ───────────────────────────────────────────────── */}
        <text
          x={SAFE.inset}
          y={SAFE.bottom}
          fontFamily="Inter Display Light"
          fontSize={19}
          fill={BRAND.white}
          letterSpacing={3.2}
          opacity={0.5 * interpolate(frame, [40, 60], [0, 1], { easing: Easing.out })}
        >
          02 — THE DETAILS
        </text>

        <Grain id="det-grain" frame={frame} opacity={0.045} />
      </g>
    </Canvas>
  );
};
