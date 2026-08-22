# STATUS.md

**Phase:** P1 Engine — in progress (session 1)
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
- Engine and `case` CLI stubs print "engine not yet implemented".
- GitHub workflows: `ci.yml`, `pages.yml` (base `/ntsb-investigator/`).
- Unit tests and production build green; CI and Pages deploy green.
- Screenshots in `docs/screenshots/`:
  - `docket-desktop-1440.png`
  - `docket-narrow-390.png`
  - `p0-docket-live.webp`
- Note: right rail clips at ~1280px viewport width (logged as P2; do not fix in P1).

## P1 session 1 (this session)

- **B4 domain read first** (time-boxed): process page, Major Investigations Manual (report-format + group-responsibility sections + Apps B/H/K), Party Guidance; three CAROL reports for tone only.
- Expanded `docs/DOMAIN.md` → **Conventions used by the engine** (FDR keys, CVR notation, PC/findings/recs style, wreckage vocab, radar timing, groups, Annex 13 map).
- Logged P2 UI issues in `docs/DECISIONS.md`.
- **Not started yet:** accident templates / engine generate path (deferred until after B4).

## Verified

- Node v20.19.2, package manager 9.2.0, git 2.47.3
- Lint / test / build pass after scaffold
- CI green; Pages green on live URL above

## Next

- Engine core after B4: rng, types, archetypes, templates, world/truth, sim, evidence, scoring, CLI, solvability harness
