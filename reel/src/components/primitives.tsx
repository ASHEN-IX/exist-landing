/**
 * EXIST — SVG scene primitives.
 *
 * Every scene composes from these. They are plain SVG elements rendered by
 * React on the server, so there is no DOM, no layout engine and no browser:
 * what you write is what rasterises, pixel for pixel, on every frame.
 */
import React from "react";
import { BRAND, TYPE } from "../config/brand";

/* --------------------------------------------------------------------------
 * Plates — photographic stills
 * ----------------------------------------------------------------------- */

export type PlateProps = {
  /** Path under the reel's public/ folder, e.g. "images/rv-plate.png". */
  src: string;
  /** Crop window in final-frame pixels. */
  x?: number;
  y?: number;
  width?: number;
  height?: number;
  /** Seconds-independent offset baked into the href to defeat caching. */
  opacity?: number;
  /** Prefix for the href — empty when the SVG lives inside public/. */
  publicDir: string;
};

/**
 * A photographic plate.
 *
 * `preserveAspectRatio="xMidYMid slice"` means the image fills the crop
 * without distortion — the scene's crop window, not the image, defines the
 * framing. That is what lets a 577px source behave like a long lens: you
 * never see the whole frame, only the part the camera is looking at.
 */
export const Plate: React.FC<PlateProps> = ({
  src,
  x = 0,
  y = 0,
  width = 1080,
  height = 1920,
  opacity = 1,
  publicDir,
}) => (
  <image
    href={publicDir ? `${publicDir}/${src}` : src}
    x={x}
    y={y}
    width={width}
    height={height}
    preserveAspectRatio="xMidYMid slice"
    opacity={opacity}
  />
);

/* --------------------------------------------------------------------------
 * Cinematic grading
 * ----------------------------------------------------------------------- */

/** Letterbox-free top/bottom falloff that seats the picture in black. */
export const GroundGradient: React.FC<{
  id: string;
  top?: number;
  bottom?: number;
  mid?: number;
}> = ({ id, top = 0.9, bottom = 0.95, mid = 0.42 }) => (
  <linearGradient id={id} x1="0" y1="0" x2="0" y2="1">
    <stop offset="0" stopColor={BRAND.ink} stopOpacity={top} />
    <stop offset={mid} stopColor={BRAND.ink} stopOpacity={0} />
    <stop offset="1" stopColor={BRAND.ink} stopOpacity={bottom} />
  </linearGradient>
);

/** Radial vignette. Pulls the eye to the centre without a hard edge. */
export const VignetteGradient: React.FC<{ id: string; strength?: number }> = ({
  id,
  strength = 0.82,
}) => (
  <radialGradient id={id} cx="0.5" cy="0.46" r="0.72">
    <stop offset="0.42" stopColor={BRAND.ink} stopOpacity={0} />
    <stop offset="1" stopColor={BRAND.ink} stopOpacity={strength} />
  </radialGradient>
);

/**
 * Film grain.
 *
 * One turbulence field per frame, seeded by the frame number so the grain
 * crawls the way real emulsion does instead of sitting still. Kept very low
 * opacity: it should read as texture at 100%, not as noise.
 */
export const Grain: React.FC<{
  id: string;
  frame: number;
  opacity?: number;
  width?: number;
  height?: number;
}> = ({ id, frame, opacity = 0.055, width = 1080, height = 1920 }) => (
  <>
    <filter id={id} x="0" y="0" width="100%" height="100%">
      <feTurbulence
        type="fractalNoise"
        baseFrequency="0.72"
        numOctaves="3"
        seed={frame % 97}
        stitchTiles="stitch"
      />
      <feColorMatrix type="saturate" values="0" />
      <feComponentTransfer>
        <feFuncA type="linear" slope={opacity} intercept="0" />
      </feComponentTransfer>
    </filter>
    <rect width={width} height={height} filter={`url(#${id})`} />
  </>
);

/**
 * Brand-red accent bar with a feathered leading edge.
 *
 * Drawn as a gradient rather than a solid rect so it reads as a light streak
 * rather than a UI element.
 */
