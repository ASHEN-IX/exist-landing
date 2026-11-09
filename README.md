# EXIST — Collection Cérémonie (prototype universitaire)

A runnable **Next.js App Router + TypeScript** campaign landing page for an
EXIST men's 3-piece slim-fit suit, translating the approved black/off-white/red
editorial direction into a cinematic, scroll-driven experience.

> **Non-official student concept.** Not affiliated with EXIST. The brand logo
> was supplied by the project team. The dark-navbar logo is a
> contrast-adjusted derivative of the same PNG, preserving the red accent.

## Run

```bash
npm install
npm run dev
```

Open http://localhost:3000. `npm run build` for a production build,
`npm run typecheck` for types.

## Stack

- Next.js 16 (App Router), React 19, TypeScript
- **GSAP + ScrollTrigger** — the hero intro and all scroll-linked motion
- **Motion (`motion/react`)** — interaction only: menu, dialogs, gallery swaps, tilt
- Lucide icons, vanilla CSS. No backend, no telemetry, no cookies, no WebGL.

Three.js was removed: the decorative satin ribbon crashed the entire page on
any machine without a WebGL context. It is now a CSS accent.

## Architecture

```
lib/motion.ts                  motion tokens, easings, intro clock, conventions
hooks/use-page-motion.ts       one scoped GSAP context: intro + scenes A–D
hooks/use-magnetic.ts          magnetic pull for primary CTAs
components/cinematic-media.tsx poster-first, lazy, visibility-gated video
components/masked-heading.tsx  line-mask typographic reveal
scripts/build-media.sh         FFmpeg pipeline for the media layer
scripts/verify.mjs             Playwright verification (desktop/mobile/reduced)
docs/CINEMATIC-BRIEF.md        shot list + generation prompts + delivery spec
docs/REPORT.md                 what changed, and what is still missing
```

**Rule:** GSAP owns scroll and the intro; Motion owns interaction. Never both
on the same property of the same element. See the header of `lib/motion.ts`.

## Media

`public/media/` holds four clips and their posters. **They are motion studies,
not filmed footage** — real H.264 video built from the approved concept stills
with a slow virtual camera move, so the composition, timing, grading and
loading behaviour could be designed and validated now.

Drop licensed footage at the same paths and dimensions and the page uses it;
no component code changes. `docs/CINEMATIC-BRIEF.md` has the shot list, the
generation prompts and the exact encode profile.

```bash
npm run media          # rebuild all clips + posters
./scripts/build-media.sh hero    # or just one target
```

## Interactive functionality

- Responsive header with scroll-aware state and an animated active-nav underline
- Cinematic hero: timed intro sequence, video background, Scene A scroll-out
- Film button opens an animated lookbook concept (not a recorded video)
- 3-state product gallery with perspective tilt and accessible controls
- 3 occasion cards with selection state
- Craft section — macro detail with a scroll progress rail
- Size estimator with chest/waist/height inputs; **illustrative only, not an
  EXIST-approved fit recommendation**
- Accessories link to the real EXIST site
- Product CTAs link to the official category:
  https://www.exist.com.tn/221-costumes-blazers
- ESC closes modals, scroll is locked behind them and released on close

## Accessibility

- `prefers-reduced-motion` supported end to end: no video is fetched, no
  decorative animation runs, and no text is ever pre-hidden.
- Visible keyboard focus on every control, one focus treatment throughout.
- Every image has an `alt`; every control has an accessible name.
- **Note:** text is pre-hidden for reveals only after GSAP has booted and is
  guaranteed to animate it (`.motion-ready`). If scripts fail, text is visible.

## Verification

```bash
node scripts/verify.mjs --visual
```

Requires a local Playwright install and a running dev server. It checks runtime
errors, poster loading, single-video playback, horizontal overflow, CTA
targets and `rel`, reveal completeness, focus rings, modal behaviour and
performance signals across desktop, mobile and reduced motion.

In an environment where Chromium cannot launch, add `?motion=reduce` to the URL
to exercise the reduced-motion branch manually. See `docs/REPORT.md` §4 for
which checks were run here and which could not be.

## Visual assets and copyright

`public/images/` contains crops from the visual mockup approved for this
project. **They are illustrative concept art, not photographs of an identified
EXIST SKU.** Before publication, substitute licensed EXIST product photography
and confirm the live SKU, stock, sizes, returns and delivery terms. No prices or
inventory are invented here.

## Mapping to the academic marketing plan

- **Attirer:** campaign and Reel are separate deliverables, not this app.
- **Convertir:** this landing page is the conversion prototype.
- **Fidéliser:** post-purchase emails and accessory campaigns are separate
  deliverables; this page supports accessory cross-selling.

Funnel objectives, audience evidence, budget and measurement design belong in
the defence deck, not this page.
