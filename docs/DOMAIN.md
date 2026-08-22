# DOMAIN.md — Domain bible

- **The NTSB** is an independent US federal agency that investigates civil aviation accidents, determines probable cause and issues safety recommendations. It has no regulatory or enforcement power; recommendations go to the FAA, manufacturers, operators, states, industry bodies. Investigations are led by an **Investigator-in-Charge (IIC)**; major accidents get a **Go Team** (IIC, group chairs, a Board Member as on-scene spokesperson). The **party system** lets the NTSB designate organisations with relevant expertise as parties (the FAA always; typically operator, manufacturer, engine maker, pilots'/mechanics' unions, ATC) — never lawyers, insurers or claimants. Parties supply people and data, and may later file *party submissions* proposing findings.
- **Investigative groups** on a major: Operations, Human Performance, Structures, Systems, Powerplants, Maintenance Records, Air Traffic Control, Meteorology, Survival Factors, Airworthiness (GA), Aircraft Performance, Witness, CVR group and FDR group (recorders go to the NTSB lab in Washington), plus Airports and Fire & Explosion when relevant.
- **Timeline:** preliminary report within weeks; docket (factual material) opened before the analysis is public; investigative updates as warranted; urgent safety recommendations any time; final report typically 12–24 months; major cases end in a public Board meeting that adopts findings, probable cause and recommendations.
- **Report structure (Annex 13 style):** 1 Factual Information (1.1 History of Flight, 1.2 Injuries, 1.3 Damage to Aircraft, 1.4 Other Damage, 1.5 Personnel, 1.6 Aircraft, 1.7 Meteorological, 1.8 Aids to Navigation, 1.9 Communications, 1.10 Airport, 1.11 Flight Recorders, 1.12 Wreckage and Impact, 1.13 Medical and Pathological, 1.14 Fire, 1.15 Survival Aspects, 1.16 Tests and Research, 1.17 Organizational and Management, 1.18 Additional Information) · 2 Analysis · 3 Conclusions (3.1 Findings — numbered declarative sentences; 3.2 Probable Cause) · 4 Recommendations (new, previously issued) · 5 Appendixes. The game's docket navigator mirrors 1.x as evidence groups; the report composer mirrors 3–4.
- **Probable-cause phrasing:** "The National Transportation Safety Board determines that the probable cause of this accident was [the event/condition]. Contributing to the accident was/were [conditions]." Recommendations are numbered like A-26-12, addressed "To the Federal Aviation Administration:" and later classified (Open—Acceptable Response, Closed—Acceptable Action, Closed—Unacceptable Action, etc.).
- **Evidence conventions to get right:** FDR parameters (B2.5 list); CVR 2-hour (older) or 25-hour (newer) solid-state, cockpit area mic vs hot mics, transcript notation "[sound of …]", "unintelligible", "#" expletive, times in local and UTC; sound-spectrum analysis yields prop/engine RPM; radar ASR ≈ 4.6-s sweep, Mode C in 100-ft increments; ADS-B ~1 Hz; NVM devices (engine monitors, GPS, EFIS, ELT); wreckage signatures — rotational scoring and chordwise scratches mean power at impact, S-bent or curled prop blades likewise, fatigue = beach marks/striations vs overload = dimpled rupture, needle-slap marks and filament stretch capture instrument/lamp state at impact, flap jackscrew and trim actuator positions, in-flight breakup = parts distributed upstream along the flight path, soot and melt patterns distinguish in-flight from post-impact fire; toxicology (CO, drugs), 72-hour histories for fatigue; stabilised-approach gates (1,000 ft IMC / 500 ft VMC); METAR/TAF formats; MDA/DA; MEL categories and repeat-deferral rules.
- **Sources (patterns only — never reproduce a real case):** NTSB investigative process — https://www.ntsb.gov/investigations/process/Pages/default.aspx · Aviation Investigation Manual, Major Team Investigations — https://www.ntsb.gov/about/Documents/MajorInvestigationsManual.pdf (appendices: …/MajorInvestigationsManualApp.pdf) · Party guidance — https://data.ntsb.gov/investigations/process/Documents/NTSB%20Party%20Guidance.pdf · CAROL case database (public domain reports, for phrasing and structure) — https://data.ntsb.gov/carol-main-public/ · CAROL user guide — https://www.ntsb.gov/Documents/CAROL-Guide.pdf. Read the manual's report-format and group-responsibility sections in P0; skim three CAROL final reports of different sizes for tone. Do not ingest specific accidents into templates.


