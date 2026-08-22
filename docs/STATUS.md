# STATUS.md

**Phase:** P1.5 Engine polish — complete
**Updated:** 22 Aug 2026 18:55 America/Chicago

## Current state

- Repo: https://github.com/mjwtaylor-cell/ntsb-investigator
- Live: https://mjwtaylor-cell.github.io/ntsb-investigator/
- CI green; GitHub Pages green (via Actions).
- Account / GitHub owner: `mjwtaylor-cell`.
- P1.5 shipped on top of P1: flight phase sizing, generator spread,
  B2.7 par/budget, explicit PC sets (outcomes not scorable), ops-part
  operator pools + occupants line.

## Verified (P1.5)

- Flight: non-RTO tracks 25–120 min @ 1 Hz (≤7200); T6 RTO short, no climb;
  all template events fire inside phase windows
- Generator: every archetype reachable; templates uniform from applicable list;
  T1 → A1 only; `--archetype` / `--template` with friendly incompatible error
- Par/budget: Σ(min evidence)×1.6 + 5-group burn; Standard par×1.5 / Senior par×1.1;
  5-group Standard survives to par calendar day with ≥25% budget left
- Tiers: explicit `probableCauseNodeIds`; outcomes excluded from scoring;
  oracles truth 98 / empty 10 on 1174
- Operators: Part 91/135/121 pools (no aircraft-family names);
  CLI `N pax + N crew · fatal N · serious N · minor N`
- Engine coverage (vitest v8 on `src/engine`): **92.57%** statements/lines
- Solvability: **200/200** passed
- Determinism hash (1174): `13c54becd6ae5e801fc11d4d325e1e11c7a450a21d1b9bcd28a4c1d94b78efce`
- Kill criterion: **YES** — P1.5 green this session

## Next (P2) — waiting for parent GO

- Docket UI: shell, viewers, action drawer, play seed 1174 end-to-end
- Do **not** start until parent GO
