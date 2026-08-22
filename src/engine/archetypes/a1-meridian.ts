/** A1 — Meridian M-4: fictional piston single (Part 91). */

import type { Archetype } from './schema';

export const A1_MERIDIAN: Archetype = {
  id: 'A1',
  name: 'Meridian M-4',
  summary: 'Piston single, 4 seats, retractable gear — Part 91 personal / light charter.',
  seats: 4,
  opsPart: '91',
  crewFlight: 1,
  crewCabin: 0,
  systems: {
    antiIce: 'carbHeat',
    pressurization: false,
    autopilotLevel: 1,
    egpwsTaws: false,
    retractableGear: true,
    propellers: 1,
    engines: 1,
    engineKind: 'piston',
  },
  performance: {
    vSpeeds: {
      vs0: 55,
      vs1: 62,
      vx: 78,
      vy: 90,
      vRef: 70,
      vFe: 110,
      vNe: 195,
    },
    climbRateFpm: { typical: 900, max: 1200 },
    descentRateFpm: { typical: 500, max: 1500 },
    fuelBurnPerHour: 14,
    fuelBurnUnit: 'gph',
    cruiseSpeedKts: 155,
    typicalRouteNm: { min: 80, max: 450 },
    serviceCeilingFt: 18000,
  },
  recorders: {
    fdr: 'none',
    cvr: false,
    adsBOut: true,
    qar: false,
    acars: false,
    engineMonitorNvm: true,
    portableGps: true,
  },
};
