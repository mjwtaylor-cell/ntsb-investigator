#!/usr/bin/env bash
set -euo pipefail
ROOT="/workspace/ntsb-investigator"
OUT="$ROOT/docs/screenshots"
BASE="${1:-http://127.0.0.1:5173/ntsb-investigator/}"
mkdir -p "$OUT"
CHROME=(google-chrome --headless=new --disable-gpu --no-sandbox --disable-dev-shm-usage --hide-scrollbars --virtual-time-budget=12000)

shot() {
  local name="$1" w="$2" h="$3" pathq="$4"
  local url="${BASE}?${pathq}"
  echo "SHOT $name $w x $h $url"
  "${CHROME[@]}" --window-size="${w},${h}" --screenshot="$OUT/$name" "$url"
  if [[ -f "$ROOT/screenshot.png" ]]; then mv -f "$ROOT/screenshot.png" "$OUT/$name"; fi
  if [[ -f "./screenshot.png" ]]; then mv -f "./screenshot.png" "$OUT/$name"; fi
}

cd "$ROOT"
shot p3-interview-1440.png 1440 900 "seed=1174&unlock=1&viewer=interview"
shot p3-handbook-1440.png 1440 900 "seed=1174&unlock=1&viewer=handbook"
shot p3-pressure-1440.png 1440 900 "seed=1174&unlock=1&viewer=document"
shot p3-parties-1440.png 1440 900 "seed=1174&unlock=1&viewer=document&evidence=parties.operator_submission"
shot p3-lab-1440.png 1440 900 "seed=1174&unlock=1&viewer=document&evidence=lab.materials_fractography"
shot p3-shell-390.png 390 844 "seed=1174&unlock=1&viewer=interview"
ls -la "$OUT"/p3-*.png
