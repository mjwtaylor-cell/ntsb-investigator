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
  createInitialState,
  buildPressureEvents,
  type ReduceContext,
  type PressureEvent,
} from './actions';
export {
  scoreCase,
  truthFindings,
  emptyFindings,
  runOracles,
  type FindingsInput,
  type OracleResult,
} from './scoring';

import { generateWorld, generateTruth, type GenerateOpts } from './generate';
import { simulateFlight, type FlightTrack } from './sim';
import { buildEvidence } from './evidence';
import {
  applyAction as reduceAction,
  advanceTime as reduceAdvanceTime,
  createInitialState,
  buildPressureEvents,
  resetQueueSeq,
  type PressureEvent,
} from './actions';
import { scoreCase, type FindingsInput } from './scoring';
import type {
  Action,
  CaseBundle,
  CaseState,
  PlayerFinding,
  ScoreReport,
} from './types';

/** Full generated case: TECH CaseBundle plus flight track + pressure. */
export interface GeneratedCase extends CaseBundle {
  flight: FlightTrack;
  pressureEvents: PressureEvent[];
}

export type GenerateCaseOpts = GenerateOpts;

/** seed → world → truth → flight → evidence catalogue → par. */
export function generateCase(
  seed: string,
  opts: GenerateCaseOpts = {},
): GeneratedCase {
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
): CaseState {
  const pressureEvents =
    (bundle as GeneratedCase).pressureEvents ??
    buildPressureEvents(bundle.truth.seed);
  return reduceAction(state, action, { bundle, pressureEvents });
}

export function advanceTime(
  state: CaseState,
  days: number,
  bundle: CaseBundle,
): CaseState {
  return reduceAdvanceTime(state, days, bundle);
}

/**
 * Score findings against truth.
 * Accepts either FindingsInput or a CaseState that already holds findings.
 */
export function score(
  findingsOrState: FindingsInput | CaseState,
  bundle: CaseBundle,
  state?: CaseState,
): ScoreReport {
  if (state) {
    return scoreCase(findingsOrState as FindingsInput, bundle, state);
  }
  const s = findingsOrState as CaseState;
  const input: FindingsInput = {
    findings: s.findings,
    findingEdges: s.findingEdges,
    recommendations: s.recommendations,
  };
  return scoreCase(input, bundle, s);
}

export type { PlayerFinding };
