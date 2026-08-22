/** Generated world: operator, crew, maintenance, environment (B2.4). */

import type { ArchetypeId, CrewRole, OpsPart, TimeOfDay } from './ids';

export interface OperatorProfile {
  id: string;
  name: string;
  opsPart: OpsPart;
  /** SOP adherence / quality in [0, 1]. */
  sopQuality: number;
  /** Schedule pressure in [0, 1]. */
  schedulePressure: number;
  /** Maintenance culture quality in [0, 1]. */
  maintenanceCulture: number;
}

export interface CrewMember {
  id: string;
  role: CrewRole;
  displayName: string;
  certificates: string[];
  totalHours: number;
  typeHours: number;
  /** Days since last relevant flight/training. */
  recencyDays: number;
  /** CRM quality in [0, 1]. */
  crmQuality: number;
  /** Survived the accident (survivable templates only). */
  survived: boolean;
}

export interface MelItem {
  id: string;
  description: string;
  category: 'A' | 'B' | 'C' | 'D';
  deferredDay: number;
  /** True if repeat-deferral / date reuse (often causal). */
  improperRepeat?: boolean;
}

export interface MaintenanceHistory {
  recentWorkOrders: string[];
  adSbComplianceNotes: string[];
  melItems: MelItem[];
  /** Free-text flags (gaps, ownership change, etc.). */
  flags: string[];
}

export interface Environment {
  airportId: string;
  airportName: string;
  /** Real US state abbreviation or name. */
  state: string;
  terrain: string;
  runway: string;
  elevationFt: number;
  timeOfDay: TimeOfDay;
  weatherSummary: string;
}

/** Full simulated world for one case seed. */
export interface World {
  seed: string;
  archetypeId: ArchetypeId;
  operator: OperatorProfile;
  crew: CrewMember[];
  maintenance: MaintenanceHistory;
  environment: Environment;
  /** Cabin / pax count at departure. */
  occupants: {
    crewFlight: number;
    crewCabin: number;
    passengers: number;
    fatalities: number;
    seriousInjuries: number;
  };
}
