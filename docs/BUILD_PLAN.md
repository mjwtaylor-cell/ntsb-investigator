# BUILD_PLAN.md — Phased build plan

Global Definition of Done for every phase: B1 §7 quality gates + screenshots + `STATUS.md` + `DECISIONS.md` + checkpoint report + STOP. Session estimates assume Grok 4.6 on SuperGrok Plus/Heavy; they are estimates.

| Phase | Sessions | Build | Acceptance |
|---|---|---|---|
| **P0 Bootstrap** | 1 | Verify toolchain (node ≥ 20, git, gh; install nvm into `/workspace` if needed). Sign into GitHub via browser takeover; `gh auth login -w`; clone repo. Scaffold Vite+React+TS, ESLint/Prettier/Vitest, tokens + fonts, `AGENTS.md` + `docs/*` from Part B, CI + Pages workflows. Ship a "Docket" placeholder page in the full visual identity (top bar, three panes, one paper document, one SVG strip chart with fake data). Read B4 sources. Ask for Pages-enable approval. | CI green; Pages URL live; screenshot matches B2.12 (fonts loaded, palette exact); `npm run case` prints "engine not yet implemented" stub; `STATUS.md` written. |
| **P1 Engine core** | 2 | `rng`, types, archetypes A1–A4, templates T1, T2, T4, T6 (one per archetype family), world + truth generation, flight sim + track, evidence derivation for recorders/NVM, radar/ADS-B, weather, wreckage, records, witnesses (template text), catalogue with costs/lead times/prereqs/decay, reducer + queue + advanceTime + decay + pressure (3 events), scoring + oracles, CLI, solvability harness (200 seeds), golden hashes. | `npm run case -- --seed 1174` prints a coherent case (chain, evidence, par); harness and oracles pass; determinism test passes; unit coverage on engine ≥ 70 %. *Kill criterion check at end of session 2.* |
| **P2 Docket UI** | 2 | Shell (top bar, rails, workspace, drawer), docket navigator, Document viewer, Wreckage map, FDR strips with synced cursor + CVR + track, Transcripts, Radar/ADS-B, Weather panel, action drawer with costs/ETAs, advance time, autosave/resume, endless-mode seed entry. | Play seed 1174 end to end (without report); screenshots of every viewer at 1440×900 + shell at 390×844; Lighthouse a11y ≥ 90; no console errors. |
| **P3 Investigation systems** | 1–2 | Go Team composition + group burn, interviews (knowledge models, topics, unlocks), lab flows (teardown, fractography, performance study, sim), party submissions, pressure events (full set), public confidence, party cooperation + subpoena, evidence decay UI, urgent rec, IIC handbook panel. | Harness still green; each system demonstrated in screenshots; interview transcript becomes an evidence item; pressure card flow works. |
| **P4 Findings & debrief** | 1–2 | Findings board, causal chain canvas, probable cause composer, recommendations, submit, board-meeting debrief with truth timeline + diff + grade, result card PNG, daily case, seed sharing. | Truth-oracle ≥ 95 via the UI path on 3 seeds; debrief screenshots; result card renders; daily seed deterministic. |
| **P5 Templates & case files** | 1–2 | Templates T3, T5, T7–T12; author the 3 curated case files (bespoke prose per B2.10; validate with CLI; snapshot to `seeds/`); balance pass (auto-investigator stats: median score of random policy 15–35, informed policy 70–90); Senior difficulty. | Harness green across all 12 templates × 4 archetypes where applicable; 3 case files playable with prose reading as written by a person, not a template; `DECISIONS.md` lists balance changes. |
| **P6 Art & polish** | 1–2 | Imagine library + covers (ask Matt for grok.com sign-in; batch ≈ 40 images; manifest), photo-set viewer, motion, empty states, handbook content, microcopy pass (B1 tone: specific, active, no apologies), performance budget, `VISUAL_QA.md` checklist run. | Every viewer has its imagery; ≤ 600 KB gz JS; Lighthouse ≥ 85/90; reduced-motion verified; screenshots before/after. |
| **P7 Release** | 1 | README with screenshots, disclaimer footer, credits, settings (reduced motion, reset), favicon/OG image, tag `v1.0.0`, release notes; optional itch.io page (approval required). | Live URL final; tag pushed; `STATUS.md` says v1 shipped with a known-issues list. |

**Checkpoint report template (post verbatim, fill every line):**

```
PHASE P_ — <name> — <date>
Shipped: <bullets with file paths / features>
Live: <Pages URL>  Commits: <first..last>
Screenshots: <attached, list>
Checks: lint ✓/✗ · tests n/n · build ✓/✗ · solvability n seeds ✓/✗ · Lighthouse perf/a11y · console errors 0
Facts verified / Assumptions / Actions completed / Waiting for approval / Unresolved
Decisions logged: <count> (see docs/DECISIONS.md)
Usage note: <rough share of the weekly pool used this session>
Next phase plan: <3 bullets>
STATUS: waiting for GO P_
```
