#!/usr/bin/env bash
set -euo pipefail
ROOT="/workspace/ntsb-investigator"
OUT="$ROOT/docs/screenshots"
BASE="${1:-http://127.0.0.1:4173/ntsb-investigator/}"
mkdir -p "$OUT"
CHROME=(google-chrome --headless=new --disable-gpu --no-sandbox --disable-dev-shm-usage --hide-scrollbars --virtual-time-budget=8000)

shot() {
  local name="$1" w="$2" h="$3" pathq="$4"
  local url="${BASE}?${pathq}"
  echo "SHOT $name $w x $h $url"
  "${CHROME[@]}" --window-size="${w},${h}" --screenshot="$OUT/$name" "$url"
  # chrome writes to cwd sometimes; normalize
  if [[ -f "$ROOT/screenshot.png" ]]; then mv -f "$ROOT/screenshot.png" "$OUT/$name"; fi
}

cd "$ROOT"
shot p2-seed-entry-1440.png 1440 900 ""
shot p2-shell-1440.png 1440 900 "seed=1174&unlock=1&viewer=document"
shot p2-document-1440.png 1440 900 "seed=1174&unlock=1&viewer=document"
shot p2-wreckage-1440.png 1440 900 "seed=1174&unlock=1&viewer=wreckage"
shot p2-fdr-1440.png 1440 900 "seed=1174&unlock=1&viewer=fdr"
shot p2-transcripts-1440.png 1440 900 "seed=1174&unlock=1&viewer=transcripts"
shot p2-radar-1440.png 1440 900 "seed=1174&unlock=1&viewer=radar"
shot p2-weather-1440.png 1440 900 "seed=1174&unlock=1&viewer=weather"
shot p2-shell-390.png 390 844 "seed=1174&unlock=1&viewer=document"
shot p2-shell-1100.png 1100 900 "seed=1174&unlock=1&viewer=document"
ls -la "$OUT"/p2-*.png