## Conventions used by the engine

Concrete lists the generator and UI code against. Patterns only — no real aircraft, operator, or accident identities.

### FDR / flight-parameter names

Sim and strip-chart keys (1 Hz baseline; archetype may drop some). Use these exact identifiers in engine types and viewers:

| Key | Meaning | Notes |
| --- | --- | --- |
| `pressureAltitude_ft` | Pressure altitude | ft |
| `radioAltitude_ft` | Radio / radar altitude | ft AGL when in range |
| `ias_kt` | Indicated airspeed | kt |
| `groundspeed_kt` | Groundspeed | kt |
| `heading_deg` | Magnetic heading | deg |
| `track_deg` | Ground track | deg |
| `pitch_deg` / `roll_deg` | Attitude | deg |
| `verticalSpeed_fpm` | Vertical speed | ft/min |
| `nz_g` | Normal acceleration | g |
| `lat_deg` / `lon_deg` | Position | integrated along track |
| `windDir_deg` / `windSpeed_kt` | Wind | along-track model |
| Turbine: `n1_pct`, `n2_pct`, `egt_c`, `torque_pct` | Engine gas-path / power | per engine index |
| Piston: `rpm`, `map_inhg` | Prop RPM / manifold pressure | per engine index |
| `fuelFlow_pph`, `fuelQty_lb` | Fuel | per tank or total as archetype dictates |
| `elevator_pct`, `aileron_pct`, `rudder_pct` | Control surface / column / wheel / pedal positions | −100…100 |
| `trim_units` | Pitch (and optionally roll/yaw) trim | |
| `flap_deg`, `gear` | Configuration | gear: `UP`/`DOWN`/`TRANSIT` |
| `autopilot`, `autothrottle`, `fma_modes` | Automation | mode strings on FMA |
| `masterCaution`, `masterWarning`, `stickShaker` | Alerts | boolean / enum |

Archetype limits: A1 — no FDR (engine-monitor NVM / portable GPS / ADS-B only); A2 — lightweight FDR (subset); A3/A4 — full set above (+ QAR/ACARS where relevant). Optional recorder damage → parameter gaps, not invented values.

### CVR transcript notation

Transcript lines are monospace, one event per line, correlated to both **local** and **UTC** clocks (App B: relative recorder time mapped to local/UTC when ATC/FDR/radar allow).

**Mic / speaker tags (prefix):**

- `CAM` — cockpit area microphone (ambient / shared)
- `HOT-1`, `HOT-2`, … — boom / mask / hand mic hot channels (captain, FO, …)
- `RDO-1`, `RDO-2` — radio transmit from a crew station
- `TWR` / `DEP` / `APP` / `CTR` / `GND` — ATC facility voice (when mixed or paired)
- `PA` — passenger address (rare)
- `INT` — interphone / cabin call

**Bracket / special tokens:**

- `[sound of …]` — identifiable non-speech (e.g. `[sound of click]`, `[sound of altitude alert]`)
- `[sound similar to …]` — uncertain identification (App B preferred phrasing when the group lacks consensus)
- `[unintelligible]` — speech present but not recoverable
- `[start of recording]` / `[end of recording]` / `[gap]` — recorder bounds or damage
- `#` — expletive redacted per Board style (non-pertinent / expletive remarks may be edited before public release)
- `(concurrent)` or split columns only if the UI needs overlapping speech; default is sequential lines with shared timestamp

**Time columns:** `HH:MM:SS.s Local` and `HH:MM:SS.s UTC` (or a single correlated clock plus an explicit offset note). Do not invent cockpit video; image-recorder language stays out of v1 transcripts.

### Probable-cause phrasing template

Lead-in (CAROL / blue-cover style):

> The National Transportation Safety Board determines that the probable cause of this accident was [primary event or condition]. Contributing to the accident was/were [contributing condition(s)].

Variants the scorer accepts as equivalent structure:

