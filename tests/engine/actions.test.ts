import { describe, it, expect, beforeEach } from 'vitest';
import { generateWorld, generateTruth } from '../../src/engine/generate';
import { simulateFlight } from '../../src/engine/sim';
import { buildEvidence } from '../../src/engine/evidence';
import {
  applyAction,
  advanceTime,
  createInitialState,
  buildPressureEvents,
  resetQueueSeq,
  type ReduceContext,
} from '../../src/engine/actions';
import type { CaseBundle } from '../../src/engine/types';

function bundleFor(seed: string): { bundle: CaseBundle; ctx: ReduceContext } {
  const { world, archetype, difficulty } = generateWorld(seed);
  const { truth, template } = generateTruth(seed, archetype, difficulty);
  const track = simulateFlight(seed, world, archetype, template);
  const { catalogue, par } = buildEvidence(template, truth, archetype, track);
  const bundle: CaseBundle = { truth, world, evidence: catalogue, par };
  const ctx: ReduceContext = {
    bundle,
    pressureEvents: buildPressureEvents(seed),
  };
  return { bundle, ctx };
}

describe('actions reducer / queue / decay / pressure', () => {
  beforeEach(() => {
    resetQueueSeq();
  });

  it('queues evidence, advances time, obtains result', () => {
    const { bundle, ctx } = bundleFor('1174');
    let state = createInitialState(bundle);
    const cheap = bundle.evidence.find(
      (e) => e.prereqs.length === 0 && e.cost <= 2 && e.leadTime >= 1,
    );
    expect(cheap).toBeTruthy();
    state = applyAction(
      state,
      { type: 'requestEvidence', evidenceId: cheap!.id },
      ctx,
    );
    expect(state.queue).toHaveLength(1);
    expect(state.investigatorDaysSpent).toBeGreaterThan(0);
    state = advanceTime(state, cheap!.leadTime, bundle);
    expect(state.obtainedEvidenceIds).toContain(cheap!.id);
    expect(state.queue).toHaveLength(0);
  });

  it('decays unsecured perishable weather evidence', () => {
    const { bundle, ctx } = bundleFor('1174');
    void ctx;
    let state = createInitialState(bundle);
    const wx = bundle.evidence.find((e) => e.decay === 30);
    expect(wx).toBeTruthy();
    state = advanceTime(state, 30, bundle);
    expect(state.decayedEvidenceIds).toContain(wx!.id);
  });

  it('resolves a pressure event after trigger day', () => {
    const { bundle, ctx } = bundleFor('1174');
    let state = createInitialState(bundle);
    const event = ctx.pressureEvents[0]!;
    state = advanceTime(state, event.triggerDay, bundle);
    state = applyAction(
      state,
      { type: 'respondPressure', eventId: event.id, choiceId: event.choices[0]!.id },
      ctx,
    );
    expect(state.pressureResolvedIds).toContain(event.id);
    expect(ctx.pressureEvents).toHaveLength(3);
  });
});
