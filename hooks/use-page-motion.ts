"use client";

import { useEffect } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import {
  DURATION,
  EASE,
  INTRO,
  SCROLL,
  STAGGER,
  applyMotionPreference,
  prefersReducedMotion,
  registerGSAP,
} from "@/lib/motion";

/**
 * Masked lines are pre-hidden by CSS with `translateY(112%)` so nothing
 * flashes before hydration. GSAP reads that computed matrix as a pixel `y`
 * offset, so animating `yPercent` alone would leave the line parked ~70 px
 * down — text permanently half-hidden.
 *
 * The fix is to state the start in the same unit GSAP is going to write:
 * measure each line's own height and animate `y` in pixels, explicitly
 * clearing `yPercent`. GSAP then owns the transform outright.
 */
function lineRevealFrom(nodes: Element[] | NodeListOf<Element>) {
  return {
    yPercent: 0,
    y: (_i: number, el: Element) => (el as HTMLElement).offsetHeight * 1.12,
  };
}

/**
 * The page's scroll choreography, in one scoped context.
 *
 * Everything here is idempotent and reversible: a single `gsap.context` owns
 * every tween and ScrollTrigger, and `ctx.revert()` on unmount kills them all
 * and restores the untouched DOM. That is what keeps a warm navigation or a
 * Fast Refresh from stacking duplicate triggers.
 *
 * Scroll-linked (scrubbed) vs. entrance (played once):
 *   scrubbed  — camera moves the user drives: hero push-in, parallax, the
 *               craft segment's progress. These must be linear (`none`),
 *               because the scroll position *is* the easing.
 *   entrance  — content arriving: played once, eased, and never reversed on
 *               scroll-up, so text a user has already read does not re-animate
 *               under them.
 */
