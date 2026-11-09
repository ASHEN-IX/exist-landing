#!/usr/bin/env bash
# Build cinematic motion studies from the high-resolution campaign masters.
# Generated concept photography lives in assets/campaign; public images are
# optimized delivery assets. Requires ImageMagick and ffmpeg with libx264.
# Usage: ./scripts/build-media.sh [all|plates|hero|fabric|closing|clean]
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
SRC="$ROOT/assets/campaign"
OUT="$ROOT/public/media"
WORK="$OUT/.work"
mkdir -p "$OUT" "$WORK"

TARGET="${1:-all}"

# Compose at delivery resolution, with no tiny mockup crops, synthetic grain,
# or sharpening. Always rebuild plates so updated masters cannot leave stale video.
poster () {
  ffmpeg -y -hide_banner -loglevel error -i "$1" -frames:v 1 \
    -vf "scale=${3}:-2:flags=lanczos" -quality 92 -compression_level 6 "$2"
}

plate_hero_desktop () {
  magick "$SRC/hero.png" -resize '1920x1080^' -gravity center \
    -extent 1920x1080 "$WORK/hero-desktop.png"
}

plate_hero_mobile () {
  magick "$SRC/hero.png" -gravity east -crop 4:5 +repage \
    -resize 1080x1350 "$WORK/hero-mobile.png"
}

plate_fabric () {
  magick "$SRC/tailoring.png" -resize '1920x1080^' -gravity center \
    -extent 1920x1080 "$WORK/fabric-detail.png"
}

plate_closing () {
  magick "$SRC/tailoring.png" -resize '1920x900^' -gravity center \
    -extent 1920x900 -brightness-contrast -12x0 "$WORK/closing-campaign.png"
}

# ---------------------------------------------------------------------------
# CLIPS
#
# Every move is a raised cosine — starts and ends at zero velocity — so the
# 12 s / 16 s loops join without a visible cut and the motion never snaps.
# ---------------------------------------------------------------------------

# $1 plate  $2 temp mp4  $3 out WxH  $4 seconds  $5 max zoom delta  $6 drift px
animate () {
  local plate="$1" tmp="$2" size="$3" dur="$4" dz="$5" drift="${6:-0}"
  local frames
  frames=$(awk -v d="$dur" 'BEGIN{printf "%d", d*30}')
  ffmpeg -y -hide_banner -loglevel error -loop 1 -framerate 30 -t "$dur" -i "$plate" \
    -vf "fps=30,zoompan=z='1.0+${dz}*(1-cos(PI*on/${frames}))/2'\
:x='iw/2-(iw/zoom/2)+${drift}*sin(2*PI*on/${frames})'\
:y='ih/2-(ih/zoom/2)':d=1:s=${size}:fps=30,format=yuv420p" \
    -t "$dur" -r 30 -c:v libx264 -profile:v high -preset medium -crf 18 \
    -pix_fmt yuv420p -g 60 -keyint_min 60 -sc_threshold 0 -movflags +faststart "$tmp"
}

build_hero_desktop () {
  echo "· hero-desktop  1920×1080 · 12 s"
  plate_hero_desktop
  animate "$WORK/hero-desktop.png" "$OUT/hero-desktop-hq.mp4" 1920x1080 12 0.030 14
  poster "$OUT/hero-desktop-hq.mp4" "$OUT/hero-desktop-hq.webp" 1920
}

build_hero_mobile () {
  echo "· hero-mobile   1080×1350 · 12 s"
  plate_hero_mobile
  animate "$WORK/hero-mobile.png" "$OUT/hero-mobile-hq.mp4" 1080x1350 12 0.035 0
  poster "$OUT/hero-mobile-hq.mp4" "$OUT/hero-mobile-hq.webp" 1080
}

build_fabric () {
  echo "· fabric-detail 1920×1080 · 16 s"
  plate_fabric
  animate "$WORK/fabric-detail.png" "$OUT/fabric-detail-hq.mp4" 1920x1080 16 0.045 16
  poster "$OUT/fabric-detail-hq.mp4" "$OUT/fabric-detail-hq.webp" 1920
}

build_closing () {
  echo "· closing       1920×900 · 16 s"
  plate_closing
  animate "$WORK/closing-campaign.png" "$OUT/closing-campaign-hq.mp4" 1920x900 16 0.035 22
  poster "$OUT/closing-campaign-hq.mp4" "$OUT/closing-campaign-hq.webp" 1920
}

case "$TARGET" in
  plates)   plate_hero_desktop; plate_hero_mobile; plate_fabric; plate_closing; echo "plates in $WORK" ;;
  hero)     build_hero_desktop; build_hero_mobile ;;
  fabric)   build_fabric ;;
  closing)  build_closing ;;
  all)      build_hero_desktop; build_hero_mobile; build_fabric; build_closing ;;
  clean)    rm -rf "$WORK"; echo "removed $WORK" ;;
  *) echo "unknown target: $TARGET" >&2; exit 1 ;;
esac

echo
for f in "$OUT"/*.mp4 "$OUT"/*.webp; do
  [ -e "$f" ] || continue
  printf "  %-28s %6sKB\n" "$(basename "$f")" "$(( $(stat -c%s "$f") / 1024 ))"
done