- “…determines the probable cause(s) of this accident to be:” + one or more declarative clauses
- Optional second sentence: “Contributing to the [severity / accident] was/were …”
- Ruling-outs belong in **Findings**, not in the PC sentence (“X was not a factor”)

Engine stores PC as structured nodes (initiating / propagation / contributing / not-causal); the report composer renders the template above from those nodes. Never paste a real Board PC into a template.

### Findings style

Numbered **declarative** sentences (3.1 Conclusions → Findings):

1. State what the Board **drew from the facts**, not raw facts alone (Manual 4.12.3.2: a conclusion is not a statement of fact).
2. Include explicit **not-a-factor** findings where an issue was analyzed and ruled out (e.g. certifications, weather, structural integrity).
3. One finding ↔ one idea; avoid compound laundry lists except for grouped “none of the following were factors…” ladders.
4. Past tense; no recommendation language inside a finding.
5. Group-chairman analysis reports use the same numbered style internally (`FOR OFFICIAL USE ONLY`); public findings appear only after Board adoption.

### Recommendation numbering and addressees

- **Form:** `A-YY-NN` (aviation) — year of issuance, sequence within year (e.g. `A-20-33`). Legacy multi-part may appear as `A-15-7` and `A-15-8`.
- **Addressee header:** `To the Federal Aviation Administration:` / `To the [Operator]:` / `To the [Manufacturer]:` / industry bodies, states, etc. One block per addressee; multiple recommendations may share a block.
- **Classification (post-response, not player-authored in v1 but shown in handbook):** `Open—Acceptable Response`, `Open—Unacceptable Response`, `Closed—Acceptable Action`, `Closed—Unacceptable Action`, `Closed—No Longer Applicable`, etc.
- Urgent recommendations may issue before the final report; engine may surface an “urgent rec” pressure event without changing the `A-YY-NN` scheme.
- Manual cue: analysis text uses “the Safety Board **believes**…” only immediately before a formal recommendation; “**concludes**…” only before a formal conclusion.

### Wreckage signature vocabulary

Use these terms in wreckage cards, lab reports, and finding hooks:

| Signature | Typical reading |
| --- | --- |
| Rotational scoring / polishing on blades or spinners | Rotation under power at impact |
| Chordwise scratches on propeller / fan | Powered rotation through debris or ground |
| S-bending / curling of propeller blades | Power at impact (vs rearward bending unpowered) |
| Beach marks / striations on fracture face | Fatigue progression |
| Dimpled / cup-and-cone / shear lip rupture | Overload (ductile) failure |
| Cleavage / brittle facets | Brittle overload or environmental embrittlement (lab-qualified) |
| Needle-slap marks on instrument faces | Indication capture at impact |
| Filament stretch in bulbs | Energized at impact vs cold fracture |
| Jackscrew / actuator extension measurement | Flap / stabilizer / spoiler position at impact |
| Control-cable continuity / bellcrank deformation | Pre-impact disconnect vs impact stretch |
| Soot nesting / melt directionality | In-flight fire vs post-impact fire |
| Upstream debris field along flight path | In-flight breakup / separation |
| Compact crater + little scatter | High-angle, low-energy or near-vertical impact |
| Ground scar / slide path | Low-angle impact with forward velocity |

Phrase lab notes in past tense, measured values with units, and separate **observation** from **interpretation** (interpretation lives in analysis / findings).

### Radar / ADS-B timing

| Source | Update / quantisation | Engine use |
| --- | --- | --- |
| ASR (airport surveillance radar) | ≈ **4.6 s** sweep | Sparse track; interpolate carefully; do not invent between-sweeps maneuver detail |
| Mode C altitude | **100 ft** increments | Quantised pressure altitude on beacon returns |
| ARTCC long-range | Similar mosaic limits; NTAP/CDR style extracts | En-route sparse points |
| ADS-B Out | ≈ **1 Hz** (when equipped) | Dense lat/lon/alt/gs; still not a substitute for FDR attitude |
| Primary-only returns | No beacon altitude | Position without Mode C |

Retain FAA 15-day ATC data-retention pressure as a scenario timer when ATC group work is delayed.

### Investigative groups and products

From the Major Team Investigations Manual (Go Team roster + App H/K). Each NTSB specialist chairs a group; parties supply members. Products:

