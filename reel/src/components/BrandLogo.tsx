/**
 * EXIST — official logo lockup.
 *
 * The logo is the supplied file, placed 1:1. It is never redrawn, traced,
 * recoloured or re-lettered: this component only positions it and controls its
 * opacity and scale. The 167×35 source is upscaled with a smooth filter, which
 * is the honest option — a vector trace would not be "the official logo".
 */
import React from "react";
import { BRAND, SAFE, TYPE } from "../config/brand";
import { Easing, interpolate } from "../lib/animate";

export type LogoProps = {
  id: string;
  publicDir: string;
  /** Top-left of the logo box, in frame coordinates. */
  x: number;
  y: number;
  /** Rendered width in px. Height follows the source aspect (167:35). */
  width: number;
  opacity?: number;
  /** Local frame. Omit to render the logo statically at full opacity. */
  frame?: number;
  /** Frame the logo begins fading up. */
  start?: number;
  duration?: number;
  /** At 0; 1 at the end of the fade. Small settle scale. */
  settle?: boolean;
};

const LOGO_ASPECT = 35 / 167;

export const BrandLogo: React.FC<LogoProps> = ({
  id,
  publicDir,
  x,
  y,
  width,
  opacity = 1,
  frame,
  start = 0,
  duration = 24,
  settle = true,
}) => {
  const height = width * LOGO_ASPECT;

  const p =
    frame === undefined
      ? 1
      : interpolate(frame, [start, start + duration], [0, 1], {
          easing: Easing.out,
        });

  // A 1.5% scale settle. Enough to feel alive, not enough to blur the mark.
  const scale = settle ? 1 + (1 - p) * 0.015 : 1;
  const cx = x + width / 2;
  const cy = y + height / 2;

  return (
    <g opacity={opacity * p} transform={`translate(${cx} ${cy}) scale(${scale}) translate(${-cx} ${-cy})`}>
      <image
        id={id}
        href={publicDir ? `${publicDir}/brand/exist-logo-light.png` : "brand/exist-logo-light.png"}
        x={x}
        y={y}
        width={width}
        height={height}
        preserveAspectRatio="xMidYMid meet"
        style={{ imageRendering: "auto" }}
      />
    </g>
  );
};

/**
 * The full brand lockup for the outro: logo, red rule, message, CTA.
 *
 * Kept in one component so both the 25 s master and the 15 s cutdown end on
 * a pixel-identical card.
 */
export const BrandEndCard: React.FC<{
  publicDir: string;
  frame: number;
  /** Frames available to the card; drives the CTA's timing. */
  duration: number;
  /** Landing page for the Collection Cérémonie. */
  url: string;
  message1: string;
  message2: string;
  cta: string;
  /** Optional quieter line under the CTA — the academic disclaimer. */
  footnote?: string;
}> = ({ publicDir, frame, duration, url, message1, message2, cta, footnote }) => {
  // Timing is expressed as fractions of the card so the 25 s outro and the
  // re-cut 15 s outro share one rhythm instead of drifting apart.
  const logoStart = Math.round(duration * 0.10);
  const msgStart = Math.round(duration * 0.30);
  const ctaStart = Math.round(duration * 0.52);
  const step = (n: number) => Math.round(duration * n);

  const ruleP = interpolate(frame, [step(0.24), step(0.24) + 22], [0, 1], {
    easing: Easing.out,
  });
  const ctaP = interpolate(frame, [ctaStart, ctaStart + 20], [0, 1], {
    easing: Easing.out,
  });

  return (
    <g>
      {/* A single soft red bloom behind the mark — the only colour in the card. */}
      <ellipse
        cx={540}
        cy={878}
        rx={340}
        ry={215}
        fill="url(#end-bloom)"
        opacity={interpolate(frame, [0, 24], [0, 1], { easing: Easing.out })}
      />

      <BrandLogo
        id="end-logo"
        publicDir={publicDir}
        x={540 - 230}
        y={826}
        width={460}
        frame={frame}
        start={logoStart}
        duration={26}
      />

      <rect
        x={540 - 60}
        y={938}
        width={120 * ruleP}
        height={2}
        fill="url(#end-rule)"
      />

      <text
        x={540}
        y={1054}
        fontFamily={TYPE.displayUltra}
        fontSize={46}
        fill={BRAND.white}
        textAnchor="middle"
        opacity={interpolate(frame, [msgStart, msgStart + 26], [0, 1], {
          easing: Easing.out,
        })}
      >
        {message1}
      </text>
      <text
        x={540}
        y={1114}
        fontFamily={TYPE.serifLight}
        fontSize={46}
        fontStyle="italic"
        fill={BRAND.white}
        textAnchor="middle"
        opacity={interpolate(frame, [msgStart + 8, msgStart + 34], [0, 1], {
          easing: Easing.out,
        })}
      >
        {message2}
      </text>

      <g opacity={ctaP}>
        <rect
          x={540 - 222}
          y={1200}
          width={444}
          height={84}
          fill="none"
          stroke={BRAND.white}
          strokeOpacity={0.42}
          strokeWidth={1.5}
        />
        <text
          x={540}
          y={1254}
          fontFamily={TYPE.displayMedium}
          fontSize={24}
          fill={BRAND.white}
          textAnchor="middle"
          letterSpacing={2.2}
        >
          {cta.toUpperCase()}
        </text>
      </g>

      <text
        x={540}
        y={1352}
        fontFamily={TYPE.displayLight}
        fontSize={23}
        fill={BRAND.white}
        fillOpacity={0.52}
        textAnchor="middle"
        letterSpacing={1.6}
        opacity={interpolate(frame, [ctaStart + 10, ctaStart + 30], [0, 1], {
          easing: Easing.out,
        })}
      >
        {url}
      </text>

      {footnote ? (
        <text
          x={540}
          y={SAFE.bottom}
          fontFamily={TYPE.displayLight}
          fontSize={17}
          fill={BRAND.white}
          fillOpacity={0.3}
          textAnchor="middle"
          letterSpacing={1.2}
          opacity={interpolate(frame, [ctaStart + 18, ctaStart + 38], [0, 1], {
            easing: Easing.out,
          })}
        >
          {footnote}
        </text>
      ) : null}
    </g>
  );
};
