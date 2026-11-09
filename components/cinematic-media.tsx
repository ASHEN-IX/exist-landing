"use client";

import { useEffect, useRef, useState } from "react";
import { prefersReducedMotion } from "@/lib/motion";

/**
 * Poster-first cinematic background media.
 *
 * Delivery rules this component exists to enforce:
 *   • The high-quality WebP poster paints immediately — it is the LCP element
 *     on the hero, so the video never blocks first render.
 *   • The <video> element mounts with no source. It only receives one once it
 *     is within one viewport of the fold, so a 1 MB clip below the fold costs
 *     nothing until the user starts scrolling toward it.
 *   • Playback is tied to visibility: anything off-screen is paused. Two hero
 *     clips never decode at the same time.
 *   • With `prefers-reduced-motion: reduce`, no video is ever fetched. The
 *     poster is the final state, not a fallback.
 *
 * The video fades in only after `playing` fires, so a stalled network shows
 * the poster rather than a black rectangle — no CLS, no flash.
 */

type Props = {
  /** Landscape/desktop clip. */
  desktop: { mp4: string; poster: string };
  /** Portrait/mobile clip — an independent crop, not a squeezed landscape. */
  mobile?: { mp4: string; poster: string };
  /** Below this width the portrait clip is used. */
  breakpoint?: number;
  /** Classes for the wrapper. */
  className?: string;
  /** Play only while the parent section is on screen (default true). */
  playOnVisible?: boolean;
  /** Decorative by default; set alt text if it ever carries meaning. */
  alt?: string;
};

export default function CinematicMedia({
  desktop,
  mobile,
  breakpoint = 900,
  className = "",
  playOnVisible = true,
  alt = "",
}: Props) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  // Source choice is decided on the client after mount. The poster is chosen
  // the same way so the first paint matches the eventual video crop.
  //
  // These hold PRIMITIVES, not the props objects. Callers pass inline object
  // literals (`desktop={{ mp4, poster }}`), so an object-valued dependency
  // changes identity on every render; the effect would then re-run forever,
  // resetting the loader on each pass and starving the IntersectionObserver
  // so the clip never received a `src`. Strings are stable and compare by
  // value, which is what the effect actually cares about.
  const [activeMp4, setActiveMp4] = useState<string | null>(null);
  const [activePoster, setActivePoster] = useState<string>(desktop.poster);
  const [videoReady, setVideoReady] = useState(false);
  const [reduced, setReduced] = useState(true);

  const desktopMp4 = desktop.mp4;
  const desktopPoster = desktop.poster;
  const mobileMp4 = mobile?.mp4;
  const mobilePoster = mobile?.poster;

  // --- pick source, honour reduced motion --------------------------------
  useEffect(() => {
    const motionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    const widthQuery = window.matchMedia(`(max-width: ${breakpoint}px)`);

    const pick = () => {
      // prefersReducedMotion() already reads the media query, and additionally
      // honours the ?motion= QA override so the reduced-motion path can be
      // exercised where the media feature cannot be emulated (lib/motion.ts).
      const isReduced = prefersReducedMotion();
      const useMobile = !!mobileMp4 && !!mobilePoster && widthQuery.matches;
      setReduced(isReduced);
      setActiveMp4(useMobile ? (mobileMp4 as string) : desktopMp4);
      setActivePoster(useMobile ? (mobilePoster as string) : desktopPoster);
    };

    pick();
    motionQuery.addEventListener("change", pick);
    widthQuery.addEventListener("change", pick);
    return () => {
      motionQuery.removeEventListener("change", pick);
      widthQuery.removeEventListener("change", pick);
    };
  }, [desktopMp4, desktopPoster, mobileMp4, mobilePoster, breakpoint]);

  // --- load the clip only when it is nearly on screen ---------------------
  useEffect(() => {
    if (reduced || !activeMp4) return;
    const el = wrapRef.current;
    const video = videoRef.current;
    if (!el || !video) return;

    let loaded = false;
    const load = () => {
      if (loaded) return;
      loaded = true;
      video.src = activeMp4;
      video.load();
    };

    // Above-the-fold media must not wait on an observer callback: in a
    // throttled or unfocused tab IntersectionObserver can be deferred
    // indefinitely, and the hero would sit on its poster with the clip never
    // even requested. One synchronous geometry check settles that case.
    const rect = el.getBoundingClientRect();
    if (rect.bottom > -window.innerHeight && rect.top < window.innerHeight * 2) {
      load();
      return;
    }

    // Root margin of one viewport: the clip has a head start, but nothing
    // more than a screen away is ever fetched.
    const loader = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          load();
          loader.disconnect();
        }
      },
      { rootMargin: "100% 0px" },
    );
    loader.observe(el);
    return () => loader.disconnect();
  }, [activeMp4, reduced]);

  // --- play only while visible -------------------------------------------
  useEffect(() => {
    if (reduced || !playOnVisible) return;
    const el = wrapRef.current;
    const video = videoRef.current;
    if (!el || !video) return;

    const player = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            // play() rejects when the element is not yet permitted to play
            // (no source, tab hidden). Silence it: the poster stays up.
            void video.play().catch(() => {});
          } else if (!video.paused) {
            video.pause();
          }
        }
      },
      { threshold: 0.01 },
    );
    player.observe(el);

    // Same reasoning as the loader: don't wait for the first observer tick to
    // start playback on something already in view.
    const rect = el.getBoundingClientRect();
    if (rect.bottom > 0 && rect.top < window.innerHeight) {
      void video.play().catch(() => {});
    }

    // Browsers pause background video when the tab is hidden; resume only if
    // we are still on screen.
    const onVisibility = () => {
      if (document.visibilityState === "visible") {
        const rect = el.getBoundingClientRect();
        const onScreen = rect.bottom > 0 && rect.top < window.innerHeight;
        if (onScreen) void video.play().catch(() => {});
      }
    };
    document.addEventListener("visibilitychange", onVisibility);

    return () => {
      player.disconnect();
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, [reduced, playOnVisible]);

  return (
    <div ref={wrapRef} className={`cine-media ${className}`} aria-hidden={alt ? undefined : "true"}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        className="cine-poster"
        src={activePoster}
        alt={alt}
        fetchPriority="high"
        decoding="async"
        draggable={false}
      />
      {!reduced && (
        <video
          ref={videoRef}
          className={`cine-video ${videoReady ? "is-ready" : ""}`}
          poster={activePoster}
          muted
          loop
          playsInline
          preload="none"
          disablePictureInPicture
          tabIndex={-1}
          onPlaying={() => setVideoReady(true)}
        />
      )}
      <div className="cine-grade" aria-hidden="true" />
    </div>
  );
}