| Group | Produces (public docket unless noted) |
| --- | --- |
| Operations | Flight history, crew quals/rosters, procedures, W&B, dispatch — **Group Chairman’s Factual Report** |
| Human Performance | 72-hour histories, behavioral/workload/interface factors — factual (+ internal analysis) |
| Structures | Wreckage distribution, airframe breakup, seats/restraint attach — factual |
| Systems | Hydraulics, electrics, flight controls, avionics as systems — factual |
| Powerplants | Engines, props/fans, fuel feed — factual; teardown notes |
| Maintenance Records | Logs, MEL/CDL, work orders, AD compliance — factual |
| Air Traffic Control | ATC tapes, radar extracts, facility packages — factual |
| Meteorology | METARs/TAFs, soundings, icing/PIREPs, forecasts — factual |
| Survival Factors | Injury patterns, cabin, evac, CRZ/ARFF — factual |
| Aircraft Performance | Trajectory, perf study, sim sessions — factual / study |
| Witness | Canvass statements, interview summaries — factual |
| CVR | CVR factual report + transcript (special release rules) |
| FDR | FDR readout / parametric plots + factual |
| Metallurgy / Materials Lab | Fractography, failure-mode lab letters (often via Structures/Powerplants) |
| Airports | (when used) airport design, lighting, NOTAMs, ARFF |
| Fire & Explosion | (when used) fire patterns, ignition sources |

**Group-chairman pipeline (Manual 3.6, 4.4, App K):** field notes (signed by group) → **Factual Report** (past tense, no analysis; outline A–D) → **Analysis Report** (FOUO; findings + PC opinion + draft recs; not in public docket). Parties may comment on factual drafts; analysis stays NTSB-only. Parties may later file **party submissions** proposing findings/PC/recs after technical review.

### Annex 13 / report section map → docket groups

Final report follows ICAO Annex 13 (Manual 4.12). Game mapping:

| Report section | Docket / UI mapping |
| --- | --- |
| 1 Factual Information | Left-rail evidence groups |
| 1.1 History of Flight | Ops + Recorders + ATC synthesis |
| 1.2 Injuries | Survival Factors |
| 1.3 Damage to Aircraft | Structures / Systems / Powerplants |
| 1.4 Other Damage | Airports / Witness / Structures |
| 1.5 Personnel Information | Operations + Human Performance |
| 1.6 Aircraft Information | Maintenance Records + Systems + Powerplants |
| 1.7 Meteorological Information | Meteorology |
| 1.8 Aids to Navigation | ATC / Airports |
| 1.9 Communications | ATC + CVR excerpts |
| 1.10 Aerodrome | Airports |
| 1.11 Flight Recorders | CVR + FDR groups |
| 1.12 Wreckage and Impact Information | Structures (+ Fire) |
| 1.13 Medical and Pathological | Survival / HP (restricted handling) |
| 1.14 Fire | Fire & Explosion |
| 1.15 Survival Aspects | Survival Factors |
| 1.16 Tests and Research | Lab / Performance studies |
| 1.17 Organizational and Management | Operations / HP / parties |
| 1.18 Additional Information | Catch-all factual |
| 1.19 (optional) Useful investigative techniques | Meta; rare in game |
| 2 Analysis | Report composer (player); not a docket folder |
| 3.1 Findings / 3.2 Probable Cause | Findings board + PC slot |
| 4 Recommendations | Rec composer (`A-YY-NN` + addressee) |
| 5 Appendixes | Supporting exhibits |

Public **docket** opens with factual material before analysis is public; CVR transcript release follows statute/Manual timing (hearing or Board-controlled public release). Engine mirrors that as an unlock gate, not as a real-case schedule.

### Process cues retained from source skim

- Investigation phases overlap: notification → on-scene / fact gathering (Go Team + party system) → analysis → Board adoption of report / PC / recs → advocacy on recommendations (process page).
- Target cadence ~12–24 months for completion; game compresses to investigator-days and calendar pressure without copying any real case timeline.
- Party status is a privilege for technical contributors (FAA always; operator, manufacturers, unions, ATC as IIC designates); no lawyers, insurers, or claimants (Party Guidance + Manual).
