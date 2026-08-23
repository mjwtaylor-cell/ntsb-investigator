# STATUS.md

**Phase:** P3 complete — waiting for GO P4
**Updated:** 22 Aug 2026 19:45 America/Chicago

## Current state

- Repo: https://github.com/mjwtaylor-cell/ntsb-investigator
- Live: https://mjwtaylor-cell.github.io/ntsb-investigator/
- Account / GitHub owner: `mjwtaylor-cell`.
- P3 feature build shipped after gates (`8fd0680` → this STATUS).

## Verified

- Engine coverage: not re-measured this session (prior 92.57% carried)
- Solvability: run at phase end (see checkpoint)
- Determinism hash (1174): `d9f72f6b85c0fa5678eccb2574328c6f197053ffc9722353ee9024670d59d535`

## P3 feature progress

- [x] Go Team composition + group burn UI (drawer)
- [x] Interviews (knowledge models, topics, unlocks; transcript → evidence)
- [x] Lab flows (teardown, fractography, performance study, sim) + presenters
- [x] Party submissions (operator / manufacturer / FAA)
- [x] Pressure events (full set of 6)
- [x] Public confidence (meter + pressure/urgent-rec effects)
- [x] Party cooperation + subpoena UI
- [x] Evidence decay UI (drawer LOST / secure)
- [x] Urgent recommendation UI
- [x] IIC handbook panel
- [x] Screenshots `docs/screenshots/p3-*.png`
- [x] Harness / leak-scan still green

## Checks (latest P3 commits)

- lint ✓ · tests 59/59 · build ✓ · leak-scan ✓

## Screenshots

- `docs/screenshots/p3-interview-1440.png` — topics + held transcript
- `docs/screenshots/p3-handbook-1440.png` — IIC handbook
- `docs/screenshots/p3-pressure-1440.png` — pressure cards + Go Team + decay LOST
- `docs/screenshots/p3-parties-1440.png` — operator party submission watermark
- `docs/screenshots/p3-lab-1440.png` — materials fractography LAB stamp
- `docs/screenshots/p3-shell-390.png` — interview shell at 390

## Next

- Waiting for **GO P4** (Findings & debrief).
