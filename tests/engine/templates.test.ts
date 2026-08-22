import { describe, it, expect } from 'vitest';
import {
  TEMPLATE_IDS,
  getTemplate,
  listTemplates,
  templatesForArchetype,
  validateTemplate,
  T1_VFR_IMC,
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

describe('failure-mode templates (P1)', () => {
  it('registry lists implemented templates', () => {
    expect(TEMPLATE_IDS.length).toBeGreaterThanOrEqual(1);
    expect(listTemplates()).toHaveLength(TEMPLATE_IDS.length);
    expect(getTemplate('T1').name).toMatch(/VFR into IMC/i);
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

    const hooks = new Map(
      T1_VFR_IMC.evidenceHooks.map((h) => [h.evidenceId, h]),
    );
    for (const node of causalNodes(T1_VFR_IMC)) {
      expect(node.revealedBy.length).toBeGreaterThanOrEqual(2);
      const without = node.revealedBy.some(
        (l) => hooks.get(l.evidenceId)?.withoutRecorders,
      );
      expect(without, node.id).toBe(true);
    }
  });

  it('every registered template validates (node counts + reveal coverage)', () => {
    for (const t of listTemplates()) {
      expectValid(t);
      expect(causalNodes(t).length).toBeGreaterThanOrEqual(3);
      expect(t.nodes.filter((n) => n.tier === 'probableCause').length).toBeGreaterThanOrEqual(
        1,
      );
      expect(t.redHerringDraw.min).toBeGreaterThanOrEqual(1);
      expect(t.redHerringDraw.max).toBeLessThanOrEqual(3);
      expect(t.redHerringPool.length).toBeGreaterThanOrEqual(t.redHerringDraw.max);
    }
  });

  it('templatesForArchetype filters by fit', () => {
    const a1 = templatesForArchetype('A1').map((t) => t.id);
    expect(a1).toContain('T1');
  });
});
