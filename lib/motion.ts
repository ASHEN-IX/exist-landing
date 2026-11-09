/**
 * EXIST — motion system.
 *
 * One place for every timing, easing and distance in the experience, so the
 * page reads as a single camera rather than a collection of effects.
 *
 * OWNERSHIP RULE (important):
 *   GSAP owns scroll-linked motion and the hero intro.
 *   Motion owns interaction: hover, tap, presence, layout swaps.
 *   No element is animated by both engines on the same property.
 *   Elements marked with a `data-*` hook below are GSAP's alone — never give
 *   them a Motion `animate`/`whileHover` on transform or opacity.
 */

import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

/* -------------------------------------------------------------------------
   Shared vocabulary
   ------------------------------------------------------------------------- */

/** Durations in seconds. Identical for GSAP and Motion. */
export const DURATION = {
  micro: 0.18,
  fast: 0.36,
  base: 0.7,
  slow: 1.1,
  film: 1.6,
} as const;

/** Travel distances in pixels. */
export const DISTANCE = {
  xs: 8,
  sm: 18,
  md: 40,
  lg: 96,
} as const;

/** Stagger intervals in seconds. */
export const STAGGER = {
  tight: 0.05,
  base: 0.09,
  loose: 0.15,
} as const;

/* -------------------------------------------------------------------------
   Easings — two parallel registries, same curves
   GSAP takes strings; Motion takes a cubic-bezier tuple (or a Motion easing
   name). Keeping them adjacent is what stops the page drifting into two
   different motion languages.
   ------------------------------------------------------------------------- */

export const EASE = {
  /** Settles fast, then floats. Default for things arriving. */
  out: "power3.out",
  /** Symmetric, for camera moves that must end where they began. */
  inOut: "power2.inOut",
  /** Long, decelerating. Headline reveals only. */
  expo: "expo.out",
  /** No easing — scrubbed timelines already map to scroll. */
  linear: "none",
} as const;

/** Motion equivalents of EASE, as cubic-bezier tuples. */
export const EASE_CSS = {
  out: [0.16, 0.84, 0.36, 1],
  inOut: [0.65, 0.05, 0.36, 1],
} as const;

/**
 * Hero intro clock, in seconds. The brief's sequence, kept as data so the
 * choreography can be retimed without hunting through the component.
 */
export const INTRO = {
  curtainStart: 0.0,
  curtainEnd: 0.5,
  chromeStart: 0.4,
  chromeEnd: 1.1,
  headlineStart: 0.8,
  headlineEnd: 1.8,
  supportStart: 1.5,
  supportEnd: 2.2,
} as const;

/** Shared ScrollTrigger config so every trigger behaves alike. */
export const SCROLL = {
  /** Standard entrance: element top meets 88% of the viewport. */
  entryStart: "top 88%",
  /** Wide media: starts earlier so large images are never caught mid-fade. */
  mediaStart: "top 92%",
  scrub: 0.6,
} as const;

let registered = false;

/** Register ScrollTrigger exactly once per page, for any entry point. */
export function registerGSAP() {
  if (registered || typeof window === "undefined") return;
  gsap.registerPlugin(ScrollTrigger);
  gsap.defaults({ ease: EASE.out, duration: DURATION.base });
  registered = true;
}

/**
 * QA override for the reduced-motion path.
 *
 * Browser automation here cannot emulate the media feature (the sandbox
 * blocks Chromium, and the in-app preview has no motion emulation), so the
 * most important accessibility branch would otherwise be untested. `?motion=reduce`
 * forces it on, `?motion=full` forces it off. Both are only read from the URL
 * — nothing persists, and a normal visit is unaffected.
 */
function motionOverride(): boolean | null {
  if (typeof window === "undefined") return null;
  const value = new URLSearchParams(window.location.search).get("motion");
  if (value === "reduce") return true;
  if (value === "full") return false;
  return null;
}

/** Live check — respects a mid-session OS change and the QA override. */
export function prefersReducedMotion() {
  if (typeof window === "undefined") return false;
  const override = motionOverride();
  if (override !== null) return override;
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

/**
 * Apply the reduced-motion decision to the document, once, at boot.
 *
 * GSAP cannot run under `prefers-reduced-motion: reduce`, so the hook simply
 * bails — but the CSS side still has to know, because a few decorative rules
 * are class-scoped rather than media-scoped. Setting the class also lets the
 * `?motion=reduce` QA path behave identically to a real OS preference.
 */
export function applyMotionPreference() {
  if (typeof document === "undefined") return;
  document.documentElement.classList.toggle(
    "motion-reduced",
    prefersReducedMotion(),
  );
}

/** True only for mice/trackpads; touch and coarse pointers skip hover work. */
export function hasFinePointer() {
  return (
    typeof window !== "undefined" &&
    window.matchMedia("(hover: hover) and (pointer: fine)").matches
  );
}
