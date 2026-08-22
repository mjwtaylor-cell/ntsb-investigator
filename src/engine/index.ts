/** Engine public API (TECH.md). */

export type * from './types';
export { NODE_TIER_WEIGHT } from './types';
export { createRng, hashSeed, type Rng } from './rng';
export {
  ARCHETYPES,
  ARCHETYPE_IDS,
  getArchetype,
  listArchetypes,
  A1_MERIDIAN,
  A2_KESTREL,
  A3_AURORA,
  A4_HALCYON,
} from './archetypes';
export type {
  Archetype,
  AircraftSystems,
  PerformanceEnvelope,
  RecorderCapabilities,
  AntiIceSystem,
  AutopilotLevel,
  FdrCapability,
} from './archetypes';

export {
  TEMPLATES,
  TEMPLATE_IDS,
  getTemplate,
  listTemplates,
  templatesForArchetype,
  validateTemplate,
  assertValidTemplate,
  T1_VFR_IMC,
  T2_FUEL,
  T4_ICING,
  T6_UNCONTAINED_ENGINE,
} from './templates';
export type {
  FailureModeTemplate,
  FlightPhase,
  FlightScriptHook,
  EvidenceHook,
  RedHerringSlot,
  ParCostStub,
  TemplateParameter,
  TemplateValidationIssue,
} from './templates';

export { generateWorld, generateTruth, type GenerateOpts } from './generate';
export { simulateFlight, type FlightTrack, type FlightSample } from './sim';
export { buildEvidence } from './evidence';
export {
  applyAction as reduceAction,
  advanceTime as reduceAdvanceTime,
  createInitialState,
  buildPressureEvents,
  resetQueueSeq,
  type ReduceContext,
  type PressureEvent,
} from './actions';
export {
  scoreCase,
  truthFindings,
  emptyFindings,
  runOracles,
  type FindingsInput,
} from './scoring';

import type {
  Action,
  CaseBundle,
  CaseState,
  ScoreReport,
} from './types';
import { generateWorld, generateTruth, type GenerateOpts } from './generate';
import { simulateFlight, type FlightTrack } from './sim';
import { buildEvidence } from './evidence';
import {
  applyAction as reduceAction,
  advanceTime as reduceAdvanceTime,
  buildPressureEvents,
  resetQueueSeq,
  type ReduceContext,
  type PressureEvent,
} from './actions';
import { scoreCase, type FindingsInput } from './scoring';

export interface GenerateCaseResult extends CaseBundle {
  flight: FlightTrack;
  pressureEvents: PressureEvent[];
}

/** Seed → full case bundle (world, truth, evidence, par) + flight/pressure. */
export function generateCase(
  seed: string,
  opts: GenerateOpts = {},
): GenerateCaseResult {
  resetQueueSeq();
  const { world, archetype, difficulty } = generateWorld(seed, opts);
  const { truth, template } = generateTruth(seed, archetype, difficulty, opts);
  const flight = simulateFlight(seed, world, archetype, template);
  const { catalogue, par } = buildEvidence(template, truth, archetype, flight);
  const pressureEvents = buildPressureEvents(seed);
  return {
    truth,
    world,
    evidence: catalogue,
    par,
    flight,
    pressureEvents,
  };
}

export function applyAction(
  state: CaseState,
  action: Action,
  bundle: CaseBundle,
  pressureEvents?: PressureEvent[],
): CaseState {
  const ctx: ReduceContext = {
    bundle,
    pressureEvents: pressureEvents ?? buildPressureEvents(state.seed),
  };
  return reduceAction(state, action, ctx);
}

export function advanceTime(
  state: CaseState,
  days: number,
  bundle: CaseBundle,
): CaseState {
  return reduceAdvanceTime(state, days, bundle);
}

export function score(
  findings: FindingsInput,
  bundle: CaseBundle,
  state: CaseState,
): ScoreReport {
  return scoreCase(findings, bundle, state);
}