export default function usePageMotion(root: React.RefObject<HTMLElement | null>) {
  useEffect(() => {
    if (!root.current) return;

    // Mirror the OS (or QA) preference onto the document before deciding
    // anything, so the CSS side agrees with this branch.
    applyMotionPreference();

    // Reduced motion: leave the DOM exactly as authored. The CSS withholds
    // every hidden-initial state when motion is off (they are scoped to
    // `.motion-ready`, which we never add), so nothing is invisible and
    // nothing moves.
    if (prefersReducedMotion()) return;

    registerGSAP();

    // Tell CSS it may now pre-hide the nodes GSAP is about to animate. This
    // runs in the same tick as the timeline setup below, before paint, so the
    // headline never flashes at its final position first. If this hook never
    // runs, the class is never added and everything stays visible.
    document.documentElement.classList.add("motion-ready");

    const ctx = gsap.context((self) => {
      const q = self.selector!;

      // ---------------------------------------------------------------
      // HERO INTRO
      // A ~2.2 s choreography that never blocks input: the page is
      // interactive from the first frame and every element is only
      // opacity/transform animated.
      //
      // `immediateRender: true` on the fromTo tweens below is essential —
      // their start values must be applied now, at setup, not when the
      // tween first ticks. Otherwise the curtain would be visible for a
      // frame before it had been pushed to opacity 1.
      // ---------------------------------------------------------------
      const intro = gsap.timeline({
        defaults: { ease: EASE.out },
        // Nothing on the page waits on this timeline.
        delay: 0.05,
      });

      // 0.0–0.5 — the curtain lifts off the first video frame.
      intro
        .fromTo(
          q("[data-intro-curtain]"),
          { opacity: 1 },
          { opacity: 0, duration: INTRO.curtainEnd - INTRO.curtainStart, ease: EASE.inOut },
          INTRO.curtainStart,
        )
        // the frame itself settles from a slow push to rest
        .fromTo(
          q("[data-hero-plate]"),
          { scale: 1.055 },
          { scale: 1, duration: 2.6, ease: "power2.out" },
          0,
        )
        // 0.4–1.1 — chrome: logo, nav, actions
        .fromTo(
          q("[data-intro-chrome] > *"),
          { opacity: 0, y: -10 },
          {
            opacity: 1,
            y: 0,
            duration: DURATION.base,
            stagger: STAGGER.tight,
          },
          INTRO.chromeStart,
        )
        // 0.8–1.8 — the collection headline, line by line
        .fromTo(
          q("[data-hero-line] [data-line-inner]"),
          lineRevealFrom(q("[data-hero-line] [data-line-inner]")),
          {
            yPercent: 0,
            y: 0,
            duration: 1,
            stagger: STAGGER.base,
            ease: EASE.expo,
          },
          INTRO.headlineStart,
        )
        // the eyebrow and its rule lead the headline in
        .fromTo(
          q("[data-hero-eyebrow]"),
          { opacity: 0, x: -14 },
          { opacity: 1, x: 0, duration: 0.7 },
          INTRO.headlineStart - 0.15,
        )
        // 1.5–2.2 — supporting copy, CTAs, scroll cue
        .fromTo(
          q("[data-hero-support] > *"),
          { opacity: 0, y: 22 },
          {
            opacity: 1,
            y: 0,
            duration: DURATION.slow,
            stagger: STAGGER.base,
          },
          INTRO.supportStart,
        )
        .fromTo(
          q("[data-hero-cue]"),
          { opacity: 0, y: 12 },
          { opacity: 1, y: 0, duration: DURATION.slow },
          INTRO.supportStart + 0.35,
        );

      // ---------------------------------------------------------------
      // SCENE A — the hero recedes as the collection begins.
      // One scrubbed timeline drives the plate, the copy and the fade to
      // black together so the transition is a single camera move.
      // -----------------------------------------------------------------
      const heroTl = gsap.timeline({
        scrollTrigger: {
          trigger: ".hero",
          start: "top top",
          end: "bottom top",
          scrub: true,
        },
      });

      heroTl
        .to(q("[data-hero-plate]"), { scale: 1.14, yPercent: 6, ease: "none" }, 0)
        .to(q("[data-hero-copy]"), { yPercent: -14, opacity: 0.15, ease: "none" }, 0)
        .to(q("[data-hero-veil]"), { opacity: 1, ease: "none" }, 0)
        .to(q("[data-hero-cue]"), { opacity: 0, ease: "none" }, 0);

      // ---------------------------------------------------------------
      // ENTRANCES — one convention for the whole page.
      // `data-reveal`      : a block rising into place
      // `data-reveal-soft` : opacity only (for large media, avoids jitter)
      // `data-mask-heading`: line-masked headline
      // `data-stagger-kids`: direct children arrive in sequence
      // -----------------------------------------------------------------
      q("[data-mask-heading]").forEach((heading: HTMLElement) => {
        const lines = heading.querySelectorAll("[data-line-inner]");
        gsap.fromTo(
          lines,
          lineRevealFrom(lines),
          {
            yPercent: 0,
            y: 0,
            duration: 1.05,
            stagger: STAGGER.tight,
            ease: EASE.expo,
            scrollTrigger: {
              trigger: heading,
              start: SCROLL.entryStart,
              once: true,
            },
          },
        );
      });

      q("[data-reveal]").forEach((el: HTMLElement) => {
        gsap.fromTo(
          el,
          { y: 44, opacity: 0 },
          {
            y: 0,
            opacity: 1,
            duration: DURATION.slow,
            ease: EASE.out,
            scrollTrigger: { trigger: el, start: SCROLL.entryStart, once: true },
          },
        );
      });

      q("[data-reveal-soft]").forEach((el: HTMLElement) => {
        gsap.fromTo(
          el,
          { opacity: 0 },
          {
            opacity: 1,
            duration: 1.2,
            ease: EASE.inOut,
            scrollTrigger: { trigger: el, start: SCROLL.mediaStart, once: true },
          },
        );
      });

      q("[data-stagger-kids]").forEach((group: HTMLElement) => {
        gsap.fromTo(
          Array.from(group.children),
          { y: 38, opacity: 0 },
          {
            y: 0,
            opacity: 1,
            duration: DURATION.base,
            stagger: STAGGER.base,
            ease: EASE.out,
            scrollTrigger: { trigger: group, start: SCROLL.entryStart, once: true },
          },
        );
      });

      // ---------------------------------------------------------------
      // SCENE B — editorial parallax inside the collection.
      // Product imagery drifts against the page at a slow rate; nothing is
      // pinned, so the content is never trapped.
      // -----------------------------------------------------------------
      q("[data-parallax]").forEach((el: HTMLElement) => {
        const depth = Number(el.dataset.parallax || 40);
        gsap.fromTo(
          el,
          { yPercent: -depth * 0.5 },
          {
            yPercent: depth * 0.5,
            ease: "none",
            scrollTrigger: {
              trigger: el.closest("[data-parallax-scope]") || el,
              start: "top bottom",
              end: "bottom top",
              scrub: SCROLL.scrub,
            },
          },
        );
      });

      // Image depth on hover is CSS (see .depth-frame); scroll adds a whisper
      // of scale so the product feels photographed rather than pasted.

      // ---------------------------------------------------------------
      // SCENE C — craft. Progress rail + frame counter for the detail block.
      // -----------------------------------------------------------------
      const craftSection = q("[data-craft]")[0] as HTMLElement | undefined;
      if (craftSection) {
        const rail = craftSection.querySelector("[data-craft-rail]");
        gsap.fromTo(
          rail,
          { scaleX: 0 },
          {
            scaleX: 1,
            ease: "none",
            scrollTrigger: {
              trigger: craftSection,
              start: "top 70%",
              end: "bottom 60%",
              scrub: SCROLL.scrub,
            },
          },
        );

        // Parallax on the macro frame, slower than the copy above it.
        gsap.fromTo(
          craftSection.querySelector("[data-craft-media]"),
          { scale: 1.12 },
          {
            scale: 1,
            ease: "none",
            scrollTrigger: {
              trigger: craftSection,
              start: "top bottom",
              end: "bottom top",
              scrub: true,
            },
          },
        );
      }

      // ---------------------------------------------------------------
      // SCENE D — closing campaign moment.
      // The plate brightens and settles as it arrives, then holds. No pin.
      // -----------------------------------------------------------------
      const closing = q(".closing-section")[0] as HTMLElement | undefined;
      if (closing) {
        gsap.fromTo(
          closing.querySelector("[data-closing-media]"),
          { scale: 1.16, opacity: 0.35 },
          {
            scale: 1,
            opacity: 1,
            ease: "none",
            scrollTrigger: {
              trigger: closing,
              start: "top bottom",
              end: "center center",
              scrub: SCROLL.scrub,
            },
          },
        );
      }

      // ---------------------------------------------------------------
      // HEADER — one passive read, no per-scroll React state.
      // Tailwind-free: toggling the class is cheaper than a render.
      // -----------------------------------------------------------------
      const header = q(".site-header")[0] as HTMLElement | undefined;
      if (header) {
        ScrollTrigger.create({
          start: 42,
          end: "max",
          onToggle: ({ isActive }) => header.classList.toggle("is-scrolled", isActive),
        });
      }

      // Section nav state — the underline follows what is actually on screen.
      const navLinks = Array.from(
        q(".desktop-nav a") as unknown as HTMLElement[],
      );
      navLinks.forEach((link) => {
        const id = link.getAttribute("href");
        if (!id?.startsWith("#")) return;
        const target = document.querySelector(id);
        if (!target) return;
        ScrollTrigger.create({
          trigger: target as HTMLElement,
          start: "top 45%",
          end: "bottom 45%",
          onToggle: ({ isActive }) => {
            if (isActive) {
              navLinks.forEach((l) => l.classList.remove("active"));
              link.classList.add("active");
            }
          },
        });
      });

      // ---------------------------------------------------------------
      // Opt-in instrumentation for automated verification:
      //   ?debug=motion  →  window.__existMotion = { intro, scrollTrigger }
      // The animation clock is otherwise invisible to a test harness, and a
      // throttled/background tab stretches a 2 s intro into a minute. Off by
      // default; never present in a normal visit.
      // ---------------------------------------------------------------
      if (new URLSearchParams(window.location.search).get("debug") === "motion") {
        (window as unknown as Record<string, unknown>).__existMotion = {
          intro,
          scrollTrigger: ScrollTrigger,
        };
        const markDone = () => {
          document.documentElement.dataset.intro = "done";
        };
        intro.eventCallback("onComplete", markDone);
        window.setTimeout(markDone, 4000);
      }
    }, root);

    // Recalculate once fonts and images have settled — the Google Fonts
    // stylesheet can shift layout after first paint, which would leave every
    // trigger's start position measured against stale geometry.
    const refresh = () => ScrollTrigger.refresh();
    if (document.fonts?.ready) void document.fonts.ready.then(refresh);
    window.addEventListener("load", refresh, { once: true });

    return () => {
      window.removeEventListener("load", refresh);
      ctx.revert();
      // Reverting restores the DOM it touched; hand the pre-hidden states
      // back to CSS only if we are still the ones owning them.
      document.documentElement.classList.remove("motion-ready");
      delete (window as unknown as Record<string, unknown>).__existMotion;
    };
  }, [root]);
}