export const RedRule: React.FC<{
  id: string;
  x: number;
  y: number;
  width: number;
  height?: number;
  opacity?: number;
  /** 0 → 1. Animates the rule drawing on from the left. */
  progress?: number;
}> = ({ id, x, y, width, height = 2, opacity = 1, progress = 1 }) => {
  const w = Math.max(0.01, width * progress);
  return (
    <>
      <linearGradient id={id} x1="0" y1="0" x2="1" y2="0">
        <stop offset="0" stopColor={BRAND.red} stopOpacity="1" />
        <stop offset="0.72" stopColor={BRAND.red} stopOpacity="1" />
        <stop offset="1" stopColor={BRAND.red} stopOpacity="0" />
      </linearGradient>
      <rect
        x={x}
        y={y}
        width={w}
        height={height}
        fill={`url(#${id})`}
        opacity={opacity}
      />
    </>
  );
};

/* --------------------------------------------------------------------------
 * Typography
 * ----------------------------------------------------------------------- */

export type TextProps = {
  children: React.ReactNode;
  x: number;
  y: number;
  /** Family name that carries the weight — see TYPE in config/brand.ts. */
  font?: string;
  fontSize: number;
  fill?: string;
  opacity?: number;
  letterSpacing?: number;
  /** "start" | "middle" | "end" */
  anchor?: "start" | "middle" | "end";
  italic?: boolean;
  /** Line-height multiplier, used by the two-line helpers below. */
  lineHeight?: number;
};

/** A single typographic line. */
export const Line: React.FC<TextProps> = ({
  children,
  x,
  y,
  font = TYPE.displayLight,
  fontSize,
  fill = BRAND.white,
  opacity = 1,
  letterSpacing = 0,
  anchor = "start",
  italic = false,
}) => (
  <text
    x={x}
    y={y}
    fontFamily={font}
    fontSize={fontSize}
    fill={fill}
    opacity={opacity}
    letterSpacing={letterSpacing}
    textAnchor={anchor}
    fontStyle={italic ? "italic" : "normal"}
    dominantBaseline="alphabetic"
  >
    {children}
  </text>
);

/**
 * Utility / eyebrow type — small, widely tracked, uppercase.
 *
 * This is the "editorial device" of the reel: collection name, scene labels
 * and the CTA all use it, which is what makes otherwise different scenes read
 * as one campaign.
 */
export const Eyebrow: React.FC<Omit<TextProps, "italic">> = ({
  letterSpacing = 0.34,
  ...rest
}) => <Line {...rest} font={TYPE.displayMedium} letterSpacing={letterSpacing} />;

/* --------------------------------------------------------------------------
 * Layout
 * ----------------------------------------------------------------------- */

/** The reel's frame, used to keep everything on one canvas. */
export const Canvas: React.FC<{
  children: React.ReactNode;
  background?: string;
  name?: string;
}> = ({ children, background = BRAND.black, name }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    xmlnsXlink="http://www.w3.org/1999/xlink"
    width={1080}
    height={1920}
    viewBox="0 0 1080 1920"
    data-scene={name}
  >
    <rect width="1080" height="1920" fill={background} />
    {children}
  </svg>
);

/**
 * A camera move applied to a group.
 *
 * Rather than moving the plate, we move and scale the whole group about the
 * frame centre — which is what a real dolly-in does, and it means the grain
 * and vignette move with the picture instead of sitting on top of it.
 */
export const CameraGroup: React.FC<{
  zoom?: number;
  x?: number;
  y?: number;
  rotate?: number;
  /** Centre of the move, in frame coordinates. Defaults to frame centre. */
  cx?: number;
  cy?: number;
  children: React.ReactNode;
  opacity?: number;
}> = ({ zoom = 1, x = 0, y = 0, rotate = 0, cx = 540, cy = 960, children, opacity = 1 }) => (
  <g
    opacity={opacity}
    transform={`translate(${cx + x} ${cy + y}) rotate(${rotate}) scale(${zoom}) translate(${-cx} ${-cy})`}
  >
    {children}
  </g>
);
