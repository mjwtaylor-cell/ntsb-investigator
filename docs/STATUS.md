# STATUS.md

**Phase:** P1 Engine core — complete (kill criterion check)
**Updated:** 22 Aug 2026 18:40 America/Chicago

## Current state

- Repo: https://github.com/mjwtaylor-cell/ntsb-investigator
- Live: https://mjwtaylor-cell.github.io/ntsb-investigator/
- CI green; GitHub Pages green (via Actions).
- Account / GitHub owner: `mjwtaylor-cell`.
- Engine P1 pipeline shipped: RNG, types, archetypes A1–A4, templates T1/T2/T4/T6,
  world/truth, flight sim + track (1 Hz), evidence catalogue, actions (queue/decay/pressure),
  scoring + oracles, `generateCase` / `applyAction` / `advanceTime` / `score`,
  case CLI, solvability harness (200 seeds) + SHA-256 determinism.

## Verified (P1)

- `./node_modules/.bin/tsx scripts/case-cli.ts --seed 1174` → A2 / T4 coherent summary
- Solvability: **200/200** passed
- Determinism hash (1174 bundle): `0f510071f8c73e509a3d24ab6efada5fa9e90b9a631c9eedcaa8b7066d6666cb`
- Oracles: truth **100**, empty **10**, herring drop **29**
- Kill criterion: **YES** — coherent seed 1174 case + solvable across 200 seeds

## B4 — done

- `docs/DOMAIN.md` conventions; P2 UI issues logged in `docs/DECISIONS.md`.

## Next (P2)

- Docket UI: shell, viewers, action drawer, play seed 1174 end-to-end
