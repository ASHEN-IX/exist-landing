# EXIST — Collection Cérémonie · Cinematic Brief

Production specification for the campaign footage, plus the state of what is
in the repository today.

---

## 1. What exists now — stated plainly

**No campaign footage was shot for this project, and none was supplied.** The
repository contains eleven small concept stills (197–577 px wide) and two logo
PNGs. Everything video-shaped in `public/media/` was synthesised from those
stills by `scripts/build-media.sh`.

| File | Source | Real video? |
|---|---|---|
| `hero-desktop.mp4` | `images/hero-model.webp`, push-in on a raised cosine | **Motion study, not footage** |
| `hero-mobile.mp4` | same still, independent 4:5 crop | Motion study |
| `fabric-detail.mp4` | `images/tailoring-detail.webp`, macro drift | Motion study |
| `closing-campaign.mp4` | `images/cloth-footer.webp`, button-row macro | Motion study |

A motion study is genuine H.264 video — a real camera move with real easing,
a shared grade and a matching poster frame — but the movement is a virtual
camera over a still. There is no textile motion, no model movement, no
physical film. They were built this way so that the *timing, composition,
grading and loading architecture* could be designed and validated now, and
licensed footage dropped into the same slots later without touching component
code.

**Replacing them is a one-step operation:** put the encoded files at the same
paths with the same names and dimensions, and the page uses them. Nothing in
`components/cinematic-media.tsx` or the motion system refers to the source
stills.

---

## 2. Delivery specification for real footage

### Technical

| Property | Hero (desktop) | Hero (mobile) | Craft macro | Closing |
|---|---|---|---|---|
| Resolution | 1920×1080 | 1080×1350 | 1600×900 | 1920×900 |
| Aspect | 16:9 | 4:5 | 16:9 | 32:15 |
| Frame rate | 25 or 30 fps | same | same | same |
| Duration | 12 s, seamless loop | 12 s | 16 s | 16 s |
| Codec | H.264 High, level 4.2 | | | |
| CRF | 23 | 24 | 24 | 25 |
| GOP | 60 frames, `keyint_min` 60, `sc_threshold 0` | | | |
| Audio | **stripped** (`-an`) | | | |
| Container | MP4, `+faststart` | | | |
| Target size | ≤ 1.5 MB | ≤ 900 KB | ≤ 1.2 MB | ≤ 700 KB |

The fixed 2-second GOP matters: it lets the browser seek cleanly and keeps the
loop point decodable. `+faststart` moves the moov atom to the front so
playback can begin before the file finishes downloading.

Poster frames are frame 0 of each clip, exported as WebP (quality 82). Frame 0
must be *the same frame the clip opens on*, so the poster→video swap is
invisible.

### Colour

Grade to the brand's three-value world: pure black ground, true white highs,
one red. Specifically:

- Blacks at or near `#000000`; no lifted shadows. Product photography may sit
  on cream (`#f7f3ef`) but campaign footage does not.
- Skin tones natural and warm — do not neutralise them into the grade.
- Suiting reads as wool: slight desaturation, no plastic sheen, visible weave.
- Muted blues are acceptable **as garment colour** but never as ambient light.
- The red accent (`#dc0b29`) appears in the frame only where it exists
  physically — pick stitching, lining, a label. No red light washes.

### Brand law

- Preserve the EXIST logo exactly as supplied; never redraw, re-time or
  recolour it beyond the existing light/dark PNG pair.
- French copy only. All marketing text is already in place in `app/page.tsx`;
  footage carries no burned-in type.
- **No burned-in captions or logos in footage.** The existing stills had them
  baked in, which is why the occasion cards are cropped above the text.
- Do not invent EXIST product SKUs. Every garment shown must be an approved
  SKU the brand can actually sell.

---

## 3. Shot list

Five shots. The first and last carry the most weight; the middle three build
the craft argument.

### Shot 01 — Hero portrait · *replaces `hero-desktop` / `hero-mobile`*

- **Frame:** Male model in the collection's black three-piece, three-quarter
  seated or standing, head turned slightly from camera. Architectural
  background — stone, colonnade, or deep studio void — thrown well out of
  focus. Subject placed right of centre, leaving the left 45 % as graded
  negative space for the headline.
- **Move:** Slow push-in, roughly 3 % of frame height over the full 12 s, eased
  in and out (no constant-velocity dolly — it reads mechanical).
- **Light:** Single large key from camera left, practical warmth in the
  background, deep falloff. Rich black levels; no fill on the shadow side.
- **Motion in frame:** Almost none. A shoulder settling, fabric breathing. The
  model must not "act".
- **Loop:** Begin and end on the same held beat so the 12 s cycle has no cut.
- **Portrait version:** separate framing, not a crop — head and shoulders,
  lower third graded to black for the mobile headline.

### Shot 02 — Fabric detail · *replaces `fabric-detail`*

- **Frame:** Macro of the lapel face, buttonholes and pick stitching. Filling
  the frame, no garment edge visible.
- **Move:** Very slow lateral drift plus a shallow rack focus breathing between
  the stitch and the cloth surface.
- **Light:** Low raking light from the side so the weave casts micro-shadows.
  This shot is about texture, so specular highlights must not blow out.

### Shot 03 — Preparation

- **Frame:** The model adjusting his cuff, then his jacket at the button. Hands
  fully in frame, deliberate movements, natural tempo.
