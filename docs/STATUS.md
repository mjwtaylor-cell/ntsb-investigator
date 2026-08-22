# STATUS.md

**Phase:** P0 Bootstrap — complete pending Pages enable / push
**Updated:** 22 Aug 2026 (America/Chicago)

## Current state

- Docs and `AGENTS.md` created from Part B (B1–B5).
- Vite + React + TypeScript scaffolded with ESLint, Prettier, Vitest.
- Design tokens at `src/ui/styles/tokens.css` (B2.12).
- Docket placeholder UI: top bar 56px, left rail 260px, paper document, SVG strip chart, right rail 340px findings board.
- Engine and `case` CLI stubs print "engine not yet implemented".
- GitHub workflows: `ci.yml`, `pages.yml` (base `/ntsb-investigator/`).
- Unit tests and production build green locally.
- Initial commit on `main` (no push — gh not authenticated).

## Verified

- Node v20.19.2, package manager 9.2.0, git 2.47.3
- Lint / test / build pass after scaffold

## Waiting

- GitHub auth + push + Pages enable (operator)

## Next (after GO P1)

- Engine core: rng, types, archetypes, templates, world/truth, sim, evidence, scoring, CLI, solvability harness
