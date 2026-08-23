# STATUS.md

**Phase:** P3 gates complete — P3 feature work NOT started
**Updated:** 22 Aug 2026 19:31 America/Chicago

## Current state

- Repo: https://github.com/mjwtaylor-cell/ntsb-investigator
- Live: https://mjwtaylor-cell.github.io/ntsb-investigator/
- CI green after gate commits (verify on latest hygiene push).
- Account / GitHub owner: `mjwtaylor-cell`.
- P1.5 + P2 complete. P3 **gates 1–4** complete. P3 systems (Go Team, interviews, lab, parties, pressure full set, etc.) **not started** this session.

## Verified (P1.5 — carried forward)

- Engine coverage 92.57%; solvability 200/200; oracles truth 98 / empty 10 on 1174
- Determinism hash (1174): `13c54becd6ae5e801fc11d4d325e1e11c7a450a21d1b9bcd28a4c1d94b78efce`

## P3 gate progress

- [x] Gate 1: CI red fixes (`prefer-const` App.tsx; `window.localStorage` smoke) — Actions green
- [x] Gate 2: CVR/ATC/witness presentation from phrase bank; leak-scan unit test
- [x] Gate 3: 72-hour sleep/duty table; docket footers `CEN26FAxxx` (no seed/CRM indices)
- [x] Gate 4: split `flight.ts` (<400); `?unlock=1` behind `import.meta.env.DEV`; P5/P6 cosmetics logged in DECISIONS (CLI `[outcome]` deferred)
- [ ] P3 feature build (BUILD_PLAN) — **not started**

## Checks (latest hygiene commit)

- lint ✓ · tests 58/58 · build ✓ · solvability carried · leak-scan ✓

## Screenshots

- Prior P2 shots remain under `docs/screenshots/p2-*.png`
- No P3 feature screenshots (P3 not started)

## Next

- GO P3 feature work per BUILD_PLAN after this gate STATUS
