import { describe, it, expect } from 'vitest';
import { generateWorld, generateTruth } from '../../src/engine/generate';
import { simulateFlight } from '../../src/engine/sim';
import { buildEvidence } from '../../src/engine/evidence';

describe('evidence catalogue', () => {
  it('builds catalogue with costs/leadTimes/prereqs/decay/reveals for 1174', () => {
    const { world, archetype, difficulty } = generateWorld('1174');
    const { truth, template } = generateTruth('1174', archetype, difficulty);
    const track = simulateFlight('1174', world, archetype, template);
    const { catalogue, par } = buildEvidence(template, truth, archetype, track);

    expect(catalogue.length).toBeGreaterThan(8);
    expect(par.evidenceSet.length).toBeGreaterThan(0);
    expect(par.investigatorDays).toBeGreaterThan(0);

    for (const item of catalogue) {
      expect(item.cost).toBeGreaterThanOrEqual(0);
      expect(item.leadTime).toBeGreaterThanOrEqual(0);
      expect(Array.isArray(item.prereqs)).toBe(true);
      expect(Array.isArray(item.reveals)).toBe(true);
    }

    const causal = truth.nodes.filter(
      (n) => n.tier !== 'nonCausal' && n.kind !== 'nonCausalCondition',
    );
    for (const node of causal) {
      const revealers = catalogue.filter((e) =>
        e.reveals.some((r) => r.nodeId === node.id),
      );
      expect(revealers.length, node.id).toBeGreaterThanOrEqual(2);
    }

    const wx = catalogue.find((e) => e.id.startsWith('wx.'));
    expect(wx?.decay).toBe(30);
  });

  it('omits FDR/CVR when archetype lacks them', () => {
    const { world, archetype, difficulty } = generateWorld('a1-case', {
      archetype: 'A1',
    });
    const { truth, template } = generateTruth('a1-case', archetype, difficulty, {
      template: 'T1',
    });
    const track = simulateFlight('a1-case', world, archetype, template);
    const { catalogue } = buildEvidence(template, truth, archetype, track);
    expect(catalogue.some((e) => e.id === 'fdr.readout')).toBe(false);
    expect(catalogue.some((e) => e.id === 'cvr.transcript')).toBe(false);
  });
});
