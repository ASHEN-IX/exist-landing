# EXIST — Collection Cérémonie · Cinematic Enhancement Report

## What changed, in one paragraph

The landing page kept its structure, copy, CTAs and brand identity, and gained a
cinematic layer: a real video hero with a timed intro sequence, a single GSAP
scroll timeline that carries the eye from the hero through the collection, a
new craft section built on a macro treatment, and a closing campaign moment.
Underneath, the three.js satin ribbon — which crashed the entire page on any
machine without WebGL — was removed and replaced with a CSS accent, the media
pipeline was rebuilt poster-first with lazy video, and a motion system with one
set of tokens now governs every animation.

---

## 1. Audit findings

| Finding | Severity | Action |
|---|---|---|
| Three.js ribbon threw `Error creating WebGL context` and took down the whole page on any machine without WebGL (confirmed in this environment) | **Blocker** | Removed. `three`, `@react-three/fiber`, `@types/three` dropped from `package.json`. Replaced with a CSS conic-gradient ribbon. |
| Hero used a CSS `background-image`, not video — no cinematic layer existed at all | High | Rebuilt as layered plate (video/poster) + veil + copy + curtain. |
| `window.addEventListener("scroll", …)` toggled header state through React `setState` on every scroll event | High | Replaced with a single ScrollTrigger `onToggle` that flips a class. Zero renders while scrolling. |
| `gsap.fromTo(... toggleActions: "play none none reverse")` reversed reveals on scroll-up, re-animating text the user had already read | Medium | Changed to `once: true`. |
| Motion `whileHover={{ y: -3 }}` and CSS `:hover` transform fought on the CTA | Medium | CTA is now CSS-only (magnetic pull + press composed in one transform). Motion no longer writes `transform` there. |
| Occasion / film images carried the old mockup's own captions burned into the pixels, colliding with the live overlays | Medium | Re-cropped above the burned-in text; added `occasion-*.webp`. |
| Headline had no reveal; sections used undifferentiated fade-ups | Medium | `MaskedHeading` with per-line clipping masks, one shared easing. |
| All imagery was ≤ 577 px wide; no posters, no responsive video sources | Medium | New aligned media build, posters at delivery width. Still sources — see §5. |
| Reduced motion only disabled GSAP; decorative CSS animation still ran | Low | Full reduced-motion branch: no video fetched, no ribbon, no curtain, text never pre-hidden. |
| Focus ring colour differed between the brand link and every other control | Low | One focus rule (`#ff3355`, 3 px, 4 px offset). |

---

## 2. Motion system

`lib/motion.ts` is the single vocabulary: `DURATION`, `DISTANCE`, `STAGGER`,
`EASE` (GSAP strings) and `EASE_CSS` (the same curves as Motion tuples),
`INTRO` (the hero clock), `SCROLL` (trigger conventions), plus
`prefersReducedMotion()`, `hasFinePointer()` and `applyMotionPreference()`.

**Ownership rule, enforced by convention and documented in the file:** GSAP
owns scroll-linked motion and the hero intro; Motion owns interaction, presence
and layout. No property is animated by both engines on the same element — that
was the specific bug fixed on the CTA.

**Conventions**

- One `gsap.context(…, root)` per page. `ctx.revert()` on unmount kills every
  tween and ScrollTrigger and restores the DOM, so Fast Refresh and a warm
  navigation cannot stack duplicates.
- Scrubbed timelines use `ease: "none"` — the scroll position *is* the easing.
- Entrance reveals are `once: true` and never reverse.
- `ScrollTrigger.refresh()` runs after `document.fonts.ready` and on `load`,
  so trigger positions are measured against final geometry (the Google Fonts
  stylesheet shifts layout after first paint).
- Pointer work writes CSS custom properties through `requestAnimationFrame`,
  never React state — `useMagnetic` re-renders zero times per pointer move.

### Hero intro clock (`INTRO`)

| Time | Beat |
|---|---|
| 0.0–0.5 s | Curtain lifts off frame 0; the plate settles from a 5.5 % push to rest |
| 0.4–1.1 s | Logo, nav, actions rise in sequence |
| 0.8–1.8 s | Headline, line by line, out of clipping masks |
| 1.5–2.2 s | Subtitle, CTAs, scroll cue |

Nothing blocks input. The curtain is `pointer-events: none`, the page is
interactive from the first frame, and the whole sequence is opacity/transform
only.

---

## 3. Media pipeline

`components/cinematic-media.tsx` enforces the loading contract:

- **Poster first.** A 17–46 KB WebP paints immediately; it is the LCP element
  on the hero. The `<video>` starts with no source.
- **Lazy by one viewport.** The clip is only attached to the element once it is
  within a screen of the fold. Below-the-fold clips cost nothing until the user
  scrolls toward them.
