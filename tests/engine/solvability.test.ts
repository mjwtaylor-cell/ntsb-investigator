import { describe, it, expect } from 'vitest';
import { createHash } from 'node:crypto';
import {
  generateCase,
  createInitialState,
  runOracles,
} from '../../src/engine/index';
import {
  bundleHash,
  checkRevealCoverage,
  checkBudgetSolvable,
  checkSeed,
  stableStringify,
} from '../../scripts/solvability';

describe('solvability harness', () => {
  it('seed 1174 is coherent, solvable, and oracle-green', () => {
    const result = checkSeed('1174');
    expect(result.issues, result.issues.join('; ')).toEqual([]);
    expect(result.ok).toBe(true);
    expect(result.truthScore).toBeGreaterThanOrEqual(95);
    expect(result.emptyScore).toBeLessThanOrEqual(10);
  });

  it('golden determinism: same seed → same SHA-256 of bundle', () => {
    const a = generateCase('1174');
    const b = generateCase('1174');
    const ha = bundleHash(a);
    const hb = bundleHash(b);
    expect(ha).toBe(hb);
    expect(ha).toMatch(/^[a-f0-9]{64}$/);
    // Golden: also hash stable stringify of truth template id + node ids
    const fingerprint = createHash('sha256')
      .update(
        stableStringify({
          templateId: a.truth.templateId,
          archetypeId: a.truth.archetypeId,
          nodeIds: a.truth.nodes.map((n) => n.id),
          evidenceIds: a.evidence.map((e) => e.id),
          par: a.par,
        }),
      )
      .digest('hex');
    const again = createHash('sha256')
      .update(
        stableStringify({
          templateId: b.truth.templateId,
          archetypeId: b.truth.archetypeId,
          nodeIds: b.truth.nodes.map((n) => n.id),
          evidenceIds: b.evidence.map((e) => e.id),
          par: b.par,
        }),
      )
      .digest('hex');
    expect(fingerprint).toBe(again);
  });

  it('spot-check 20 seeds for reveals + budget + oracles', () => {
    for (let i = 0; i < 20; i++) {
      const seed = String(2000 + i);
      const bundle = generateCase(seed);
      expect(checkRevealCoverage(bundle), seed).toEqual([]);
      expect(checkBudgetSolvable(bundle), seed).toEqual([]);
      const state = createInitialState(bundle);
      state.submitted = true;
      state.investigatorDaysSpent = bundle.par.investigatorDays;
      state.calendarDay = bundle.par.calendarDays;
      const o = runOracles(bundle, state);
      expect(o.truthScore, seed).toBeGreaterThanOrEqual(95);
      expect(o.emptyScore, seed).toBeLessThanOrEqual(10);
    }
  });
});
