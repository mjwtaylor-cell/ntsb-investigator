import { describe, it, expect } from 'vitest';
import {
  TEMPLATE_IDS,
  getTemplate,
  listTemplates,
  templatesForArchetype,
  validateTemplate,
  T1_VFR_IMC,
  T2_FUEL,
  T4_ICING,
  T6_UNCONTAINED_ENGINE,
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
  it('registry lists T1, T2, T4, T6', () => {
    expect(TEMPLATE_IDS).toEqual(['T1', 'T2', 'T4', 'T6']);
    expect(listTemplates()).toHaveLength(4);
    expect(getTemplate('T1').name).toMatch(/VFR into IMC/i);
    expect(getTemplate('T2').name).toMatch(/Fuel exhaustion/i);
    expect(getTemplate('T4').name).toMatch(/icing/i);
    expect(getTemplate('T6').name).toMatch(/Uncontained engine/i);
  });

  it('T1 validates: PC, reveal coverage, A1 without-recorders', () => {
    expectValid(T1_VFR_IMC);
    expect(T1_VFR_IMC.archetypes).toEqual(['A1']);
    expect(
      T1_VFR_IMC.nodes.filter((n) => n.tier === 'probableCause').length,
    ).toBeGreaterThanOrEqual(1);
    assertA1WithoutRecorders(T1_VFR_IMC);
  });

  it('T2 validates: PC, reveal coverage, A1 without-recorders', () => {
    expectValid(T2_FUEL);
    expect(T2_FUEL.archetypes).toEqual(['A1', 'A2']);
    expect(
      T2_FUEL.nodes.filter((n) => n.tier === 'probableCause').length,
    ).toBeGreaterThanOrEqual(1);
    assertA1WithoutRecorders(T2_FUEL);
  });

  it('T4 validates: PC, reveal coverage, A2-only icing/MEL', () => {
    expectValid(T4_ICING);
    expect(T4_ICING.archetypes).toEqual(['A2']);
    expect(T4_ICING.nodes.some((n) => n.id === 'latent.mel_misuse')).toBe(true);
    expect(
      T4_ICING.nodes.filter((n) => n.tier === 'probableCause').length,
    ).toBeGreaterThanOrEqual(1);
    for (const node of causalNodes(T4_ICING)) {
      expect(node.revealedBy.length).toBeGreaterThanOrEqual(2);
    }
  });

  it('T6 validates: PC, reveal coverage, A3/A4 uncontained failure', () => {
    expectValid(T6_UNCONTAINED_ENGINE);
    expect(T6_UNCONTAINED_ENGINE.archetypes).toEqual(['A3', 'A4']);
    expect(
      T6_UNCONTAINED_ENGINE.nodes.some(
        (n) => n.id === 'latent.missed_sb_inspection',
      ),
    ).toBe(true);
    expect(
      T6_UNCONTAINED_ENGINE.nodes.filter((n) => n.tier === 'probableCause')
        .length,
    ).toBeGreaterThanOrEqual(1);
    for (const node of causalNodes(T6_UNCONTAINED_ENGINE)) {
      expect(node.revealedBy.length).toBeGreaterThanOrEqual(2);
    }
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
      expect(t.redHerringPool.length).toBeGreaterThanOrEqual(
        t.redHerringDraw.max,
      );
      assertA1WithoutRecorders(t);
    }
  });

  it('templatesForArchetype filters by fit', () => {
    expect(templatesForArchetype('A1').map((t) => t.id)).toEqual(
      expect.arrayContaining(['T1', 'T2']),
    );
    expect(templatesForArchetype('A2').map((t) => t.id)).toEqual(
      expect.arrayContaining(['T2', 'T4']),
    );
    expect(templatesForArchetype('A2').map((t) => t.id)).not.toContain('T1');
    expect(templatesForArchetype('A3').map((t) => t.id)).toEqual(['T6']);
    expect(templatesForArchetype('A4').map((t) => t.id)).toEqual(['T6']);
  });
});
