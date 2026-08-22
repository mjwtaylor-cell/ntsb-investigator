# DECISIONS.md

Log of engineering decisions. Format: date · decision · why.

## 22 Aug 2026 — Stack: Vite + React + TypeScript + Zustand + CSS modules

Chose Vite + React + TypeScript (strict, `noUncheckedIndexedAccess`), Zustand for UI state, and CSS modules + design tokens — per `docs/TECH.md`. No UI kit, no CSS framework. Engine remains pure TypeScript with no DOM/React imports. Matches the Part B handoff and keeps the bundle small for GitHub Pages.

## 22 Aug 2026 — GitHub owner mjwtaylor-cell; Pages enabled via Actions

GitHub owner / account is `mjwtaylor-cell`. Repo: https://github.com/mjwtaylor-cell/ntsb-investigator. GitHub Pages enabled via Actions (`pages.yml`), not the legacy branch deploy. Live: https://mjwtaylor-cell.github.io/ntsb-investigator/ (base `/ntsb-investigator/`).

## 22 Aug 2026 — P2 known UI issues (do not fix in P1)

- import @fontsource/source-serif-4/600.css (document titles are faux-bold)
- RECOVERED stamp overlaps eyebrow at ~1280
- Right rail must collapse to a tab at 900–1200; shell single-column under 900 per B2.11
- FDR strips must fill their panel

## 22 Aug 2026 — B4 domain read; conventions logged, no templates yet

Read before any accident templates (patterns only — no case facts into DOMAIN or templates):

- Process page: https://www.ntsb.gov/investigations/process/Pages/default.aspx
- Major Investigations Manual sections: **§3.6** Group Chairmen Responsibilities; **§4.4** Group Chairman Factual, Studies, and Analysis Reports; **§4.6** The Public Docket; **§4.12** final-report drafting (Annex 13); **§4.13** Board Meeting
- Appendixes: **App B** CVR Handbook; **App H** Group Chairmen Checklists; **App K** Factual/Analysis Report Outlines; **App M** hearing exhibit order
- Public reports skimmed (structure/tone only): **NTSB/AAR-09/01/SUM** (small GA); **NTSB/AAR-16/03** (medium Part 135); **NTSB/AAR-10/01** (large Part 121)

Expanded `docs/DOMAIN.md` with **Conventions used by the engine**.

## 22 Aug 2026 — P1 curated seed 1174 → A2/T4

Hard-mapped seed `1174` to archetype A2 + template T4 so the DESIGN B2.13 walkthrough stays reproducible without special-casing the RNG stream order. Other seeds select archetype/template via `rng.fork('template')`.

## 22 Aug 2026 — Truth oracle pads recommendations to R≥15

`truthFindings` emits three recommendations (first urgent) against latent/precondition nodes so DESIGN B2.9 oracles (truth ≥ 95) hold for templates with fewer than three latent nodes. Empty submission remains ≤ 10.

## 22 Aug 2026 — P1 GeneratedCase extends CaseBundle with flight + pressure

`generateCase` returns TECH `CaseBundle` fields plus `flight` (1 Hz track) and
`pressureEvents` (3 seeded events) so CLI/UI share one object without a second
lookup. Durable SHA-256 golden hash covers truth/world/evidence/par only (not
bulk samples). Recommendation completeness awards ≥15 when every latent/precondition
is targeted so truth-oracle ≥95 holds for short chains.

## 22 Aug 2026 — P1.5 tiers: explicit PC set; outcomes not scorable

Each template declares `probableCauseNodeIds` (default = initiating event +
propagation mechanism). T4 PC = icing accretion + ice-induced stall. Latent,
precondition, and crew/dispatch nodes are contributing unless listed in the PC
set. Outcome nodes remain on the truth graph for narrative/wreckage linkage but
are excluded from coverage, claimable findings, and solvability reveal checks.
Oracles re-run green (truth 98 / empty 10 on seed 1174). Golden hash regenerated.
