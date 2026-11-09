/**
 * EXIST — shot sequence.
 *
 * The macro section is not a slideshow: each shot is its own camera move with
 * its own framing, cut hard on a beat. To keep a hard cut from reading as a
 * glitch, the outgoing shot gets a short whip — it accelerates a few frames
 * before the cut.
 *
 * FRAMING. The source stills are small (the largest usable macro is ~250 px),
 * and stretching one across 1080×1920 turns it to mush. So a full-height band
 * is still used where the material supports it, but a shot may instead be
 * composed as a PANEL: a contained picture with black around it, placed on a
 * different part of the frame from the shot before. That is what full-bleed
 * macro footage would do on a real edit — the frame is never the same twice,
 * and the picture is never asked to carry more pixels than it has.
 */
import React from "react";
import { BRAND } from "../config/brand";
import { Easing, interpolate } from "../lib/animate";
import { CameraGroup, Plate } from "./primitives";

/** Where a shot's picture sits in the frame. */
export type ShotLayout = {
  /** Crop rectangle in frame coordinates. */
  x: number;
  y: number;
  width: number;
  height: number;
  /** How much of the frame the picture occupies — drives the camera's range. */
  panel?: boolean;
};

export type Shot = {
  /** Plate under public/, e.g. "images/fb-weave.png". */
  src: string;
  /** Frames this shot occupies. */
  frames: number;
  /** Where the picture lives. */
  layout: ShotLayout;
  /** Zoom at the start and end of the shot. */
  zoom: readonly [number, number];
  /** Pan in frame pixels, start → end. */
  pan?: readonly [number, number];
  /** Vertical drift, start → end. */
  lift?: readonly [number, number];
  /** Degrees of roll across the shot. Keep under 1.2 — more reads as a tilt. */
  roll?: number;
  /** Extra exposure at the top of the shot, 0–1. Simulates a light hit. */
  flare?: number;
};

const EDGE = 7;

export const ShotSequence: React.FC<{
  shots: readonly Shot[];
  local: number;
  publicDir: string;
  /** Frames of whip before each cut. 0 disables. */
  whip?: number;
}> = ({ shots, local, publicDir, whip = 4 }) => {
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
  const eased = Easing.cosine(t);

  const zoom = interpolate(eased, [0, 1], shot.zoom);
  const pan = shot.pan ? interpolate(eased, [0, 1], shot.pan) : 0;
  const lift = shot.lift ? interpolate(eased, [0, 1], shot.lift) : 0;
  const roll = shot.roll ? interpolate(t, [0, 1], [0, shot.roll]) : 0;

  // Whip into the cut.
  const framesLeft = start + shot.frames - local;
  const whipIn =
    whip > 0 && framesLeft <= whip && index < shots.length - 1
      ? 1 - framesLeft / whip
      : 0;
  const exitScale = 1 + whipIn * 0.05;
  const exitOpacity = 1 - whipIn * 0.5;

  // Reveal: panels wipe in from a hair above their resting place.
  const reveal = interpolate(local - start, [0, 8], [0, 1], { easing: Easing.out });

  const flare = shot.flare
    ? interpolate(local - start, [0, 7], [shot.flare, 0], { easing: Easing.out })
    : 0;

  const { x, y, width, height } = shot.layout;

  return (
    <g opacity={exitOpacity}>
      {/* A panel's ground: pure black behind the contained picture, so the
          shot reads as a composed frame rather than a failed full-bleed. */}
      {shot.layout.panel ? (
        <rect x={0} y={0} width={1080} height={1920} fill={BRAND.ink} />
      ) : null}

      <defs>
        <clipPath id={`shot-${index}`}>
          <rect
            x={x}
            y={y + (1 - reveal) * 26}
            width={width}
            height={height}
          />
        </clipPath>
      </defs>

      <g clipPath={`url(#shot-${index})`}>
        <CameraGroup zoom={zoom * exitScale} x={pan} y={lift} rotate={roll}>
          <Plate
            src={shot.src}
            publicDir={publicDir}
            x={x - EDGE}
            y={y + (1 - reveal) * 26 - EDGE}
            width={width + EDGE * 2}
            height={height + EDGE * 2}
          />
        </CameraGroup>
      </g>

      {/* A hairline rule on the panel's leading edge — the editorial tick that
          makes a contained picture read as deliberate. */}
      {shot.layout.panel ? (
        <rect
          x={x}
          y={y - 22}
          width={Math.max(0, 74 * reveal)}
          height={2}
          fill={BRAND.white}
          fillOpacity={0.5}
        />
      ) : null}

      {flare > 0 ? (
        <rect width={1080} height={1920} fill={BRAND.white} opacity={flare * 0.07} />
      ) : null}
    </g>
  );
};

export const shotsDuration = (shots: readonly Shot[]): number =>
  shots.reduce((sum, s) => sum + s.frames, 0);
