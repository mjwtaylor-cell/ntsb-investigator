import { describe, it, expect } from 'vitest';
import {
  generateCase,
  createInitialState,
  advanceTime,
  GROUP_DAILY_BURN,
  EXPECTED_GROUPS_FOR_PAR,
  PAR_EVIDENCE_MULT,
} from '../../src/engine/index';
import type { InvestigativeGroup } from '../../src/engine/types';

const FIVE_GROUPS: InvestigativeGroup[] = [
  'operations',
  'structures',
  'meteorology',
  'recorders',
  'witnesses',
];

describe('par / budget (B2.7)', () => {
  it('par = Σ(min evidence)×1.6 + expected 5-group burn over calendar', () => {
    const bundle = generateCase('1174');
    const expectedBurn =
      EXPECTED_GROUPS_FOR_PAR * GROUP_DAILY_BURN * bundle.par.calendarDays;
    const expectedPar = Math.ceil(
      bundle.par.evidenceCostSum * PAR_EVIDENCE_MULT + expectedBurn,
    );
    expect(bundle.par.investigatorDays).toBe(expectedPar);
    expect(bundle.par.expectedBurnPerDay).toBe(
      EXPECTED_GROUPS_FOR_PAR * GROUP_DAILY_BURN,
    );
  });

  it('Standard budget is par×1.5; Senior is par×1.1', () => {
    const std = generateCase('1174', { difficulty: 'standard' });
    const sen = generateCase('1174', { difficulty: 'senior' });
    expect(std.par.investigatorDays).toBe(sen.par.investigatorDays);
    const stdState = createInitialState(std);
    const senState = createInitialState(sen);
    expect(stdState.investigatorDaysRemaining).toBe(
      Math.ceil(std.par.investigatorDays * 1.5),
    );
    expect(senState.investigatorDaysRemaining).toBe(
      Math.ceil(sen.par.investigatorDays * 1.1),
    );
  });

  it('5-group Standard case survives to par calendar day with ≥25% budget left', () => {
    const bundle = generateCase('1174', { difficulty: 'standard' });
    let state = createInitialState(bundle);
    state = {
      ...state,
      activeGroups: [...FIVE_GROUPS],
    };
    state = advanceTime(state, bundle.par.calendarDays, bundle);
    const start = Math.ceil(bundle.par.investigatorDays * 1.5);
    const remaining = state.investigatorDaysRemaining;
    expect(remaining / start).toBeGreaterThanOrEqual(0.25);
    // Also: burn matches 5 × GROUP_DAILY_BURN × calendarDays
    const burned = start - remaining;
    expect(burned).toBeCloseTo(
      FIVE_GROUPS.length * GROUP_DAILY_BURN * bundle.par.calendarDays,
      5,
    );
  });
});
