# STATUS.md

**Phase:** P2 Docket UI — acceptance green (pending parent review)
**Updated:** 22 Aug 2026 19:05 America/Chicago

## Current state

- Repo: https://github.com/mjwtaylor-cell/ntsb-investigator
- Live: https://mjwtaylor-cell.github.io/ntsb-investigator/
- CI / Pages: redeploy from main pushes.
- Account / GitHub owner: `mjwtaylor-cell`.
- P1.5 complete (engine untouched this session).
- P2 Docket UI shipped: shell, docket, all six viewers, action drawer, autosave, endless seed entry; seed 1174 playable end-to-end (no report composer — P4).

## Verified (P2)

- [x] Shell (top bar, rails, workspace, drawer) + B2.11 responsive (rail tab 900–1200; single-column <900)
- [x] Docket navigator wired to catalogue / groups (stand up/down, request, secure, open)
- [x] Document viewer (paper, stamps, derived MEL/dispatch/etc.)
- [x] Wreckage map (procedural SVG)
- [x] FDR strips + synced cursor + CVR side panel + track
- [x] Transcripts
- [x] Radar/ADS-B
- [x] Weather panel
- [x] Action drawer (queue ETAs, advance time, pressure cards)
- [x] Autosave/resume + endless-mode seed entry
- [x] Play seed 1174 (`?seed=1174&unlock=1` deep-link for shots; manual play via UI)
- [x] Screenshots `docs/screenshots/p2-*.png`
- [x] Known issues from DECISIONS closed (serif 600, stamp flex header, rail collapse, FDR fill)
- [ ] Lighthouse a11y ≥ 90 — **skipped** (Chrome present; lighthouse not installed this session — note)
- Console: no app-thrown errors observed in smoke path; headless shot path uses unlock helper

## Checks

- lint ✓ · tests 52/52 · build ✓ · engine solvability carried from P1.5

## Screenshots

- docs/screenshots/p2-seed-entry-1440.png
- docs/screenshots/p2-shell-1440.png
- docs/screenshots/p2-document-1440.png
- docs/screenshots/p2-wreckage-1440.png
- docs/screenshots/p2-fdr-1440.png
- docs/screenshots/p2-transcripts-1440.png
- docs/screenshots/p2-radar-1440.png
- docs/screenshots/p2-weather-1440.png
- docs/screenshots/p2-shell-390.png
- docs/screenshots/p2-shell-1100.png

## Next

- Parent GO for P3 Investigation systems (Go Team burn UI depth, interviews, labs, pressure full set, etc.)
- Optional: run Lighthouse a11y on live Pages after deploy
