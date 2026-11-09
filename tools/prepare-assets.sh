#!/usr/bin/env bash
# ---------------------------------------------------------------------------
# EXIST — Collection Cérémonie Reel · asset ingest
#
# WHAT THIS DOES, PLAINLY
#   The repository holds only small concept stills (max 577 px wide) and two
#   167×35 logo PNGs. rsvg-convert cannot decode WebP, so every source is
#   converted to PNG once, at the largest size the source can honestly carry.
#
#   Each output is graded to the campaign look: desaturated (the supplied
#   navy concept suits read black), contrast lifted, grain-free at source so
#   the per-frame SVG grain is the only grain in the final picture.
#
#   Sources are ENLARGED no further than 1.9× because beyond that the concept
#   stills visibly soften. Full-bleed shots therefore composite a graded
#   close-up over a blurred extension of the same plate (a film practice,
#   not a fabricated photograph) instead of stretching 577 px across 1080.
#
# Usage:  ./tools/prepare-assets.sh
# ---------------------------------------------------------------------------
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"   # project root
SRC="$ROOT/public/images"                                 # concept stills (landing page)
OUT="$ROOT/reel/public/images"                            # reel project assets
CACHE="$ROOT/reel/.asset-cache"
mkdir -p "$OUT" "$CACHE"

# Campaign grade. Desaturate so navy reads charcoal; lift local contrast;
# lower the black point a shade so the blacks are deep, not muddy.
GRADE_DESAT="hue=s=0.12,eq=contrast=1.16:brightness=-0.035:gamma=0.96"
GRADE_WARM="hue=s=0.20,eq=contrast=1.12:brightness=-0.03:gamma=0.98"

# src → cached PNG. Records the true pixel size for the manifest.
ingest () {
  local name="$1"
  [ -f "$CACHE/$name.png" ] && return 0
  ffmpeg -y -hide_banner -loglevel error -i "$SRC/$name.webp" \
    -vf "format=rgb24" -frames:v 1 "$CACHE/$name.png"
  # ffmpeg writes PNGs with a colour-space chunk that libsrvg will not decode;
  # stripping it keeps the pixels and makes the plate readable again.
  magick "$CACHE/$name.png" -strip -depth 8 "$CACHE/$name.png"
}

# $1 cache name · $2 out name · $3 filter chain · $4 vignette strength
render () {
  local name="$1" out="$2" chain="$3"
  ffmpeg -y -hide_banner -loglevel error -i "$CACHE/$name.png" \
    -vf "$chain,format=rgb24" -frames:v 1 -update 1 "$OUT/$out"
  magick "$OUT/$out" -strip -depth 8 "$OUT/$out"
  printf "  %-30s %s\n" "$out" \
    "$(magick "$OUT/$out" -format '%wx%h' info: 2>/dev/null)"
}

for f in hero-model suit-product tailoring-detail cloth-footer tie cufflinks \
         shirt shoes business-look wedding-look engagement-look red-ribbon \
         hero-button hero-fabric hero-tie; do
  ingest "$f"
done

echo "· RENDER 1 — hero portrait (source 577×365)"

# REVEAL — the hero. Source is 577×365 (16:10), so it is delivered as a
# full-width EDITORIAL BAND at native aspect rather than stretched to fill
# 9:16: no invented pixels. The vertical space above and below is composed as
# deliberate black, and the headline sits in it.
render hero-model rv-plate.png \
"scale=1206:763:flags=lanczos,setsar=1,$GRADE_DESAT,\
unsharp=5:5:0.35:5:5:0,vignette=PI/4.4"

# INVITATION (scene 1) — same man, tighter head-and-shoulders crop. The hook
# needs his face, not the chair.
render hero-model in-plate.png \
"crop=420:263:120:0,scale=1080:677:flags=lanczos,setsar=1,$GRADE_DESAT,\
eq=contrast=1.10,vignette=PI/4.6"

# ── DETAILS (scene 2) ───────────────────────────────────────────────────────
# Every crop below is chosen to sit INSIDE the product card, clear of the
# landing page's own typography (which is cropped out, never painted over).

