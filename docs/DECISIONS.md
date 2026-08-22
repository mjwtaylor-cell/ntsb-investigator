# DECISIONS.md

Log of engineering decisions. Format: date · decision · why.

## 22 Aug 2026 — Stack: Vite + React + TypeScript + Zustand + CSS modules

Chose Vite + React + TypeScript (strict, `noUncheckedIndexedAccess`), Zustand for UI state, and CSS modules + design tokens — per `docs/TECH.md`. No UI kit, no CSS framework. Engine remains pure TypeScript with no DOM/React imports. Matches the Part B handoff and keeps the bundle small for GitHub Pages.

## 22 Aug 2026 — GitHub owner mjwtaylor-cell; Pages enabled via Actions

GitHub owner / account is `mjwtaylor-cell`. Repo: https://github.com/mjwtaylor-cell/ntsb-investigator. GitHub Pages enabled via Actions (`pages.yml`), not the legacy branch deploy. Live: https://mjwtaylor-cell.github.io/ntsb-investigator/ (base `/ntsb-investigator/`).
