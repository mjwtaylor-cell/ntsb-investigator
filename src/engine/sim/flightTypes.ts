/**
 * Flight track types and 1 Hz sample shape (DOMAIN.md FDR keys).
 */

import type { FlightPhase } from '../templates';

/** One 1 Hz sample using DOMAIN.md FDR key names. */
export interface FlightSample {
  t_s: number;
  phase: FlightPhase;
  pressureAltitude_ft: number;
  radioAltitude_ft: number;
  ias_kt: number;
  groundspeed_kt: number;
  heading_deg: number;
  track_deg: number;
  pitch_deg: number;
  roll_deg: number;
  verticalSpeed_fpm: number;
  nz_g: number;
  lat_deg: number;
  lon_deg: number;
  windDir_deg: number;
  windSpeed_kt: number;
  fuelFlow_pph: number;
  fuelQty_lb: number;
  flap_deg: number;
  gear: 'UP' | 'DOWN' | 'TRANSIT';
  /** Injected template event id, if any, at this second. */
  eventId?: string;
}

export interface FlightTrack {
  samples: FlightSample[];
  events: { t_s: number; eventId: string; description: string; phase: FlightPhase }[];
  impactIndex: number;
  /** Planned enroute distance used to size the profile (nm). */
  legNm: number;
}

export interface PhasePlan {
  phase: FlightPhase;
  durationSec: number;
  altStart: number;
  altEnd: number;
  ias: number;
  vs: number;
  flap: number;
  gear: 'UP' | 'DOWN' | 'TRANSIT';
}

export const MIN_FLIGHT_SEC = 25 * 60;
export const MAX_FLIGHT_SEC = 120 * 60;
export const HARD_CAP_SAMPLES = 7200;
