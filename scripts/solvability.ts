#!/usr/bin/env node
/**
 * Solvability harness: N seeds, reveal coverage, budget, random policy,
 * oracles, and SHA-256 determinism.
 */

import { createHash } from 'node:crypto';
import {
  generateCase,
  createInitialState,
  applyAction,
  advanceTime,
  createRng,
  runOracles,
  type CaseBundle,
  type Action,
  type CaseState,
} from '../src/engine/index.ts';

export function stableStringify(value: unknown): string {
  return JSON.stringify(sortKeys(value));
}

function sortKeys(value: unknown): unknown {
  if (Array.isArray(value)) return value.map(sortKeys);
  if (value && typeof value === 'object') {
    const obj = value as Record<string, unknown>;
    const out: Record<string, unknown> = {};
    for (const k of Object.keys(obj).sort()) {
      out[k] = sortKeys(obj[k]);
    }
    return out;
  }
  return value;
}

/** Hash the durable bundle fields (exclude flight samples bulk noise optional). */
export function bundleHash(bundle: CaseBundle): string {
  const payload = {
    truth: bundle.truth,
    world: bundle.world,
    evidence: bundle.evidence,
    par: bundle.par,
  };
  return createHash('sha256').update(stableStringify(payload)).digest('hex');
}

function causalNodes(bundle: CaseBundle) {
  return bundle.truth.nodes.filter(
    (n) => n.tier !== 'nonCausal' && n.kind !== 'nonCausalCondition',
  );
}

export function checkRevealCoverage(bundle: CaseBundle): string[] {
  const issues: string[] = [];
  for (const node of causalNodes(bundle)) {
    const reveals = bundle.evidence.filter((e) =>
      e.reveals.some((r) => r.nodeId === node.id),
    );
    if (reveals.length < 2) {
      issues.push(
        `${node.id} has ${reveals.length} catalogue reveals (need ≥2)`,
      );
    }
  }
  return issues;
}

/** At least one revealing item obtainable within Standard budget (par×1.5). */
export function checkBudgetSolvable(bundle: CaseBundle): string[] {
  const issues: string[] = [];
  const budget = Math.ceil(bundle.par.investigatorDays * 1.5);
  for (const node of causalNodes(bundle)) {
    const revealing = bundle.evidence.filter((e) =>
      e.reveals.some((r) => r.nodeId === node.id),
    );
    // Prefer items with empty prereqs; else include cheap prereq chain estimate
    const obtainable = revealing.filter((e) => {
      const preCost = e.prereqs.reduce((sum, id) => {
        const pre = bundle.evidence.find((x) => x.id === id);
        return sum + (pre?.cost ?? 0);
      }, 0);
      return e.cost + preCost <= budget;
    });
    if (obtainable.length < 1) {
      issues.push(`${node.id} has no revealing evidence within Standard budget`);
    }
  }
  return issues;
}

function randomPolicy(
  seed: string,
  bundle: CaseBundle,
  steps = 40,
): CaseState {
  const rng = createRng(`${seed}::randomPolicy`);
  let state = createInitialState(bundle);
  const pressure = 'pressureEvents' in bundle
    ? (bundle as { pressureEvents: { id: string; triggerDay: number; choices: { id: string }[] }[] }).pressureEvents
    : [];
  void pressure;

  for (let i = 0; i < steps; i++) {
    const candidates: Action[] = [];
    const available = bundle.evidence.filter(
      (e) =>
        !state.obtainedEvidenceIds.includes(e.id) &&
        !state.decayedEvidenceIds.includes(e.id) &&
        !state.queue.some(
          (q) =>
            q.source.type === 'requestEvidence' &&
            q.source.evidenceId === e.id,
        ) &&
        e.prereqs.every((p) => state.obtainedEvidenceIds.includes(p)) &&
        state.investigatorDaysRemaining >= e.cost,
    );
    for (const e of available.slice(0, 12)) {
      candidates.push({ type: 'requestEvidence', evidenceId: e.id });
    }
    candidates.push({ type: 'advanceTime', days: rng.pick([1, 3, 7]) });
    if (state.activeGroups.length < 4) {
      candidates.push({
        type: 'standUpGroup',
        group: rng.pick([
          'operations',
          'structures',
          'meteorology',
          'recorders',
          'witnesses',
          'maintenanceRecords',
        ] as const),
      });
    }
    const action = rng.pick(candidates);
    try {
      if (action.type === 'advanceTime') {
        state = advanceTime(state, action.days, bundle);
      } else {
        state = applyAction(state, action, bundle);
      }
    } catch {
      // Random policy may hit soft failures; ignore and continue
      state = advanceTime(state, 1, bundle);
    }
  }
  return state;
}

export interface SeedResult {
  seed: string;
  ok: boolean;
  hash: string;
  issues: string[];
  truthScore: number;
  emptyScore: number;
}

export function checkSeed(seed: string): SeedResult {
  const issues: string[] = [];
  const a = generateCase(seed);
  const b = generateCase(seed);
  const hashA = bundleHash(a);
  const hashB = bundleHash(b);
  if (hashA !== hashB) issues.push('determinism hash mismatch');

  issues.push(...checkRevealCoverage(a));
  issues.push(...checkBudgetSolvable(a));

  try {
    randomPolicy(seed, a);
  } catch (err) {
    issues.push(`random policy threw: ${(err as Error).message}`);
  }

  const state = createInitialState(a);
  state.submitted = true;
  state.investigatorDaysSpent = a.par.investigatorDays;
  state.calendarDay = a.par.calendarDays;
  const oracle = runOracles(a, state);
  if (oracle.truthScore < 95) {
    issues.push(`truth score ${oracle.truthScore} < 95`);
  }
  if (oracle.emptyScore > 10) {
    issues.push(`empty score ${oracle.emptyScore} > 10`);
  }

  return {
    seed,
    ok: issues.length === 0,
    hash: hashA,
    issues,
    truthScore: oracle.truthScore,
    emptyScore: oracle.emptyScore,
  };
}

function parseN(argv: string[]): number {
  for (let i = 0; i < argv.length; i++) {
    if (argv[i] === '--n') return Number(argv[++i] ?? 200);
    if (argv[i]?.startsWith('--n=')) return Number(argv[i]!.slice(4));
  }
  return 200;
}

export function main(): void {
  const n = parseN(process.argv.slice(2));
  let pass = 0;
  const failures: SeedResult[] = [];
  for (let i = 0; i < n; i++) {
    const seed = String(1000 + i);
    const result = checkSeed(seed);
    if (result.ok) pass += 1;
    else failures.push(result);
    if ((i + 1) % 50 === 0) {
      console.log(`… ${i + 1}/${n} checked (${pass} pass)`);
    }
  }
  console.log(
    `Solvability: ${pass}/${n} passed; ${failures.length} failed`,
  );
  for (const f of failures.slice(0, 15)) {
    console.log(`  FAIL seed=${f.seed} :: ${f.issues.join('; ')}`);
  }
  if (failures.length > 15) {
    console.log(`  … and ${failures.length - 15} more`);
  }
  // Always show seed 1174 explicitly
  const curated = checkSeed('1174');
  console.log(
    `Curated 1174: ${curated.ok ? 'PASS' : 'FAIL'} hash=${curated.hash.slice(0, 16)}… truth=${curated.truthScore} empty=${curated.emptyScore}`,
  );
  if (failures.length > 0 || !curated.ok) process.exit(1);
}

const isDirect = process.argv[1]?.includes('solvability');
if (isDirect) {
  main();
}
