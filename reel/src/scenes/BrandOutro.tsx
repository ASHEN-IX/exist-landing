/**
 * 05 · THE BRAND — 00:20–00:25
 *
 * Resolution. The picture fades to black and the campaign lands on its own
 * name: the official logo, one red rule, the message, and a single bordered
 * CTA. Nothing moves that does not have to.
 *
 * The CTA and the URL sit inside the Reels safe area, well clear of the
 * platform's own caption block — a CTA behind a "Follow" button is a CTA
 * nobody taps.
 */
import React from "react";
import { BRAND } from "../config/brand";
import { Easing, interpolate } from "../lib/animate";
import { useCurrentFrame } from "../lib/composition";
import { BrandEndCard } from "../components/BrandLogo";
import { Canvas, Grain } from "../components/primitives";

export type SceneProps = { publicDir: string };

export const BrandOutro: React.FC<SceneProps & {
  fps?: number;
  message1: string;
  message2: string;
  cta: string;
  url: string;
  footnote?: string;
  /** Frames in the outro, so the card can pace itself. */
  durationInFrames?: number;
}> = ({
  publicDir,
  fps = 30,
  message1,
  message2,
  cta,
  url,
  footnote,
  durationInFrames = 150,
}) => {
  const frame = useCurrentFrame();

  // The previous scene's picture is still falling away as this one opens:
  // a black wash that resolves over the first half-second so the cut to the
  // card feels like the image settling, not like a new slide.
  const settle = interpolate(frame, [0, 16], [0.55, 0], { easing: Easing.out });

  // A very slow red bloom pulse under the logo — reads as the sting ringing
  // out rather than as an animated graphic.
  const pulse = interpolate(frame, [18, 46, 110, 150], [0, 0.62, 0.5, 0.44], {
    easing: Easing.cosine,
  });

  return (
    <Canvas name="brand" background={BRAND.black}>
      <defs>
        <radialGradient id="end-bloom" cx="0.5" cy="0.5" r="0.5">
          <stop offset="0" stopColor={BRAND.red} stopOpacity={0.20 * pulse} />
          <stop offset="0.55" stopColor={BRAND.red} stopOpacity={0.06 * pulse} />
          <stop offset="1" stopColor={BRAND.red} stopOpacity="0" />
        </radialGradient>
        <linearGradient id="end-rule" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor={BRAND.red} stopOpacity="0" />
          <stop offset="0.2" stopColor={BRAND.red} stopOpacity="1" />
          <stop offset="0.8" stopColor={BRAND.red} stopOpacity="1" />
          <stop offset="1" stopColor={BRAND.red} stopOpacity="0" />
        </linearGradient>
      </defs>

      <BrandEndCard
        publicDir={publicDir}
        frame={frame}
        duration={durationInFrames}
        url={url}
        message1={message1}
        message2={message2}
        cta={cta}
        footnote={footnote}
      />

      {/* The settle wash, drawn last so it dims the whole card. */}
      <rect width={1080} height={1920} fill={BRAND.black} opacity={settle} />

      <Grain id="end-grain" frame={frame} opacity={0.038} />
    </Canvas>
  );
};
