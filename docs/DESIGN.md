# DESIGN.md — Game design

#### B2.1 Fantasy and pillars

You are the IIC of a Go Team launched to a fatal or serious aviation accident. Nobody hands you a path. You decide which groups to stand up, what to pull, whom to interview, what to send to the lab, when to brief the press, when to write. The truth is a causal chain hidden in a simulated world; evidence is what that world left behind, filtered through physics, records and unreliable people.

Pillars:
1. **Open inquiry.** Every action is available from day one, gated only by physical prerequisites (can't read a recorder you haven't recovered) and cost. No scripted order, no "correct path"; multiple routes to the same proof.
2. **Evidence is derived, never authored.** FDR traces, wreckage map, fractography, witness statements — all computed from one simulated truth. Red herrings are real conditions that were present but not causal.
3. **Pressure, not timers.** Investigator-days, calendar days, public confidence and party cooperation shape choices; nothing fails you for being slow, but slowness has a price.
4. **Write the cause.** The climax is composing a probable cause statement and recommendations that hold up. The score is a diff against the truth — coverage, precision, support.
5. **Documentary polish.** It should look like the best-designed federal docket you've ever seen.

#### B2.2 Case loop

1. **Notification & launch (Day 0).** Brief card: aircraft archetype, operator type, location, phase of flight, fatalities/injuries, weather snapshot, known facts (e.g. "ADS-B track ends at 2,100 ft AGL"). Choose Go Team composition: which investigative groups to stand up (each has a daily burn). You can stand groups up/down later.
2. **On-scene (Days 1–~10).** Field actions: document wreckage, recover recorders & NVM devices, fuel samples, interviews while memories are fresh, secure perishable records (weather archives expire, runway condition reports, security video). Evidence decays on a schedule if not secured.
3. **Analysis (Weeks–months).** Lab readouts, teardowns, materials lab, performance study, sim sessions, records audits, further interviews, party submissions, optional public hearing. Pressure events arrive.
4. **Synthesis (any time).** Findings board → causal chain → probable cause statement → contributing factors → recommendations. Urgent safety recommendations can be issued early.
5. **Board meeting.** Submit. Debrief: animated truth timeline; your chain vs truth diff; what you missed / over-claimed; cost and time vs par; public confidence; grade; shareable result card.

Target session length: 25–40 min per case on Standard.

#### B2.3 Resources and pressure

| Resource | What it is | Moves when |
|---|---|---|
| Investigator-days (budget) | Pool spent by actions and by daily burn of active groups | Every action; every calendar day per active group |
| Calendar days (clock) | Days since accident; board meeting deadline (default 270 days Standard / 180 Senior) | Advancing time to results; lab lead times |
| Public confidence (0–100) | Perceived competence of the investigation | Up: timely investigative updates, correct urgent recs. Down: leaks, long silence, wrong urgent recs, hearing fumbles |
| Party cooperation (per party, 0–100) | How fast and how honestly the operator / manufacturer / FAA / union produce records | Down: subpoena, public blame. Up: sharing factual updates first |

Pressure events (seeded, 3–6 per case): media leak of a theory; congressional letter; a similar incident elsewhere (pressure for an urgent rec); family briefing; foreign AIB data request; weather threatens the site (perishable evidence); budget cut (−15 % investigator-days); a party leaks its own submission. Each offers 2–3 responses with costs and effects; none is forced.

#### B2.4 Scenario engine

**Archetypes (v1 = 4, all fictional types):**

| Id | Type | Ops | Crew | Recorders / data |
|---|---|---|---|---|
| A1 | Meridian M-4 — piston single, 4 seats, retractable | Part 91 | 1 | No FDR/CVR; engine-monitor NVM; portable GPS track; ADS-B Out |
| A2 | Kestrel 19 — twin turboprop commuter, 19 seats, de-ice boots | Part 135 | 2 | CVR; lightweight FDR (limited params); ADS-B |
| A3 | Aurora RJ-75 — regional jet, 75 seats | Part 121 | 2 + 2 cabin | FDR (full) + CVR; ADS-B; QAR |
| A4 | Halcyon 220 — narrowbody, 160 seats | Part 121 | 2 + 4 cabin | FDR (full) + CVR; ADS-B; QAR; ACARS |

Each archetype: systems present (anti-ice, pressurization, autopilot/automation level, EGPWS/TAWS), performance envelope (V-speeds, climb/descent rates, fuel burn), cabin/survival model, typical route lengths.

