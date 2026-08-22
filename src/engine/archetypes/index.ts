/** Barrel for aircraft archetypes A1–A4. */

export type {
  AntiIceSystem,
  AutopilotLevel,
  FdrCapability,
  AircraftSystems,
  PerformanceEnvelope,
  RecorderCapabilities,
  Archetype,
} from './schema';

export { A1_MERIDIAN } from './a1-meridian';
export { A2_KESTREL } from './a2-kestrel';
export { A3_AURORA } from './a3-aurora';
export { A4_HALCYON } from './a4-halcyon';

export {
  ARCHETYPES,
  ARCHETYPE_IDS,
  getArchetype,
  listArchetypes,
} from './registry';
