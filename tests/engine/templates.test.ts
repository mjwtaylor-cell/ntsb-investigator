import { describe, it, expect } from 'vitest';
import {
  TEMPLATE_IDS,
  getTemplate,
  listTemplates,
  templatesForArchetype,
  validateTemplate,
  T1_VFR_IMC,
  T2_FUEL_EXHAUSTION,
} from '../../src/engine/templates';
import type { FailureModeTemplate } from '../../src/engine/templates';

function expectValid(template: FailureModeTemplate): void {
  const issues = validateTemplate(template);
  expect(issues, JSON.stringify(issues)).toEqual([]);
}

function causalNodes(template: FailureModeTemplate) {
  return template.nodes.filter(
    (n) => n.tier !== 'nonCausal' && n.kind !== 'nonCausalCondition',
  );
}

function assertA1WithoutRecorders(template: FailureModeTemplate): void {
  if (!template.archetypes.includes('A1')) return;
  const hooks = new Map(
    template.evidenceHooks.map((h) => [h.evidenceId, h]),
  );
  for (const node of causalNodes(template)) {
    expect(node.revealedBy.length).toBeGreaterThanOrEqual(2);
    const without = node.revealedBy.some(
      (l) => hooks.get(l.evidenceId)?.withoutRecorders,
    );
    expect(without, node.id).toBe(true);
  }
}

describe('failure-mode templates (P1)', () => {
  it('registry lists implemented templates', () => {
    expect(TEMPLATE_IDS).toEqual(expect.arrayContaining(['T1', 'T2']));
    expect(listTemplates()).toHaveLength(TEMPLATE_IDS.length);
    expect(getTemplate('T1').name).toMatch(/VFR into IMC/i);
    expect(getTemplate('T2').name).toMatch(/Fuel exhaustion/i);
  });

  it('T1 validates: PC, reveal coverage, A1 without-recorders', () => {
    expectValid(T1_VFR_IMC);
    expect(T1_VFR_IMC.archetypes).toEqual(['A1', 'A2']);
    const pcs = T1_VFR_IMC.nodes.filter((n) => n.tier === 'probableCause');
    expect(pcs.length).toBeGreaterThanOrEqual(1);
    expect(T1_VFR_IMC.redHerringPool.length).toBeGreaterThanOrEqual(
      T1_VFR_IMC.redHerringDraw.max,
    );
    expect(T1_VFR_IMC.flightScriptHooks.length).toBeGreaterThanOrEqual(1);
    expect(T1_VFR_IMC.evidenceHooks.length).toBeGreaterThanOrEqual(2);
    expect(T1_VFR_IMC.parCostStub.investigatorDays).toBeGreaterThan(0);
    assertA1WithoutRecorders(T1_VFR_IMC);
  });

  it('T2 validates: PC, reveal coverage, A1 without-recorders', () => {
    expectValid(T2_FUEL_EXHAUSTION);
    expect(T2_FUEL_EXHAUSTION.archetypes).toEqual(['A1', 'A2']);
    const pcs = T2_FUEL_EXHAUSTION.nodes.filter(
      (n) => n.tier === 'probableCause',
    );
    expect(pcs.length).toBeGreaterThanOrEqual(1);
    assertA1WithoutRecorders(T2_FUEL_EXHAUSTION);
  });

  it('every registered template validates (node counts + reveal coverage)', () => {
    for (const t of listTemplates()) {
      expectValid(t);
      expect(causalNodes(t).length).toBeGreaterThanOrEqual(3);
      expect(
        t.nodes.filter((n) => n.tier === 'probableCause').length,
      ).toBeGreaterThanOrEqual(1);
      expect(t.redHerringDraw.min).toBeGreaterThanOrEqual(1);
      expect(t.redHerringDraw.max).toBeLessThanOrEqual(3);
      expect(t.redHerringPool.length).toBeGreaterThanOrEqual(t.redHerringDraw.max);
      assertA1WithoutRecorders(t);
    }
  });

  it('templatesForArchetype filters by fit', () => {
    const a1 = templatesForArchetype('A1').map((t) => t.id);
    expect(a1).toEqual(expect.arrayContaining(['T1', 'T2']));
  });
});
