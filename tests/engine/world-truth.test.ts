import { describe, it, expect } from 'vitest';
import {
  generateWorld,
  generateTruth,
  resolveSelection,
  CaseSelectionError,
} from '../../src/engine/generate';
import { generateCase } from '../../src/engine/index';

describe('world + truth generation', () => {
  it('seed 1174 yields A2 / T4 (curated walkthrough)', () => {
    const { world, archetype, difficulty } = generateWorld('1174');
    expect(world.archetypeId).toBe('A2');
    expect(archetype.id).toBe('A2');
    expect(difficulty).toBe('standard');
    const { truth, template } = generateTruth('1174', archetype, difficulty);
    expect(truth.templateId).toBe('T4');
    expect(template.id).toBe('T4');
    expect(truth.nodes.some((n) => n.tier === 'probableCause')).toBe(true);
    expect(truth.nodes.some((n) => n.tier === 'nonCausal')).toBe(true);
  });

  it('same seed is deterministic for world + truth', () => {
    const a = generateWorld('42');
    const b = generateWorld('42');
    expect(a.world).toEqual(b.world);
    const ta = generateTruth('42', a.archetype, a.difficulty);
    const tb = generateTruth('42', b.archetype, b.difficulty);
    expect(ta.truth).toEqual(tb.truth);
  });

  it('opts force archetype and template', () => {
    const { world, archetype } = generateWorld('99', { archetype: 'A1' });
    expect(world.archetypeId).toBe('A1');
    const { truth } = generateTruth('99', archetype, 'standard', {
      template: 'T1',
    });
    expect(truth.templateId).toBe('T1');
  });

  it('uses named forks without throwing across archetypes', () => {
    for (const id of ['A1', 'A2', 'A3', 'A4'] as const) {
      const { archetype, difficulty } = generateWorld(`seed-${id}`, {
        archetype: id,
      });
      const { truth } = generateTruth(`seed-${id}`, archetype, difficulty);
      expect(truth.archetypeId).toBe(id);
      expect(truth.nodes.length).toBeGreaterThan(3);
    }
  });

  it('every archetype is reachable across a seed sweep', () => {
    const seen = new Set<string>();
    for (let i = 0; i < 80; i++) {
      const { archetype } = resolveSelection(String(3000 + i));
      seen.add(archetype.id);
    }
    expect([...seen].sort()).toEqual(['A1', 'A2', 'A3', 'A4']);
  });

  it('--template alone auto-picks a compatible archetype', () => {
    const r = resolveSelection('auto-t6', { template: 'T6' });
    expect(r.template.id).toBe('T6');
    expect(['A3', 'A4']).toContain(r.archetype.id);
    const bundle = generateCase('auto-t6', { template: 'T6' });
    expect(bundle.truth.templateId).toBe('T6');
  });

  it('incompatible archetype+template throws CaseSelectionError', () => {
    expect(() =>
      resolveSelection('bad', { archetype: 'A1', template: 'T6' }),
    ).toThrow(CaseSelectionError);
  });
});