**Failure-mode templates (v1 = 12).** Each is a parameterised causal graph + flight script + evidence hooks + red-herring pool + par costs.

| # | Template | Archetypes | Typical chain (latent → initiating → propagation → outcome) |
|---|---|---|---|
| T1 | VFR into IMC / spatial disorientation | A1, A2 | get-there-itis + weak IFR currency → entered cloud at night → graveyard spiral → in-flight breakup or CFIT |
| T2 | Fuel exhaustion / starvation | A1, A2 | planning error or gauge defect or selector mis-set → engine power loss → forced landing / stall |
| T3 | Carburettor / induction icing | A1 | carb-ice conditions + late carb heat → power loss in descent → off-airport landing |
| T4 | Airframe icing + deferred anti-ice defect | A2 | MEL misuse + dispatch pressure → boots inop in icing → wing/tailplane stall on approach |
| T5 | Unstabilised approach → runway excursion | A2–A4 | SOP culture + tailwind + contaminated runway → long/fast landing → overrun; survival factors |
| T6 | Uncontained engine failure (fatigue) | A3, A4 | missed inspection / misread SB revision → disk/blade fatigue fracture at high power → hydraulic loss, fire → controllability |
| T7 | Flight-control malfunction | A2, A3 | mis-rigged cable / trim runaway / FOD jam after maintenance → pitch/roll anomaly → loss of control |
| T8 | Go-around loss of control | A3, A4 | training/automation policy → somatogravic illusion or mode confusion on go-around → pitch-up stall or nose-over |
| T9 | CFIT on non-precision approach | A2, A3 | altimeter setting error / descent below MDA / TAWS inhibited (MEL) → terrain impact |
| T10 | Carbon-monoxide incapacitation | A1 | cracked muffler + missed inspection → CO exposure → subtle incapacitation → gentle descent into terrain |
| T11 | Maintenance-induced engine failure | A1, A2 | recent overhaul error (loose fitting / missing safety wire) → oil loss / fire → power loss |
| T12 | Mid-air in the traffic pattern | A1 + A1 | non-standard entry + radio confusion → see-and-avoid failure → collision |

T12 is the only two-aircraft template (two simulated tracks, one collision geometry); if P5 runs long, it is the first cut.

**Truth graph.** A DAG of typed nodes:

```ts
type NodeTier = 'probableCause' | 'contributing' | 'precondition' | 'nonCausal';
interface CausalNode {
  id: string;                   // 'latent.mel_misuse'
  kind: 'latentCondition' | 'precondition' | 'initiatingEvent' | 'propagation' | 'crewAction' | 'outcome' | 'nonCausalCondition';
  tier: NodeTier;               // scoring weight: probableCause 3, contributing 1.5, precondition 1, nonCausal 0
  text: string;                 // finding-style sentence
  revealedBy: { evidenceId: string; strength: 0..1 }[];  // which evidence items expose it and how strongly
  conflictsWith?: string[];     // red-herring interplay
}
```

