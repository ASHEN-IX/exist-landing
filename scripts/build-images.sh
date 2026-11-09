#!/usr/bin/env bash
# Optimize the generated concept masters without reusing mockup screenshots.
set -euo pipefail
ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
SRC="$ROOT/assets/campaign"
OUT="$ROOT/public/images"

render () {
  magick "$SRC/$1.png" -resize "${3:-1672x1672>}" -quality 92 "$OUT/$2-hq.webp"
}

render hero hero-model
render suit suit-product
render tailoring tailoring-detail
render tailoring cloth-footer
for occasion in wedding engagement business; do
  render "$occasion" "occasion-$occasion"
  render "$occasion" "$occasion-look"
done
for accessory in shirt tie shoes; do
  render "$accessory" "$accessory" '1200x1200>'
done
render cufflinks cufflinks-studio '1200x1200>'
magick "$SRC/tailoring.png" -gravity west -crop 500x500+0+200 +repage \
  -resize 216x216 -quality 92 "$OUT/hero-fabric-hq.webp"
magick "$SRC/tailoring.png" -crop 390x390+1150+390 +repage \
  -resize 216x216 -quality 92 "$OUT/hero-button-hq.webp"
magick "$SRC/suit.png" -crop 190x190+440+30 +repage \
  -resize 216x216 -quality 92 "$OUT/hero-tie-hq.webp"
