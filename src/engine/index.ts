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

export function generateCase(_seed?: string): never {
  void _seed;
  throw new Error('engine not yet implemented');
}

export function applyAction(): never {
  throw new Error('engine not yet implemented');
}

export function advanceTime(): never {
  throw new Error('engine not yet implemented');
}

export function score(): never {
  throw new Error('engine not yet implemented');
}
