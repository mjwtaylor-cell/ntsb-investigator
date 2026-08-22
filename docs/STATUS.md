# STATUS.md

**Phase:** P1 Engine core — in progress (B4 done)
**Updated:** 22 Aug 2026 (America/Chicago)

## Current state

- Repo: https://github.com/mjwtaylor-cell/ntsb-investigator
- Live: https://mjwtaylor-cell.github.io/ntsb-investigator/
- CI green; GitHub Pages green (via Actions).
- Account / GitHub owner: `mjwtaylor-cell`.
- Docs and `AGENTS.md` from Part B (B1–B5).
- Vite + React + TypeScript scaffold with ESLint, Prettier, Vitest.
- Design tokens at `src/ui/styles/tokens.css` (B2.12).
- Docket placeholder UI: top bar 56px, left rail 260px, paper document, SVG strip chart, right rail 340px findings board.
- Engine: seeded RNG with named forks; archetypes A1–A4; engine types stubs. Templates / world / sim / evidence / scoring / CLI / solvability still ahead.
- GitHub workflows: `ci.yml`, `pages.yml` (base `/ntsb-investigator/`).
- Screenshots in `docs/screenshots/`:
  - `docket-desktop-1440.png`
  - `docket-narrow-390.png`
  - `p0-docket-live.webp`

## B4 — done

- `docs/DOMAIN.md` includes **Conventions used by the engine** (FDR keys, CVR notation, PC/findings/recs, wreckage vocab, radar/ADS-B timing, investigative groups, Annex 13 → docket map).
- Manual: §§3.6, 4.4, 4.6, 4.12–4.13; Apps B, H, K, M.
- Reports (tone only): AAR-09/01/SUM, AAR-16/03, AAR-10/01.
- P2 UI issues logged in `docs/DECISIONS.md` — do not fix in P1.

## Verified

- Node v20.19.2, package manager 9.2.0, git 2.47.3
- Lint / test / build pass after scaffold
- CI green; Pages green on live URL above

## Next (P1)

- Do not start templates until DOMAIN conventions are present (done)
- Engine: world/truth, sim, evidence, scoring, CLI, solvability harness