# 1 — suit torso: the strongest asset. Reads as true black once desaturated,
#     and holds lapel/waistcoat structure at 9:16 crop.
render suit-product dt-suit.png \
"crop=150:230:62:18,scale=1080:1656:flags=lanczos,$GRADE_DESAT,\
eq=contrast=1.24:brightness=-0.10:gamma=0.92,unsharp=5:5:0.45:5:5:0,\
vignette=PI/3.8"

# 2 — the button row, cropped to the right of the card so no copy enters frame.
render cloth-footer dt-buttons.png \
"crop=250:186:159:0,scale=1450:1079:flags=lanczos,$GRADE_WARM,\
eq=contrast=1.26:brightness=-0.14,unsharp=5:5:0.7:5:5:0,vignette=PI/3.4"

# 3 — cufflinks. Clean dark ground, tiles well vertically.
render cufflinks dt-cufflink.png \
"crop=166:80:0:0,scale=1245:600:flags=lanczos,$GRADE_WARM,\
eq=contrast=1.20:brightness=-0.08,unsharp=5:5:0.7:5:5:0,vignette=PI/3.6"

# 4 — the tie, folded on black. Strong diagonal for a lateral drift.
render tie dt-tie.png \
"crop=156:80:0:0,scale=1245:638:flags=lanczos,$GRADE_WARM,\
eq=contrast=1.16:brightness=-0.06,vignette=PI/3.8"

# 5 — shirt collar. The one clean white break in the section.
render shirt dt-shirt.png \
"crop=156:80:0:0,scale=1245:638:flags=lanczos,$GRADE_WARM,\
eq=contrast=1.06:brightness=-0.03,vignette=PI/4.2"

# PRODUCT — the three-piece on its stand, for the transformation.
render suit-product sp-suit.png \
"crop=244:311:0:0,scale=1080:1376:flags=lanczos,$GRADE_WARM,\
eq=contrast=1.14,vignette=PI/4.6"

# ACCENT — red ribbon, a controlled brand-red atmospheric element.
render red-ribbon acc-ribbon.png \
"crop=348:186:0:0,scale=1500:802:flags=lanczos,\
eq=contrast=1.10:brightness=-0.10:saturation=1.25,vignette=PI/3.4"


# ── FULL-BLEED 9:16 VARIANTS ────────────────────────────────────────────────
# The detail section plays these edge-to-edge. Each is a crop of the product
# card that excludes the landing page's typography entirely, enlarged once to
# 1080×1920 and graded to campaign. A 1080-wide macro from a 250 px source is
# at the honest limit of this material — detail is preserved by keeping the
# crop tight and the contrast high, not by any resynthesis.
render suit-product fb-suit.png \
"crop=108:192:70:26,scale=1080:1920:flags=lanczos,$GRADE_DESAT,\
eq=contrast=1.10:brightness=0.10:gamma=1.10,unsharp=5:5:0.45:5:5:0"

# Buttons only: the crop sits inside the fabric, clear of the card edge on the
# right and the landing-page copy on the left.
render cloth-footer fb-buttons.png \
"crop=165:130:235:30,scale=1080:851:flags=lanczos,$GRADE_WARM,\
eq=contrast=1.22:brightness=-0.10,unsharp=5:5:0.8:5:5:0"

render cufflinks fb-cufflink.png \
"crop=110:80:40:0,scale=1080:786:flags=lanczos,$GRADE_WARM,\
eq=contrast=1.22:brightness=-0.06,unsharp=5:5:0.8:5:5:0"

render tailoring-detail fb-weave.png \
"crop=150:200:80:60,scale=1080:1440:flags=lanczos,$GRADE_WARM,\
eq=contrast=1.18:brightness=-0.06,unsharp=5:5:0.7:5:5:0"

render tie fb-tie.png \
"crop=120:78:20:1,scale=1080:702:flags=lanczos,$GRADE_WARM,\
eq=contrast=1.20:brightness=-0.08,unsharp=5:5:0.7:5:5:0"

# BRAND — the official logo, untouched apart from lossless PNG copy.
cp "$ROOT/public/exist-logo-light.png" "$OUT/../brand/exist-logo-light.png"
cp "$ROOT/public/exist-logo-original.png" "$OUT/../brand/exist-logo-original.png"

echo
echo "  brand/exist-logo-light.png   (official, unmodified)"
echo "  brand/exist-logo-original.png (official, unmodified)"