- **Play only while visible.** `IntersectionObserver` pauses anything off
  screen, and `visibilitychange` handles backgrounded tabs. Two hero clips
  never decode simultaneously.
- **Reduced motion fetches nothing.** No `<video>` element at all; the poster
  is the final state.
- **No CLS.** Everything is absolutely positioned inside a fixed-ratio parent,
  and the video fades in only after `playing` fires — a stalled network shows
  the poster, never a black rectangle.
- **Responsive source.** An independent portrait clip below 900 px, not a
  squeezed landscape.

`scripts/build-media.sh` builds the assets: compose a plate at 1.25× delivery
size, animate it with `zoompan` on a raised cosine (zero velocity at both
ends, so the loop has no seam), encode H.264 High with a fixed 60-frame GOP
and `+faststart`, then extract frame 0 as the poster.

---

## 4. Validation

### What was actually run

| Check | Result |
|---|---|
| `npx tsc --noEmit` | Pass, 0 errors |
| `npx next build` | Pass — compiled, TypeScript checked, 3/3 static pages |
| Browser render, 1440×900 | Verified in the in-app preview |
| Browser render, 390×844 | Verified |
| Reduced-motion path | Verified via `?motion=reduce` (see below) |
| Horizontal overflow, both viewports | None (`scrollWidth === clientWidth`) |
| All `[data-reveal]` / `[data-stagger-kids]` reach opacity ≥ 0.9 after a full scroll | Yes |
| Every masked headline lands at 0 px offset | Yes |
| Size-guide modal: open, scroll lock, Escape close, lock release | Pass |
| Film modal: opens, frame renders, pause control present | Pass |
| Keyboard focus visible on first Tab stop | Pass (3 px `#ff3355`, offset 4 px) |
| Accessible names | 0 unnamed controls, 0 images without `alt`, exactly one `h1`, `lang="fr"` |
| WebGL / THREE errors | None — the crash source is gone |
| CLS at first paint | **0** |
| Video bytes requested at first paint | **1 clip** (`hero-desktop`, 1.0 MB) — the other two load on approach |
| MP4 requests under reduced motion | **0** |
| FCP | **Not measured.** See below. |

Evidence captured in `docs/screenshots/`: `desktop-hero.jpg` (1440×900),
`desktop-size-guide.jpg`, `desktop-film-modal.jpg`.

### Two things this environment could not do

**Playwright could not run.** `scripts/verify.mjs` is written and ready — it
covers runtime errors, poster loading, single-video playback, overflow, CTA
targets and `rel`, reveal completeness, focus rings, modal behaviour and
performance signals across desktop/mobile/reduced-motion. Chromium cannot
launch here: the sandbox denies `socket()` (`Operation not permitted`), and the
registry is blocked so `@playwright/test` cannot be installed either. The
script resolves the globally installed Playwright instead. **Run
`node scripts/verify.mjs --visual` on a normal machine to get the full
pass/fail matrix and the screenshot set.** Every assertion in it was mirrored
by hand in the browser preview; the preview results are what is reported above.

**FCP was not measured.** The in-app preview pane throttles `requestAnimationFrame`
to roughly one frame per second while unfocused (measured: 7 frames in 2025 ms,
in gaps of 12/17/976/17/17/17/964 ms), so `first-contentful-paint` reported
19.98 s against a 104 ms DOMContentLoaded. That number is an artifact of the
hidden pane and is **not** a page performance figure. The trustworthy signals
from the same run were CLS 0, 44 requests, 1.06 MB total, and exactly one video
request — those are geometry and network facts, unaffected by the frame clock.
Real Core Web Vitals need a real browser: run Lighthouse against the production
build (`next build && next start`) on desktop and throttled mobile, or take
field data after launch.

**The reduced-motion branch is verified**, but through a documented QA
parameter (`?motion=reduce`) rather than OS emulation, because neither
available browser can emulate the media feature. The override only reads the
URL query; a normal visit is unaffected. The real media query is still the
default path in `prefersReducedMotion()`.

### What the reduced-motion run showed

- `motion-ready` never added, so no text is ever pre-hidden
- 0 `<video>` elements in the DOM
- 0 `.mp4` network requests
- Curtain `display: none`
- Headline at 0 px offset, hero copy opacity 1
- The page still reads as a complete campaign — poster, type, all CTAs

---

## 5. Gaps and honest limitations

1. **No campaign footage exists.** Every clip in `public/media/` is a motion
   study — a real encoded video with a real camera move, built from the
   approved concept stills. There is no filmed model, no textile motion, no
   physical film. This is stated in the media script header, in
   `docs/CINEMATIC-BRIEF.md`, and in the table below. `docs/CINEMATIC-BRIEF.md`
   carries the five-shot list, generation prompts, colour law and acceptance
   checks needed to replace them.

