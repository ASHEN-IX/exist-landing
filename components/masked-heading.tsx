"use client";

import type { ElementType, ReactNode } from "react";

/**
 * Line-masked typographic reveal.
 *
 * Each line sits in its own clipping window and its inner span is translated
 * out of the window from below — so the type is revealed rather than faded.
 * This is the only headline entrance in the experience; a letter-by-letter
 * "explosion" would fight the restraint of the rest of the page.
 *
 * GSAP owns `[data-line-inner]` inside this component (see use-page-motion).
 * Do not also animate these nodes from Motion.
 */
export default function MaskedHeading({
  lines,
  as: Tag = "h2",
  className = "",
  delay = 0,
}: {
  /** One entry per visual line. Strings render as-is; nodes for inline marks. */
  lines: ReactNode[];
  as?: ElementType;
  className?: string;
  /** Seconds of stagger offset, applied by the caller's timeline. */
  delay?: number;
}) {
  return (
    <Tag className={`masked-heading ${className}`} data-mask-heading data-mask-delay={delay}>
      {lines.map((line, i) => (
        <span className="line-mask" key={i}>
          <span className="line-inner" data-line-inner>
            {line}
          </span>
        </span>
      ))}
    </Tag>
  );
}
