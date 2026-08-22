import { describe, it, expect } from 'vitest';
import { generateWorld, generateTruth } from '../../src/engine/generate';
import { simulateFlight } from '../../src/engine/sim';
import { buildEvidence } from '../../src/engine/evidence';
import { createInitialState } from '../../src/engine/actions';
import {
  scoreCase,
  truthFindings,
  emptyFindings,
  runOracles,
} from '../../src/engine/scoring';
import type { CaseBundle } from '../../src/engine/types';

function bundle(seed: string): CaseBundle {
  const { world, archetype, difficulty } = generateWorld(seed);
  const { truth, template } = generateTruth(seed, archetype, difficulty);
  const track = simulateFlight(seed, world, archetype, template);
  const { catalogue, par } = buildEvidence(template, truth, archetype, track);
  return { truth, world, evidence: catalogue, par };
}

describe('scoring + oracles', () => {
  it('truth ≥ 95 and empty ≤ 10 on seed 1174', () => {
    const b = bundle('1174');
    const state = createInitialState(b);
    state.submitted = true;
    state.investigatorDaysSpent = b.par.investigatorDays;
    state.calendarDay = b.par.calendarDays;
    const t = scoreCase(truthFindings(b), b, state);
    const e = scoreCase(emptyFindings(), b, state);
    expect(t.total).toBeGreaterThanOrEqual(95);
    expect(e.total).toBeLessThanOrEqual(10);
    const o = runOracles(b, state);
    expect(o.pass).toBe(true);
  });
});