2. **All imagery is still low-resolution.** The source stills are 197–577 px
   wide; the posters and video plates are upscaled from them. They hold up at
   the sizes used because of the grade and the dark treatment, but they are not
   press-quality and would not survive a large 4K display or print use. The
   brief specifies the replacement assets.

3. **The blue suiting doesn't match the brief's black.** The brief asks for
   black ceremony suiting; the supplied concept stills show navy blue. The
   footage and the product imagery both follow the supplied stills, because
   inventing a black suit would mean inventing product photography. Flagged
   for the brand to resolve when real assets are shot.

4. **Copy burned into old stills.** Several source images still carry the
   mockup's own captions in their pixels. The occasion cards and the film
   modal now crop above them; `suit-product.webp` and `tailoring-detail.webp`
   still have fragments at their edges in the raw files, but they are inside
   the crop used everywhere they appear.

5. **No automated regression gate in CI.** `scripts/verify.mjs` is ready but
   cannot be wired into a pipeline from here. Adding it to CI on a machine
   that permits Chromium is a one-line job.

6. **`?motion=reduce` is a QA affordance shipped to production.** It is
   harmless (it only forces the accessible path) and documented in
   `lib/motion.ts`, but if the project wants a smaller surface it can be gated
   behind `process.env.NODE_ENV !== "production"`.

---

## 6. Files

### Added

| Path | Purpose |
|---|---|
| `lib/motion.ts` | Motion tokens, easings for both engines, intro clock, ScrollTrigger conventions, reduced-motion resolution |
| `hooks/use-page-motion.ts` | The single scoped GSAP context: hero intro, scene A–D scroll choreography, reveals, header/nav state, instrumentation |
| `hooks/use-magnetic.ts` | Composable magnetic pull for primary CTAs; rAF + CSS custom properties, mouse-only |
| `components/cinematic-media.tsx` | Poster-first, viewport-lazy, visibility-gated responsive video |
| `components/masked-heading.tsx` | Line-mask typographic reveal |
| `scripts/build-media.sh` | FFmpeg pipeline: plates, camera moves, encodes, posters |
| `scripts/verify.mjs` | Playwright verification suite (desktop / mobile / reduced motion) |
| `docs/CINEMATIC-BRIEF.md` | Shot list, generation prompts, delivery spec, acceptance checks |
| `docs/REPORT.md` | This document |
| `public/media/*.mp4`, `*.webp` | Four motion studies + posters |
| `public/images/occasion-*.webp` | Clean crops of the three occasion stills |
| `.claude/launch.json` | Dev-server config for the in-app preview |

### Modified

| Path | Change |
|---|---|
| `app/page.tsx` | Hero rebuilt as a layered cinematic plate; `Craft` scene added; `MaskedHeading` adopted; GSAP moved out to the hook; magnetic CTAs; header state no longer React-driven; three.js ribbon removed |
| `app/globals.css` | Cinematic media layer, masked headings, craft section, closing scene, magnetic CTA, unified focus ring, `.motion-ready` / `.motion-reduced` failsafes, expanded responsive + reduced-motion blocks |
| `package.json` | `three`, `@react-three/fiber`, `@types/three` removed; `media` script added |

### Removed

| Path | Reason |
|---|---|
| `components/ribbon-scene.tsx` | Crashed the page without WebGL; decorative only |

---

## 7. Design decisions worth naming

**The hero is a film, the sections are a lookbook.** Black ground for the
campaign moments, cream for the collection and fitting sections. The
transition between them is the scene A scrub — the hero darkens, scales and
parallaxes out — rather than a hard cut. That contrast between campaign black
and editorial cream is the page's structure.

**One headline reveal, not many.** Line masks are used on every major heading
with the same easing and duration, so the page reads as one typographic
gesture. No letter-by-letter effects, no per-word colour pops.

**Nothing is pinned.** Every effect is either a scrubbed transform or a
one-shot entrance. Pinning was avoided deliberately: it traps touch scrolling,
breaks anchor links, and makes content feel gated. The craft section gets its
drama from a full-bleed macro and a progress rail instead.

**The copy stayed where it was.** Every French sentence, every CTA and every
destination is the original. The craft section adds new editorial copy in the
same voice; nothing was replaced or removed for the sake of the design.

**Failure is designed in.** Text is pre-hidden only after GSAP has booted and
is guaranteed to animate it (`.motion-ready`). If hydration fails, scripts are
blocked, or the motion hook never runs, the headline is simply visible. A
campaign page must not depend on an animation to be readable.
