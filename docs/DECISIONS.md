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

## 22 Aug 2026 — B4 domain read (P1 session 1); conventions logged, no templates yet

Read before any accident templates: NTSB investigative process page; Major Investigations Manual §§3.6 (Group Chairmen Responsibilities), 4.4 (Group Chairman Factual/Studies/Analysis Reports), 4.6 (Public Docket), 4.10–4.13 (Party Submissions through Board Meeting), plus App B (CVR Handbook), App H (Group Chairmen Checklists), App K (Factual/Analysis Report Outlines); Party Guidance PDF. CAROL tone skim (structure/phrasing only — no case facts into DOMAIN or templates): **ANC22LA034** (small GA / Class 4), **ERA23FA001** (medium / Class 3), **AAR-20/02** (major Part 121 blue-cover). Expanded `docs/DOMAIN.md` with **Conventions used by the engine**.
