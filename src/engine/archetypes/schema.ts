/** Aircraft archetype schema: systems, performance, recorders (B2.4). */

import type { ArchetypeId, OpsPart } from '../types';

/** Anti-ice / de-ice capability present on the type. */
export type AntiIceSystem =
  | 'none'
  | 'carbHeat'
  | 'boots'
  | 'bleedWing'
  | 'electric';

/**
 * Autopilot / automation level.
 * 0 none · 1 basic wing-leveler · 2 FD+AP · 3 FMS / autothrottle.
 */
export type AutopilotLevel = 0 | 1 | 2 | 3;

/** FDR fitment for the type. */
export type FdrCapability = 'none' | 'lightweight' | 'full';

export interface AircraftSystems {
  antiIce: AntiIceSystem;
  pressurization: boolean;
  autopilotLevel: AutopilotLevel;
  /** EGPWS / TAWS class equipment. */
  egpwsTaws: boolean;
  retractableGear: boolean;
  /** Propeller count; 0 for pure jets. */
  propellers: number;
  engines: number;
  engineKind: 'piston' | 'turboprop' | 'turbofan';
}

export interface PerformanceEnvelope {
  /** Knots; optional fields vary by type. */
  vSpeeds: {
    vs0?: number;
    vs1?: number;
    vx?: number;
    vy?: number;
    vRef?: number;
    vNe?: number;
    vMo?: number;
    vFe?: number;
  };
  climbRateFpm: { typical: number; max: number };
  descentRateFpm: { typical: number; max: number };
  /** Fuel burn stub units: gph (piston) or pph (turbine). */
  fuelBurnPerHour: number;
  fuelBurnUnit: 'gph' | 'pph';
  cruiseSpeedKts: number;
  typicalRouteNm: { min: number; max: number };
  serviceCeilingFt: number;
}

/**
 * Recorder / data capabilities derived from the type (B2.4 table).
 * Used by evidence generation to omit impossible streams (e.g. no CVR on A1).
 */
export interface RecorderCapabilities {
  fdr: FdrCapability;
  cvr: boolean;
  adsBOut: boolean;
  qar: boolean;
  acars: boolean;
  /** Engine-monitor non-volatile memory (EGT/CHT/RPM/FF). */
  engineMonitorNvm: boolean;
  /** Portable / panel GPS track log. */
  portableGps: boolean;
}

export interface Archetype {
  id: ArchetypeId;
  /** Marketing / type name, e.g. "Meridian M-4". */
  name: string;
  /** Short type blurb for the Day-0 brief card. */
  summary: string;
  seats: number;
  opsPart: OpsPart;
  crewFlight: number;
  crewCabin: number;
  systems: AircraftSystems;
  performance: PerformanceEnvelope;
  recorders: RecorderCapabilities;
}
