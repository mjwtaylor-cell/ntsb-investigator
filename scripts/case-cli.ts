#!/usr/bin/env node
/**
 * Case CLI: `case -- --seed 1174` prints a one-screen summary.
 * Optional `--json [path]` dumps the bundle.
 * `--archetype` / `--template` force selection; incompatible pairs error kindly.
 */

import { writeFileSync } from 'node:fs';
import {
  generateCase,
  getArchetype,
  getTemplate,
  CaseSelectionError,
} from '../src/engine/index.ts';

function parseArgs(argv: string[]): {
  seed: string;
  template?: string;
  archetype?: string;
  json?: string | true;
  difficulty?: 'standard' | 'senior';
} {
  const out: {
    seed: string;
    template?: string;
    archetype?: string;
    json?: string | true;
    difficulty?: 'standard' | 'senior';
  } = { seed: '1174' };
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i]!;
    if (a === '--seed') out.seed = String(argv[++i] ?? out.seed);
    else if (a.startsWith('--seed=')) out.seed = a.slice('--seed='.length);
    else if (a === '--template') out.template = String(argv[++i]);
    else if (a.startsWith('--template='))
      out.template = a.slice('--template='.length);
    else if (a === '--archetype') out.archetype = String(argv[++i]);
    else if (a.startsWith('--archetype='))
      out.archetype = a.slice('--archetype='.length);
    else if (a === '--difficulty')
      out.difficulty = argv[++i] as 'standard' | 'senior';
    else if (a === '--json') {
      const next = argv[i + 1];
      if (next && !next.startsWith('-')) {
        out.json = String(argv[++i]);
      } else {
        out.json = true;
      }
    } else if (a.startsWith('--json=')) out.json = a.slice('--json='.length);
  }
  return out;
}

function main(): void {
  const args = parseArgs(process.argv.slice(2));
  let bundle;
  try {
    bundle = generateCase(args.seed, {
      archetype: args.archetype as 'A1' | 'A2' | 'A3' | 'A4' | undefined,
      template: args.template as 'T1' | 'T2' | 'T4' | 'T6' | undefined,
      difficulty: args.difficulty,
    });
  } catch (err) {
    if (err instanceof CaseSelectionError) {
      console.error(`Error: ${err.message}`);
      process.exit(1);
    }
    if (err instanceof Error && /Unknown (archetype|template)/i.test(err.message)) {
      console.error(`Error: ${err.message}`);
      process.exit(1);
    }
    throw err;
  }

  const arch = getArchetype(bundle.truth.archetypeId);
  const tmpl = getTemplate(bundle.truth.templateId);
  const causal = bundle.truth.nodes.filter((n) => n.tier !== 'nonCausal');
  const herrings = bundle.truth.nodes.filter((n) => n.tier === 'nonCausal');
  const chain = causal
    .map((n) => `  [${n.tier}] ${n.id}: ${n.text.slice(0, 90)}`)
    .join('\n');

  const crewN =
    bundle.world.occupants.crewFlight + bundle.world.occupants.crewCabin;
  const occ = bundle.world.occupants;
  const minor = 'minorInjuries' in occ ? (occ as { minorInjuries: number }).minorInjuries : 0;

  const summary = [
    `NTSB Investigator — case seed ${args.seed}`,
    `Archetype: ${arch.id} ${arch.name} (Part ${arch.opsPart})`,
    `Template:  ${tmpl.id} ${tmpl.name}`,
    `Difficulty: ${bundle.truth.difficulty}`,
    `Location:  ${bundle.world.environment.airportName}, ${bundle.world.environment.state} (${bundle.world.environment.timeOfDay})`,
    `Operator:  ${bundle.world.operator.name}`,
    `Occupants: ${occ.passengers} pax + ${crewN} crew · fatal ${occ.fatalities} · serious ${occ.seriousInjuries} · minor ${minor}`,
    `Flight:    ${bundle.flight.samples.length} samples @ 1 Hz; events: ${bundle.flight.events.map((e) => e.eventId).join(', ') || '(none)'}`,
    `Evidence:  ${bundle.evidence.length} catalogue items`,
    `Par:       ${bundle.par.investigatorDays} inv-days / ${bundle.par.calendarDays} calendar days`,
    `Par set:   ${bundle.par.evidenceSet.join(', ')}`,
    `Chain (${causal.length} causal + ${herrings.length} non-causal):`,
    chain,
    `Pressure:  ${bundle.pressureEvents.map((p) => `${p.id}@d${p.triggerDay}`).join(', ')}`,
  ].join('\n');

  console.log(summary);

  if (args.json) {
    const payload = {
      truth: bundle.truth,
      world: bundle.world,
      evidence: bundle.evidence,
      par: bundle.par,
      flight: {
        sampleCount: bundle.flight.samples.length,
        events: bundle.flight.events,
        impactIndex: bundle.flight.impactIndex,
      },
      pressureEvents: bundle.pressureEvents,
    };
    const text = JSON.stringify(payload, null, 2);
    if (args.json === true) console.log(text);
    else {
      writeFileSync(args.json, text, 'utf8');
      console.log(`\nWrote JSON → ${args.json}`);
    }
  }
}

main();
