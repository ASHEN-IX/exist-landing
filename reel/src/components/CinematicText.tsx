/**
 * EXIST — cinematic typography.
 *
 * The reel uses exactly two type behaviours, and they carry the whole
 * campaign:
 *
 *  1. A *masked rise* — the line is clipped to a rectangle slightly shorter
 *     than its own height and slides up from under it. It reads as film
 *     titles rather than as a CSS fade, because the letterforms are genuinely
 *     revealed by an edge instead of fading in.
 *
 *  2. A *tracked settle* — small uppercase copy that enters slightly loose
 *     and tightens as it arrives. Micro-motion only; at 1080px the change is
 *     a few pixels, which is exactly the amount that reads as "expensive".
 *
 * Every value is driven by the frame number, so the render is deterministic.
 */
import React from "react";
import { BRAND, TYPE } from "../config/brand";
import { Easing, fade, interpolate } from "../lib/animate";

/** Letter-spacing given in em, converted to the px SVG actually wants. */
export const tracking = (fontSize: number, em: number): number => fontSize * em;

/**
 * A line that rises out from behind a mask.
 *
 * `reveal` is 0–1: at 0 the line is fully below the mask, at 1 it sits on its
 * baseline. The mask is per-line, so multi-line headings reveal line by line
 * instead of all at once.
 */
export const MaskedLine: React.FC<{
  id: string;
  children: React.ReactNode;
  x: number;
  y: number;
  fontSize: number;
  font?: string;
  fill?: string;
  italic?: boolean;
  letterSpacing?: number;
  /** 0 → 1 reveal progress. */
  reveal: number;
  /** Overall opacity, applied on top of the reveal. */
  opacity?: number;
  anchor?: "start" | "middle";
}> = ({
  id,
  children,
  x,
  y,
  fontSize,
  font = TYPE.displayUltra,
  fill = BRAND.white,
  italic = false,
  letterSpacing = 0,
  reveal,
  opacity = 1,
  anchor = "start",
}) => {
  const r = Math.max(0, Math.min(1, reveal));
  // The line travels a bit more than its own cap height so the top of the
  // mask is cleared even for letters with tall ascenders.
  const lift = (1 - r) * fontSize * 1.30;
  // The mask must clear cap height above the baseline AND the descenders of
  // an italic line (g, y, p) below it. 1.75em with a 0.45em top offset does
  // both; a tighter box clips the descenders, which reads as a broken render.
  const maskH = fontSize * 1.75;
  // Clipping rectangles cannot live inside <defs> and be reused per anchor,
  // so each line owns its own.
  const clipX = anchor === "middle" ? -540 : 0;
  return (
    <>
      <defs>
        <clipPath id={`mask-${id}`}>
          <rect
            x={x + clipX}
            y={y - maskH + fontSize * 0.55}
            width={1080}
            height={maskH}
          />
        </clipPath>
      </defs>
      <g clipPath={`url(#mask-${id})`}>
        <text
          x={x}
          y={y + lift}
          fontFamily={font}
          fontSize={fontSize}
          fill={fill}
          letterSpacing={letterSpacing}
          textAnchor={anchor}
          fontStyle={italic ? "italic" : "normal"}
          opacity={opacity}
        >
          {children}
        </text>
      </g>
    </>
  );
};

/**
 * The campaign headline lockup.
 *
 * Two lines, revealed in sequence: a light sans statement, then an italic
 * serif clause one beat later. The mix is the campaign's signature — the sans
 * states, the serif confides.
 */
