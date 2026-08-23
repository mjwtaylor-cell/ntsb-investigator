# STATUS.md

**Phase:** P2 Docket UI — in progress
**Updated:** 22 Aug 2026 18:55 America/Chicago

## Current state

- Repo: https://github.com/mjwtaylor-cell/ntsb-investigator
- Live: https://mjwtaylor-cell.github.io/ntsb-investigator/
- CI green; GitHub Pages green (via Actions).
- Account / GitHub owner: `mjwtaylor-cell`.
- P1.5 complete. P2 Docket UI started this session.

## Verified (P1.5 — carried forward)

- Engine coverage 92.57%; solvability 200/200; oracles truth 98 / empty 10 on 1174
- Determinism hash (1174): `13c54becd6ae5e801fc11d4d325e1e11c7a450a21d1b9bcd28a4c1d94b78efce`

## P2 progress

- [ ] Shell (top bar, rails, workspace, drawer) + responsive B2.11
- [ ] Docket navigator wired to catalogue / groups
- [ ] Document viewer (paper, stamps, real MEL/dispatch text)
- [ ] Wreckage map
- [ ] FDR strips + synced cursor + CVR + track
- [ ] Transcripts
- [ ] Radar/ADS-B
- [ ] Weather panel
- [ ] Action drawer (costs/ETAs, advance time)
- [ ] Autosave/resume + endless-mode seed entry
- [ ] Play seed 1174 end to end
- [ ] Screenshots p2-* + Lighthouse a11y note
- [ ] Known issues from DECISIONS (font 600, stamp, rail collapse, FDR fill)

## Next

- Ship P2 acceptance; do not rework engine unless a tiny UI-integration fix is forced.
