# TECH.md — Technical spec

- **Stack:** Vite + React (current stable releases at build time) + TypeScript (strict, `noUncheckedIndexedAccess`), Zustand for UI state, `lucide-react`, `@fontsource` fonts. No UI kit, no CSS framework — CSS modules + tokens. Engine: pure TS. Tests: Vitest (+ `@testing-library/react` for a few UI smoke tests). Lint: ESLint (typescript-eslint, react-hooks, `no-restricted-imports` blocking DOM/React inside `src/engine`) + Prettier. Node ≥ 20 (use `nvm` in `/workspace` if the machine lacks it). Bundle budget: ≤ 600 KB gz JS excluding images; images lazy-loaded WebP ≤ 150 KB each.
- **Repo layout:**

```
AGENTS.md                      # B1
docs/ DESIGN.md TECH.md DOMAIN.md BUILD_PLAN.md DECISIONS.md STATUS.md VISUAL_QA.md
src/engine/
  rng.ts                       # mulberry32 + fork(name) named streams
  types/                       # CausalNode, CaseTruth, World, EvidenceItem, Action, CaseState, ScoreReport
  archetypes/                  # A1–A4 data
  templates/                   # T1–T12, one file each + registry
  generate/ world.ts truth.ts  # seed → world → truth graph
  sim/ flight.ts track.ts      # phase-scripted kinematics, lat/lon integration
  evidence/ recorders.ts radar.ts weather.ts wreckage.ts records.ts witnesses.ts parties.ts catalogue.ts
  actions/ reducer.ts queue.ts pressure.ts decay.ts
  narrative/ phrasebank/ cvr.ts atc.ts witnessText.ts documents.ts
  scoring/ score.ts oracle.ts
  seeds/ pinewood.json kestrel204.json aurora1157.json daily.ts
  index.ts                     # generateCase(seed, opts), applyAction, advanceTime, score
src/ui/ app/ shell/ docket/ viewers/ board/ report/ debrief/ modes/ handbook/ styles/tokens.css
src/assets/ fonts/ images/ manifest.json svg/ (aircraft silhouettes, stamps)
scripts/ case-cli.ts solvability.ts gen-seeds.ts screenshot.ts
tests/ engine/*.test.ts golden/*.json ui/*.test.tsx
.github/workflows/ ci.yml pages.yml
```

- **Core interfaces:**

```ts
generateCase(seed: string, opts?: { archetype?: ArchetypeId; template?: TemplateId; difficulty?: 'standard'|'senior' }): CaseBundle
// CaseBundle = { truth: CaseTruth; world: World; evidence: EvidenceCatalogue; par: Par }
applyAction(state: CaseState, action: Action, bundle: CaseBundle): CaseState      // pure reducer
advanceTime(state: CaseState, days: number, bundle: CaseBundle): CaseState        // resolves queue, decay, pressure
score(findings: Findings, bundle: CaseBundle, state: CaseState): ScoreReport
```

- **Determinism & streams:** `rng.fork('world')`, `'crew'`, `'maintenance'`, `'weather'`, `'template'`, `'flight'`, `'witnesses'`, `'pressure'`; adding a feature must use a *new* stream, never reorder draws in an existing one (golden-hash tests will catch it).
- **CLI:** `npm run case -- --seed 1174 [--template T4] [--json out.json]` prints a one-screen summary (archetype, template, chain, par, evidence count) and optionally dumps the bundle; `npm run solvability -- --n 200` runs the harness; `npm run seeds:build` regenerates curated snapshots (only when intentionally re-authoring).
- **Solvability harness (must pass in CI on 200 seeds):** every causal node has ≥ 2 revealing evidence items, ≥ 1 obtainable with prerequisites satisfiable inside the Standard budget; a random-policy auto-investigator never throws; truth submission scores ≥ 95; empty submission ≤ 10; determinism (same seed → same SHA-256 of the bundle).
- **Persistence:** `localStorage` key per case (`ntsb:case:<seed>:log`), settings key, completed-cases index; JSON export/import.
- **CI/CD:** `ci.yml` (lint, test, build, solvability) on PR + push; `pages.yml` deploys `dist/` to GitHub Pages on `main` (Vite `base: '/ntsb-investigator/'`). Lighthouse checked manually in the bot's browser (or `npx lighthouse` headless if Chrome deps install; otherwise skip and note).
- **Screenshots:** prefer Playwright (`npx playwright install chromium`); if system deps block on the cloud computer after 3 tries, use your own browser + the computer's screenshot, and note it.