export const HeadlineLockup: React.FC<{
  id: string;
  line1: string;
  line2?: string;
  x: number;
  y: number;
  fontSize?: number;
  /** Local frame. */
  frame: number;
  /** Frame the lockup begins entering. */
  start: number;
  /** Stagger between line one and line two, in frames. */
  stagger?: number;
  opacity?: number;
  anchor?: "start" | "middle";
  fill?: string;
}> = ({
  id,
  line1,
  line2,
  x,
  y,
  fontSize = 96,
  frame,
  start,
  stagger = 7,
  opacity = 1,
  anchor = "start",
  fill = BRAND.white,
}) => {
  const d = 26;
  const r1 = interpolate(frame, [start, start + d], [0, 1], {
    easing: Easing.drape,
  });
  const r2 = interpolate(frame, [start + stagger, start + stagger + d], [0, 1], {
    easing: Easing.drape,
  });
  const lineHeight = fontSize * 1.06;

  return (
    <g opacity={opacity}>
      <MaskedLine
        id={`${id}-a`}
        x={x}
        y={y}
        fontSize={fontSize}
        font={TYPE.displayUltra}
        fill={fill}
        reveal={r1}
        anchor={anchor}
        letterSpacing={tracking(fontSize, -0.018)}
      >
        {line1}
      </MaskedLine>
      {line2 ? (
        <MaskedLine
          id={`${id}-b`}
          x={x}
          y={y + lineHeight}
          fontSize={fontSize}
          font={TYPE.serifLight}
          fill={fill}
          italic
          reveal={r2}
          anchor={anchor}
          letterSpacing={tracking(fontSize, -0.004)}
        >
          {line2}
        </MaskedLine>
      ) : null}
    </g>
  );
};

/**
 * Tabular eyebrow — the collection name, scene label or CTA.
 *
 * Enters from a slightly wider track and settles. Deliberately quiet: it is
 * the least animated element on screen and that restraint is the point.
 */
export const TrackedLabel: React.FC<{
  children: React.ReactNode;
  x: number;
  y: number;
  frame: number;
  start: number;
  duration?: number;
  fontSize?: number;
  trackingEm?: number;
  fill?: string;
  opacity?: number;
  anchor?: "start" | "middle";
}> = ({
  children,
  x,
  y,
  frame,
  start,
  duration = 22,
  fontSize = 24,
  trackingEm = 0.34,
  fill = BRAND.white,
  opacity = 1,
  anchor = "start",
}) => {
  const p = interpolate(frame, [start, start + duration], [0, 1], {
    easing: Easing.out,
  });
  return (
    <text
      x={x}
      y={y}
      fontFamily={TYPE.displayMedium}
      fontSize={fontSize}
      fill={fill}
      textAnchor={anchor}
      opacity={p * opacity}
      letterSpacing={tracking(fontSize, trackingEm + (1 - p) * 0.14)}
    >
      {children}
    </text>
  );
};

/**
 * A caption card: the two-line lockup plus its red rule, faded as a unit.
 *
 * Scenes use this so every card in the reel shares one entrance, one exit and
 * one vertical rhythm.
 */
export const CaptionCard: React.FC<{
  id: string;
  line1: string;
  line2?: string;
  x: number;
  y: number;
  fontSize?: number;
  frame: number;
  /** Frames the card is on screen for, relative to the scene. */
  inStart: number;
  inDur?: number;
  outStart: number;
  outDur?: number;
  ruleWidth?: number;
  anchor?: "start" | "middle";
}> = ({
  id,
  line1,
  line2,
  x,
  y,
  fontSize = 92,
  frame,
  inStart,
  outDur = 16,
  outStart,
  ruleWidth = 132,
  anchor = "start",
}) => {
  const envelope = fade(frame, inStart, 4, outStart, outDur, Easing.linear);
  const ruleP = interpolate(frame, [inStart, inStart + 20], [0, 1], {
    easing: Easing.out,
  });
  const ruleX = anchor === "middle" ? x - ruleWidth / 2 : x;

  return (
    <g opacity={envelope}>
      <linearGradient id={`${id}-rule`} x1="0" y1="0" x2="1" y2="0">
        <stop offset="0" stopColor={BRAND.red} stopOpacity="1" />
        <stop offset="0.78" stopColor={BRAND.red} stopOpacity="1" />
        <stop offset="1" stopColor={BRAND.red} stopOpacity="0" />
      </linearGradient>
      <rect
        x={ruleX}
        y={y - fontSize - 46}
        width={ruleWidth * ruleP}
        height={2}
        fill={`url(#${id}-rule)`}
      />
      <HeadlineLockup
        id={id}
        line1={line1}
        line2={line2}
        x={x}
        y={y}
        fontSize={fontSize}
        frame={frame}
        start={inStart + 4}
        anchor={anchor}
        opacity={1}
      />
    </g>
  );
};