- **Move:** Static or a whisper of handheld drift. The action is the motion.
- **Requirement:** Hands must be anatomically correct in every frame — this is
  the shot where generated footage fails most visibly. Reject any take with
  fused fingers, wrong button counts, or fabric clipping through the hand.

### Shot 04 — Walking sequence

- **Frame:** Full body, walking toward camera at a slight angle. Full silhouette
  readable: jacket line, break of the trouser, shoe.
- **Move:** Tracking at the same rate as the walk, so the model stays framed
  while the background moves.
- **Requirement:** Consistent garment across the whole take and with Shots 01
  and 05 — same cloth, same lapel width, same button stance.

### Shot 05 — Closing portrait · *replaces `closing-campaign`*

- **Frame:** Composed, confident hold. Strong negative space on the left for
  "Affirmez votre allure. Marquez le moment." and the CTA.
- **Move:** Near-static; the smallest possible drift so the frame is alive.
- **Light:** The most sculpted of the set — this is the campaign still.

---

## 4. Generation prompt templates

If footage is produced with a generative video model rather than shot on set,
these are the working prompts. **They are prompts, not assets** — nothing in
this repository was generated from them. Treat any output as a draft to be
reviewed frame by frame against §5.

### Shot 01

```
Cinematic fashion film still, 24fps, anamorphic. A man in his early thirties
wearing a tailored black three-piece suit, white shirt, dark tie, seated in a
minimal architectural interior of pale stone columns, shallow depth of field,
architectural background heavily blurred. Three-quarter view, head turned
slightly away from camera, composed and still. Single large soft key light
from camera left, deep shadow on the right side of the face, rich crushed
black background, natural warm skin tones, no fill light. Camera does an
extremely slow push-in, roughly three percent over twelve seconds, eased.
Wool suiting with visible weave, no sheen. Photorealistic, film grain,
35mm. No text, no logos, no visible brand marks.
```

Negative: `plastic skin, waxy texture, oversharpened, HDR halo, distorted
hands, extra fingers, warped lapels, floating buttons, flickering, morphing
fabric, cartoon, illustration, red lighting, coloured gel, lens flare flood`

### Shot 02

```
Extreme macro of black wool suit fabric, lapel edge with hand-sewn buttonhole
and fine red pick stitching, filling the entire frame. Low raking side light
revealing the weave texture and micro-shadow. Slow lateral camera drift with
a subtle rack focus between the stitching and the cloth surface. Photorealistic
textile, natural fibre irregularity, no plastic sheen, no repeating pattern,
shallow depth of field, film grain. No text, no logos.
```

### Shot 03

```
Cinematic medium close-up, a man in a black tailored three-piece suit
adjusting his cuff with his opposite hand, then buttoning his jacket.
Deliberate, unhurried, natural movement. Hands fully visible and anatomically
correct, five fingers, correct button count. Soft directional key light from
camera left, black background, warm skin tones, wool texture visible.
Photorealistic, shallow depth of field, 35mm film grain. No text, no logos.
```

### Shot 04

```
Full-body cinematic tracking shot of a man in a black slim-fit three-piece
suit walking toward camera at a slight angle through a minimal stone
colonnade. Camera tracks at walking pace keeping him centred. Complete
silhouette readable: jacket line, trouser break, shoes. Consistent garment
throughout. Soft directional light, deep shadows, warm natural skin. Slow
motion, 24fps. Photorealistic, film grain. No text, no logos.
```

### Shot 05

```
Cinematic closing campaign portrait, a man in a black tailored three-piece
suit, standing, hands relaxed, direct composed gaze slightly off camera.
Dramatic chiaroscuro: single sculpted key light, deep black background,
substantial empty space on the left third of the frame. Near-static camera.
Wool suiting texture, natural skin tones, fine film grain, 35mm.
Photorealistic. No text, no logos.
```

---

## 5. Acceptance checks before footage ships

Run these against every delivered clip:

1. **Anatomy** — scrub frame by frame at 25 % speed. Hands, ears, collar and
   button counts must be consistent and correct. Reject on any doubt.
2. **Temporal stability** — no boiling, crawling or flicker on flat surfaces.
   Pause on three consecutive frames of the same fabric; they must be nearly
   identical.
3. **Garment continuity** — lapel width, button stance and cloth must match
   across Shots 01, 04 and 05. Shoot or generate them as one set.
4. **Grade continuity** — pull stills from each clip into one contact sheet.
   Blacks must match; there must be no colour cast drift between shots.
5. **Loop** — play the hero clip on repeat for two minutes. Any visible seam
   fails.
6. **Weight** — re-encode with `scripts/build-media.sh` settings; a desktop
   hero clip over 1.5 MB will cost LCP on mobile networks.

---

## 6. Re-encoding reference

The commands live in `scripts/build-media.sh` and are the single source of
truth. The briefs above match them; if one changes, change both.

```bash
# Rebuild everything (posters included)
./scripts/build-media.sh all

# Just the hero pair, after swapping in new source stills
./scripts/build-media.sh hero
```

For supplied footage rather than stills, the encode step is the same — feed
ffmpeg the clip instead of the still and keep `-an`, the CRF, the 60-frame
GOP, `+faststart` and the poster extraction from frame 0. Drop the
`zoompan` stage, since a real shot already has its camera move.