Every template guarantees: ≥ 1 probableCause node; each causal node revealed by ≥ 2 independent evidence items (at least one obtainable without recorders, so A1 cases are solvable); 1–3 nonCausal nodes drawn from a red-herring pool (crew fatigue, minor logbook gap, marginal-but-legal weather, recent ownership change, prior incident in pilot history, ATC phraseology slip, an unrelated deferred item, a checklist deviation that didn't matter).

**World generation (per seed):** archetype → operator profile (SOP quality, schedule pressure, maintenance culture) → crew profiles (certificates, hours, recency, training history, 72-hour history, CRM quality) → maintenance history (logs, ADs/SBs, MEL items, recent work orders) → environment (fictional airport in a real state, terrain, runway, time of day, weather system) → template selection consistent with all of the above → truth graph → flight script → evidence catalogue.

#### B2.5 Flight simulation and data

Phase-scripted kinematics, not 6-DOF. Phases: preflight, taxi, takeoff, climb, cruise, descent, approach, landing/go-around, with injected events from the template. Output at 1 Hz for the whole flight (≤ 7,200 samples): pressure altitude, radio altitude, IAS, groundspeed, heading, track, pitch, roll, vertical speed, normal acceleration, N1/N2/EGT/torque or RPM/manifold pressure per engine, fuel flow and quantity, control positions (elevator/aileron/rudder), trim, flap, gear, autopilot/autothrottle modes, master caution/warning, stick shaker, plus lat/lon/wind integrated along track.

Derived streams:
- **FDR readout** — archetype-limited parameter set (A2 lightweight FDR drops half the params; A1 has none). Optional recorder damage → gaps.
- **NVM** — engine monitor (A1: EGT/CHT/RPM/fuel flow at 6 s), portable GPS track, EFIS snapshots.
- **Radar** — ASR positions every 4.6 s, Mode C altitude quantised to 100 ft, ±0.05 nm noise, dropouts below the radar floor (terrain-aware); **ADS-B** 1 Hz for equipped archetypes.
- **CVR** — transcript generated from phase phrase banks (checklists, callouts, ATC read-backs), event reactions, crew persona/CRM parameters, sound annotations ("[sound similar to stick shaker]", "[unintelligible]"), plus hot-mic/area-mic tags. A2–A4 only; A1 has none.
- **ATC** — clearances, handoffs, read-backs, distress calls if time allowed; controller notes.
- **Weather** — METAR/TAF/PIREP/AIRMET/SIGMET strings, hourly obs, radar mosaic summary, sounding (freezing level, icing band, LLWS).
- **Wreckage** — from impact state (speed, flight-path angle, bank, configuration): principal impact point, crater/ground scar, debris trail length ∝ speed·cos(angle), fragmentation, fire zone if fuel + ignition; in-flight breakup → separation points upstream with ballistic scatter and wind drift. Component signatures: rotational scoring / chordwise scratching (power at impact), propeller blade bending, fracture faces (fatigue striations vs dimpled overload), control continuity, flap/trim/gear positions, needle-slap marks on instruments, filament stretch, soot/melt patterns (in-flight vs post-impact fire), seat/restraint state.
- **Witnesses** — 3–9 generated observers placed along the track with line-of-sight, distance and lighting; statements template-generated from what they *could* perceive, with bias (altitude over-estimated, "sputtering" when RPM surged, direction errors), reliability score hidden.

#### B2.6 Evidence catalogue

Every evidence item: `id`, `group` (which investigative group produces it), `cost` (investigator-days), `leadTime` (calendar days), `prereqs` (other items / recovered components / party cooperation level), `reveals` (node ids + strength), `decay` (day after which it's lost unless secured), and a renderer type (document, table, trace, map, transcript, photo-set, dialogue).

Catalogue (v1 ≈ 45 items):
- **On-scene:** wreckage distribution map; ground-scar / impact geometry; structures exam (wing/empennage attach points — in-flight vs ground separation); control-continuity check; cockpit switch/instrument positions; engine field exam; propeller field exam; fuel samples & quantities; fire-pattern survey; survival-factors survey; recorder recovery; NVM-device recovery; site photos; witness canvass; security/doorbell video request (decays in 7 days).
- **Records:** maintenance logbooks; AD/SB compliance audit; MEL/deferred-items list; recent work orders + parts invoices (cross-check for falsified records); operator SOPs/ops specs; dispatch release, weight & balance, flight plan; training records; crew 72-hour histories; certificates & medicals; schedule/financial pressure indicators; ATC voice tapes; radar data; ADS-B data; weather package (decays in 30 days unless requested); NOTAMs; airport runway-condition reports; prior incident/ASRS-style reports for operator and type.
- **Lab:** FDR readout; CVR transcript; CVR sound-spectrum study (prop/engine RPM from sound); engine teardown; propeller/governor exam; fuel-system exam; flight-control exam + rigging measurement; materials lab fractography; avionics NVM download; instrument exam; toxicology & pathology; aircraft performance study; simulator sessions; flight test; structures/loads analysis.
- **People & parties:** interviews (surviving crew, passengers, witnesses, controllers, mechanics, dispatcher, chief pilot, director of ops, manufacturer reps); party submissions (operator, manufacturer, FAA — each biased toward itself; useful *and* a trap).
- **Process:** investigative update / press briefing; public hearing; urgent safety recommendation; extension request.

#### B2.7 Actions

Everything in B2.6 is an action ("Request…"), plus: stand up / stand down a group; advance time (to next result, +1 day, +7 days); secure perishable evidence; subpoena a party (cooperation −, speed +); issue urgent rec; draft/submit findings. Actions queue with ETAs and show cost before confirmation. Some actions need the relevant group active (teardown needs Powerplants; fractography needs Structures/Materials).

Par per template = cost of the minimum sufficient evidence set × 1.6, plus group burn over the par calendar length (investigator-days). Default budget: Standard = par × 1.5; Senior = par × 1.1 with more noise and an extra red herring.

#### B2.8 Interviews and parties

Interviews are structured, not free text: topic menu ("72-hour history", "the approach briefing", "what you heard", "the deferred boot item"), topics unlock as evidence surfaces. Answers come from the interviewee's knowledge model (what they know, what they'll admit, their bias) with reliability noise; follow-ups unlock deeper answers; transcripts become evidence items. Crew survivors exist only in survivable templates. Party submissions arrive on request or at day ~120; each proposes findings favouring its interest (operator blames weather/crew; manufacturer blames maintenance; FAA minimises oversight), mixing true facts with spin.

#### B2.9 Findings, probable cause, recommendations, scoring

- **Findings board:** drag any evidence → create a finding (declarative sentence chosen from the evidence item's revealable facts, or the node text once revealed). Findings cite their evidence automatically.
- **Causal chain builder:** arrange findings into a DAG with "led to" links; mark each node Probable cause / Contributing / Not causal.
- **Probable cause composer:** generates the NTSB-style sentence from the marked nodes: "The National Transportation Safety Board determines that the probable cause of this accident was … Contributing to the accident was/were …".
- **Recommendations:** pick recipient (FAA / manufacturer / operator / industry group) + a rec template bound to a latent condition or precondition; optional free text.
- **Urgent rec:** can be issued any time; scored on whether it targets a true latent condition.

Scoring (0–100):
- Coverage `C` = Σ weights of causal nodes present in the player's chain *with citing evidence that actually reveals them* ÷ Σ weights of all causal nodes (weights: PC 3, contributing 1.5, precondition 1).
- Precision penalty `P` = 15 per non-causal node marked Probable cause, 6 per non-causal marked Contributing, 2 per unsupported finding.
- Statement `S` (0–20): PC node set correct 12; contributing set Jaccard × 8.
- Recommendations `R` (0–20): +5 per rec that targets a true latent/precondition with a sensible recipient (max 15); −3 per unsupported rec; urgent rec +5 correct / −10 wrong.
- Efficiency `E` (0–10): from budget and days vs par.
- Total = 50·C + S + R + E − P, clamped. Grades: S ≥ 90, A ≥ 80, B ≥ 65, C ≥ 50, else D.
- Oracles (tests): submitting the truth scores ≥ 95; submitting nothing scores ≤ 10; adding a red herring as PC drops ≥ 12.

Debrief shows the truth timeline (animated), your chain overlaid (hits / misses / over-claims), the evidence you never pulled that would have revealed missed nodes, and the result card.

#### B2.10 Modes, difficulty, curated case files

- **Case files (3, curated):** fixed seeds with bespoke prose (witness statements, interview answers, party submissions, CVR flavour) written by the bot at authoring time into `src/engine/seeds/*.json`; full snapshot stored so engine changes never alter them.
  1. *Night Run to Pinewood* — A1 / T1. Night VFR into IMC over hills, spatial disorientation, in-flight breakup. Red herrings: carb-ice-favourable weather; a 6-week logbook gap. ~25 min.
  2. *Kestrel 19, Flight 204* — A2 / T4 + T5 seasoning. Deferred de-ice boot discrepancy (MEL misuse), dispatch pressure, icing on a night approach, unstabilised, tailplane stall on flap extension. Red herrings: captain's fatigue (present, non-causal); a transient altimeter mis-set corrected in time. ~35 min.
  3. *Aurora 75, Flight 1157* — A3 / T6 + survival factors. Fan-disk fatigue crack missed at the last inspection because an ambiguous service-bulletin revision changed the interval; uncontained failure on takeoff, hydraulic loss, rejected-takeoff overrun, fire, evacuation issues. Red herrings: a checklist deviation that didn't matter; gusty crosswind. ~40 min.
- **Endless:** random seed; choose archetype/template/difficulty or "surprise me"; seed codes shareable (`?seed=KX7-PINE-2041`).
- **Daily case:** seed derived from the UTC date; everyone gets the same case; result card says "Daily · 22 Aug 2026".
- **Difficulty:** Standard (budget par×1.5, 1–2 red herrings) / Senior IIC (par×1.1, 2–3 red herrings, records gaps, noisier witnesses, shorter deadline).
- **IIC Handbook:** non-blocking side panel on first play (what each group does, how recorders work, what "probable cause" means); never gates actions; dismissible forever.

#### B2.11 UI and interaction (desktop-first)

- **Top bar (56 px):** case title & archetype glyph · Day counter · budget meter · public confidence · board-meeting countdown · **Draft findings** button.
- **Left rail (260 px) — Docket navigator:** sections by investigative group (Operations, Human Performance, Structures, Systems, Powerplants, Maintenance Records, ATC, Meteorology, Survival Factors, Recorders, Witnesses, Parties) with "new" badges; each section lists evidence held and actions available with cost/lead time.
- **Workspace (flex) — tabbed viewers:** Document (records on paper with typeset serif body, stamps, redaction-free but with gaps), Wreckage map (procedural SVG: terrain contours, north arrow, scale bar, principal impact point, debris points coloured by component group, fire zone, separation points; hover = component card), FDR strips (stacked SVG strip charts, synced cursor across strips, CVR transcript and radar track; drag to scrub; event flags), Transcripts (CVR/ATC monospace with timestamps and speaker lanes), Radar/ADS-B track (map with altitude ribbon), Weather panel (METAR/TAF decoded + raw, sounding, icing band), Photo set (Imagine library thumbnails keyed to component + finding variant), Interview (topic menu + transcript), Party submission (paper with a "party" watermark).
- **Right rail (340 px) — Findings board:** pinned findings, causal chain canvas (nodes + arrows, tier colouring), notes.
- **Action drawer (bottom sheet):** queue with ETAs, advance-time controls, pressure events as cards with response choices.
- **Report composer (modal):** chain review → probable cause sentence → recs → submit.
- **Debrief (full-screen):** truth timeline, diff, grade, result card (PNG export via canvas).
- Responsive: ≥ 1200 px three-pane; 900–1200 board collapses to a tab; < 900 single-column read-mostly (daily case playable on a phone is a stretch goal, not a v1 requirement).

#### B2.12 Art direction and design tokens

**Concept — "The Docket."** A dark field-office workspace; evidence lives on warm paper inside it; the accent is international orange, the colour of the recorders. Dark-first, single committed theme (no light mode for the game). No glassmorphism, no gradients, no rounded-everything, no emoji in UI.

```css
:root {
  --ink-950:#0B0F14; --ink-900:#0F151C; --ink-800:#161E27; --ink-700:#1F2A36; --ink-600:#2B3847;
  --ink-300:#8A97A6; --ink-100:#E6EBF0;
  --paper-50:#F4F0E7; --paper-100:#EAE4D7; --paper-ink:#1C2128; --paper-rule:#CFC7B6;
  --orange-500:#F2561D; --orange-300:#FF8C5A;     /* accent: recorders, new evidence, causal links, PC highlight */
  --blue-400:#4C8DDB;                              /* links, selection, federal stamps */
  --ok:#3FA66B; --warn:#E0A32E; --crit:#D64545;   /* semantic only, never decorative */
  --series-1:#5FB3C9; --series-2:#E0A32E; --series-3:#8FD694; --series-4:#FF8C5A; /* charts; also vary dash */
  --radius:3px; --hair:1px solid var(--ink-600);
  --font-display:"IBM Plex Sans Condensed"; --font-ui:"IBM Plex Sans"; --font-mono:"IBM Plex Mono"; --font-doc:"Source Serif 4";
}
```

- **Type:** display/eyebrows = Plex Sans Condensed 600, uppercase, +0.08em tracking (section heads, stamps "RECOVERED", "PARTY SUBMISSION"); UI = Plex Sans 400/500; data, timestamps, transcripts = Plex Mono with `font-variant-numeric: tabular-nums`; document prose = Source Serif 4 at 16–17 px, 65-character measure. Scale: 12 / 13 / 14 / 16 / 20 / 26 / 34. All via `@fontsource`.
- **Surfaces:** page `--ink-950`; panels `--ink-800` with `--hair`; paper documents `--paper-50` with a faint SVG-turbulence grain at 4 % opacity and a 1 px `--paper-rule` edge; stamps in `--blue-400` or `--orange-500` at 80 % opacity, slightly rotated (−2°…2°), tracked uppercase.
- **Charts & maps:** hand-rolled SVG; 1 px series lines, faint grid (`--ink-600` at 50 %), emphasised endpoint, event flags in `--orange-500`; wreckage map terrain in `--ink-700` contours, debris dots 4–6 px by component group, fire zone hatched `--crit` at 25 %.
- **Motion:** 150–220 ms ease-out. New evidence card slides in from the docket; transcripts typewriter on *first* open only; FDR cursor scrub at 60 fps; debrief timeline draws on. All off under `prefers-reduced-motion`.
- **Iconography:** `lucide-react`, 1.5 px stroke, `--ink-300` default.
- **Imagery (P6):** Grok Imagine Image 2.0 via grok.com/imagine (Game Assets "Props & UI Kit" template, transparent export, multi-reference for consistency). One cover image per case file (documentary photo style, dusk, long lens, no people identifiable) and a reusable library of ≈ 36 evidence photos keyed `(componentType, findingVariant)` — e.g. `fan-disk / fatigue`, `fan-disk / overload`, `prop-blade / powered`, `prop-blade / unpowered`, `muffler / cracked`, `boot / deteriorated`, `cockpit / instruments`, `debris-field / shallow`, `debris-field / steep`. Style sheet: muted, slightly desaturated, consistent 3:2, white-balanced, no text baked in. Prompts and outputs in `manifest.json`.

#### B2.13 Example walkthrough (seed 1174, Standard)

Day 0: Kestrel 19 (A2), Part 135 commuter, night approach into a fictional Montana field, 2 crew + 11 pax, 9 fatalities, freezing drizzle reported. You stand up Operations, Systems, Powerplants, Meteorology, Maintenance Records, Recorders, Witnesses (skip Human Performance for now — it would add 3 investigator-days of burn per calendar day). Days 1–3: wreckage map shows a compact, steep field with both props showing power signatures; flap jackscrews at 35° extension; CVR and lightweight FDR recovered. Day 4: witness canvass — two say "engine sputtering" (reliability low; the sound was a prop surge). Day 9: CVR transcript — first officer calls "flaps thirty-five", four seconds later "[sound similar to airframe buffet]", captain "what the—", pitch-down. FDR (limited) shows airspeed 118 kt, pitch down 18° in 3 s after flap selection. Meteorology: icing band 2,000–6,000 ft, freezing drizzle. You request the MEL list (2 days): "De-ice boots, outboard RH — deferred, Cat C, day 9 of 10". Work orders show the boot item was deferred twice and the second deferral reused the first's date. Dispatch release shows no icing remark; the DO's interview deflects to the crew. Party submission from the operator blames "crew failure to maintain airspeed". You mark: latent — maintenance control allowed an improper repeat deferral (contributing); precondition — dispatch into known icing with boots inop (contributing); initiating — tailplane ice accretion; propagation — tailplane stall on flap 35 (PC); crew action — unstabilised approach with late configuration (contributing). Fatigue was present in the 72-hour history but FDR/CVR show no decision degradation — you leave it Not causal. Recs: FAA (MEL repeat-deferral oversight for Part 135), operator (icing dispatch policy), manufacturer (flap-35 limitation in icing, AFM revision). Day 142, 61 % of budget. Score 88 — A: missed the precondition "training program omitted tailplane-icing recognition" (revealed by training records you never pulled).

#### B2.14 Accessibility, save, share

Keyboard-operable throughout (roving tabindex in docket, arrow-key scrub on strips); visible focus; colour never the only encoding (shape/dash/label); reduced motion; contrast ≥ 4.5:1 for text on both ink and paper. Case state is event-sourced — `state = reduce(seed, actionLog)` — so saves are tiny (seed + log), autosaved to localStorage per case, exportable as JSON, and replayable. Share: seed code, result-card PNG.

#### B2.15 Out of scope for v1 and content rules

Out: multiplayer, leaderboards/backends, 3D wreckage, voice, real-time LLM text, other NTSB modes (rail/marine/highway/pipeline — the archetype/template system must not preclude them), mobile-first play. Footer disclaimer: "NTSB Investigator is a work of fiction for entertainment and education. It is not affiliated with or endorsed by the National Transportation Safety Board. All aircraft, operators, airports, people and events are fictional." If this ever ships commercially, rename (e.g. *Probable Cause* or *Go Team*).
